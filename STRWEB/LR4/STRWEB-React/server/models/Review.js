const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  toy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Toy',
    required: [true, 'Toy is required']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating must be at most 5']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title must be less than 200 characters']
  },
  comment: {
    type: String,
    required: [true, 'Comment is required'],
    trim: true,
    maxlength: [2000, 'Comment must be less than 2000 characters']
  },
  pros: [{
    type: String,
    trim: true,
    maxlength: [100, 'Pro must be less than 100 characters']
  }],
  cons: [{
    type: String,
    trim: true,
    maxlength: [100, 'Con must be less than 100 characters']
  }],
  verifiedPurchase: {
    type: Boolean,
    default: false
  },
  helpful: {
    type: Number,
    default: 0,
    min: [0, 'Helpful count cannot be negative']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

reviewSchema.index({ toy: 1, createdAt: -1 });
reviewSchema.index({ toy: 1, user: 1 }, { unique: true });

reviewSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Review', reviewSchema);

