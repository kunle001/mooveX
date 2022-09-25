const authController= require('../Controllers/authController')
const express= require('express')

const router= express.Router();

router.route('/signup').post(authController.signUpAgent)

module.exports= router