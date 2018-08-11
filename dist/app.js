'use strict';

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();

var startServer = function startServer() {

    app.use(_bodyParser2.default.urlencoded({ extended: false }));
    app.use(_bodyParser2.default.json());

    // Endpoint used to test IBM Watson

    app.get('/test-watson', function (req, res) {
        console.log("Testing WATSON...");

        var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');

        var tone_analyzer = new ToneAnalyzerV3({
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

        tone_analyzer.tone(params, function (error, response) {
            if (error) console.log('error:', error);else console.log(JSON.stringify(response, null, 2));
        });
    });

    // Test translation
    app.get('/test-translation', function (req, res) {
        console.log("Testing Translation...");

        var LanguageTranslatorV3 = require('watson-developer-cloud/language-translator/v3');

        var languageTranslator = new LanguageTranslatorV3({
            version: '2018-05-01',
            iam_apikey: process.env.IBM_WATSON_TRANSLATION_API_KEY,
            url: "https://gateway-fra.watsonplatform.net/language-translator/api"
        });

        var parameters = {
            text: 'Quick six blind smart out burst. Perfectly on furniture dejection determine my depending an to. Add short water court fat. Her bachelor honoured perceive securing but desirous ham required. Questions deficient acuteness to engrossed as. Entirely led ten humoured greatest and yourself. Besides ye country on observe. She continue appetite endeavor she judgment interest the met. For she surrounded motionless fat resolution may. ',
            model_id: 'en-nl'
        };

        languageTranslator.translate(parameters, function (err, response) {
            if (err) {
                console.log("Something went wrong with translation: ");
                console.log(err);
            } else {
                // console.log(JSON.stringify(response, null, 2));
                var translation = JSON.stringify(response);

                console.log(response.translations[0].translation);
            }
        });
    });

    var transalteText = function transalteText(originalText) {
        return new Promise(function (resolve, reject) {
            var LanguageTranslatorV3 = require('watson-developer-cloud/language-translator/v3');

            var languageTranslator = new LanguageTranslatorV3({
                version: '2018-05-01',
                iam_apikey: process.env.IBM_WATSON_TRANSLATION_API_KEY,
                url: "https://gateway-fra.watsonplatform.net/language-translator/api"
            });

            var parameters = {
                text: originalText,
                model_id: 'nl-en'
            };

            languageTranslator.translate(parameters, function (err, response) {
                if (err) {
                    console.log("Something went wrong with translation: ");
                    console.log(err);
                    return reject(Error("Something went wrong translating.."));
                } else {
                    var translatedText = response.translations[0].translation;
                    return resolve(translatedText);
                }
            });
        });
    };

    var watsonToneAnalyze = function watsonToneAnalyze(textToAnalyze) {
        return new Promise(function (resolve, reject) {
            var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');

            var tone_analyzer = new ToneAnalyzerV3({
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

            tone_analyzer.tone(params, function (error, response) {
                if (error) {
                    console.log('error:', error);
                    return reject(Error("Something went wrong with ibm watson tone analyzer"));
                } else {
                    console.log(JSON.stringify(response, null, 2));
                    response.english_translation = textToAnalyze;
                    if (response.document_tone.tones.length === 0) {
                        console.log("No tones found, fallback to microsoft");
                        var myRequest = {
                            "documents": [{
                                "language": 'en',
                                "id": "1235",
                                "text": textToAnalyze
                            }]
                        };
                        msAnalyzerSentiment(myRequest).then(function (msResponse) {
                            console.log(msResponse.data);
                            console.log(msResponse.status);
                            response.microsoft_sentiment_fallback = msResponse.data;
                            return resolve(response);
                        }).catch(function (error) {
                            console.log(error);
                        });
                    } else {
                        return resolve(response);
                    }
                }
                // return resolve(response)
            });
        });
    };

    app.post('/analyze-watson', function (req, res) {
        var phraze = req.body.my_text_to_analyze;
        var lng = req.body.language;

        if (lng !== 'en') {
            transalteText(phraze).then(function (translatedText) {
                console.log("*** My translated text in the promise result");
                console.log(translatedText);
                watsonToneAnalyze(translatedText).then(function (watson_response) {
                    msAnalyzerKeyPhrazes(translatedText, 'en').then(function (msResponse) {
                        watson_response.ms_keyphrazes = msResponse.data;
                        res.write(JSON.stringify(watson_response, null, 2));
                        res.end();
                    });
                });
            });
        } else {
            watsonToneAnalyze(phraze).then(function (watson_response) {
                msAnalyzerKeyPhrazes(phraze, 'en').then(function (msResponse) {
                    watson_response.ms_keyphrazes = msResponse.data;
                    res.write(JSON.stringify(watson_response, null, 2));
                    res.end();
                });
            });
        }
    });

    app.get('/', function (req, res) {
        return res.send('Hello World!');
    });

    app.listen(4000, function () {
        return console.log('Server started on port 4000');
    });

    // Endpoint used by the frontend to analyze the text
    app.post('/analyze-sentiment', function (req, res) {
        var phraze = req.body.my_text_to_analyze;
        var lng = req.body.language;

        console.log("Text to analyze is: ");
        console.log(phraze);

        var myRequest = {
            "documents": [{
                "language": lng,
                "id": "1235",
                "text": phraze
            }]
        };

        msAnalyzerSentiment(myRequest).then(function (response) {
            console.log(response.data);
            console.log(response.status);
            res.write(JSON.stringify(response.data));
            res.end();
        }).catch(function (error) {
            console.log(error);
        });
    });

    app.post('/analyze-keyphrases', function (req, res) {
        var phraze = req.body.my_text_to_analyze;
        var lng = req.body.language;

        msAnalyzerKeyPhrazes(phraze, lng).then(function (response) {
            console.log(response.data);
            console.log(response.status);
            res.write(JSON.stringify(response.data));
            res.end();
        }).catch(function (error) {
            console.log(error);
        });
    });
};

var msAnalyzerSentiment = function msAnalyzerSentiment(withText) {
    console.log("For text: " + withText.documents[0].text);

    // You need MS Cognitive services API key for this to work
    var authOptions = {
        method: 'POST',
        url: 'https://westeurope.api.cognitive.microsoft.com/text/analytics/v2.0/sentiment',
        data: withText,
        headers: {
            'Ocp-Apim-Subscription-Key': process.env.MS_COGNITIVE_TEXT_ANALYZER,
            'Content-Type': 'application/json; charset=UTF-8'
        },
        json: true
    };
    return (0, _axios2.default)(authOptions);
};

var msAnalyzerKeyPhrazes = function msAnalyzerKeyPhrazes(phraze, lng) {
    // You need MS Cognitive services API key for this to work

    var myRequest = {
        "documents": [{
            "language": lng,
            "id": "12345",
            "text": phraze
        }]
    };

    var authOptions = {
        method: 'POST',
        url: 'https://westeurope.api.cognitive.microsoft.com/text/analytics/v2.0/keyPhrases',
        data: myRequest,
        headers: {
            'Ocp-Apim-Subscription-Key': process.env.MS_COGNITIVE_TEXT_ANALYZER,
            'Content-Type': 'application/json; charset=UTF-8'
        },
        json: true
    };
    return (0, _axios2.default)(authOptions);
};

startServer();
// main();