import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import { getCurrentDate, getTimezone } from '../../utils/dateUtils';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const currentDate = getCurrentDate();
  const timezone = getTimezone();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoText}>Фабрика игрушек</span>
        </Link>
        
        <div className={styles.navLinks}>
          <Link to="/" className={styles.navLink}>Главная</Link>
          <Link to="/catalog" className={styles.navLink}>Каталог</Link>
          <Link to="/market" className={styles.navLink}>Статистика</Link>
          {user && user.role !== 'admin' && (
            <Link to="/cart" className={styles.navLink}>Корзина</Link>
          )}
          {user && user.role === 'admin' && (
            <>
              <Link to="/add-toy" className={styles.navLink}>Добавить игрушку</Link>
              <Link to="/orders" className={styles.navLink}>Заказы</Link>
            </>
          )}
        </div>

        <div className={styles.rightSection}>
          {/* <div className={styles.dateInfo}>
            <span className={styles.date}>{currentDate.toLocaleDateString('ru-RU')}</span>
            <span className={styles.timezone}>{timezone}</span>
          </div> */}
          
          {user ? (
            <div className={styles.userSection}>
              <span className={styles.username}>{user.username}</span>
              <button onClick={handleLogout} className={styles.logoutBtn}>
                Выход
              </button>
            </div>
          ) : (
            <div className={styles.authLinks}>
              <Link to="/login" className={styles.loginBtn}>Вход</Link>
              <Link to="/register" className={styles.registerBtn}>Регистрация</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

