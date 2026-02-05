import React, { useState, useEffect } from 'react';
import api from '../../config/axios';
import styles from './MarketAnalyzer.module.css';

// Стрелочная функция компонент для анализа рынка
const MarketAnalyzer = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMarketStats();
  }, []);

  const loadMarketStats = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/market/stats');
      setStats(response.data);
    } catch (err) {
      setError('Ошибка загрузки статистики');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onMarketAnalyze = () => {
    loadMarketStats();
  };

  if (loading) {
    return <div className={styles.loading}>Загрузка данных...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!stats) {
    return null;
  }

  return (
    <div className={styles.marketAnalyzer}>
      <div className={styles.header}>
        <h2>Статистика игрушек</h2>
        <button onClick={onMarketAnalyze} className={styles.refreshBtn}>
          Обновить данные
        </button>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📊</div>
          <div className={styles.statValue}>{stats.totalToys}</div>
          <div className={styles.statLabel}>Всего игрушек</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>✅</div>
          <div className={styles.statValue}>{stats.availableToys}</div>
          <div className={styles.statLabel}>Доступно</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>💰</div>
          <div className={styles.statValue}>
            {Math.round(stats.averagePrice).toLocaleString()} BYN
          </div>
          <div className={styles.statLabel}>Средняя цена</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>🚫</div>
          <div className={styles.statValue}>{stats.unavailableToys || 0}</div>
          <div className={styles.statLabel}>Недоступно</div>
        </div>
      </div>

      <div className={styles.charts}>
        <div className={styles.chartSection}>
          <h3>Распределение по видам игрушек</h3>
          <div className={styles.chart}>
            {stats.toysByCategory?.map(item => (
              <div key={item._id} className={styles.chartItem}>
                <div className={styles.chartLabel}>
                  {item._id === 'constructor' ? 'Конструктор' :
                   item._id === 'doll' ? 'Кукла' :
                   item._id === 'car' ? 'Машинка' :
                   item._id === 'board_game' ? 'Настольная игра' :
                   item._id === 'soft_toy' ? 'Мягкая игрушка' :
                   item._id === 'educational' ? 'Развивающая игрушка' :
                   item._id === 'puzzle' ? 'Пазл' :
                   item._id === 'action_figure' ? 'Фигурка' :
                   item._id === 'sports' ? 'Спортивная игрушка' :
                   item._id === 'electronic' ? 'Электронная игрушка' : 'Другое'}
                </div>
                <div className={styles.chartBar}>
                  <div 
                    className={styles.chartFill}
                    style={{ 
                      width: `${(item.count / stats.totalToys) * 100}%` 
                    }}
                  />
                </div>
                <div className={styles.chartValue}>{item.count}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.chartSection}>
          <h3>Заказы по статусам</h3>
          <div className={styles.chart}>
            {stats.ordersByStatus?.map(item => (
              <div key={item._id} className={styles.chartItem}>
                <div className={styles.chartLabel}>
                  {item._id === 'processing' ? 'В процессе' :
                   item._id === 'completed' ? 'Завершён' : item._id}
                </div>
                <div className={styles.chartBar}>
                  <div 
                    className={styles.chartFill}
                    style={{ 
                      width: `${(item.count / (stats.ordersByStatus.reduce((sum, d) => sum + d.count, 0))) * 100}%` 
                    }}
                  />
                </div>
                <div className={styles.chartValue}>
                  {item.count} ({item.totalValue?.toLocaleString()} BYN)
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.chartSection}>
          <h3>Общая статистика заказов</h3>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Всего заказов</div>
              <div className={styles.statValue}>{stats.totalOrders || 0}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Завершено</div>
              <div className={styles.statValue}>{stats.completedOrders || 0}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketAnalyzer;

