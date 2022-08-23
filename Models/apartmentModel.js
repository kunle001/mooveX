const mongoose= require('mongoose')
const slugify = require('slugify')



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
    apartmentType: {
        type: String,
        enum: ['student', 'open', 'gender specific', 'non-student'],
        default: 'open'

    },

    gender: {
        type: String,
        enum: ['Male', 'Female'],
        validate:{
            validator: function(){
                return this.apartmentType=== 'gender specific'
            }
        }
    },

    roomOccupants: Number, 
    coordinates: {
        type: [Number],
        required: [true, 'what is the "coordinates" of this apartment???']
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
    },
    agents:[{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    }],

    owners:[{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
},
{
    toJSON: {virtuals: true}, 
    toobject: {virtuals: true}
})

apartmentSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true });
    next();
  });

apartmentSchema.pre(/^findOne/, function(next){
    this.populate({
        path: 'owners',
        select: 'name email imageCover -_id '
    });
    
    this.populate({
        path: 'agents',
        select: 'name email imageCover -_id'
    })

    next();
});




const Apartment = mongoose.model('Apartment', apartmentSchema)

module.exports = Apartment;