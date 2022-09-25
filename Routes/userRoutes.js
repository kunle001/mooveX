const userController= require('../Controllers/userController')
const authController= require('../Controllers/authController')

const express= require('express')

const router= express.Router()

router.route('/login').post(authController.login)
router.route('/logout').get(authController.logout)
router.route('/forgotPassword').post(authController.forgotPassword);


router.route('/')
        .post(authController.signUp)
        .get(authController.protect, authController.RestrictTo('admin'), userController.getAllUsers)

router.route('/me').get(authController.protect, userController.myProfile)
                   .patch(userController.uploadUserPhoto,userController.resizeUserPhoto,userController.updateMe)
                   
router.route('/update-password')
        .patch(authController.protect, authController.updatePassword)

router.route('/:id')
        .delete(authController.RestrictTo('admin'), userController.deleteAccount)
        .patch(authController.protect, userController.uploadUserPhoto,userController.resizeUserPhoto,
        userController.updateUser)
        .get(userController.getOneUser)



router.route('/activateAccount').post(userController.activateAccount)
router.route('/deactivateAccount').patch(authController.protect, userController.deactivateAccount)


router.route('/resetPassword/:token').post(authController.resetPassword);
        
// router.route('/:id')

module.exports= router 