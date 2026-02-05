import React, { Component } from 'react';
import api from '../../config/axios';
import styles from './ProductionTracker.module.css';

// Классовый компонент для отслеживания заказов
class ProductionTracker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      loading: false,
      error: '',
      lastUpdate: null,
      autoRefresh: true
    };
  }

  componentDidMount() {
    this.loadOrders();
    // Автоматическое обновление каждые 10 секунд
    if (this.state.autoRefresh) {
      this.refreshInterval = setInterval(() => {
        this.loadOrders();
        this.checkAndUpdateOrderStatuses();
      }, 10000);
    }
  }

  componentWillUnmount() {
    // Очистка интервала при размонтировании
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadOrders = async () => {
    this.setState({ loading: true, error: '' });
    try {
      const response = await api.get('/api/orders');
      const allOrders = response.data || [];
      
      // Фильтруем только заказы в процессе
      const processingOrders = allOrders
        .filter(order => order.status === 'processing')
        .slice(0, 10); // Показываем максимум 10 заказов

      // Преобразуем заказы в формат для отображения
      const orders = processingOrders.map(order => {
        const createdAt = new Date(order.createdAt);
        const now = new Date();
        const elapsedMinutes = Math.floor((now - createdAt) / (1000 * 60));
        const remainingMinutes = Math.max(0, 5 - elapsedMinutes);
        
        return {
          id: order._id,
          orderNumber: order._id.toString().slice(-8),
          totalPrice: order.totalPrice,
          toysCount: order.toys.length,
          createdAt: createdAt,
          elapsedMinutes: elapsedMinutes,
          remainingMinutes: remainingMinutes,
          status: order.status,
          progress: Math.min(100, (elapsedMinutes / 5) * 100)
        };
      });

      this.setState({
        orders,
        loading: false,
        lastUpdate: new Date()
      });
    } catch (err) {
      this.setState({
        error: 'Ошибка загрузки заказов',
        loading: false
      });
      console.error('OrderTracker error:', err);
    }
  };

  checkAndUpdateOrderStatuses = async () => {
    try {
      const { orders } = this.state;
      
      // Проверяем каждый заказ
      for (const order of orders) {
        const elapsedMinutes = Math.floor((new Date() - order.createdAt) / (1000 * 60));
        
        // Если прошло 5 минут, обновляем статус на "завершён"
        if (elapsedMinutes >= 5 && order.status === 'processing') {
          try {
            await api.put(`/api/orders/${order.id}/status`, { status: 'completed' });
            // Обновляем локальное состояние
            this.setState(prevState => ({
              orders: prevState.orders.filter(o => o.id !== order.id)
            }));
          } catch (err) {
            console.error(`Error updating order ${order.id}:`, err);
          }
        }
      }
    } catch (err) {
      console.error('Error checking order statuses:', err);
    }
  };

  onRefresh = () => {
    this.loadOrders();
    this.checkAndUpdateOrderStatuses();
  };

  onToggleAutoRefresh = () => {
    this.setState(prevState => {
      const newAutoRefresh = !prevState.autoRefresh;
      
      if (newAutoRefresh) {
        // Включаем автообновление
        this.refreshInterval = setInterval(() => {
          this.loadOrders();
          this.checkAndUpdateOrderStatuses();
        }, 10000);
      } else {
        // Выключаем автообновление
        if (this.refreshInterval) {
          clearInterval(this.refreshInterval);
        }
      }
      
      return { autoRefresh: newAutoRefresh };
    });
  };

  onOrderClick = (orderId) => {
    // Можно перейти на страницу деталей заказа или показать модальное окно
    alert(`Заказ #${this.state.orders.find(order => order.id === orderId)?.orderNumber}`);
  };

  onCompleteNow = async (orderId) => {
    try {
      await api.put(`/api/orders/${orderId}/status`, { status: 'completed' });
      // Обновляем локальное состояние
      this.setState(prevState => ({
        orders: prevState.orders.filter(order => order.id !== orderId)
      }));
    } catch (err) {
      alert('Ошибка обновления статуса заказа');
      console.error(err);
    }
  };

  formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  formatRemainingTime = (remainingMinutes) => {
    if (remainingMinutes <= 0) return 'Готово';
    if (remainingMinutes === 1) return '1 минута';
    if (remainingMinutes < 5) return `${remainingMinutes} минуты`;
    return `${remainingMinutes} минут`;
  };

  render() {
    const { orders, loading, error, lastUpdate, autoRefresh } = this.state;

    if (loading && orders.length === 0) {
      return <div className={styles.loading}>Загрузка заказов...</div>;
    }

    return (
      <div className={styles.productionTracker}>
        <div className={styles.header}>
          <h2 className={styles.title}>Заказы в процессе</h2>
          <div className={styles.controls}>
            <button
              onClick={this.onRefresh}
              className={styles.refreshBtn}
              disabled={loading}
            >
              {loading ? 'Обновление...' : '🔄 Обновить'}
            </button>
            <button
              onClick={this.onToggleAutoRefresh}
              className={styles.autoRefreshBtn}
            >
              {autoRefresh ? '⏸️ Пауза' : '▶️ Автообновление'}
            </button>
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {lastUpdate && (
          <div className={styles.lastUpdate}>
            Последнее обновление: {this.formatTime(lastUpdate)}
          </div>
        )}

        <div className={styles.productionList}>
          {orders.map(order => (
            <div
              key={order.id}
              className={styles.productionItem}
              onClick={() => this.onOrderClick(order.id)}
            >
              <div className={styles.itemHeader}>
                <h3 className={styles.itemName}>Заказ #{order.orderNumber}</h3>
                <span
                  className={styles.itemStatus}
                  style={{ backgroundColor: '#17a2b8' }}
                >
                  В процессе
                </span>
              </div>

              <div className={styles.orderInfo}>
                <p className={styles.orderDetails}>
                  Игрушек: {order.toysCount} • Сумма: {order.totalPrice.toLocaleString()} BYN
                </p>
                <p className={styles.orderTime}>
                  Создан: {this.formatTime(order.createdAt)} • Прошло: {order.elapsedMinutes} мин.
                </p>
              </div>

              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: `${order.progress}%`,
                    backgroundColor: order.progress >= 100 ? '#AAE5B3' : '#17a2b8'
                  }}
                />
                <span className={styles.progressText}>{Math.round(order.progress)}%</span>
              </div>

              <div className={styles.itemFooter}>
                <span className={styles.estimatedTime}>
                  ⏱️ Осталось: {this.formatRemainingTime(order.remainingMinutes)}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    this.onCompleteNow(order.id);
                  }}
                  className={styles.statusBtn}
                >
                  Завершить сейчас ✓
                </button>
              </div>
            </div>
          ))}
        </div>

        {orders.length === 0 && !loading && (
          <div className={styles.empty}>
            Нет заказов в процессе
          </div>
        )}
      </div>
    );
  }
}

export default ProductionTracker;

