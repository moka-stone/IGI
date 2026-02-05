const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Toy = require('../models/Toy');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   GET /api/orders
// @desc    Get all orders (for current user or admin)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    // Обычные пользователи видят только свои заказы
    if (req.user.role !== 'admin') {
      query.user = req.user.id;
    }

    const orders = await Order.find(query)
      .populate('user', 'username email')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'username email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Проверка прав доступа
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/orders
// @desc    Create order
// @access  Private
router.post('/', auth, [
  body('toys').isArray({ min: 1 }).withMessage('At least one toy is required'),
  body('toys.*.toy').isMongoId().withMessage('Valid toy ID is required'),
  body('toys.*.price').isNumeric().withMessage('Price must be a number'),
  body('toys.*.quantity').isInt({ min: 100 }).withMessage('Minimum order quantity is 100'),
  body('totalPrice').isNumeric().withMessage('Total price must be a number')
], async (req, res) => {
  try {
    // Администраторы не могут создавать заказы
    if (req.user.role === 'admin') {
      return res.status(403).json({ message: 'Administrators cannot create orders' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Проверяем, что все игрушки существуют и доступны, и сохраняем их данные
    const toysData = [];
    for (const item of req.body.toys) {
      const toy = await Toy.findById(item.toy);
      if (!toy) {
        return res.status(404).json({ message: `Toy ${item.toy} not found` });
      }
      if (toy.status !== 'available') {
        return res.status(400).json({ message: `Toy ${toy.title} is not available` });
      }
      
      // Проверяем количество
      const quantity = item.quantity || 100;
      if (quantity < 100) {
        return res.status(400).json({ message: `Minimum order quantity is 100 for toy ${toy.title}` });
      }
      
      // Сохраняем данные об игрушке
      toysData.push({
        toyId: toy._id,
        toyData: {
          title: toy.title,
          brand: toy.brand,
          model: toy.model,
          category: toy.category,
          ageRange: toy.ageRange,
          material: toy.material,
          color: toy.color,
          dimensions: toy.dimensions,
          weight: toy.weight,
          features: toy.features || [],
          images: toy.images || []
        },
        price: item.price,
        quantity: quantity
      });
    }

    // Получаем данные пользователя для paymentInfo
    const userData = await User.findById(req.user.id);
    
    const order = new Order({
      user: req.user.id,
      toys: toysData,
      totalPrice: req.body.totalPrice,
      paymentInfo: req.body.paymentInfo || {
        email: userData?.email || '',
        phone: '',
        cardNumber: '',
        cardHolder: ''
      },
      status: 'processing'
    });

    await order.save();

    await order.populate('user', 'username email');

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (admin only)
// @access  Private (Admin)
router.put('/:id/status', auth, [
  body('status').isIn(['processing', 'completed']).withMessage('Invalid status')
], async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = req.body.status;
    if (req.body.status === 'completed' && !order.completedAt) {
      order.completedAt = new Date();
    }
    
    await order.save();
    await order.populate('user', 'username email');

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

