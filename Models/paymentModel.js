const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  apartment: {
    type: mongoose.Schema.ObjectId,
    ref: 'Apartment',
    required: [true, 'Payment must belong to an Apartment!']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Apartment must belong to a User!']
  },
  price: {
    type: Number,
    require: [true, 'Apartment must have a price.']
  },
  createdAt: {
    type: Date,
    default: new Date
  },
  paid: {
    type: Boolean,
    default: true
  }
});

paymentSchema.index({createdAt: -1})

paymentSchema.pre(/^find/, function(next) {
  this.populate('user').populate({
    path: 'apartment',
    select: 'name price'
  });
  next();
});

const Booking = mongoose.model('Payment', paymentSchema);

module.exports = Booking;
