const express = require('express')
const router = require('express').Router()
const userController = require('../controllers/user-controllers')
const authorize = require('../middleware/authorize')


router.post('/register', userController.register)
router.post('/login', userController.login)
router.get('/current-user', authorize, userController.currentUser)
router.get('/itinerary-title/', authorize, userController.itineraryTitle)

module.exports = router