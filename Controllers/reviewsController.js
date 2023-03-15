const { findByIdAndDelete } = require('../Models/apartmentModel');
const { findById } = require('../Models/bookSectionModel');
const Review = require('../Models/reviewsModel');
const User = require('../Models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync')



exports.setAPartmentUserIds = (req, res, next) => {
    if (!req.body.apartment) req.body.apartment = req.params.apartmentId;
    if (!req.body.user) req.body.user = res.locals.user.id;
    next();
};

exports.Checked = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.body.user)
    if (!user.checked) {
        return (next(new AppError('you are not checked you cannot make reviews', 400)))
    }
    next();

});


exports.createReview = catchAsync(async (req, res, next) => {

    const review = await Review.create(req.body);

    if (!review) {
        return next(new AppError('an error occured while creating this', 400))
    }

    res.status(201).json({
        status: 'success',
        data: review
    })

});


exports.getReviews = catchAsync(async (req, res, next) => {

    const reviews = await Review.find({ apartment: req.params.apartmentId })

    if (!reviews) {
        return (next(new AppError('no apartment with this ID', 404)))
    }

    res.status(200).json({
        length: reviews.length,
        status: 'success',
        data: reviews
    })

});

exports.updateReview = catchAsync(async (req, res, next) => {


    const review = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidations: true })

    if (!review) {
        return (next(new AppError('no review with this id', 404)))
    }

    res.status(200).json({
        status: 'success',
        data: review
    })


});

exports.deleteReview = catchAsync(async (req, res, next) => {

    const review = await findByIdAndDelete(req.params.id)

    if (!review) {
        return (next(new AppError('no review with this ID', 404)))
    }

    res.status(200).json({
        status: 'success',
        data: null
    })

})



