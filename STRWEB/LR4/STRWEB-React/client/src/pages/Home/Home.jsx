import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import styles from './Home.module.css';

function Home() {
  const { user } = useContext(AuthContext);

  return (
    <div className={styles.home}>
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>Фабрика игрушек</h1>
        <p className={styles.heroSubtitle}>
          Профессиональные услуги по продаже игрушек для детей всех возрастов
        </p>
        <div className={styles.heroButtons}>
          <Link to="/catalog" className={styles.primaryBtn}>
            Каталог игрушек
          </Link>
          <Link to="/market" className={styles.secondaryBtn}>
            Статистика
          </Link>
        </div>
      </section>

      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>Наши партнеры</h2>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}
          onDoubleClick = {() => alert("Вы нажали два раза")}
          onMouseEnter = {() => alert("Курсор вошёл в область")}
          onMouseLeave  = {() => alert("Курсор покинул область")}
          onContextMenu  = {() => alert("Вы нажали правой кнопкой")}>
            <div className={styles.featureIcon}>LEGO</div>
            <h3>Качественные конструкторы</h3>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>Barbie</div>
            <h3>Модные куклы</h3>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>Hot Wheels</div>
            <h3>Скорость и драйв</h3>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>Hasbro</div>
            <h3>Настольные игры</h3>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;

