// src/pages/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    vezeteknev: '', keresztnev: '', telefon: '+36', email: '', jelszo: '', jelszoUjra: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); 
    setSuccess('');

    // TELEFONSZÁM ELLENŐRZÉSE: +36 és pontosan 9 számjegy
    const phoneRegex = /^\+36\d{9}$/;
    if (!phoneRegex.test(formData.telefon)) {
      return setError('A telefonszám formátuma érvénytelen! Helyes formátum: +36301234567 (+36 és pontosan 9 számjegy szóközök nélkül).');
    }

    if (formData.jelszo !== formData.jelszoUjra) {
      return setError('A két jelszó nem egyezik!');
    }

    try {
      const response = await axios.post('http://localhost:3000/api/register', formData);
      if (response.data.success) {
        setSuccess('Sikeres regisztráció! Most már bejelentkezhetsz.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Hiba a szerverhez való csatlakozáskor.');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center w-100" style={{ minHeight: 'calc(100vh - 100px)' }}>
      <div className="container d-flex justify-content-center align-items-center">
        <div className="row w-100 login-container shadow">

          {/* Bal oldal: Űrlap */}
          <div className="col-md-6 p-4 p-md-5 d-flex flex-column justify-content-center align-items-center login-box-left">
            <h2 className="mb-4 fw-bold">Regisztráció</h2>
            
            {error && <div className="alert alert-danger w-75 py-2 text-center">{error}</div>}
            {success && <div className="alert alert-success w-75 py-2 text-center">{success}</div>}

            <form onSubmit={handleRegister} className="w-100 d-flex flex-column align-items-center">
              <div className="d-flex w-75 gap-2 mb-3">
                <input 
                  type="text" 
                  name="vezeteknev" 
                  className="form-control p-2" 
                  placeholder="Vezetéknév" 
                  onChange={handleChange} 
                  required 
                />
                <input 
                  type="text" 
                  name="keresztnev" 
                  className="form-control p-2" 
                  placeholder="Keresztnév" 
                  onChange={handleChange} 
                  required 
                />
              </div>

              {/* TELEFONSZÁM BEVITELI MEZŐ MEGSZORÍTÁSSAL */}
              <input 
                type="tel" 
                name="telefon" 
                className="form-control mb-3 w-75 p-2" 
                placeholder="+36301234567" 
                value={formData.telefon}
                onChange={handleChange} 
                maxLength={12}
                pattern="^\+36\d{9}$"
                title="A telefonszámnak +36-tal kell kezdődnie és pontosan 9 számjegyet kell tartalmaznia (pl. +36301234567)"
                required 
              />

              <input 
                type="email" 
                name="email" 
                className="form-control mb-3 w-75 p-2" 
                placeholder="E-mail cím" 
                onChange={handleChange} 
                required 
              />
              <input 
                type="password" 
                name="jelszo" 
                className="form-control mb-3 w-75 p-2" 
                placeholder="Jelszó" 
                onChange={handleChange} 
                required 
              />
              <input 
                type="password" 
                name="jelszoUjra" 
                className="form-control mb-4 w-75 p-2" 
                placeholder="Jelszó újra" 
                onChange={handleChange} 
                required 
              />

              <button type="submit" className="btn btn-dark w-75 py-2">Regisztrálok</button>
            </form>
          </div>

          {/* Jobb oldal: Logó */}
          <div className="col-md-6 p-4 p-md-5 d-flex flex-column justify-content-center align-items-center text-center">
            <img src="/logo.png" alt="Nails by Vera Logó" className="img-fluid mb-4" style={{ maxWidth: '180px' }} />
            <h1 className="fs-3 fw-bold mb-4">Csatlakozz hozzánk!</h1>
            <p className="m-0 fs-6">
              Már van fiókod? <Link to="/login" className="fw-bold text-decoration-none forget-link ms-1">Lépj be itt!</Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;