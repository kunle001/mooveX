const express= require('express');
const multer= require('multer')
const authController= require('../Controllers/authController')
const paymentController= require('../Controllers/paymentController')
const viewsController= require('../Controllers/viewsController')


const router= express.Router()

router.use(authController.checkIfLoggedIn)

router.get('/',paymentController.createPaymentCheckout,viewsController.homePage);

router.get('/login', viewsController.login)
router.get('/agents', viewsController.agentPage)
router.get('/my-profile', viewsController.userProfile);
router.get('/apartments', viewsController.allApartments)
router.get('/signup', viewsController.signUp)
router.get('/create-apartment',viewsController.createApartment)
router.get('/updateme', viewsController.updateUser)
router.get('/forgot-password', viewsController.forgotPassword)
router.get('/:slug', viewsController.apartmentPage);
router.get('/user/:userId', viewsController.Profile)
module.exports= router;