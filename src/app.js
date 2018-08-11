'use strict'
import axios from 'axios';
import express from 'express';
import bodyParser from 'body-parser';

const app = express();

const startServer = () => {

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    // Endpoint used to test IBM Watson

    app.get('/test-watson', (req, res) => {
        console.log("Testing WATSON...");

        let ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');

        let tone_analyzer = new ToneAnalyzerV3({
            username: process.env.IBM_WATSON_TONE_ANALYZER_USERNAME,
            password: process.env.IBM_WATSON_TONE_ANALYZER_PASSWORD,
            version_date: '2017-09-21'
        });

        var params = {
            'tone_input': {
                            "text": "Team, I know that times are tough! Product sales have been disappointing for the past three quarters. We have a competitive product, but we need to do a better job of selling it!"
                        },
            'content_type': 'application/json'
        };


        tone_analyzer.tone(params, (error, response) => {
            if (error)
                console.log('error:', error);
            else
                console.log(JSON.stringify(response, null, 2));
            }
        );
    })

    // Test translation
    app.get('/test-translation', (req, res) => {
        console.log("Testing Translation...");

        let LanguageTranslatorV3 = require('watson-developer-cloud/language-translator/v3');

        let languageTranslator = new LanguageTranslatorV3({
            version: '2018-05-01',
            iam_apikey: process.env.IBM_WATSON_TRANSLATION_API_KEY,
            url: "https://gateway-fra.watsonplatform.net/language-translator/api"
        });

        let parameters = {
            text: 'Quick six blind smart out burst. Perfectly on furniture dejection determine my depending an to. Add short water court fat. Her bachelor honoured perceive securing but desirous ham required. Questions deficient acuteness to engrossed as. Entirely led ten humoured greatest and yourself. Besides ye country on observe. She continue appetite endeavor she judgment interest the met. For she surrounded motionless fat resolution may. ',
            model_id: 'en-nl'
        };

        languageTranslator.translate(parameters, (err, response) => {
            if (err) {
                console.log("Something went wrong with translation: ");
                console.log(err)
            } else {
                // console.log(JSON.stringify(response, null, 2));
                const translation = JSON.stringify(response)

                console.log(response.translations[0].translation)
            }
        })
    })

    const transalteText = (originalText) => {
        return new Promise((resolve, reject) => {
            let LanguageTranslatorV3 = require('watson-developer-cloud/language-translator/v3');

            let languageTranslator = new LanguageTranslatorV3({
                version: '2018-05-01',
                iam_apikey: process.env.IBM_WATSON_TRANSLATION_API_KEY,
                url: "https://gateway-fra.watsonplatform.net/language-translator/api"
            });

            let parameters = {
                text: originalText,
                model_id: 'nl-en'
            };

            languageTranslator.translate(parameters, (err, response) => {
                if (err) {
                    console.log("Something went wrong with translation: ")
                    console.log(err)
                    return reject(Error("Something went wrong translating.."))
                } else {
                    const translatedText = response.translations[0].translation
                    return resolve(translatedText)
                }
            })
        })
    }

    const watsonToneAnalyze = (textToAnalyze) => {
        return new Promise((resolve, reject) => {
            let ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');

            let tone_analyzer = new ToneAnalyzerV3({
                username: process.env.IBM_WATSON_TONE_ANALYZER_USERNAME,
                password: process.env.IBM_WATSON_TONE_ANALYZER_PASSWORD,
                version_date: '2017-09-21'
            });

            var params = {
                'tone_input': {
                                "text": textToAnalyze
                            },
                'content_type': 'application/json'
            };

            tone_analyzer.tone(params, (error, response) => {
                if (error) {
                    console.log('error:', error)
                    return reject(Error("Something went wrong with ibm watson tone analyzer"))
                } else {
                    console.log(JSON.stringify(response, null, 2))
                    response.english_translation = textToAnalyze
                    if (response.document_tone.tones.length === 0) {
                        console.log("No tones found, fallback to microsoft")
                        const myRequest = {
                            "documents": [
                                {
                                    "language": 'en',
                                    "id": "1235",
                                    "text": textToAnalyze
                                }
                            ]
                        }
                        msAnalyzerSentiment(myRequest).then((msResponse) => {
                            console.log(msResponse.data)
                            console.log(msResponse.status)
                            response.microsoft_sentiment_fallback = msResponse.data
                            return resolve(response)
                        })
                        .catch((error) => {
                            console.log(error)
                        })

                    } else {
                        return resolve(response)
                    }
                }
                // return resolve(response)
            })
        })
    }

    app.post('/analyze-watson', (req, res) => {
        const phraze = req.body.my_text_to_analyze;
        const lng = req.body.language;

        if (lng !== 'en') {
            transalteText(phraze).then( (translatedText) => {
                console.log("*** My translated text in the promise result")
                console.log(translatedText)
                watsonToneAnalyze(translatedText).then((watson_response) => {
                    msAnalyzerKeyPhrazes(translatedText, 'en').then((msResponse) => {
                        watson_response.ms_keyphrazes = msResponse.data
                        res.write(JSON.stringify(watson_response, null, 2));
                        res.end();
                    })
                    
                })
            });
        } else {
            watsonToneAnalyze(phraze).then((watson_response) => {
                msAnalyzerKeyPhrazes(phraze, 'en').then((msResponse) => {
                    watson_response.ms_keyphrazes = msResponse.data
                    res.write(JSON.stringify(watson_response, null, 2));
                    res.end();
                })
            })
        }
    });

    app.get('/', (req, res) => res.send('Hello World!'))

    app.listen(4000, () => console.log('Server started on port 4000'))

    // Endpoint used by the frontend to analyze the text
    app.post('/analyze-sentiment', (req,res) => {
        const phraze = req.body.my_text_to_analyze;
        const lng = req.body.language;

        console.log("Text to analyze is: ");
        console.log(phraze);
        
        const myRequest = {
            "documents": [
                {
                    "language": lng,
                    "id": "1235",
                    "text": phraze
                }
            ]
        }

        msAnalyzerSentiment(myRequest)
            .then((response) => {
                console.log(response.data);
                console.log(response.status);
                res.write(JSON.stringify(response.data));
                res.end();
            })
            .catch((error) => {
                console.log(error)
            });
    });

    app.post('/analyze-keyphrases', (req, res) => {
        const phraze = req.body.my_text_to_analyze;
        const lng = req.body.language;

        

        msAnalyzerKeyPhrazes(phraze, lng)
            .then((response) => {
                console.log(response.data);
                console.log(response.status);
                res.write(JSON.stringify(response.data));
                res.end();
            })
            .catch((error) => {
                console.log(error)
            })
        
    })
}

