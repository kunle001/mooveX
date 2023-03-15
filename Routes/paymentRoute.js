const paymentController = require('../Controllers/paymentController')
const authController = require('../Controllers/authController')

const express = require('express')

const router = express.Router()

router.route('/checkout-session/:apartmentID')
      .get(authController.protect, paymentController.getCheckoutSession)



module.exports = router 