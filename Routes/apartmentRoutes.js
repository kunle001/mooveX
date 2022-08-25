const express= require('express');
const apartmentController = require('../Controllers/apartmentController');
const authController= require('../Controllers/authController')

const router= express.Router();

// router.use('/:tourId')


router.route('/')
    .get(apartmentController.getAllApartments)
    .post(apartmentController.createApartment)

router.use(authController.checkIfLoggedin)

router.route('/:id')
    .get(apartmentController.getOneApartment)
    
router.use(authController.Restrict('admin'))
    .patch(apartmentController.updateApartment)
    .delete(apartmentController.deleteApartment)




module.exports= router;







