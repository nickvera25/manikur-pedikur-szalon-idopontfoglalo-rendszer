// src/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState({ text: '', isSuccess: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', isSuccess: false });
    try {
      const response = await axios.post('http://localhost:3000/api/forgot-password', { email });
      setMessage({ 
        text: response.data.message, 
        isSuccess: response.data.success 
      });
    } catch (err) {
      setMessage({ 
        text: 'Hiba a szerverhez való csatlakozáskor.', 
        isSuccess: false 
      });
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center w-100" style={{ minHeight: 'calc(100vh - 100px)' }}>
      <div className="container d-flex justify-content-center align-items-center">
        <div className="card-pink shadow p-4 p-md-5 w-100 text-center" style={{ maxWidth: '500px' }}>
          <h2 className="mb-3 fw-bold">Elfelejtett jelszó</h2>
          <p className="mb-4">
            Add meg a regisztrációkor használt e-mail címedet, és küldünk egy linket a visszaállításhoz.
          </p>

          {message.text && (
            <div className={`alert ${message.isSuccess ? 'alert-salon' : 'alert-danger'} w-100 py-2 mb-3`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-100 text-start">
            <div className="mb-4">
              <label className="form-label fw-bold">E-mail cím</label>
              <input 
                type="email" 
                className="form-control" 
                placeholder="pelda@email.hu" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            <button type="submit" className="btn btn-dark w-100 py-2 mb-3">
              Link küldése
            </button>
          </form>

          <Link to="/login" className="forget-link mt-2 d-inline-block">
            Vissza a belépéshez
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;