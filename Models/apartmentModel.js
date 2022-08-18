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
    location: [
        {
            type:{
                type: String,
                default:'Point',
                enum: ['Point']
            },
            coordinates: {
                type: Number,
                unique:[true, 'This Place belongs to someone else']
            }, 
            address: String, 
            description: String, 

        }
    ],

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
    }
})


const Apartment= mongoose.model('Apartment', apartmentSchema)

module.exports= Apartment;