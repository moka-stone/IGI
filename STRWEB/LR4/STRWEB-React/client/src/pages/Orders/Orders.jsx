import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import api from '../../config/axios';
import { formatDateWithTimezone } from '../../utils/dateUtils';
import ProductionTracker from '../../components/ProductionTracker/ProductionTracker.jsx';
import styles from './Orders.module.css';

function Orders() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'admin') {
      navigate('/');
      return;
    }

    loadOrders();
  }, [user, navigate, filterStatus]);

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/orders');
      let filteredOrders = response.data;
      
      if (filterStatus) {
        filteredOrders = filteredOrders.filter(order => order.status === filterStatus);
      }
      
      setOrders(filteredOrders);
    } catch (err) {
      console.error('Error loading orders:', err);
      setError(err.response?.data?.message || 'Ошибка загрузки заказов');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/api/orders/${orderId}/status`, { status: newStatus });
      loadOrders();
    } catch (err) {
      alert('Ошибка обновления статуса заказа');
      console.error(err);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      processing: 'В процессе',
      completed: 'Завершён'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      processing: '#17a2b8',
      completed: '#28a745'
    };
    return colors[status] || '#6c757d';
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

  if (!user || user.role !== 'admin') {
    return null;
  }

  if (loading) {
    return <div className={styles.loading}>Загрузка заказов...</div>;
  }

  return (
    <div className={styles.orders}>
      <ProductionTracker />
      
      <div className={styles.header}>
        <h1 className={styles.title}>Все заказы</h1>
        <div className={styles.filters}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">Все статусы</option>
            <option value="processing">В процессе</option>
            <option value="completed">Завершён</option>
          </select>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {orders.length === 0 ? (
        <div className={styles.empty}>
          <p>Заказы не найдены</p>
        </div>
      ) : (
        <div className={styles.ordersList}>
          {orders.map(order => {
            const dateInfo = formatDateWithTimezone(order.createdAt);
            return (
              <div key={order._id} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <div className={styles.orderInfo}>
                    <h3>Заказ #{order._id.toString().slice(-8)}</h3>
                    <p className={styles.orderUser}>
                      Пользователь: <strong>{order.user?.username}</strong> ({order.user?.email})
                    </p>
                    <p className={styles.orderDate}>
                      Дата: {dateInfo.local}
                    </p>
                  </div>
                  <div className={styles.orderStatus}>
                    <span
                      className={styles.statusBadge}
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                    {order.status !== 'completed' && (
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className={styles.statusSelect}
                      >
                        <option value="processing">В процессе</option>
                        <option value="completed">Завершён</option>
                      </select>
                    )}
                  </div>
                </div>

                <div className={styles.carsList}>
                  <h4>Игрушки в заказе:</h4>
                  {order.toys.map((item, idx) => (
                    <div key={idx} className={styles.carItem}>
                      <div className={styles.carImage}>
                        {item.toyData?.images && item.toyData.images.length > 0 ? (
                          <img src={item.toyData.images[0].url} alt={item.toyData.title} />
                        ) : (
                          <div className={styles.placeholderImage}>🧸</div>
                        )}
                      </div>
                      <div className={styles.carInfo}>
                        <h4>{item.toyData?.title || 'Игрушка'}</h4>
                        <p>
                          {item.toyData?.brand} {item.toyData?.model} • {item.toyData?.ageRange?.min}-{item.toyData?.ageRange?.max} лет
                        </p>
                        <p>
                          {getCategoryLabel(item.toyData?.category)} • {getMaterialLabel(item.toyData?.material)}
                        </p>
                        {item.toyData?.weight && (
                          <p>
                            Вес: {item.toyData.weight} г
                          </p>
                        )}
                      </div>
                      <div className={styles.carPrice}>
                        <div>{item.price.toLocaleString()} BYN × {item.quantity || 100} шт.</div>
                        <div className={styles.itemTotal}>{(item.price * (item.quantity || 100)).toLocaleString()} BYN</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.orderFooter}>
                  <div className={styles.paymentInfo}>
                    <h4>Платежная информация:</h4>
                    <p><strong>Email:</strong> {order.paymentInfo?.email}</p>
                    <p><strong>Телефон:</strong> {order.paymentInfo?.phone}</p>
                    <p><strong>Карта:</strong> **** **** **** {order.paymentInfo?.cardNumber?.slice(-4)}</p>
                  </div>
                  <div className={styles.totalSection}>
                    <div className={styles.total}>
                      <span>Итого:</span>
                      <span className={styles.totalPrice}>{order.totalPrice.toLocaleString()} BYN</span>
                    </div>
                    {order.completedAt && (
                      <p className={styles.completedDate}>
                        Завершено: {new Date(order.completedAt).toLocaleString('ru-RU')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Orders;

