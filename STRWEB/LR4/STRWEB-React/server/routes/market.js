const express = require('express');
const router = express.Router();
const Toy = require('../models/Toy');
const Order = require('../models/Order');

// @route   GET /api/market/stats
// @desc    Get market statistics
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const totalToys = await Toy.countDocuments();
    const availableToys = await Toy.countDocuments({ status: 'available' });
    const unavailableToys = await Toy.countDocuments({ status: 'unavailable' });
    
    const avgPrice = await Toy.aggregate([
      { $match: { status: 'available' } },
      { $group: { _id: null, avgPrice: { $avg: '$price' } } }
    ]);

    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, totalValue: { $sum: '$totalPrice' } } }
    ]);

    const totalOrders = await Order.countDocuments();
    const completedOrders = await Order.countDocuments({ status: 'completed' });

    const toysByCategory = await Toy.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.json({
      totalToys,
      availableToys,
      unavailableToys,
      averagePrice: avgPrice[0]?.avgPrice || 0,
      totalOrders,
      completedOrders,
      ordersByStatus,
      toysByCategory
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

