'use strict'
import axios from 'axios';
import express from 'express';
import bodyParser from 'body-parser';

const app = express();

const startServer = () => {
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    app.get('/', (req, res) => res.send('Hello World!'))

    app.listen(3000, () => console.log('Server started on port 3000'))

    app.post('/analyze', (req,res) => {
        const phraze = req.body.my_text_to_analyze;

        console.log("Text to analyze is: ");
        console.log(phraze);
        

        const myRequest = {
            "documents": [
                {
                    "language": "en",
                    "id": "1235",
                    "text": phraze
                }
            ]
        }

        callServer(myRequest)
            .then((response) => {
                console.log(response.data);
                console.log(response.status);
                res.end("" + response.data.documents[0].score);
            })
            .catch((error) => {
                console.log(error)
            });
    });
}

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
        return axios(authOptions);
            
}

// main();
startServer();
