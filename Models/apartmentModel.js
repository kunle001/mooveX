const mongoose= require('mongoose')


const apartmentSchema= new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'apartment must have a name'],
        unique:true,
        trim: true,
        maxlength: [40, 'Name should be less than 40 letters'],
        minlength: [5, 'Apartment should have a name at least 5 length long'],

    },
    slug: String,
    roomspaces:{
        type: Number, 
        required: [true, 'please specify the number of rooms available'],
    },

    roomOccupants: Number, 
    coordinates: {
        type: [Number],
        required: [true, 'what is the "coordinates" of this apartment???']
    },

    owner:{
        type: String, 
        required: [true, 'Apartment must belong to an owner']
    }, 
    summary:{
        type: String, 
        required: [true, 'Please add ur description'], 
        trim: true
    }, 
    years: {
        type: Number, 
        required: ['true', 'Please how old is your apartment']
    }, 
    secretApartment: {
        type: Boolean,
        default: false
    },
    price: {
        type: Number,
        required:[true, 'what is the "price" of your apartment']
    }, 
    discountPrice: Number,
    imageCover: {
        type: String,
        required: [true, 'your apartment must have an image cover']
    },
    images: [String],

    ratingsAverage: {
        type: Number,
        default: 4.5
    },
    ratingsQuantity: {
        type: Number,
        default: 1
    }

})


const Apartment = mongoose.model('Apartment', apartmentSchema)

module.exports = Apartment;