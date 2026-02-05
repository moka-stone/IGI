import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext.jsx';
import Navbar from './components/Navbar/Navbar.jsx';
import ScrollToTop from './components/ScrollToTop/ScrollToTop.jsx';
import Home from './pages/Home/Home.jsx';
import Catalog from './pages/Catalog/Catalog.jsx';
import ToyDetail from './pages/ToyDetail/ToyDetail.jsx';
import AddToy from './pages/AddToy/AddToy.jsx';
import EditToy from './pages/EditToy/EditToy.jsx';
import Cart from './pages/Cart/Cart.jsx';
import Checkout from './pages/Checkout/Checkout.jsx';
import CheckoutSuccess from './pages/CheckoutSuccess/CheckoutSuccess.jsx';
import Orders from './pages/Orders/Orders.jsx';
import MarketAnalysis from './pages/MarketAnalysis/MarketAnalysis.jsx';
import Login from './pages/Login/Login.jsx';
import Register from './pages/Register/Register.jsx';
import AuthCallback from './pages/AuthCallback/AuthCallback.jsx';
import api from './config/axios';
import styles from './App.module.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/api/auth/me')
        .then(res => {
          // Нормализуем user объект - добавляем id если есть только _id
          const userData = res.data;
          if (userData._id && !userData.id) {
            userData.id = userData._id.toString();
          }
          console.log('User loaded:', userData);
          setUser(userData);
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    // Нормализуем user объект - добавляем id если есть только _id
    const normalizedUser = { ...userData };
    if (normalizedUser._id && !normalizedUser.id) {
      normalizedUser.id = normalizedUser._id.toString();
    }
    console.log('User logged in:', normalizedUser);
    setUser(normalizedUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <Router>
        <ScrollToTop />
        <div className={styles.app}>
          <Navbar />
          <main className={styles.main}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/toy/:id" element={<ToyDetail />} />
              <Route 
                path="/add-toy" 
                element={user && user.role === 'admin' ? <AddToy /> : <Navigate to="/" />} 
              />
              <Route 
                path="/edit-toy/:id" 
                element={user ? <EditToy /> : <Navigate to="/login" />} 
              />
              <Route path="/cart" element={<Cart />} />
              <Route 
                path="/checkout" 
                element={user && user.role !== 'admin' ? <Checkout /> : <Navigate to="/" />} 
              />
              <Route path="/checkout/success" element={<CheckoutSuccess />} />
              <Route 
                path="/orders" 
                element={user && user.role === 'admin' ? <Orders /> : <Navigate to="/" />} 
              />
              <Route path="/market" element={<MarketAnalysis />} />
              <Route 
                path="/login" 
                element={user ? <Navigate to="/" /> : <Login />} 
              />
              <Route 
                path="/register" 
                element={user ? <Navigate to="/" /> : <Register />} 
              />
              <Route path="/auth/callback" element={<AuthCallback />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;

