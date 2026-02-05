const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const Review = require('../models/Review');
const Toy = require('../models/Toy');
const auth = require('../middleware/auth');

// @route   GET /api/reviews
// @desc    Get all reviews (with filters)
// @access  Public
router.get('/', [
  query('toy').optional().isMongoId().withMessage('Invalid toy ID'),
  query('user').optional().isMongoId().withMessage('Invalid user ID'),
  query('minRating').optional().isInt({ min: 1, max: 5 }),
  query('maxRating').optional().isInt({ min: 1, max: 5 })
], async (req, res) => {
  try {
    const { toy, user, minRating, maxRating } = req.query;
    let query = {};

    if (toy) query.toy = toy;
    if (user) query.user = user;
    if (minRating || maxRating) {
      query.rating = {};
      if (minRating) query.rating.$gte = Number(minRating);
      if (maxRating) query.rating.$lte = Number(maxRating);
    }

    const reviews = await Review.find(query)
      .populate('toy', 'brand model title')
      .populate('user', 'username email')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error('Reviews GET error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/reviews/:id
// @desc    Get review by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('toy', 'brand model title')
      .populate('user', 'username email');
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/reviews/toy/:toyId
// @desc    Get reviews for specific toy
// @access  Public (optional auth)
router.get('/toy/:toyId', async (req, res) => {
  try {
    const toy = await Toy.findById(req.params.toyId);
    if (!toy) {
      return res.status(404).json({ message: 'Toy not found' });
    }

    const query = { toy: req.params.toyId };

    const reviews = await Review.find(query)
      .populate('user', 'username email')
      .sort({ createdAt: -1 });

    // Вычисляем средний рейтинг
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.json({
      reviews,
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews: reviews.length
    });
  } catch (error) {
      console.error('Error fetching reviews for toy:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/reviews
// @desc    Create review
// @access  Private
router.post('/', auth, [
  body('toy').isMongoId().withMessage('Valid toy ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('comment').trim().notEmpty().withMessage('Comment is required'),
  body('pros').optional().isArray(),
  body('cons').optional().isArray(),
  body('verifiedPurchase').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Проверяем, существует ли игрушка
    const toy = await Toy.findById(req.body.toy);
    if (!toy) {
      return res.status(404).json({ message: 'Toy not found' });
    }

    // Проверяем, не оставлял ли пользователь уже отзыв на эту игрушку
    const existingReview = await Review.findOne({
      toy: req.body.toy,
      user: req.user.id
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this toy' });
    }

    const review = new Review({
      ...req.body,
      user: req.user.id
    });

    await review.save();
    await review.populate('toy', 'brand model title');
    await review.populate('user', 'username email');

    res.status(201).json(review);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this toy' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/reviews/:id
// @desc    Update review
// @access  Private
router.put('/:id', auth, [
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('comment').optional().trim().notEmpty().withMessage('Comment cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Проверяем права доступа: только автор или админ может редактировать
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Обновляем поля
    Object.assign(review, req.body);
    await review.save();
    await review.populate('toy', 'brand model title');
    await review.populate('user', 'username email');

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete review
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Проверяем права доступа: только автор или админ может удалять
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await review.deleteOne();
    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/reviews/:id/helpful
// @desc    Mark review as helpful
// @access  Private
router.post('/:id/helpful', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Увеличиваем счетчик полезности
    review.helpful = (review.helpful || 0) + 1;
    await review.save();

    res.json({ helpful: review.helpful });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

