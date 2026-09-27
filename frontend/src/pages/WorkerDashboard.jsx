// src/pages/WorkerDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

const WorkerDashboard = () => {
  const userName = localStorage.getItem('userName') || "Kolléga";
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  const fetchTodaySchedule = async () => {
    if (!token) return;
    try {
      const res = await axios.get('http://localhost:3000/api/today-schedule', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setTodaySchedule(res.data.data);
      }
    } catch (err) {
      console.error("Hiba a mai beosztás betöltésekor:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodaySchedule();
  }, []);

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const res = await axios.put(`http://localhost:3000/api/update-appointment-status/${bookingId}`, 
        { statusz_neve: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setTodaySchedule(prev => prev.map(item => {
          if (item.foglalas_id === bookingId) {
            return {
              ...item,
              statusz: { ...item.statusz, statusz_neve: newStatus }
            };
          }
          return item;
        }));
      }
    } catch (err) {
      console.error("Nem sikerült módosítani a státuszt", err);
      alert("Hiba történt a státusz mentésekor.");
    }
  };

  const formattedToday = dayjs().format('YYYY.MM.DD.');

  return (
    <div className="container mt-5 mb-5 d-flex justify-content-center">
      <div 
        className="card-powder w-100 p-4 p-md-5 shadow-sm d-flex flex-column justify-content-start"
        style={{ maxWidth: '1150px', minHeight: '520px' }}
      >
        <h1 className="fw-bold mb-5" style={{ fontSize: '2.8rem' }}>
          Üdvözöljük {userName}!
        </h1>

        <div 
          className="card-pink p-4 p-md-5 shadow-sm"
          style={{ maxWidth: '900px', minHeight: '260px' }}
        >
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
            <h2 className="m-0 fw-bold fs-4">Mai beosztásod</h2>
            <h2 className="m-0 fw-bold fs-4">{formattedToday}</h2>
          </div>

          {loading ? (
            <p className="fs-5">Beosztás betöltése...</p>
          ) : todaySchedule.length === 0 ? (
            <div className="py-4 text-start">
              <p className="fs-4 m-0 fw-semibold">Ma nincs betervezett vendéged!</p>
            </div>
          ) : (
            <ul className="list-unstyled m-0 d-flex flex-column gap-3 pt-2">
              {todaySchedule.map((item) => {
                const currentStatus = item.statusz?.statusz_neve || 'Jóváhagyva';
                const startTime = dayjs(item.kezdo_idopont).format('H:mm');
                const endTime = dayjs(item.veg_idopont).format('H:mm');

                const statusBg = currentStatus === 'Teljesítve' 
                  ? '#d1e7dd' 
                  : currentStatus === 'Lemondva' 
                  ? '#f8d7da' 
                  : 'var(--page-bg)';

                return (
                  <li 
                    key={item.foglalas_id} 
                    className="card-white p-3 d-flex justify-content-between align-items-center flex-wrap gap-3 shadow-sm"
                  >
                    <div style={{ fontSize: '1.15rem' }}>
                      <span className="me-2 fw-bold">•</span>
                      <strong className="me-2">{startTime} - {endTime}</strong>
                      | <span className="fw-semibold">{item.vendeg.vezeteknev} {item.vendeg.keresztnev}</span>
                      | <span>{item.szolgaltatas.szolgaltatas_neve}</span>
                    </div>

                    <div className="d-flex align-items-center">
                      <select 
                        className="form-select form-select-sm fw-bold shadow-none"
                        style={{ 
                          backgroundColor: statusBg, 
                          color: 'var(--text-and-btn)', 
                          border: 'var(--salon-border)', 
                          borderRadius: '8px',
                          cursor: 'pointer',
                          minWidth: '140px'
                        }}
                        value={currentStatus}
                        onChange={(e) => handleStatusChange(item.foglalas_id, e.target.value)}
                      >
                        <option value="Jóváhagyva">Jóváhagyva</option>
                        <option value="Teljesítve">✓ Teljesítve</option>
                        <option value="Lemondva">✕ Lemondva</option>
                      </select>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
};

export default WorkerDashboard;