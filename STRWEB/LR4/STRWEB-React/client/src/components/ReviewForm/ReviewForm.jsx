import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import api from '../../config/axios';
import styles from './ReviewForm.module.css';

function ReviewForm({ toyId, review = null, onSuccess, onCancel }) {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    rating: review?.rating || 5,
    title: review?.title || '',
    comment: review?.comment || '',
    pros: review?.pros || [],
    cons: review?.cons || [],
    verifiedPurchase: review?.verifiedPurchase || false
  });
  const [proInput, setProInput] = useState('');
  const [conInput, setConInput] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      setError('Необходима авторизация');
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAddPro = () => {
    if (proInput.trim() && formData.pros.length < 10) {
      setFormData(prev => ({
        ...prev,
        pros: [...prev.pros, proInput.trim()]
      }));
      setProInput('');
    }
  };

  const handleRemovePro = (index) => {
    setFormData(prev => ({
      ...prev,
      pros: prev.pros.filter((_, i) => i !== index)
    }));
  };

  const handleAddCon = () => {
    if (conInput.trim() && formData.cons.length < 10) {
      setFormData(prev => ({
        ...prev,
        cons: [...prev.cons, conInput.trim()]
      }));
      setConInput('');
    }
  };

  const handleRemoveCon = (index) => {
    setFormData(prev => ({
      ...prev,
      cons: prev.cons.filter((_, i) => i !== index)
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
      newErrors.rating = 'Рейтинг должен быть от 1 до 5';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Заголовок обязателен';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Заголовок должен быть не более 200 символов';
    }

    if (!formData.comment.trim()) {
      newErrors.comment = 'Комментарий обязателен';
    } else if (formData.comment.length > 2000) {
      newErrors.comment = 'Комментарий должен быть не более 2000 символов';
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
        toy: toyId,
        rating: Number(formData.rating),
        title: formData.title.trim(),
        comment: formData.comment.trim(),
        pros: formData.pros.filter(p => p.trim()),
        cons: formData.cons.filter(c => c.trim()),
        verifiedPurchase: formData.verifiedPurchase
      };

      if (review) {
        await api.put(`/api/reviews/${review._id}`, data);
      } else {
        await api.post('/api/reviews', data);
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.errors?.[0]?.msg ||
                          'Ошибка сохранения отзыва';
      setError(errorMessage);
      console.error('Review save error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div className={styles.reviewForm}>
      <h3 className={styles.title}>
        {review ? 'Редактировать отзыв' : 'Добавить отзыв'}
      </h3>

      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="rating">Рейтинг *</label>
          <div className={styles.ratingSelector}>
            {[1, 2, 3, 4, 5].map(rating => (
              <button
                key={rating}
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, rating }));
                  if (errors.rating) {
                    setErrors(prev => ({ ...prev, rating: '' }));
                  }
                }}
                className={`${styles.starBtn} ${formData.rating >= rating ? styles.active : ''}`}
              >
                ★
              </button>
            ))}
            <span className={styles.ratingDisplay}>
              {renderStars(formData.rating)} ({formData.rating}/5)
            </span>
          </div>
          {errors.rating && <span className={styles.errorText}>{errors.rating}</span>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="title">Заголовок *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={errors.title ? styles.inputError : styles.input}
            placeholder="Краткое описание вашего опыта"
            maxLength={200}
          />
          {errors.title && <span className={styles.errorText}>{errors.title}</span>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="comment">Комментарий *</label>
          <textarea
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            rows="5"
            className={errors.comment ? styles.textareaError : styles.textarea}
            placeholder="Подробно опишите ваш опыт использования игрушки"
            maxLength={2000}
          />
          <div className={styles.charCount}>
            {formData.comment.length}/2000 символов
          </div>
          {errors.comment && <span className={styles.errorText}>{errors.comment}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Плюсы (опционально)</label>
          <div className={styles.prosConsInput}>
            <input
              type="text"
              value={proInput}
              onChange={(e) => setProInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddPro();
                }
              }}
              className={styles.input}
              placeholder="Добавить плюс"
              maxLength={100}
            />
            <button
              type="button"
              onClick={handleAddPro}
              className={styles.addBtn}
              disabled={!proInput.trim() || formData.pros.length >= 10}
            >
              Добавить
            </button>
          </div>
          {formData.pros.length > 0 && (
            <ul className={styles.prosConsList}>
              {formData.pros.map((pro, idx) => (
                <li key={idx}>
                  {pro}
                  <button
                    type="button"
                    onClick={() => handleRemovePro(idx)}
                    className={styles.removeBtn}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>Минусы (опционально)</label>
          <div className={styles.prosConsInput}>
            <input
              type="text"
              value={conInput}
              onChange={(e) => setConInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCon();
                }
              }}
              className={styles.input}
              placeholder="Добавить минус"
              maxLength={100}
            />
            <button
              type="button"
              onClick={handleAddCon}
              className={styles.addBtn}
              disabled={!conInput.trim() || formData.cons.length >= 10}
            >
              Добавить
            </button>
          </div>
          {formData.cons.length > 0 && (
            <ul className={styles.prosConsList}>
              {formData.cons.map((con, idx) => (
                <li key={idx}>
                  {con}
                  <button
                    type="button"
                    onClick={() => handleRemoveCon(idx)}
                    className={styles.removeBtn}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="verifiedPurchase"
              checked={formData.verifiedPurchase}
              onChange={handleChange}
              className={styles.checkbox}
            />
            Подтвердить покупку этой игрушки
          </label>
        </div>

        <div className={styles.actions}>
          <button
            type="submit"
            disabled={loading || !user}
            className={styles.submitBtn}
          >
            {loading ? 'Сохранение...' : review ? 'Сохранить изменения' : 'Опубликовать отзыв'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className={styles.cancelBtn}
              disabled={loading}
            >
              Отмена
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default ReviewForm;