const msAnalyzerSentiment = (withText) => {
    console.log("For text: " + withText.documents[0].text);

    // You need MS Cognitive services API key for this to work
    const authOptions = {
            method: 'POST',
            url: 'https://westeurope.api.cognitive.microsoft.com/text/analytics/v2.0/sentiment',
            data: withText,
            headers: {
                'Ocp-Apim-Subscription-Key': process.env.MS_COGNITIVE_TEXT_ANALYZER,
                'Content-Type': 'application/json; charset=UTF-8'
            },
            json: true
        };
    return axios(authOptions);           
}

const msAnalyzerKeyPhrazes = (phraze, lng) => {
    // You need MS Cognitive services API key for this to work

    const myRequest = {
        "documents": [ 
            {
                "language": lng,
                "id": "12345",
                "text": phraze
            }
        ]
    }

    const authOptions = {
            method: 'POST',
            url: 'https://westeurope.api.cognitive.microsoft.com/text/analytics/v2.0/keyPhrases',
            data: myRequest,
            headers: {
                'Ocp-Apim-Subscription-Key': process.env.MS_COGNITIVE_TEXT_ANALYZER,
                'Content-Type': 'application/json; charset=UTF-8'
            },
            json: true
        };
    return axios(authOptions);           
}

startServer();
// main();
