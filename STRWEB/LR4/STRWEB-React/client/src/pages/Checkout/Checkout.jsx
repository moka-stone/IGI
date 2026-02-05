import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import api from '../../config/axios';
import styles from './Checkout.module.css';

function Checkout() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role === 'admin') {
      navigate('/');
      return;
    }

    loadCartItems();
  }, [user, navigate]);

  const loadCartItems = async () => {
    try {
      const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
      
      if (cartData.length === 0) {
        navigate('/cart');
        return;
      }

      // Преобразуем старый формат (массив ID) в новый формат (массив объектов)
      const cartItems = cartData.map(item => {
        if (typeof item === 'string') {
          return { toyId: item, quantity: 100 };
        }
        return item;
      });

      const toysPromises = cartItems.map(item => api.get(`/api/toys/${item.toyId}`));
      const toysResponses = await Promise.all(toysPromises);
      const toys = toysResponses.map((res, index) => ({
        ...res.data,
        quantity: cartItems[index].quantity || 100
      })).filter(toy => toy && toy.status === 'available');
      
      if (toys.length === 0) {
        navigate('/cart');
        return;
      }

      // Проверяем, что все товары имеют минимум 100 штук
      const invalidItems = toys.filter(toy => (toy.quantity || 100) < 100);
      if (invalidItems.length > 0) {
        setError('Все товары должны иметь минимум 100 штук. Пожалуйста, обновите количество в корзине.');
        return;
      }

      setCartItems(toys);
    } catch (err) {
      console.error('Error loading cart:', err);
      setError('Ошибка загрузки корзины');
    }
  };

  const handleSubmit = async () => {
    setError('');

    if (cartItems.length === 0) {
      setError('Корзина пуста');
      return;
    }

    // Проверяем, что все товары имеют минимум 100 штук
    const invalidItems = cartItems.filter(toy => (toy.quantity || 100) < 100);
    if (invalidItems.length > 0) {
      setError('Все товары должны иметь минимум 100 штук. Пожалуйста, обновите количество в корзине.');
      return;
    }

    setLoading(true);

    try {
      // Создаем заказ
      const orderData = {
        toys: cartItems.map(toy => ({
          toy: toy._id,
          price: toy.price,
          quantity: toy.quantity || 100
        })),
        totalPrice: getTotalPrice()
      };

      const response = await api.post('/api/orders', orderData);

      // Очищаем корзину
      localStorage.removeItem('cart');

      // Перенаправляем на страницу успеха
      navigate('/checkout/success', { 
        state: { 
          order: response.data,
          purchasedToys: cartItems,
          totalPrice: getTotalPrice()
        } 
      });
    } catch (err) {
      console.error('Order creation error:', err);
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Ошибка при оформлении заказа. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, toy) => total + (toy.price * (toy.quantity || 100)), 0);
  };

  if (!user) {
    return null;
  }

  return (
    <div className={styles.checkout}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Оформление заказа</h1>
          <button onClick={() => navigate('/cart')} className={styles.backBtn}>
            ← Вернуться в корзину
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.content}>
          <div className={styles.orderSummary}>
            <h2>Ваш заказ</h2>
            <div className={styles.itemsList}>
              {cartItems.map(toy => (
                <div key={toy._id} className={styles.orderItem}>
                  <div className={styles.itemImage}>
                    {toy.images && toy.images.length > 0 ? (
                      <img src={toy.images[0].url} alt={toy.title} />
                    ) : (
                      <div className={styles.placeholderImage}>🧸</div>
                    )}
                  </div>
                  <div className={styles.itemInfo}>
                    <h3>{toy.title}</h3>
                    <p>{toy.brand} {toy.model} • {toy.ageRange?.min}-{toy.ageRange?.max} лет</p>
                    <p className={styles.quantityInfo}>Количество: {toy.quantity || 100} шт.</p>
                  </div>
                  <div className={styles.itemPrice}>
                    <div>{toy.price.toLocaleString()} BYN × {toy.quantity || 100} шт.</div>
                    <div className={styles.itemTotal}>{(toy.price * (toy.quantity || 100)).toLocaleString()} BYN</div>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.total}>
              <span>Итого:</span>
              <span className={styles.totalPrice}>{getTotalPrice().toLocaleString()} BYN</span>
            </div>
          </div>

          <div className={styles.actionSection}>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={styles.submitBtn}
            >
              {loading ? 'Обработка...' : `Оформить заказ на ${getTotalPrice().toLocaleString()} BYN`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;

