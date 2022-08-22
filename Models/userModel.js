const mongoose = require('mongoose');
const slugify= require('slugify')
const bcrypt= require('bcrypt')

userSchema= new mongoose.Schema({
    name:{
        type: String,
        required:[true, 'provide a name'],

    },
    password: {
        type: String,
        minlength: 8,
        select: false, //dont show this on the api
        required:[true, 'input your password']
    }, 
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
          // This only works on CREATE and SAVE!!!
          validator: function(el) {
            return el === this.password;
          },
          message: 'Passwords are not the same!'
        }
      },
    email: {
        type: String,
        unique: true,
        required: [true, 'please provide an email']
    },

    imageCover: {
        type: String,
        required: [true, 'Please Upload your picture "imageCover"']
    }, 
    active: {
        type: Boolean, 
        default: true
    },

    about: String,
    slug: String, 
    role: {
        type: String, 
        enum: ['user', 'agent', 'owner'] ,
        default: 'user'
    },
    experience:{
        type: Number, 
        validate:{
            validator: function(el){
               return this.role==='agent'
            }
        }
    }, 

})

userSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true });
    next();
  });

userSchema.pre('save', async function(next){

    if(!this.isModified('password')) return next();

    this.password= await bcrypt.hash(this.password, 12);

    this.passwordConfirm= undefined;
    next();

});

userSchema.pre(/^find/, function(next){
    this.find({active: {$ne: false}});
    next();

});




const User = mongoose.model('User', userSchema);

module.exports = User;
