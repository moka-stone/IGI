import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import ToyForm from '../../components/ToyForm/ToyForm.jsx';
import styles from './AddToy.module.css';

function AddToy() {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== 'admin') {
    return (
      <div className={styles.error}>
        <h2>Доступ запрещен</h2>
        <p>Только администраторы могут добавлять игрушки.</p>
      </div>
    );
  }

  return (
    <div className={styles.addToy}>
      <ToyForm />
    </div>
  );
}

export default AddToy;

