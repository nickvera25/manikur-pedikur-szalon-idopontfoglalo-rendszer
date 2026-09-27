// src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/login', { email, jelszo: password });

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', response.data.user.szerep); 
        localStorage.setItem('userName', `${response.data.user.vezeteknev} ${response.data.user.keresztnev}`);

        if (response.data.user.jelszo_modositas_szukseges) {
          navigate('/kotelezo-jelszocsere');
          window.location.reload();
          return;
        }

        const szerep = response.data.user.szerep;
        if (szerep === 'Admin') navigate('/admin-dashboard');
        else if (szerep === 'Alkalmazott') navigate('/worker-dashboard'); 
        else navigate('/udvozoljuk');
        
        window.location.reload(); 
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error("Bejelentkezési hiba:", error);
      setError("Hiba történt a szerverhez való csatlakozáskor.");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center w-100" style={{ minHeight: 'calc(100vh - 100px)' }}>
      <div className="container d-flex justify-content-center align-items-center">
        <div className="row w-100 login-container shadow">

          {/* Bal oldal: Űrlap */}
          <div className="col-md-6 p-4 p-md-5 d-flex flex-column justify-content-center align-items-center login-box-left">
            <h2 className="mb-4 fw-bold">Belépés</h2>
            
            {error && <div className="alert alert-danger w-75 py-2 text-center">{error}</div>}
            
            <form onSubmit={handleLogin} className="w-100 d-flex flex-column align-items-center">
              <input 
                type="email" 
                className="form-control mb-3 w-75 p-2" 
                placeholder="E-mail cím" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
              <input 
                type="password" 
                className="form-control mb-4 w-75 p-2" 
                placeholder="Jelszó" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <button type="submit" className="btn btn-dark w-75 py-2">Bejelentkezés</button>
            </form>
            <Link to="/forgot-password" className="mt-4 text-decoration-none forget-link">Elfelejtetted a jelszavad?</Link>
          </div>

          {/* Jobb oldal: Logó és Regisztráció link */}
          <div className="col-md-6 p-4 p-md-5 d-flex flex-column justify-content-center align-items-center text-center">
            <img src="/logo.png" alt="Nails by Vera Logó" className="img-fluid mb-4" style={{ maxWidth: '180px' }} />
            <h1 className="fs-3 fw-bold mb-4">Üdvözöljük az oldalon!</h1>
            <p className="m-0 fs-6">
              Még nincs fiókod? 
              <Link to="/register" className="fw-bold text-decoration-none forget-link ms-1">Regisztrálj itt!</Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;