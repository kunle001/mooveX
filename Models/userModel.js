const mongoose = require('mongoose');
const slugify = require('slugify')
const bcrypt = require('bcrypt')
const crypto = require('crypto')


userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'provide a name'],

  },
  lastName: {
    type: String,
    required: [true, 'what is your "lastName"']

  },

  password: {
    type: String,
    minlength: 8,
    select: false,
    required: [true, 'input your password']
  },
  confirmPassword: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function (el) {
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
  active: {
    type: Boolean,
    default: true
  },
  checked: {
    type: Boolean,
    default: false
  },
  bio: String,
  slug: String,
  role: {
    type: String,
    enum: ['user', 'agent', 'owner', 'admin'],
    default: 'user'
  },
  imageCover: { type: String, default: 'default.jpg' },
  Tel: Number,
  occupation: String,
  currentLocation: {
    type: {
      type: String,
      default: "Point",
      enum: ["Point"]
    },
    coordinates: [Array]
  },
  passwordChangedAt: {
    type: Date,
    select: false
  },
  passwordResetToken: { type: String, select: false },
  passwordResetExpires: { type: Date, select: false }

},

  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }

  });

userSchema.virtual('booking', {
  ref: 'Booking',
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


userSchema.pre('save', function (next) {

  if (!this.isModified('password')) return next();

  this.password = bcrypt.hash(this.password, 12);

  this.confirmPassword = undefined;
  next();

});


userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');


  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;



