const mongoose= require('mongoose');

const bookingSchema= new mongoose.Schema({
    user:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required:[true, 'booking must have a user']
    },
    agent:
        {
          type: mongoose.Schema.ObjectId,
          ref: 'User'
        },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    apartment:{
        type:mongoose.Schema.ObjectId,
        ref: 'Apartment',
        required:[true, 'input apartment']
    },
    message: String,
    scheduledAt: Date
},
{ toJSON: { virtuals: true }, toObject: { virtuals: true }});

bookingSchema.index({apartment: 1, user:1, agent:1}, {unique:true})
bookingSchema.index({sheduledAt: 1})

bookingSchema.pre('save', function(next){
    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 3)

    this.scheduledAt= tomorrow
    next();
})

bookingSchema.pre(/^find/, function(next){
    this.populate({
        path: 'user',
        select: 'email profilePic firstName'
    }).populate({
        path:'apartment',
        select: 'name years ratingsAverage'
    }).populate({
        path:'agent',
        select: 'name email'
    });
    next();
})

const Booking= mongoose.model('booking', bookingSchema)

module.exports= Booking

