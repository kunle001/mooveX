const express= require('express')
const reviewController= require('../Controllers/reviewsController')
const authController= require('../Controllers/authController')

const router= express.Router({mergeParams: true})

router.use(authController.checkIfLoggedin)

router.route('/')
        .post(
            authController.Restrict('admin'),
            reviewController.setAPartmentUserIds,
            reviewController.Checked,
            reviewController.createReview
        )
        .get(reviewController.getReviews)
 
router.route('/:id').patch(
    reviewController.setAPartmentUserIds,
    reviewController.updateReview
).delete(reviewController.deleteReview)


module.exports= router












