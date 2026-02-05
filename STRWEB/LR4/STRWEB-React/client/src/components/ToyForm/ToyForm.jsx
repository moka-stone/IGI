import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import api from '../../config/axios';
import styles from './ToyForm.module.css';

function ToyForm({ toy = null, onSuccess }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: toy?.title || '',
    description: toy?.description || '',
    brand: toy?.brand || '',
    model: toy?.model || '',
    category: toy?.category || 'constructor',
    ageRange: {
      min: toy?.ageRange?.min || 0,
      max: toy?.ageRange?.max || 12
    },
    material: toy?.material || 'plastic',
    color: toy?.color || '',
    price: toy?.price || '',
    dimensions: {
      length: toy?.dimensions?.length || '',
      width: toy?.dimensions?.width || '',
      height: toy?.dimensions?.height || ''
    },
    weight: toy?.weight || '',
    features: toy?.features || [],
    status: toy?.status || 'available',
    article: toy?.article || '',
    imageUrl: toy?.images?.[0]?.url || ''
  });
  const [featureInput, setFeatureInput] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('ageRange.')) {
      const ageField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        ageRange: {
          ...prev.ageRange,
          [ageField]: value
        }
      }));
    } else if (name.startsWith('dimensions.')) {
      const dimField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        dimensions: {
          ...prev.dimensions,
          [dimField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAddFeature = () => {
    if (featureInput.trim() && formData.features.length < 10) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, featureInput.trim()]
      }));
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Название обязательно';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Описание обязательно';
    }

    if (!formData.brand.trim()) {
      newErrors.brand = 'Бренд обязателен';
    }

    if (!formData.model.trim()) {
      newErrors.model = 'Модель обязательна';
    }

    if (!formData.ageRange.min || formData.ageRange.min < 0) {
      newErrors['ageRange.min'] = 'Минимальный возраст должен быть 0 или больше';
    }

    if (!formData.ageRange.max || formData.ageRange.max < formData.ageRange.min) {
      newErrors['ageRange.max'] = 'Максимальный возраст должен быть больше минимального';
    }

    if (formData.ageRange.max > 99) {
      newErrors['ageRange.max'] = 'Максимальный возраст не должен превышать 99';
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Цена должна быть положительным числом';
    }

    if (!formData.color.trim()) {
      newErrors.color = 'Цвет обязателен';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validate()) {
      return;
    }

    if (!user) {
      setError('Необходима авторизация');
      return;
    }

    setLoading(true);
    try {
      const data = {
        ...formData,
        price: Number(formData.price),
        ageRange: {
          min: Number(formData.ageRange.min),
          max: Number(formData.ageRange.max)
        },
        dimensions: {
          length: formData.dimensions.length ? Number(formData.dimensions.length) : undefined,
          width: formData.dimensions.width ? Number(formData.dimensions.width) : undefined,
          height: formData.dimensions.height ? Number(formData.dimensions.height) : undefined
        },
        weight: formData.weight ? Number(formData.weight) : undefined,
        images: formData.imageUrl.trim() ? [{ url: formData.imageUrl.trim(), description: '' }] : []
      };
      
      // Удаляем imageUrl из данных, так как он уже преобразован в images
      delete data.imageUrl;

      if (toy) {
        await api.put(`/api/toys/${toy._id}`, data);
      } else {
        await api.post('/api/toys', data);
      }

      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/catalog');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка сохранения игрушки');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.toyForm}>
      <h2 className={styles.title}>
        {toy ? 'Редактировать игрушку' : 'Добавить новую игрушку'}
      </h2>

      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="title">Название *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={errors.title ? styles.inputError : styles.input}
              placeholder="Например: LEGO City Пожарная станция"
            />
            {errors.title && <span className={styles.errorText}>{errors.title}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="brand">Бренд *</label>
            <input
              type="text"
              id="brand"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className={errors.brand ? styles.inputError : styles.input}
              placeholder="LEGO"
            />
            {errors.brand && <span className={styles.errorText}>{errors.brand}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="model">Модель *</label>
            <input
              type="text"
              id="model"
              name="model"
              value={formData.model}
              onChange={handleChange}
              className={errors.model ? styles.inputError : styles.input}
              placeholder="City Пожарная станция"
            />
            {errors.model && <span className={styles.errorText}>{errors.model}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="category">Вид игрушки *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={styles.select}
            >
              <option value="constructor">Конструктор</option>
              <option value="doll">Кукла</option>
              <option value="car">Машинка</option>
              <option value="board_game">Настольная игра</option>
              <option value="soft_toy">Мягкая игрушка</option>
              <option value="educational">Развивающая игрушка</option>
              <option value="puzzle">Пазл</option>
              <option value="action_figure">Фигурка</option>
              <option value="sports">Спортивная игрушка</option>
              <option value="electronic">Электронная игрушка</option>
              <option value="other">Другое</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="ageRange.min">Минимальный возраст (лет) *</label>
            <input
              type="number"
              id="ageRange.min"
              name="ageRange.min"
              value={formData.ageRange.min}
              onChange={handleChange}
              min="0"
              max="99"
              className={errors['ageRange.min'] ? styles.inputError : styles.input}
              placeholder="0"
            />
            {errors['ageRange.min'] && <span className={styles.errorText}>{errors['ageRange.min']}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="ageRange.max">Максимальный возраст (лет) *</label>
            <input
              type="number"
              id="ageRange.max"
              name="ageRange.max"
              value={formData.ageRange.max}
              onChange={handleChange}
              min="0"
              max="99"
              className={errors['ageRange.max'] ? styles.inputError : styles.input}
              placeholder="12"
            />
            {errors['ageRange.max'] && <span className={styles.errorText}>{errors['ageRange.max']}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="material">Материал *</label>
            <select
              id="material"
              name="material"
              value={formData.material}
              onChange={handleChange}
              className={styles.select}
            >
              <option value="plastic">Пластик</option>
              <option value="wood">Дерево</option>
              <option value="textile">Текстиль</option>
              <option value="metal">Металл</option>
              <option value="rubber">Резина</option>
              <option value="mixed">Смешанный</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="color">Цвет *</label>
            <input
              type="text"
              id="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              className={errors.color ? styles.inputError : styles.input}
              placeholder="Красный"
            />
            {errors.color && <span className={styles.errorText}>{errors.color}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="price">Цена (BYN) *</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              className={errors.price ? styles.inputError : styles.input}
              placeholder="Цена"
            />
            {errors.price && <span className={styles.errorText}>{errors.price}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="dimensions.length">Длина (см)</label>
            <input
              type="number"
              id="dimensions.length"
              name="dimensions.length"
              value={formData.dimensions.length}
              onChange={handleChange}
              min="0"
              step="0.1"
              className={styles.input}
              placeholder="20"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="dimensions.width">Ширина (см)</label>
            <input
              type="number"
              id="dimensions.width"
              name="dimensions.width"
              value={formData.dimensions.width}
              onChange={handleChange}
              min="0"
              step="0.1"
              className={styles.input}
              placeholder="15"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="dimensions.height">Высота (см)</label>
            <input
              type="number"
              id="dimensions.height"
              name="dimensions.height"
              value={formData.dimensions.height}
              onChange={handleChange}
              min="0"
              step="0.1"
              className={styles.input}
              placeholder="10"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="weight">Вес (г)</label>
            <input
              type="number"
              id="weight"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              min="0"
              className={styles.input}
              placeholder="500"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="status">Статус</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={styles.select}
            >
              <option value="available">Доступна</option>
              <option value="unavailable">Недоступна</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="article">Артикул</label>
            <input
              type="text"
              id="article"
              name="article"
              value={formData.article}
              onChange={handleChange}
              className={styles.input}
              placeholder="Артикул (опционально)"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="imageUrl">URL картинки</label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className={styles.input}
              placeholder="https://example.com/image.jpg (опционально)"
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Особенности</label>
          <div className={styles.featuresInput}>
            <input
              type="text"
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddFeature();
                }
              }}
              className={styles.input}
              placeholder="Добавить особенность"
            />
            <button
              type="button"
              onClick={handleAddFeature}
              className={styles.addFeatureBtn}
              disabled={!featureInput.trim() || formData.features.length >= 10}
            >
              Добавить
            </button>
          </div>
          {formData.features.length > 0 && (
            <div className={styles.featuresList}>
              {formData.features.map((feature, idx) => (
                <span key={idx} className={styles.featureTag}>
                  {feature}
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(idx)}
                    className={styles.removeFeatureBtn}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description">Описание *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="5"
            className={errors.description ? styles.textareaError : styles.textarea}
            placeholder="Подробное описание игрушки"
          />
          {errors.description && <span className={styles.errorText}>{errors.description}</span>}
        </div>

        <div className={styles.actions}>
          <button
            type="submit"
            disabled={loading}
            className={styles.submitBtn}
          >
            {loading ? 'Сохранение...' : toy ? 'Сохранить изменения' : 'Добавить игрушку'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className={styles.cancelBtn}
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}

export default ToyForm;

