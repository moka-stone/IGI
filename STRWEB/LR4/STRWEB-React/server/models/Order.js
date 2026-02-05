const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  toys: [{
    toyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Toy'
    },
    // Сохраняем полную информацию об игрушке для истории
    toyData: {
      title: String,
      brand: String,
      model: String,
      category: String,
      ageRange: {
        min: Number,
        max: Number
      },
      material: String,
      color: String,
      dimensions: {
        length: Number,
        width: Number,
        height: Number
      },
      weight: Number,
      features: [String],
      images: [{
        url: String,
        description: String
      }]
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price must be positive']
    },
    quantity: {
      type: Number,
      required: true,
      min: [100, 'Minimum order quantity is 100'],
      default: 100
    }
  }],
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Total price must be positive']
  },
  paymentInfo: {
    cardNumber: String,
    cardHolder: String,
    email: String,
    phone: String
  },
  status: {
    type: String,
    enum: ['processing', 'completed'],
    default: 'processing'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date
});

orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  if (this.status === 'completed' && !this.completedAt) {
    this.completedAt = Date.now();
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);

