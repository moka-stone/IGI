const mongoose = require('mongoose');

const toySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title must be less than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['constructor', 'doll', 'car', 'board_game', 'soft_toy', 'educational', 'puzzle', 'action_figure', 'sports', 'electronic', 'other'],
    required: [true, 'Category is required']
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Model is required'],
    trim: true
  },
  ageRange: {
    min: {
      type: Number,
      required: [true, 'Minimum age is required'],
      min: [0, 'Minimum age must be 0 or greater']
    },
    max: {
      type: Number,
      required: [true, 'Maximum age is required'],
      min: [0, 'Maximum age must be 0 or greater'],
      max: [99, 'Maximum age must be 99 or less']
    }
  },
  material: {
    type: String,
    enum: ['plastic', 'wood', 'textile', 'metal', 'rubber', 'mixed'],
    required: [true, 'Material is required']
  },
  color: {
    type: String,
    required: [true, 'Color is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be positive']
  },
  dimensions: {
    length: {
      type: Number,
      min: [0, 'Length must be positive']
    },
    width: {
      type: Number,
      min: [0, 'Width must be positive']
    },
    height: {
      type: Number,
      min: [0, 'Height must be positive']
    }
  },
  weight: {
    type: Number,
    min: [0, 'Weight must be positive']
  },
  features: [{
    type: String,
    trim: true,
    maxlength: [100, 'Feature must be less than 100 characters']
  }],
  images: [{
    url: String,
    description: String,
    visionAnalysis: {
      labels: [String],
      confidence: Number
    }
  }],
  status: {
    type: String,
    enum: ['available', 'unavailable'],
    default: 'available'
  },
  article: {
    type: String,
    trim: true,
    uppercase: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

toySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Toy', toySchema);

