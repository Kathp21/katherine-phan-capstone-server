const express = require("express")
const router = express.Router()
const axios = require("axios")
const knex = require("knex")(require("../knexfile"));

const OPEN_AI_KEY = process.env.OPEN_AI_KEY

router.post('/', async (req, res) => {
    try {
        const { destination, season, duration, budget, interests, additionalInfo } = req.body
        const title = `${destination} ${season} Adventure: ${duration} Days of ${interests.join(', ')}`;
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-4o",
            messages: [{ 
                role: 'user',
                content: `I would like a travel itinerary with the following details:
                Destination: ${destination} 
                Season: ${season}
                Duration: ${duration}
                Budget: ${budget} in Canadian dollar with dollar sign. Show budget for each day.
                Interests: ${interests}
                Additional Info: ${additionalInfo}

                Provide the output in JSON with the daily recommendations as elements
                in an array named "itinerary". Each element should be an object with the following schema:

                {
                    "day_string": "<A string that represents the day of the trip>",
                    "location": "<A more specific area within the destination>",
                    "duration": "<string>",
                    "budget": "<A dollar amount with the dollar sign. The budget required for activities for this specific day>",
                    "description": "<A description of the activities that you'll be doing>"
                }
                `
            }], 
            response_format: { "type": "json_object" }
        }, {
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPEN_AI_KEY}`
            }
        });
        let responseData = JSON.parse(response.data.choices[0].message.content)
        responseData.title = title

        res.status(200).json(responseData)
        console.log(responseData)
    }  catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
})

module.exports = router