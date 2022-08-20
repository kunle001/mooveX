const express= require('express');
const apartmentController = require('../Controllers/apartmentController');

const router= express.Router();


router.route('/')
    .get(apartmentController.getAllApartments)
    .post(apartmentController.createApartment)

router.route('/:id')
    .patch(apartmentController.updateApartment)
    .delete(apartmentController.deleteApartment)




module.exports= router;







