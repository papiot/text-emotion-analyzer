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

    app.post('/analyze-watson', function (req, res) {
        var phraze = req.body.my_text_to_analyze;

        var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');

        var tone_analyzer = new ToneAnalyzerV3({
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

        tone_analyzer.tone(params, function (error, response) {
            if (error) console.log('error:', error);else console.log(JSON.stringify(response, null, 2));
            res.write(JSON.stringify(response, null, 2));
            res.end();
        });
    });

    app.get('/', function (req, res) {
        return res.send('Hello World!');
    });

    app.listen(3000, function () {
        return console.log('Server started on port 3000');
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

        var myRequest = {
            "documents": [{
                "language": lng,
                "id": "12345",
                "text": phraze
            }]
        };

        msAnalyzerKeyPhrazes(myRequest).then(function (response) {
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

var msAnalyzerKeyPhrazes = function msAnalyzerKeyPhrazes(withText) {
    // You need MS Cognitive services API key for this to work
    var authOptions = {
        method: 'POST',
        url: 'https://westeurope.api.cognitive.microsoft.com/text/analytics/v2.0/keyPhrases',
        data: withText,
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