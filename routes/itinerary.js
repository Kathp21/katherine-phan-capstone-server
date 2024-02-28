const router = require('express').Router();
const itineraryController = require('../controllers/itinerary');


router
    .route('/')
    .post(itineraryController.add)

module.exports = router;