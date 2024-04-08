const express = require("express")
const router = express.Router()
const axios = require("axios")

router.post('/', async (req, res) => {
    try {
        const { destination, season, duration, budget, interests, additionalInfo } = req.body
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-3.5-turbo",
        // const recommendationId = 
        // const response = await axios.post(`https://api.clickup.com/api/v2`, {
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
                in an array. Each element should be an object with the following schema:

                {
                    "itinerary": [
                        {
                            "day_string": <A string that represents the day of the trip>,
                            "location": <A more specific area within the destination>,
                            "duration": <string>,
                            "budget": <A dollar amount with the dollar sign. The budget required for activities for this specific day>,
                            "description": <A description of the activities that you'll be doing>
                        }
                    ]
                }

                `
            }], 
            response_format: { "type": "json_object" }
        }, {
            headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer sk-jQS3h6r4Xi0bFzVCn1xlT3BlbkFJDxfOz22GqUg4CY4dBwFQs`
            'Authorization': `Bearer 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`
            
            }
        });
        const responseData = response.data.choices[0].message.content

        // Insert data into the database
        await knex('itinerary').insert({
            day_string,
            location,
            duration,
            budget,
            description,
            
            // itinerary_data: JSON.stringify(responseData) // Make sure this matches your database schema
        });
    
        res.status(200).json(responseData)
        console.log(responseData)
    }  catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
})

module.exports = router