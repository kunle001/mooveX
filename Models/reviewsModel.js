const mongoose= require('mongoose')
const Apartment= require('./apartmentModel')


const reviewSchema= new mongoose.Schema({
    rating:{
        type: Number, 
        min:1,
        max:5,
        required: [true, 'Add your ratings'],
    },
    comment:{
        type: String,
        required:[true, 'drop your comment']
    }, 
    createdAt: {
        type: Date, 
        default: Date.now
    }, 
    apartment:{
        type: mongoose.Schema.ObjectId,
        ref: 'Apartment',
        required: [true, 'comment must be on an apartment']
    },

    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'you must be a user to make comment']
    }
}, 
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  });


reviewSchema.index({apartment: 1, user:1}, {unique:true})



reviewSchema.pre(/^find/, function(next){
    this.populate({
        path: 'user',
        select: 'firstName lastName imageCover role'
    }).populate({
        path: 'apartment',
        select: '-_id'
    });
    next();
})

reviewSchema.statics.calcAVerageRatings= async function(apartmentId){

    const reviewStats= await this.aggregate([
        {
            $match: {apartment: apartmentId}
        },
        {
            $group:{
                _id: '$apartment',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating'}
            }
        }
    ]);
    
    await Apartment.findByIdAndUpdate(apartmentId, {
        ratingsQuantity: reviewStats[0].nRating,
        ratingsAverage: reviewStats[0].avgRating
    })
};

reviewSchema.post('save',async function(){

    await this.constructor.calcAVerageRatings(this.apartment)
     
})

reviewSchema.pre(/^findOneAnd/, async function(next){
    this.review= await Review.findOne()
    next();
})

reviewSchema.post(/^findOneAnd/, async function(){
   await this.review.constructor.calcAVerageRatings(this.review.apartment)
})

const Review= mongoose.model('Review', reviewSchema)

module.exports= Review;