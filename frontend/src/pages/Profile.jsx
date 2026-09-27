// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  
  const [userData, setUserData] = useState({ vezeteknev: '', keresztnev: '', email: '', telefon: '' });
  const [dataMessage, setDataMessage] = useState({ text: '', type: '' });

  const [passwords, setPasswords] = useState({ regiJelszo: '', ujJelszo: '', ujJelszoUjra: '' });
  const [passMessage, setPassMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    axios.get('http://localhost:3000/api/profile', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(response => {
      if (response.data.success) {
        setUserData(response.data.user);
      }
    }).catch(err => console.log(err));
  }, [navigate]);

  const handleDataChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handlePassChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleDataSubmit = async (e) => {
    e.preventDefault();
    setDataMessage({ text: '', type: '' });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('http://localhost:3000/api/profile/update', userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setDataMessage({ text: response.data.message, type: 'success' });
        localStorage.setItem('userName', `${userData.vezeteknev} ${userData.keresztnev}`);
      } else {
        setDataMessage({ text: response.data.message, type: 'danger' });
      }
    } catch (error) {
      setDataMessage({ text: 'Hiba a szerverrel való kommunikációban.', type: 'danger' });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassMessage({ text: '', type: '' });

    if (passwords.regiJelszo === passwords.ujJelszo) {
      return setPassMessage({ text: 'Az új jelszó nem lehet ugyanaz, mint a jelenlegi!', type: 'danger' });
    }

    if (passwords.ujJelszo !== passwords.ujJelszoUjra) {
      return setPassMessage({ text: 'Az új jelszavak nem egyeznek!', type: 'danger' });
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('http://localhost:3000/api/profile/password', {
        regiJelszo: passwords.regiJelszo,
        ujJelszo: passwords.ujJelszo
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setPassMessage({ text: response.data.message, type: 'success' });
        setPasswords({ regiJelszo: '', ujJelszo: '', ujJelszoUjra: '' });
      } else {
        setPassMessage({ text: response.data.message, type: 'danger' });
      }
    } catch (error) {
      setPassMessage({ text: 'Hiba a szerverrel való kommunikációban.', type: 'danger' });
    }
  };

  return (
    <div className="container mt-5 mb-5 d-flex justify-content-center">
      <div className="card-pink p-4 p-md-5 w-100 shadow-sm" style={{ maxWidth: '650px' }}>
        
        {/* Személyes adatok szekció */}
        <h2 className="fw-bold text-center mb-4">Személyes adataim</h2>
        
        {dataMessage.text && (
          <div className={`alert ${dataMessage.type === 'success' ? 'alert-salon' : 'alert-danger'} py-2 text-center mb-4`}>
            {dataMessage.text}
          </div>
        )}
        
        <form onSubmit={handleDataSubmit}>
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label fw-bold">Vezetéknév</label>
              <input 
                type="text" 
                className="form-control" 
                name="vezeteknev" 
                value={userData.vezeteknev} 
                onChange={handleDataChange} 
                required 
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold">Keresztnév</label>
              <input 
                type="text" 
                className="form-control" 
                name="keresztnev" 
                value={userData.keresztnev} 
                onChange={handleDataChange} 
                required 
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">E-mail cím</label>
            <input 
              type="email" 
              className="form-control" 
              name="email" 
              value={userData.email} 
              onChange={handleDataChange} 
              required 
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold">Telefonszám</label>
            <input 
              type="tel" 
              className="form-control" 
              name="telefon" 
              value={userData.telefon || ''} 
              onChange={handleDataChange} 
              required 
            />
          </div>

          <button type="submit" className="btn btn-dark w-100 py-2 shadow-sm">
            Adatok mentése
          </button>
        </form>
        
        <hr className="salon-divider my-5" />
        
        {/* Jelszó módosítása szekció */}
        <h4 className="fw-bold text-center mb-4">Jelszó módosítása</h4>
        
        {passMessage.text && (
          <div className={`alert ${passMessage.type === 'success' ? 'alert-salon' : 'alert-danger'} py-2 text-center mb-4`}>
            {passMessage.text}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit}>
          <div className="mb-3">
            <label className="form-label fw-bold">Jelenlegi jelszó</label>
            <input 
              type="password" 
              className="form-control" 
              name="regiJelszo" 
              value={passwords.regiJelszo} 
              onChange={handlePassChange} 
              required 
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Új jelszó</label>
            <input 
              type="password" 
              className="form-control" 
              name="ujJelszo" 
              value={passwords.ujJelszo} 
              onChange={handlePassChange} 
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
              onChange={handlePassChange} 
              required 
            />
          </div>

          <button type="submit" className="btn btn-dark w-100 py-2 shadow-sm">
            Jelszó frissítése
          </button>
        </form>

      </div>
    </div>
  );
};

export default Profile;