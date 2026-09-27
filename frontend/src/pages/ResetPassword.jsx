// src/pages/ResetPassword.jsx
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState({ ujJelszo: '', ujJelszoUjra: '' });
  const [message, setMessage] = useState({ text: '', isSuccess: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', isSuccess: false });

    if (passwords.ujJelszo !== passwords.ujJelszoUjra) {
      return setMessage({ text: 'A két jelszó nem egyezik!', isSuccess: false });
    }

    try {
      const response = await axios.post('http://localhost:3000/api/reset-password', {
        token,
        ujJelszo: passwords.ujJelszo
      });

      setMessage({ 
        text: response.data.message, 
        isSuccess: response.data.success 
      });

      if (response.data.success) {
        setTimeout(() => navigate('/login'), 2500);
      }
    } catch (err) {
      setMessage({ text: 'Hiba a szerverrel való kommunikációban.', isSuccess: false });
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center w-100" style={{ minHeight: 'calc(100vh - 100px)' }}>
      <div className="container d-flex justify-content-center align-items-center">
        <div className="card-pink shadow p-4 p-md-5 w-100 text-center" style={{ maxWidth: '500px' }}>
          <h2 className="mb-4 fw-bold">Új jelszó beállítása</h2>
          
          {message.text && (
            <div className={`alert ${message.isSuccess ? 'alert-salon' : 'alert-danger'} w-100 py-2 text-center mb-3`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-100 text-start">
            <div className="mb-3">
              <label className="form-label fw-bold">Új jelszó</label>
              <input 
                type="password" 
                className="form-control" 
                name="ujJelszo" 
                value={passwords.ujJelszo} 
                onChange={(e) => setPasswords({ ...passwords, [e.target.name]: e.target.value })} 
                required 
              />
            </div>
            <div className="mb-4">
              <label className="form-label fw-bold">Új jelszó megerősítése</label>
              <input 
                type="password" 
                className="form-control" 
                name="ujJelszoUjra" 
                value={passwords.ujJelszoUjra} 
                onChange={(e) => setPasswords({ ...passwords, [e.target.name]: e.target.value })} 
                required 
              />
            </div>
            <button type="submit" className="btn btn-dark w-100 py-2 mb-3">
              Jelszó frissítése
            </button>
          </form>

          <Link to="/login" className="forget-link mt-2 d-inline-block">
            Ugrás a belépéshez
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;