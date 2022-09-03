const userController= require('../Controllers/userController')
const authController= require('../Controllers/authController')

const express= require('express')

const router= express.Router()

router.route('/login').post(authController.login)
router.route('/logout').get(authController.logout)
router.route('/forgotPassword').post(authController.forgotPassword);


router.route('/')
        .post(authController.signUp)
        .get(authController.checkIfLoggedin, authController.Restrict('admin'), userController.getAllUsers)

router.route('/me').get(authController.checkIfLoggedin, userController.myProfile)

router.route('/:id')
        .delete(authController.Restrict('admin'), userController.deleteAccount)
        .patch(authController.checkIfLoggedin, userController.updateUser)
        .get(userController.getOneUser)



router.route('/activateAccount').post(userController.activateAccount)
router.route('/deactivateAccount').patch(authController.checkIfLoggedin, userController.deactivateAccount)


router.route('/resetPassword/:token').post(authController.resetPassword);
        
// router.route('/:id')

module.exports= router 