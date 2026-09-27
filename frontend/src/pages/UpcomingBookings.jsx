// src/pages/UpcomingBookings.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

const UpcomingBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchUpcoming = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await axios.get('http://localhost:3000/api/my-bookings/upcoming', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setBookings(res.data.data);
    } catch (err) {
      setError("Nem sikerült lekérni a közelgő időpontokat.");
    }
  };

  useEffect(() => {
    fetchUpcoming();
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Biztosan le szeretnéd mondani ezt az időpontot?")) return;

    setMessage('');
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await axios.delete(`http://localhost:3000/api/cancel-booking/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setMessage(res.data.message);
        fetchUpcoming();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Hiba történt a lemondás során.");
    }
  };

  return (
    <div className="container mt-5 mb-5 d-flex justify-content-center">
      <div className="card-pink p-4 p-md-5 w-100 shadow-sm" style={{ maxWidth: '900px' }}>
        <h2 className="fw-bold text-center mb-4">Közelgő foglalásaim</h2>

        {message && <div className="alert alert-salon py-2 text-center mb-3">{message}</div>}
        {error && <div className="alert alert-danger py-2 text-center mb-3">{error}</div>}

        {bookings.length === 0 ? (
          <p className="text-center my-4 fs-5">Jelenleg nincs aktív jövőbeli foglalásod.</p>
        ) : (
          <div className="d-flex flex-column gap-3">
            {bookings.map((b) => (
              <div 
                key={b.foglalas_id} 
                className="card-powder p-3 d-flex justify-content-between align-items-center flex-wrap gap-2 shadow-sm"
              >
                <div>
                  <h5 className="fw-bold mb-1">
                    {b.szolgaltatas?.szolgaltatas_neve} ({b.szolgaltatas?.ar?.toLocaleString('hu-HU')} Ft)
                  </h5>
                  <p className="mb-0">
                    📅 <strong>{dayjs(b.kezdo_idopont).format('YYYY. MMMM D. HH:mm')}</strong> – {dayjs(b.veg_idopont).format('HH:mm')}
                  </p>
                  <p className="mb-0 small">
                    👤 Szakember: {b.alkalmazott?.vezeteknev} {b.alkalmazott?.keresztnev} {b.alkalmazott?.telefon && `(${b.alkalmazott.telefon})`}
                  </p>
                </div>
                <button 
                  className="btn btn-dark py-2 px-3"
                  onClick={() => handleCancel(b.foglalas_id)}
                >
                  Lemondás
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingBookings;