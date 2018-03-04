'use strict';

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
    (0, _axios2.default)(authOptions).then(function (response) {
        console.log(response.data);
        console.log(response.status);
    }).catch(function (error) {
        console.log(error);
    });
};

main();