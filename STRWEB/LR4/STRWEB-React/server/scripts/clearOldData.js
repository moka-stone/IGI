const mongoose = require('mongoose');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Toy = require('../models/Toy');
require('dotenv').config();

const clearOldData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/realestate');
    console.log('Connected to MongoDB');

    // Удалить все заказы (они могут содержать старые данные об автомобилях)
    const ordersDeleted = await Order.deleteMany({});
    console.log(`Deleted ${ordersDeleted.deletedCount} orders`);

    // Удалить все отзывы
    const reviewsDeleted = await Review.deleteMany({});
    console.log(`Deleted ${reviewsDeleted.deletedCount} reviews`);

    // Удалить все игрушки (если нужно начать с чистого листа)
    const toysDeleted = await Toy.deleteMany({});
    console.log(`Deleted ${toysDeleted.deletedCount} toys`);

    // Удалить старые индексы из коллекции reviews
    try {
      const ReviewModel = mongoose.model('Review');
      const indexes = await ReviewModel.collection.getIndexes();
      console.log('Current indexes:', Object.keys(indexes));
      
      // Удаляем старый индекс car_1_user_1 если он существует
      if (indexes['car_1_user_1']) {
        await ReviewModel.collection.dropIndex('car_1_user_1');
        console.log('✅ Dropped old index: car_1_user_1');
      }
      
      // Удаляем старый индекс car_1_createdAt_-1 если он существует
      if (indexes['car_1_createdAt_-1']) {
        await ReviewModel.collection.dropIndex('car_1_createdAt_-1');
        console.log('✅ Dropped old index: car_1_createdAt_-1');
      }
      
      // Пересоздаем правильные индексы
      await ReviewModel.collection.createIndex({ toy: 1, createdAt: -1 });
      await ReviewModel.collection.createIndex({ toy: 1, user: 1 }, { unique: true });
      console.log('✅ Created new indexes for Review model');
    } catch (error) {
      console.log('Index operation error:', error.message);
    }

    console.log('✅ Old data cleared successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing data:', error);
    process.exit(1);
  }
};

clearOldData();

