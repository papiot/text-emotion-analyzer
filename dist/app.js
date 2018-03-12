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

    app.get('/', function (req, res) {
        return res.send('Hello World!');
    });

    app.listen(3000, function () {
        return console.log('Server started on port 3000');
    });

    app.post('/analyze', function (req, res) {
        var phraze = req.body.my_text_to_analyze;

        console.log("Text to analyze is: ");
        console.log(phraze);

        var myRequest = {
            "documents": [{
                "language": "nl",
                "id": "1235",
                "text": phraze
            }]
        };

        callServer(myRequest).then(function (response) {
            console.log(response.data);
            console.log(response.status);
            res.end("" + response.data.documents[0].score);
        }).catch(function (error) {
            console.log(error);
        });
    });
};

// Main function
var main = function main() {
    var positiveText = {
        "documents": [{
            "language": "en",
            "id": "1234",
            "text": "It is such a beautiful day!!"
        }]
    };

    var negativeText = {
        "documents": [{
            "language": "en",
            "id": "1235",
            "text": "This is such a lousy computer."
        }]
    };
    callServer(positiveText);
    callServer(negativeText);
};

var callServer = function callServer(withText) {
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

// main();
startServer();