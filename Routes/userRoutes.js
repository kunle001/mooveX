const userController= require('../Controllers/userController')
const authController= require('../Controllers/authController')

const express= require('express')

const router= express.Router()

router.route('/')
        .post(userController.signUp)
        .get(userController.getAllUsers)
router.route('/:id')
        .delete(userController.deactivateAccount)
        .patch(userController.updateUser)
        .get(userController.getOneUser)

router.route('/login').post(authController.login)
router.route('/logout').get(authController.logout)

router.route('/activateAccount').post(userController.activateAccount)

router.route('/forgotPassword').post(authController.forgotPassword);

router.route('/resetPassword/:token').post(authController.resetPassword);
        


module.exports= router