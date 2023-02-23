const express= require('express');
const apartmentController = require('../Controllers/apartmentController');
const authController= require('../Controllers/authController')
const reviewRouter= require('../Routes/reviewRoutes')
const bookingRouter= require('../Routes/bookingRoute')

const router= express.Router();

// router.use('/:tourId')


router.use('/:apartmentId/reviews', reviewRouter);
router.use('/:apartmentId/bookings', bookingRouter)

router.use(authController.protect)

router.route('/')
    .get(apartmentController.getAllApartments)
    .post(apartmentController.createApartment)
router.route('/top-5-cheap').get(apartmentController.getTop5Cheap);

router.route('/google-analytics').get(apartmentController.googleAnalytics)


router.route('/:id')
    .get(apartmentController.getOneApartment)
    .patch(
        apartmentController.uploadApartmentImages,
        apartmentController.resizeApartmentImages,
        apartmentController.uploadVideo,
        apartmentController.updateApartment)
    .delete(apartmentController.deleteApartment)
router.route('/around/:distance/center/:latlng/unit/:unit').get(apartmentController.getApartmentAround)

router.route('/distances/:latlng/unit/:unit').get(apartmentController.getDistances)



module.exports= router;