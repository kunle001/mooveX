const userController= require('../Controllers/userController')

const express= require('express')

const router= express.Router()

router.route('/')
        .post(userController.signUp)
        .get(userController.getAllUsers)
router.route('/:id')
        .delete(userController.deactivateAccount)
        .patch(userController.updateUser)
        .get(userController.getOneUser)

router.route('/activateAccount').post(userController.activateAccount)
        


module.exports= router