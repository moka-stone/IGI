import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './CheckoutSuccess.module.css';

function CheckoutSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { purchasedToys, totalPrice } = location.state || { purchasedToys: [], totalPrice: 0 };

  return (
    <div className={styles.success}>
      <div className={styles.container}>
        <div className={styles.icon}>✓</div>
        <h1 className={styles.title}>Заказ успешно оформлен!</h1>
        <p className={styles.message}>
          Спасибо за покупку. Ваш заказ принят в обработку.
        </p>

        {purchasedToys.length > 0 && (
          <div className={styles.orderDetails}>
            <h2>Детали заказа</h2>
            <div className={styles.carsList}>
              {purchasedToys.map(toy => (
                <div key={toy._id} className={styles.carItem}>
                  <div className={styles.carImage}>
                    {toy.images && toy.images.length > 0 ? (
                      <img src={toy.images[0].url} alt={toy.title} />
                    ) : (
                      <div className={styles.placeholderImage}>🧸</div>
                    )}
                  </div>
                  <div className={styles.carInfo}>
                    <h3>{toy.title}</h3>
                    <p>{toy.brand} {toy.model} • {toy.ageRange?.min}-{toy.ageRange?.max} лет</p>
                  </div>
                  <div className={styles.carPrice}>
                    <div>{toy.price.toLocaleString()} BYN × {toy.quantity || 100} шт.</div>
                    <div className={styles.itemTotal}>{(toy.price * (toy.quantity || 100)).toLocaleString()} BYN</div>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.total}>
              <span>Итого:</span>
              <span className={styles.totalPrice}>{totalPrice.toLocaleString()} BYN</span>
            </div>
          </div>
        )}

        <div className={styles.actions}>
          <button onClick={() => navigate('/catalog')} className={styles.primaryBtn}>
            Вернуться в каталог
          </button>
          <button onClick={() => navigate('/')} className={styles.secondaryBtn}>
            На главную
          </button>
        </div>
      </div>
    </div>
  );
}

export default CheckoutSuccess;

