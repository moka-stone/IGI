const mongoose = require('mongoose');
const Toy = require('../models/Toy');
const User = require('../models/User');
const Review = require('../models/Review');
require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/realestate');
    console.log('Connected to MongoDB');

    // Создать тестового пользователя
    let user = await User.findOne({ email: 'test@example.com' });
    if (!user) {
      user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'admin'
      });
      await user.save();
      console.log('Test user created');
    }

    // Очистить существующие данные
    await Toy.deleteMany({});
    await Review.deleteMany({});
    
    // Удалить старые индексы из коллекции reviews (если они есть)
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
      // Продолжаем выполнение даже если есть ошибка с индексами
    }

    // Создать игрушки
    const toys = [
      {
        title: 'LEGO City Пожарная станция',
        description: 'Большой набор конструктора LEGO City с пожарной станцией, пожарной машиной и фигурками пожарных. Развивает воображение и моторику. Подходит для детей от 5 лет.',
        brand: 'LEGO',
        model: 'City Пожарная станция',
        category: 'constructor',
        ageRange: { min: 5, max: 12 },
        material: 'plastic',
        color: 'Красный, белый, желтый',
        price: 129,
        dimensions: { length: 38, width: 26, height: 9 },
        weight: 1200,
        features: ['Большой набор', 'Фигурки в комплекте', 'Подвижные элементы'],
        status: 'available',
        article: 'LEGO-60215',
        images: [
          {
            url: 'https://ir.ozone.ru/s3/multimedia-1-8/6908722136.jpg',
            description: 'LEGO City Пожарная станция'
          }
        ],
        createdBy: user._id
      },
      {
        title: 'Barbie Кукла с аксессуарами',
        description: 'Классическая кукла Barbie с красивым платьем и аксессуарами. Высокое качество, реалистичные черты лица. Идеальный подарок для девочек.',
        brand: 'Barbie',
        model: 'Классическая кукла',
        category: 'doll',
        ageRange: { min: 3, max: 10 },
        material: 'plastic',
        color: 'Розовый, золотой',
        price: 40,
        dimensions: { length: 12, width: 8, height: 30 },
        weight: 200,
        features: ['Сменная одежда', 'Аксессуары в комплекте', 'Гибкие суставы'],
        status: 'available',
        article: 'BARBIE-001',
        images: [
          {
            url: 'https://ir.ozone.ru/s3/multimedia-s/c1000/6849757756.jpg',
            description: 'Barbie кукла'
          }
        ],
        createdBy: user._id
      },
      {
        title: 'Hot Wheels Набор машинок',
        description: 'Набор из 10 машинок Hot Wheels разных моделей. Яркие цвета, качественная сборка. Отлично подходит для коллекции или игр.',
        brand: 'Hot Wheels',
        model: 'Набор машинок',
        category: 'car',
        ageRange: { min: 3, max: 14 },
        material: 'metal',
        color: 'Разные',
        price: 50,
        dimensions: { length: 30, width: 20, height: 5 },
        weight: 500,
        features: ['10 машинок', 'Разные модели', 'Коллекционное качество'],
        status: 'available',
        article: 'HW-10PACK',
        images: [
          {
            url: 'https://cdn.ime.by/UserFiles/images/catalog/Goods/2397/09642397/norm/09642397.n_0.png',
            description: 'Hot Wheels набор'
          }
        ],
        createdBy: user._id
      },
      {
        title: 'Монополия Классическая',
        description: 'Классическая настольная игра Монополия для всей семьи. Развивает стратегическое мышление и финансовую грамотность. Для 2-6 игроков.',
        brand: 'Hasbro',
        model: 'Монополия Классическая',
        category: 'board_game',
        ageRange: { min: 8, max: 99 },
        material: 'mixed',
        color: 'Разные',
        price: 45,
        dimensions: { length: 40, width: 40, height: 5 },
        weight: 800,
        features: ['Классическая версия', 'Для всей семьи', 'Развивающая игра'],
        status: 'available',
        article: 'MONOPOLY-CLASSIC',
        images: [
          {
            url: 'https://cdn.ime.by/UserFiles/images/catalog/Goods/6366/09596366/norm/09596366.n_0.png',
            description: 'Монополия'
          }
        ],
        createdBy: user._id
      },
      {
        title: 'Мягкая игрушка Мишка Тедди',
        description: 'Плюшевый мишка Тедди из мягкого текстиля. Очень мягкий и приятный на ощупь. Идеальный друг для ребенка.',
        brand: 'Teddy',
        model: 'Плюшевый Мишка',
        category: 'soft_toy',
        ageRange: { min: 0, max: 12 },
        material: 'textile',
        color: 'Коричневый',
        price: 25,
        dimensions: { length: 30, width: 25, height: 40 },
        weight: 600,
        features: ['Очень мягкий', 'Гипоаллергенный', 'Можно стирать'],
        status: 'available',
        article: 'TEDDY',
        images: [
          {
            url: 'https://s5-goods.ozstatic.by/2000/569/453/101/101453569_0.jpg',
            description: 'Мишка Тедди'
          }
        ],
        createdBy: user._id
      },
      {
        title: 'Пазл 1000 элементов "Озеро в горах"',
        description: 'Красивый пазл на 1000 элементов с изображением гор. Высокое качество печати, плотные детали. Развивает внимание и терпение.',
        brand: 'Ravensburger',
        model: 'Пазл 1000 элементов',
        category: 'puzzle',
        ageRange: { min: 10, max: 99 },
        material: 'mixed',
        color: 'Разные',
        price: 13,
        dimensions: { length: 50, width: 70, height: 2 },
        weight: 400,
        features: ['1000 элементов', 'Высокое качество', 'Красивое изображение'],
        status: 'available',
        article: 'PUZZLE-1000',
        images: [
          {
            url: 'https://s3-goods.ozstatic.by/2000/384/711/10/10711384_0.jpg',
            description: 'Пазл'
          }
        ],
        createdBy: user._id
      },
      {
        title: 'Развивающий набор "Учимся считать"',
        description: 'Развивающий набор для обучения счету. Включает цифры, счетные палочки и карточки. Помогает детям освоить основы математики.',
        brand: 'Умница',
        model: 'Учимся считать',
        category: 'educational',
        ageRange: { min: 3, max: 7 },
        material: 'wood',
        color: 'Разные',
        price: 13,
        dimensions: { length: 2, width: 9 , height: 16 },
        weight: 300,
        features: ['Экологичные материалы', 'Развивающая игра', 'Для дошкольников'],
        status: 'available',
        article: 'EDU-COUNT',
        images: [
          {
            url: 'https://cdn21vek.by/imgproxy/preview_b/plain/img/galleries/5891/31/rosman_0717_5fe0fa765333f.jpeg',
            description: 'Развивающий набор'
          }
        ],
        createdBy: user._id
      },
      {
        title: 'Фигурка супергероя',
        description: 'Детализированная фигурка супергероя железный человек с подвижными суставами. Высокое качество изготовления, реалистичные детали. Для коллекции или игр.',
        brand: 'Marvel',
        model: 'Фигурка супергероя',
        category: 'action_figure',
        ageRange: { min: 6, max: 14 },
        material: 'plastic',
        color: 'Разные',
        price: 32,
        dimensions: { length: 8, width: 5, height: 15 },
        weight: 150,
        features: ['Подвижные суставы', 'Детализированная', 'Официальная лицензия'],
        status: 'available',
        article: 'MARVEL-FIG',
        images: [
          {
            url: 'https://s3-goods.ozstatic.by/2000/265/401/101/101401265_0.jpg',
            description: 'Фигурка'
          }
        ],
        createdBy: user._id
      },
      {
        title: 'Футбольный мяч детский',
        description: 'Качественный футбольный мяч для детей. Изготовлен из прочных материалов, подходит для игры на улице и в помещении.',
        brand: 'Ecos',
        model: 'Футбольный мяч',
        category: 'sports',
        ageRange: { min: 5, max: 14 },
        material: 'rubber',
        color: 'Белый, черный',
        price: 48,
        dimensions: { length: 22, width: 22, height: 22 },
        weight: 300,
        features: ['Прочный', 'Для улицы и зала', 'Официальный размер'],
        status: 'available',
        article: 'FootBall-BALL',
        images: [
          {
            url: 'https://cdn21vek.by/imgproxy/preview_b/plain/img/galleries/6780/960/bl2001998157_ecos_61152776678b7.jpeg',
            description: 'Футбольный мяч'
          }
        ],
        createdBy: user._id
      },
      {
        title: 'Робот-игрушка щенок с управлением',
        description: 'Интерактивный робот с дистанционным управлением. Может двигаться, светиться и издавать звуки. Развивает интерес к технологиям.',
        brand: 'Robo',
        model: 'Робот интерактивный',
        category: 'electronic',
        ageRange: { min: 6, max: 12 },
        material: 'plastic',
        color: 'Серебристый, синий',
        price: 125,
        dimensions: { length: 20, width: 15, height: 30 },
        weight: 800,
        features: ['Дистанционное управление', 'Световые эффекты', 'Звуковые эффекты'],
        status: 'available',
        article: 'ROBO-001',
        images: [
          {
            url: 'https://images.deal.by/412246437_w640_h640_bg1533-sobaka-robot-schenok.jpg',
            description: 'Робот'
          }
        ],
        createdBy: user._id
      }
    ];

    const insertedToys = await Toy.insertMany(toys);
    console.log(`Created ${insertedToys.length} toys`);

    // Создать тестовые отзывы (Review.deleteMany уже выполнен выше)
    
    // Создаем дополнительного пользователя для отзывов
    let reviewUser2 = await User.findOne({ email: 'reviewer@example.com' });
    if (!reviewUser2) {
      reviewUser2 = new User({
        username: 'reviewer',
        email: 'reviewer@example.com',
        password: 'password123',
        role: 'user'
      });
      await reviewUser2.save();
      console.log('Review user created');
    }

    const reviews = [
      {
        toy: insertedToys[0]._id, // LEGO City
        user: user._id,
        rating: 5,
        title: 'Отличный конструктор!',
        comment: 'Очень качественный набор, ребенок в восторге. Детали хорошо подходят друг к другу, инструкция понятная. Рекомендую!',
        pros: ['Качество', 'Детализация', 'Инструкция', 'Развивающий'],
        cons: ['Высокая цена'],
        verifiedPurchase: true,
        helpful: 15
      },
      {
        toy: insertedToys[0]._id, // LEGO City
        user: reviewUser2._id,
        rating: 4,
        title: 'Хороший набор',
        comment: 'Неплохой конструктор, но цена немного завышена. В остальном все отлично.',
        pros: ['Качество', 'Детализация'],
        cons: ['Высокая цена'],
        verifiedPurchase: false,
        helpful: 8
      },
      {
        toy: insertedToys[1]._id, // Barbie
        user: user._id,
        rating: 5,
        title: 'Красивая кукла',
        comment: 'Дочка очень довольна. Кукла качественная, красивая, аксессуары в комплекте. Отличный подарок!',
        pros: ['Качество', 'Красота', 'Аксессуары'],
        cons: [],
        verifiedPurchase: true,
        helpful: 12
      },
      {
        toy: insertedToys[3]._id, // Монополия
        user: reviewUser2._id,
        rating: 5,
        title: 'Классика для всей семьи',
        comment: 'Отличная игра для семейных вечеров. Правила простые, игра увлекательная. Все довольны!',
        pros: ['Для всей семьи', 'Увлекательная', 'Классика'],
        cons: ['Долгая игра'],
        verifiedPurchase: true,
        helpful: 20
      },
      {
        toy: insertedToys[4]._id, // Мишка Тедди
        user: user._id,
        rating: 5,
        title: 'Очень мягкий мишка',
        comment: 'Мишка очень мягкий и приятный на ощупь. Ребенок его обожает. Качество отличное.',
        pros: ['Мягкость', 'Качество', 'Безопасность'],
        cons: [],
        verifiedPurchase: true,
        helpful: 18
      },
      {
        toy: insertedToys[9]._id, // Робот
        user: reviewUser2._id,
        rating: 5,
        title: 'Отличный робот',
        comment: 'Робот работает отлично, управление простое. Ребенок в восторге от световых и звуковых эффектов.',
        pros: ['Интерактивность', 'Эффекты', 'Управление'],
        cons: ['Требует батарейки'],
        verifiedPurchase: true,
        helpful: 14
      }
    ];

    await Review.insertMany(reviews);
    console.log(`Created ${reviews.length} reviews`);

    console.log('Seed data created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
