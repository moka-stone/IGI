const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const axios = require('axios');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'deepseek/deepseek-chat-v3.1';

if (!OPENROUTER_API_KEY) {
  console.warn('⚠️  OPENROUTER_API_KEY не найден в переменных окружения');
} else {
  console.log('✅ OpenRouter настроен:', { model: OPENROUTER_MODEL });
}

router.post('/generate-description', auth, async (req, res) => {
  try {
    const { toyData } = req.body;
    
    if (!toyData) {
      return res.status(400).json({ message: 'Toy data is required' });
    }

    if (!OPENROUTER_API_KEY) {
      return res.status(503).json({ message: 'OpenRouter API не настроен. Добавьте OPENROUTER_API_KEY в переменные окружения.' });
    }

    const prompt = `Создай профессиональное маркетинговое описание игрушки на основе следующих данных:
Бренд: ${toyData.brand || 'не указан'}
Модель: ${toyData.model || 'не указана'}
Вид игрушки: ${toyData.category || 'не указан'}
Возраст: ${toyData.ageRange?.min || 'не указан'}-${toyData.ageRange?.max || 'не указан'} лет
Материал: ${toyData.material || 'не указан'}
Цвет: ${toyData.color || 'не указан'}
Габариты: ${toyData.dimensions?.length || 'не указана'} x ${toyData.dimensions?.width || 'не указана'} x ${toyData.dimensions?.height || 'не указана'} см
Вес: ${toyData.weight || 'не указан'} г
Особенности: ${toyData.features?.join(', ') || 'не указаны'}
Цена: ${toyData.price || 'не указана'}

Создай привлекательное описание на русском языке, которое подчеркнет преимущества игрушки.`;

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: OPENROUTER_MODEL,
        messages: [
          { role: 'system', content: 'Ты профессиональный копирайтер для фабрики игрушек. Отвечай без форматирования, чтобы твой ответ был как описание игрушки' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
          'X-Title': 'Toy Factory'
        }
      }
    );

    const description = response.data.choices[0]?.message?.content || '';

    res.json({ description });
  } catch (error) {
    console.error('OpenRouter error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Error generating description', error: error.response?.data?.error?.message || error.message });
  }
});

module.exports = router;

