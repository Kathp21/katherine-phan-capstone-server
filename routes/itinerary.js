const router = require('express').Router();
const itineraryController = require('../controllers/itinerary-controllers');
const authorize = require('../middleware/authorize');


router.get('/itineraries', authorize, itineraryController.itineraries)
router.post('/save-itinerary', authorize, itineraryController.saveItinerary)


router
    .route('/:recommendation_id')
    .get(authorize, itineraryController.itinerariesDetails)
    .delete(itineraryController.deleteItinerary)

module.exports = router;