import React, { useContext, useState, useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import ToyForm from '../../components/ToyForm/ToyForm.jsx';
import api from '../../config/axios';
import styles from './EditToy.module.css';

function EditToy() {
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const [toy, setToy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadToy();
  }, [id]);

  const loadToy = async () => {
    try {
      const response = await api.get(`/api/toys/${id}`);
      const toyData = response.data;
      
      // Проверяем, что пользователь является владельцем или админом
      const userId = user?.id || user?._id;
      let createdById = null;
      if (toyData.createdBy) {
        if (typeof toyData.createdBy === 'object') {
          createdById = toyData.createdBy._id || toyData.createdBy.id || toyData.createdBy;
        } else {
          createdById = toyData.createdBy;
        }
      }
      
      const userIdStr = userId ? userId.toString() : null;
      const createdByIdStr = createdById ? createdById.toString() : null;
      const isOwner = userIdStr && createdByIdStr && userIdStr === createdByIdStr;
      const isAdmin = user?.role === 'admin';
      
      if (!isOwner && !isAdmin) {
        setError('У вас нет прав на редактирование этой игрушки');
        return;
      }
      
      setToy(toyData);
    } catch (err) {
      setError('Ошибка загрузки игрушки');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!toy) {
    return <div className={styles.error}>Игрушка не найдена</div>;
  }

  return (
    <div className={styles.editToy}>
      <ToyForm toy={toy} />
    </div>
  );
}

export default EditToy;

