const mongoose = require('mongoose');
const slugify= require('slugify')
const bcrypt= require('bcrypt')
const crypto= require('crypto')


userSchema= new mongoose.Schema({
    firstName:{
        type: String,
        required:[true, 'provide a name'],

    },
    lastName:{
        type: String,
        required: [true, 'what is your "lastName"']

    },

    password: {
        type: String,
        minlength: 8,
        select: false,
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

    profilePic: {
        type: String,
        required: [true, 'Please Upload your picture "imageCover"']
    }, 
    active: {
        type: Boolean, 
        default: true
    },
    checked:{
        type: Boolean,
        default: false
    },
    aboutMe: String,
    slug: String, 
    role: {
        type: String, 
        enum: ['user', 'agent', 'owner', 'admin'],
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
    passwordChangedAt:{
        type: Date,
        select: false
    },
    passwordResetToken: {type:String, select: false},
    passwordResetExpires: {type:Date, select:false}

},
{
    toObject: {virtuals:true},
    toJSON: {virtuals: true}
    
});

userSchema.virtual('booking',{
    ref:'Booking',
    foreignField: 'user',
    localField: '_id'
});

userSchema.virtual('booking', {
    ref: 'Booking',
    foreignField: 'agent', 
    localField: '_id'

})

userSchema.virtual('booking', {
    ref: 'Booking', 
    foreignField: 'apartment',
    localField: '_id'
});


userSchema.pre('save', function(next){

    if(!this.isModified('password')) return next();

    this.password= bcrypt.hash(this.password, 12);

    this.passwordConfirm= undefined;
    next();

});



userSchema.pre(/^find/, function(next){
    this.find({active: {$ne: false}});
    next();

});


userSchema.methods.changedPasswordAfter= function(jwtTimeStamp){
    if(this.passwordChangedAt){
        const changedPasswordAt= parseInt(this.passwordChangedAt.getTime()/1000, 10)

        return jwtTimeStamp< changedPasswordAt
    }
};

userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
  
    this.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
  
    // console.log({ resetToken }, this.passwordResetToken);
  
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  
    return resetToken;
  };



const User = mongoose.model('User', userSchema);


module.exports = User;



