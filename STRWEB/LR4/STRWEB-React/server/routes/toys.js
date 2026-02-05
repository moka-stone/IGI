const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const Toy = require('../models/Toy');
const auth = require('../middleware/auth');

// @route   GET /api/toys
// @desc    Get all toys (with search, sort, filter)
// @access  Public
router.get('/', [
  query('search').optional().trim(),
  query('sort').optional().isIn(['price_asc', 'price_desc', 'weight_asc', 'weight_desc', 'date_desc', 'date_asc']),
  query('category').optional().isIn(['constructor', 'doll', 'car', 'board_game', 'soft_toy', 'educational', 'puzzle', 'action_figure', 'sports', 'electronic', 'other']),
  query('status').optional().isIn(['available', 'unavailable']),
  query('minPrice').optional().isNumeric(),
  query('maxPrice').optional().isNumeric(),
  query('minAge').optional().isNumeric(),
  query('maxAge').optional().isNumeric(),
  query('material').optional().isIn(['plastic', 'wood', 'textile', 'metal', 'rubber', 'mixed'])
], async (req, res) => {
  try {
    const { search, sort, category, status, minPrice, maxPrice, minAge, maxAge, material } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) query.category = category;
    if (status) query.status = status;
    if (material) query.material = material;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (minAge || maxAge) {
      query['ageRange.min'] = {};
      query['ageRange.max'] = {};
      if (minAge) query['ageRange.min'].$lte = Number(minAge);
      if (maxAge) query['ageRange.max'].$gte = Number(maxAge);
    }

    let sortOption = {};
    switch (sort) {
      case 'price_asc': sortOption = { price: 1 }; break;
      case 'price_desc': sortOption = { price: -1 }; break;
      case 'weight_asc': sortOption = { weight: 1 }; break;
      case 'weight_desc': sortOption = { weight: -1 }; break;
      case 'date_desc': sortOption = { createdAt: -1 }; break;
      case 'date_asc': sortOption = { createdAt: 1 }; break;
      default: sortOption = { createdAt: -1 };
    }

    const toys = await Toy.find(query)
      .populate('createdBy', 'username')
      .sort(sortOption);

    res.json(toys);
  } catch (error) {
    console.error('Toys GET error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/toys/:id
// @desc    Get toy by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const toy = await Toy.findById(req.params.id)
      .populate('createdBy', 'username');
    
    if (!toy) {
      return res.status(404).json({ message: 'Toy not found' });
    }

    res.json(toy);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/toys
// @desc    Create toy
// @access  Private
router.post('/', auth, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('brand').trim().notEmpty().withMessage('Brand is required'),
  body('model').trim().notEmpty().withMessage('Model is required'),
  body('category').isIn(['constructor', 'doll', 'car', 'board_game', 'soft_toy', 'educational', 'puzzle', 'action_figure', 'sports', 'electronic', 'other']).withMessage('Invalid category'),
  body('ageRange.min').isInt({ min: 0 }).withMessage('Minimum age must be 0 or greater'),
  body('ageRange.max').isInt({ min: 0, max: 99 }).withMessage('Maximum age must be between 0 and 99'),
  body('material').isIn(['plastic', 'wood', 'textile', 'metal', 'rubber', 'mixed']).withMessage('Invalid material'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('color').trim().notEmpty().withMessage('Color is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const toy = new Toy({
      ...req.body,
      createdBy: req.user.id
    });

    await toy.save();
    await toy.populate('createdBy', 'username');

    res.status(201).json(toy);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/toys/:id
// @desc    Update toy
// @access  Private
router.put('/:id', auth, [
  body('ageRange.max').optional().isInt({ min: 0, max: 99 }).withMessage('Maximum age must be between 0 and 99')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const toy = await Toy.findById(req.params.id);
    
    if (!toy) {
      return res.status(404).json({ message: 'Toy not found' });
    }

    if (toy.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(toy, req.body);
    await toy.save();
    await toy.populate('createdBy', 'username');

    res.json(toy);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/toys/:id
// @desc    Delete toy
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const toy = await Toy.findById(req.params.id);
    
    if (!toy) {
      return res.status(404).json({ message: 'Toy not found' });
    }

    if (toy.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await toy.deleteOne();
    res.json({ message: 'Toy deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

