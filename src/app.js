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

    app.post('/analyze-watson', (req, res) => {
        const phraze = req.body.my_text_to_analyze;

        let ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');

        let tone_analyzer = new ToneAnalyzerV3({
            username: process.env.IBM_WATSON_TONE_ANALYZER_USERNAME,
            password: process.env.IBM_WATSON_TONE_ANALYZER_PASSWORD,
            version_date: '2017-09-21'
        });

        var params = {
            'tone_input': {
                            "text": phraze
                        },
            'content_type': 'application/json'
        };

        tone_analyzer.tone(params, (error, response) => {
            if (error)
                console.log('error:', error);
            else
                console.log(JSON.stringify(response, null, 2));
                res.write(JSON.stringify(response, null, 2));
                res.end()
            }
        );

    })

    app.get('/', (req, res) => res.send('Hello World!'))

    app.listen(3000, () => console.log('Server started on port 3000'))

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

        const myRequest = {
            "documents": [ 
                {
                    "language": lng,
                    "id": "12345",
                    "text": phraze
                }
            ]
        }

        msAnalyzerKeyPhrazes(myRequest)
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

const msAnalyzerKeyPhrazes = (withText) => {
    // You need MS Cognitive services API key for this to work
    const authOptions = {
            method: 'POST',
            url: 'https://westeurope.api.cognitive.microsoft.com/text/analytics/v2.0/keyPhrases',
            data: withText,
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
