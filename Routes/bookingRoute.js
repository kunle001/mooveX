const express= require('express')
const bookingController= require('../Controllers/bookingController')
const authController= require('../Controllers/authController')


const router= express.Router({mergeParams:true});

router.use(authController.protect)

router.route('/:apartmentId/agent/:agentId').post(bookingController.createBooking)

router.route('/').get(bookingController.getBookings)


module.exports= router
