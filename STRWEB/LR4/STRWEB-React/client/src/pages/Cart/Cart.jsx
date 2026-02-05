import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import api from '../../config/axios';
import styles from './Cart.module.css';

function Cart() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCartItems();
  }, []);

  const loadCartItems = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Получаем корзину из localStorage (может быть массивом ID или объектов {toyId, quantity})
      const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
      
      if (cartData.length === 0) {
        setCartItems([]);
        setLoading(false);
        return;
      }

      // Преобразуем старый формат (массив ID) в новый формат (массив объектов)
      const cartItems = cartData.map(item => {
        if (typeof item === 'string') {
          return { toyId: item, quantity: 100 };
        }
        return item;
      });

      // Загружаем данные игрушек с сервера
      const toysPromises = cartItems.map(item => api.get(`/api/toys/${item.toyId}`));
      const toysResponses = await Promise.all(toysPromises);
      const toys = toysResponses.map((res, index) => ({
        ...res.data,
        quantity: cartItems[index].quantity || 100
      })).filter(toy => toy && toy.status === 'available');
      
      setCartItems(toys);
    } catch (err) {
      console.error('Error loading cart:', err);
      setError('Ошибка загрузки корзины');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = (toyId) => {
    const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
    const updatedCart = cartData.filter(item => {
      if (typeof item === 'string') {
        return item !== toyId;
      }
      return item.toyId !== toyId;
    });
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    setCartItems(prev => prev.filter(toy => toy._id !== toyId));
  };

  const updateQuantity = (toyId, newQuantity) => {
    if (newQuantity < 100) {
      alert('Минимальное количество для заказа - 100 штук');
      return;
    }
    
    const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
    const updatedCart = cartData.map(item => {
      if (typeof item === 'string') {
        if (item === toyId) {
          return { toyId: item, quantity: newQuantity };
        }
        return item;
      }
      if (item.toyId === toyId) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    setCartItems(prev => prev.map(toy => 
      toy._id === toyId ? { ...toy, quantity: newQuantity } : toy
    ));
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, toy) => total + (toy.price * (toy.quantity || 100)), 0);
  };

  const handleCheckout = () => {
    if (!user) {
      alert('Необходима авторизация для оформления заказа');
      navigate('/login');
      return;
    }

    if (user.role === 'admin') {
      alert('Администраторы не могут оформлять заказы');
      return;
    }

    if (cartItems.length === 0) {
      alert('Корзина пуста');
      return;
    }

    navigate('/checkout');
  };

  if (loading) {
    return <div className={styles.loading}>Загрузка корзины...</div>;
  }

  return (
    <div className={styles.cart}>
      <div className={styles.header}>
        <h1 className={styles.title}>Корзина</h1>
        {cartItems.length > 0 && (
          <span className={styles.itemCount}>{cartItems.length} {cartItems.length === 1 ? 'игрушка' : cartItems.length < 5 ? 'игрушки' : 'игрушек'}</span>
        )}
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {cartItems.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🛒</div>
          <h2>Корзина пуста</h2>
          <p>Добавьте игрушки в корзину для покупки</p>
          <Link to="/catalog" className={styles.browseBtn}>
            Перейти в каталог
          </Link>
        </div>
      ) : (
        <>
          <div className={styles.cartItems}>
            {cartItems.map(toy => (
              <div key={toy._id} className={styles.cartItem}>
                <div className={styles.carImage}>
                  {toy.images && toy.images.length > 0 ? (
                    <img src={toy.images[0].url} alt={toy.title} />
                  ) : (
                    <div className={styles.placeholderImage}>🧸</div>
                  )}
                </div>
                
                <div className={styles.carInfo}>
                  <Link to={`/toy/${toy._id}`} className={styles.carTitle}>
                    {toy.title}
                  </Link>
                  <p className={styles.carDetails}>
                    {toy.brand} {toy.model} • {toy.ageRange?.min}-{toy.ageRange?.max} лет
                  </p>
                  <p className={styles.carSpecs}>
                    {toy.material === 'plastic' ? 'Пластик' : toy.material === 'wood' ? 'Дерево' : toy.material === 'textile' ? 'Текстиль' : toy.material === 'metal' ? 'Металл' : toy.material === 'rubber' ? 'Резина' : 'Смешанный'} {toy.weight && `• ${toy.weight} г`}
                  </p>
                  <div className={styles.quantityControl}>
                    <label>Количество:</label>
                    <input
                      type="number"
                      min="100"
                      value={toy.quantity || 100}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 100;
                        updateQuantity(toy._id, Math.max(100, val));
                      }}
                      className={styles.quantityInput}
                    />
                    <span className={styles.quantityNote}>(мин. 100)</span>
                  </div>
                </div>

                <div className={styles.carPrice}>
                  <span className={styles.price}>{toy.price.toLocaleString()} BYN</span>
                  <span className={styles.pricePerUnit}>× {toy.quantity || 100} шт.</span>
                  <span className={styles.totalItemPrice}>
                    = {(toy.price * (toy.quantity || 100)).toLocaleString()} BYN
                  </span>
                </div>

                <button
                  onClick={() => removeFromCart(toy._id)}
                  className={styles.removeBtn}
                  title="Удалить из корзины"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className={styles.summary}>
            <div className={styles.summaryRow}>
              <span>Товаров:</span>
              <span>{cartItems.length}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Всего штук:</span>
              <span>{cartItems.reduce((sum, toy) => sum + (toy.quantity || 100), 0)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Итого:</span>
              <span className={styles.totalPrice}>{getTotalPrice().toLocaleString()} BYN</span>
            </div>
            <button
              onClick={handleCheckout}
              className={styles.checkoutBtn}
              disabled={!user || user.role === 'admin'}
            >
              {!user ? 'Войдите для оформления заказа' : 
               user.role === 'admin' ? 'Администраторы не могут оформлять заказы' :
               'Оформить заказ'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;

