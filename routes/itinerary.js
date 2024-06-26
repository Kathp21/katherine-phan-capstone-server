const router = require('express').Router();
const itineraryController = require('../controllers/itinerary-controllers');
const authorize = require('../middleware/authorize');


router.get('/itineraries', authorize, itineraryController.itineraries)
// router.get('/itinerary-details/:recommendation_id', authorize, itineraryController.itinerariesDetails)
router.post('/save-itinerary', authorize, itineraryController.saveItinerary)


router
    .route('/:recommendation_id')
    .get(authorize, itineraryController.itinerariesDetails)
    .delete(itineraryController.deleteItinerary)

module.exports = router;