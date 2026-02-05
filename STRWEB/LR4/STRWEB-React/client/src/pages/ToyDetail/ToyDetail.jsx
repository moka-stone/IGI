import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../config/axios';
import { AuthContext } from '../../context/AuthContext.jsx';
import { formatDateWithTimezone } from '../../utils/dateUtils';
import Reviews from '../../components/Reviews/Reviews.jsx';
import styles from './ToyDetail.module.css';

function ToyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [toy, setToy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [aiDescription, setAiDescription] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [quantity, setQuantity] = useState(100);

  useEffect(() => {
    loadToy();
  }, [id]);

  const loadToy = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/api/toys/${id}`);
      setToy(response.data);
    } catch (err) {
      setError('Ошибка загрузки игрушки');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!user) {
      alert('Необходима авторизация');
      return;
    }

    setLoadingAi(true);
    try {
      const response = await api.post('/api/ai/generate-description', {
        toyData: toy
      });
      setAiDescription(response.data.description);
    } catch (err) {
      setError('Ошибка генерации описания');
      console.error(err);
    } finally {
      setLoadingAi(false);
    }
  };


  const handleDelete = async () => {
    if (!user) return;
    if (!window.confirm('Вы уверены, что хотите удалить эту игрушку?')) return;

    try {
      await api.delete(`/api/toys/${id}`);
      navigate('/catalog');
    } catch (err) {
      setError('Ошибка удаления игрушки');
    }
  };

  const handleAddToCart = () => {
    if (toy.status !== 'available') {
      alert('Эта игрушка недоступна для покупки');
      return;
    }
    
    if (quantity < 100) {
      alert('Минимальное количество для заказа - 100 штук');
      return;
    }
    
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItemIndex = cart.findIndex(item => {
      if (typeof item === 'string') {
        return item === toy._id;
      }
      return item.toyId === toy._id;
    });
    
    if (existingItemIndex !== -1) {
      // Обновляем количество существующего товара
      if (typeof cart[existingItemIndex] === 'string') {
        cart[existingItemIndex] = { toyId: toy._id, quantity: quantity };
      } else {
        cart[existingItemIndex].quantity = quantity;
      }
      alert(`Количество обновлено до ${quantity} штук`);
    } else {
      cart.push({ toyId: toy._id, quantity: quantity });
      alert(`Игрушка добавлена в корзину (${quantity} штук)`);
    }
    localStorage.setItem('cart', JSON.stringify(cart));
  };

  if (loading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  if (error && !toy) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!toy) {
    return <div className={styles.error}>Игрушка не найдена</div>;
  }

  const dateInfo = formatDateWithTimezone(toy.createdAt);
  const updateInfo = formatDateWithTimezone(toy.updatedAt);

  const getCategoryLabel = (category) => {
    const labels = {
      constructor: 'Конструктор',
      doll: 'Кукла',
      car: 'Машинка',
      board_game: 'Настольная игра',
      soft_toy: 'Мягкая игрушка',
      educational: 'Развивающая игрушка',
      puzzle: 'Пазл',
      action_figure: 'Фигурка',
      sports: 'Спортивная игрушка',
      electronic: 'Электронная игрушка',
      other: 'Другое'
    };
    return labels[category] || category;
  };

  const getMaterialLabel = (material) => {
    const labels = {
      plastic: 'Пластик',
      wood: 'Дерево',
      textile: 'Текстиль',
      metal: 'Металл',
      rubber: 'Резина',
      mixed: 'Смешанный'
    };
    return labels[material] || material;
  };

  const getStatusLabel = (status) => {
    const labels = {
      available: 'Доступна',
      unavailable: 'Недоступна'
    };
    return labels[status] || status;
  };

  return (
    <div className={styles.propertyDetail}>
      <button onClick={() => navigate(-1)} className={styles.backBtn}>
        ← Назад
      </button>

      <div className={styles.header}>
        <h1 className={styles.title}>{toy.title}</h1>
        {user && (
          (() => {
            const userId = user.id || user._id || (typeof user === 'string' ? user : null);
            let createdById = null;
            if (toy.createdBy) {
              if (typeof toy.createdBy === 'object') {
                createdById = toy.createdBy._id || toy.createdBy.id || toy.createdBy;
              } else {
                createdById = toy.createdBy;
              }
            }
            
            const userIdStr = userId ? userId.toString() : null;
            const createdByIdStr = createdById ? createdById.toString() : null;
            const isOwner = userIdStr && createdByIdStr && userIdStr === createdByIdStr;
            const isAdmin = user.role === 'admin';
            const canEdit = isOwner || isAdmin;
            
            return canEdit ? (
              <div className={styles.actions}>
                <button 
                  onClick={() => navigate(`/edit-toy/${toy._id}`)} 
                  className={styles.editBtn}
                >
                  Редактировать
                </button>
                <button onClick={handleDelete} className={styles.deleteBtn}>
                  Удалить
                </button>
              </div>
            ) : null;
          })()
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.mainSection}>
          <div className={styles.images}>
            {toy.images && toy.images.length > 0 ? (
              toy.images.map((img, idx) => (
                <div key={idx} className={styles.imageWrapper}>
                  <img src={img.url} alt={img.description || toy.title} />
                  
                </div>
              ))
            ) : (
              <div className={styles.placeholderImage}>🧸</div>
            )}
          </div>

          <div className={styles.info}>
            <div className={styles.priceSection}>
              <div className={styles.priceRow}>
                <span className={styles.price}>{toy.price.toLocaleString()} BYN</span>
                <span className={styles.type}>{toy.brand} {toy.model}</span>
              </div>
              {toy.status === 'available' && user && user.role !== 'admin' && (
                <div className={styles.addToCartSection}>
                  <div className={styles.quantityInput}>
                    <label htmlFor="quantity">Количество (мин. 100):</label>
                    <input
                      type="number"
                      id="quantity"
                      min="100"
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 100;
                        setQuantity(Math.max(100, val));
                      }}
                      className={styles.quantityField}
                    />
                  </div>
                  <button onClick={handleAddToCart} className={styles.addToCartBtn}>
                    🛒 Добавить в корзину ({quantity} шт.)
                  </button>
                </div>
              )}
            </div>

            <div className={styles.details}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Вид игрушки:</span>
                <span className={styles.detailValue}>{getCategoryLabel(toy.category)}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Возрастная категория:</span>
                <span className={styles.detailValue}>{toy.ageRange?.min}-{toy.ageRange?.max} лет</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Материал:</span>
                <span className={styles.detailValue}>{getMaterialLabel(toy.material)}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Цвет:</span>
                <span className={styles.detailValue}>{toy.color}</span>
              </div>
              {toy.dimensions && (toy.dimensions.length || toy.dimensions.width || toy.dimensions.height) && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Габариты:</span>
                  <span className={styles.detailValue}>
                    {toy.dimensions.length} x {toy.dimensions.width} x {toy.dimensions.height} см
                  </span>
                </div>
              )}
              {toy.weight && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Вес:</span>
                  <span className={styles.detailValue}>{toy.weight} г</span>
                </div>
              )}
              {toy.features && toy.features.length > 0 && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Особенности:</span>
                  <span className={styles.detailValue}>{toy.features.join(', ')}</span>
                </div>
              )}
              {toy.article && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Артикул:</span>
                  <span className={styles.detailValue}>{toy.article}</span>
                </div>
              )}
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Статус:</span>
                <span className={styles.detailValue}>{getStatusLabel(toy.status)}</span>
              </div>
            </div>

            <div className={styles.description}>
              <h2>Описание</h2>
              <p>{toy.description}</p>
              
              {user && (
                <div className={styles.aiSection}>
                  <button
                    onClick={handleGenerateDescription}
                    disabled={loadingAi}
                    className={styles.aiBtn}
                  >
                    {loadingAi ? 'Генерация...' : 'Сгенерировать описание (AI)'}
                  </button>
                  {aiDescription && (
                    <div className={styles.aiDescription}>
                      <h3>AI-описание:</h3>
                      <p>{aiDescription}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className={styles.dates}>
              <div className={styles.dateBlock}>
                <h3>Дата создания</h3>
                <p><strong>Локально:</strong> {dateInfo.local}</p>
                <p><strong>UTC:</strong> {dateInfo.utc}</p>
                <p><strong>Таймзона:</strong> {dateInfo.timezone}</p>
              </div>
              <div className={styles.dateBlock}>
                <h3>Дата обновления</h3>
                <p><strong>Локально:</strong> {updateInfo.local}</p>
                <p><strong>UTC:</strong> {updateInfo.utc}</p>
                <p><strong>Таймзона:</strong> {updateInfo.timezone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {toy && toy._id && (
        <div className={styles.reviewsSection}>
          <Reviews toyId={toy._id} />
        </div>
      )}
    </div>
  );
}

export default ToyDetail;

