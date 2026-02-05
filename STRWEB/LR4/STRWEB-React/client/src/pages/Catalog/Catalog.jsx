import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import api from '../../config/axios';
import { formatDateWithTimezone } from '../../utils/dateUtils';
import styles from './Catalog.module.css';

function Catalog() {
  const { user } = useContext(AuthContext);
  const [toys, setToys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    sort: 'date_desc',
    minPrice: '',
    maxPrice: '',
    minAge: '',
    maxAge: '',
    material: ''
  });

  // Загрузка игрушек при изменении фильтров (кроме поиска)
  useEffect(() => {
    loadToys();
  }, [filters.category, filters.status, filters.sort, filters.minPrice, filters.maxPrice, filters.minAge, filters.maxAge, filters.material]);

  const loadToys = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.status) params.append('status', filters.status);
      if (filters.sort) params.append('sort', filters.sort);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.minAge) params.append('minAge', filters.minAge);
      if (filters.maxAge) params.append('maxAge', filters.maxAge);
      if (filters.material) params.append('material', filters.material);

      const response = await api.get(`/api/toys?${params.toString()}`);
      setToys(response.data);
    } catch (err) {
      console.error('Catalog load error:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.status === 403 ? 'Доступ запрещен. Проверьте настройки сервера.' :
                          'Ошибка загрузки каталога';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadToys();
  };

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

  const getStatusLabel = (status) => {
    const labels = {
      available: 'Доступна',
      unavailable: 'Недоступна'
    };
    return labels[status] || status;
  };

  if (loading) {
    return <div className={styles.loading}>Загрузка каталога...</div>;
  }

  return (
    <div className={styles.catalog}>
      <div className={styles.header}>
        <h1 className={styles.title}>Каталог игрушек</h1>
        {user && user.role === 'admin' && (
          <Link to="/add-toy" className={styles.addBtn}>
            + Добавить игрушку
          </Link>
        )}
      </div>

      <div className={styles.filters}>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Поиск по бренду, модели, названию..."
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchBtn}>
            🔍 Найти
          </button>
        </form>

        <select
          name="category"
          value={filters.category}
          onChange={handleFilterChange}
          className={styles.select}
        >
          <option value="">Все виды игрушек</option>
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

        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          className={styles.select}
        >
          <option value="">Все статусы</option>
          <option value="available">Доступен</option>
          <option value="reserved">Забронирован</option>
          <option value="sold">Продан</option>
          <option value="in_service">На обслуживании</option>
        </select>

        <input
          type="number"
          name="minPrice"
          value={filters.minPrice}
          onChange={handleFilterChange}
          placeholder="Мин. цена"
          className={styles.priceInput}
        />

        <input
          type="number"
          name="maxPrice"
          value={filters.maxPrice}
          onChange={handleFilterChange}
          placeholder="Макс. цена"
          className={styles.priceInput}
        />

        <input
          type="number"
          name="minAge"
          value={filters.minAge}
          onChange={handleFilterChange}
          placeholder="Мин. возраст"
          className={styles.priceInput}
        />

        <input
          type="number"
          name="maxAge"
          value={filters.maxAge}
          onChange={handleFilterChange}
          placeholder="Макс. возраст"
          className={styles.priceInput}
        />

        <select
          name="material"
          value={filters.material}
          onChange={handleFilterChange}
          className={styles.select}
        >
          <option value="">Все материалы</option>
          <option value="plastic">Пластик</option>
          <option value="wood">Дерево</option>
          <option value="textile">Текстиль</option>
          <option value="metal">Металл</option>
          <option value="rubber">Резина</option>
          <option value="mixed">Смешанный</option>
        </select>

        <select
          name="sort"
          value={filters.sort}
          onChange={handleFilterChange}
          className={styles.select}
        >
          <option value="date_desc">Новые сначала</option>
          <option value="date_asc">Старые сначала</option>
          <option value="price_asc">Цена: по возрастанию</option>
          <option value="price_desc">Цена: по убыванию</option>
          <option value="weight_asc">Вес: по возрастанию</option>
          <option value="weight_desc">Вес: по убыванию</option>
        </select>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.propertiesGrid}>
        {toys.map(toy => {
          const dateInfo = formatDateWithTimezone(toy.createdAt);
          const handleAddToCart = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (toy.status !== 'available') {
              alert('Эта игрушка недоступна для покупки');
              return;
            }
            
            const quantityStr = prompt('Введите количество (минимум 100 штук):', '100');
            if (!quantityStr) return;
            
            const quantity = parseInt(quantityStr) || 100;
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
          
          return (
            <div key={toy._id} className={styles.propertyCard}>
              <Link to={`/toy/${toy._id}`} className={styles.cardLink}>
                <div className={styles.propertyImage}>
                  {toy.images && toy.images.length > 0 ? (
                    <img src={toy.images[0].url} alt={toy.title} />
                  ) : (
                    <div className={styles.placeholderImage}>🧸</div>
                  )}
                  <span className={styles.statusBadge} data-status={toy.status}>
                    {getStatusLabel(toy.status)}
                  </span>
                </div>
                
                <div className={styles.propertyInfo}>
                  <h3 className={styles.propertyTitle}>{toy.title}</h3>
                  <p className={styles.propertyType}>{toy.brand} {toy.model} • {getCategoryLabel(toy.category)}</p>
                  <p className={styles.propertyPrice}>
                    {toy.price.toLocaleString()} BYN
                  </p>
                  <p className={styles.propertyLocation}>
                    🧸 {toy.ageRange?.min}-{toy.ageRange?.max} лет
                  </p>
                  <p className={styles.propertyArea}>
                    {toy.material === 'plastic' ? 'Пластик' : toy.material === 'wood' ? 'Дерево' : toy.material === 'textile' ? 'Текстиль' : toy.material === 'metal' ? 'Металл' : toy.material === 'rubber' ? 'Резина' : 'Смешанный'} {toy.weight && `• ${toy.weight} г`}
                  </p>
                  <div className={styles.propertyDate}>
                    <small>Добавлено: {dateInfo.local}</small>
                  </div>
                </div>
              </Link>
              {toy.status === 'available' && user && user.role !== 'admin' && (
                <button
                  onClick={handleAddToCart}
                  className={styles.addToCartBtn}
                >
                  🛒 Добавить в корзину
                </button>
              )}
            </div>
          );
        })}
      </div>

      {toys.length === 0 && !loading && (
        <div className={styles.empty}>Игрушки не найдены</div>
      )}
    </div>
  );
}

export default Catalog;

