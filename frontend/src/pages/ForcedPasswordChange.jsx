// src/pages/ForcedPasswordChange.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ForcedPasswordChange = () => {
  const [ujJelszo, setUjJelszo] = useState('');
  const [ujJelszoUjra, setUjJelszoUjra] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (ujJelszo !== ujJelszoUjra) {
      setError("A két jelszó nem egyezik meg!");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3000/api/force-password-change', 
        { ujJelszo },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert("Sikeres jelszóváltoztatás! Kérjük, jelentkezz be újra.");
        localStorage.clear();
        navigate('/login');
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError("Hiba történt a jelszó módosítása során.");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center w-100" style={{ minHeight: 'calc(100vh - 100px)' }}>
      <div className="container d-flex justify-content-center align-items-center">
        <div className="card-pink shadow p-4 p-md-5 w-100" style={{ maxWidth: '500px' }}>
          <h2 className="mb-3 fw-bold text-center">Jelszócsere szükséges</h2>
          <p className="text-center mb-4">
            Mivel ez az első belépésed, biztonsági okokból meg kell változtatnod az alapértelmezett jelszavadat.
          </p>

          {error && <div className="alert alert-salon py-2 text-center mb-3">{error}</div>}

          <form onSubmit={handlePasswordChange}>
            <div className="mb-3">
              <label className="form-label fw-bold">Új jelszó</label>
              <input 
                type="password" 
                className="form-control" 
                value={ujJelszo} 
                onChange={(e) => setUjJelszo(e.target.value)} 
                required 
              />
            </div>
            <div className="mb-4">
              <label className="form-label fw-bold">Új jelszó még egyszer</label>
              <input 
                type="password" 
                className="form-control" 
                value={ujJelszoUjra} 
                onChange={(e) => setUjJelszoUjra(e.target.value)} 
                required 
              />
            </div>
            <button type="submit" className="btn btn-dark w-100 py-2">
              Jelszó mentése
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForcedPasswordChange;