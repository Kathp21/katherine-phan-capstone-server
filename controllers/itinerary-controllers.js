const knex = require("knex")(require("../knexfile"));
const { v4: uuidv4 } = require('uuid');

//Get list of itinerary
const itineraries = async (req, res) => {

    try {
        const user_id = req.user.id;
        if (!user_id) {
          return res.status(400).json({ message: "User ID is required" });
        }
    
        // Query the 'itinerary' table to find entries where 'recommendation_id' matches 'user_id'
        const itineraries = await knex('itinerary')
          .where('user_id', '=', user_id)
          .select('*'); // Select all fields, adjust if specific fields are needed
    
        // Check if no itineraries were found for the user
        if (itineraries.length === 0) {
          return res.status(404).json({
            message: `No itineraries found for user with ID ${user_id}`
          });
        }
    
        // Send the list of itineraries
        res.json(itineraries);
    } catch (error) {
        console.error('Error fetching itineraries:', error); // Debugging
        res.status(500).json({
          message: `Unable to retrieve itineraries for user with ID ${user_id}` 
        });
    }
}

//Post request save the itinerary
const saveItinerary = async (req, res) => {
    const itineraries = req.body.itinerary;
    const title = req.body.title;
    const userId = req.user.id; // Ensure you have user ID from JWT or session
    console.log(userId)
    console.log(req.body)
    if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
    }
    if (!itineraries || itineraries.length === 0) {
        return res.status(400).json({ message: "No itinerary data provided." });
    }

    // Check for any missing fields in any itinerary
    const invalidEntry = itineraries.find(itinerary => 
        !itinerary.day_string || !itinerary.location || !itinerary.duration ||
        !itinerary.budget || !itinerary.description
    );

    if (invalidEntry) {
        return res.status(400).json({ message: "All fields must be provided.", invalidEntry });
    }

    try {
      // Use transaction for batch inserting
        await knex.transaction(async trx => {
        const recommendationId = uuidv4(); // Generate a UUID for this batch of itineraries
          for (const item of itineraries) {
              await trx('itinerary').insert({
                recommendation_id: recommendationId, 
                title: title,
                day_string: item.day_string,
                location: item.location,
                duration: item.duration,
                budget: item.budget.replace('$', ''), // Removing dollar sign before saving
                description: item.description,
                user_id: userId
              });
          }
        });
      res.status(201).json({ message: "Itinerary saved successfully" });

    } catch (error) {
      console.error('Save Itinerary Error:', error);
      res.status(500).json({ message: 'Failed to save itinerary' });
    }
}

//get request for itinerary details
const itinerariesDetails = async (req, res) => {
    try {
        const user_id = req.user.id;
        const recommendation_id = req.params.recommendation_id;
    
        if (!user_id) {
          return res.status(400).json({ message: "User ID is required" });
        }
        if (!recommendation_id) {
          return res.status(400).json({ message: "Recommendation ID is required" });
        }
    
        console.log('User ID:', user_id); // Debugging
        console.log('Recommendation ID:', recommendation_id); // Debugging
    
        const details = await knex('itinerary')
          .where({
            user_id: user_id,
            recommendation_id: recommendation_id
          })
          .select('*');
        
        if (details.length === 0) {
          return res.status(404).json({
            message: `No itinerary details found for user with ID ${user_id} and recommendation ID ${recommendation_id}`
          });
        }
    
        res.json(details);
    } catch (error) {
        console.error('Error fetching itinerary details:', error); // Debugging
        res.status(500).json({
            message: `Unable to retrieve itinerary details for user with ID ${user_id} and recommendation ID ${recommendation_id}`
        });
    }
}

module.exports = { 
    itineraries,
    saveItinerary,
    itinerariesDetails
}