// src/pages/PastBookings.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

const PastBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPast = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await axios.get('http://localhost:3000/api/my-bookings/past', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) setBookings(res.data.data);
      } catch (err) {
        setError("Nem sikerült lekérni a korábbi foglalásokat.");
      }
    };

    fetchPast();
  }, []);

  return (
    <div className="container mt-5 mb-5 d-flex justify-content-center">
      <div className="card-pink p-4 p-md-5 w-100 shadow-sm" style={{ maxWidth: '900px' }}>
        <h2 className="fw-bold text-center mb-4">Korábbi foglalásaim</h2>

        {error && <div className="alert alert-salon py-2 text-center mb-3">{error}</div>}

        {bookings.length === 0 ? (
          <p className="text-center my-4 fs-5">Még nincsenek lezárult korábbi foglalásaid.</p>
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
                    📅 <strong>{dayjs(b.kezdo_idopont).format('YYYY. MMMM D. HH:mm')}</strong>
                  </p>
                  <p className="mb-0 small">
                    👤 Szakember: {b.alkalmazott?.vezeteknev} {b.alkalmazott?.keresztnev}
                  </p>
                </div>
                
                <span className="badge card-white text-salon py-2 px-3 shadow-sm">
                  {b.statusz?.statusz_neve || 'Teljesítve'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PastBookings;