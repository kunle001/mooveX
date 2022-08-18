const express= require('express');
const apartmentController= require('../Controllers/apartmentController');

const router= express.Router();


router
    .route('/')
    .get(apartmentController.getAllApartments)
    .post(apartmentController.createApartment)

module.exports= router;