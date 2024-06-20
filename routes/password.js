const router = require('express').Router()
const passwordController = require('../controllers/password-controllers')

router.post('/forgot-password', passwordController.forgotPassword)
router.post('/reset-password', passwordController.resetPassword)

module.exports = router