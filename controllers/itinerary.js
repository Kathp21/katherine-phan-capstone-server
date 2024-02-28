const router = require("express").Router();
const knex = require("knex")(require("../knexfile"));

const add = async (req, res) => {

    const {
        day_string,
        location,
        duration,
        budget,
        description
    } = req.body
    
    try{
        const newItinerary = { day_string, location, duration, budget, description }
        const result = await knex('itinerary').insert(newItinerary, 'id')
        const newItineraryId = result[0]
        const createdItinerary = await knex('itinerary').where({id: newItineraryId}).first()
        res.status(201).json(createdItinerary)
    } catch(error) {
        res.status(500).json({
            message: `Unable to create new itinerary: ${error.message}`
        })
    }
}

module.exports = { add }