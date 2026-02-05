import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import api from '../../config/axios';
import ReviewForm from '../ReviewForm/ReviewForm.jsx';
import styles from './Reviews.module.css';

function Reviews({ toyId }) {
  const { user } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  useEffect(() => {
    if (toyId) {
      loadReviews();
    } else {
      setLoading(false);
    }
  }, [toyId]);

  const loadReviews = async () => {
    if (!toyId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/api/reviews/toy/${toyId}`);
      setReviews(response.data.reviews || []);
      setAverageRating(response.data.averageRating || 0);
      setTotalReviews(response.data.totalReviews || 0);
    } catch (err) {
      console.error('Error loading reviews:', err);
      setError(err.response?.data?.message || 'Ошибка загрузки отзывов');
    } finally {
      setLoading(false);
    }
  };

  const handleAddReview = () => {
    if (!user) {
      alert('Необходима авторизация для добавления отзыва');
      return;
    }
    setEditingReview(null);
    setShowForm(true);
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowForm(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот отзыв?')) {
      return;
    }

    try {
      await api.delete(`/api/reviews/${reviewId}`);
      loadReviews();
    } catch (err) {
      alert('Ошибка удаления отзыва');
      console.error(err);
    }
  };

  const handleMarkHelpful = async (reviewId) => {
    if (!user) {
      alert('Необходима авторизация');
      return;
    }

    try {
      await api.post(`/api/reviews/${reviewId}/helpful`);
      loadReviews();
    } catch (err) {
      console.error('Error marking helpful:', err);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingReview(null);
    loadReviews();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingReview(null);
  };

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!toyId) {
    return null;
  }

  if (loading) {
    return <div className={styles.loading}>Загрузка отзывов...</div>;
  }

  return (
    <div className={styles.reviews}>
      <div className={styles.header}>
        <div className={styles.ratingSummary}>
          <h2>Отзывы</h2>
          {totalReviews > 0 ? (
            <div className={styles.ratingInfo}>
              <div className={styles.averageRating}>
                <span className={styles.ratingValue}>{averageRating.toFixed(1)}</span>
                <span className={styles.ratingStars}>{renderStars(Math.round(averageRating))}</span>
              </div>
              <div className={styles.totalReviews}>
                {totalReviews} {totalReviews === 1 ? 'отзыв' : totalReviews < 5 ? 'отзыва' : 'отзывов'}
              </div>
            </div>
          ) : (
            <p className={styles.noReviews}>Пока нет отзывов</p>
          )}
        </div>
        {user && !showForm && (
          <button onClick={handleAddReview} className={styles.addReviewBtn}>
            + Добавить отзыв
          </button>
        )}
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {showForm && (
        <ReviewForm
          toyId={toyId}
          review={editingReview}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}

      <div className={styles.reviewsList}>
        {reviews.length === 0 && !showForm ? (
          <div className={styles.empty}>
            <p>Пока нет отзывов об этой игрушке</p>
            {user && (
              <button onClick={handleAddReview} className={styles.addReviewBtn}>
                Станьте первым, кто оставит отзыв
              </button>
            )}
          </div>
        ) : (
          reviews.map(review => {
            const isOwner = user && (user.id === review.user?._id || user.id === review.user?.id);
            
            return (
              <div key={review._id} className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <div className={styles.reviewUser}>
                    <div className={styles.userAvatar}>
                      {review.user?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className={styles.userInfo}>
                      <div className={styles.username}>
                        {review.user?.username || 'Анонимный пользователь'}
                        {review.verifiedPurchase && (
                          <span className={styles.verifiedBadge}>✓ Проверенная покупка</span>
                        )}
                      </div>
                      <div className={styles.reviewDate}>{formatDate(review.createdAt)}</div>
                    </div>
                  </div>
                  <div className={styles.reviewRating}>
                    <span className={styles.stars}>{renderStars(review.rating)}</span>
                    <span className={styles.ratingNumber}>{review.rating}/5</span>
                  </div>
                </div>

                <h3 className={styles.reviewTitle}>{review.title}</h3>
                <p className={styles.reviewComment}>{review.comment}</p>

                {review.pros && review.pros.length > 0 && (
                  <div className={styles.prosCons}>
                    <div className={styles.pros}>
                      <strong>Плюсы:</strong>
                      <ul>
                        {review.pros.map((pro, idx) => (
                          <li key={idx}>{pro}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {review.cons && review.cons.length > 0 && (
                  <div className={styles.prosCons}>
                    <div className={styles.cons}>
                      <strong>Минусы:</strong>
                      <ul>
                        {review.cons.map((con, idx) => (
                          <li key={idx}>{con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <div className={styles.reviewFooter}>
                  <button
                    onClick={() => handleMarkHelpful(review._id)}
                    className={styles.helpfulBtn}
                    disabled={!user}
                  >
                    👍 Полезно ({review.helpful || 0})
                  </button>
                  {isOwner && (
                    <div className={styles.reviewActions}>
                      <button
                        onClick={() => handleEditReview(review)}
                        className={styles.editBtn}
                      >
                        Редактировать
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        className={styles.deleteBtn}
                      >
                        Удалить
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Reviews;

