'use strict'
import axios from 'axios';

// Main function
const main = () => {
    const positiveText = {
        "documents": [
            {
                "language": "en",
                "id": "1234",
                "text": "It is such a beautiful day!!"
            }
        ]
    }

    const negativeText = {
        "documents": [
            {
                "language": "en",
                "id": "1235",
                "text": "This is such a lousy computer."
            }
        ]
    }
    callServer(positiveText);
    callServer(negativeText);
}

const callServer = (withText) => {
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
        axios(authOptions)
            .then((response) => {
                console.log(response.data);
                console.log(response.status);
            })
            .catch((error) => {
                console.log(error)
            })
}

main();
