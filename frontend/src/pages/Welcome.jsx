// src/pages/Welcome.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';

const Welcome = () => {
  const userName = localStorage.getItem('userName') || "Vendég";
  const [nextBooking, setNextBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ text: '', isError: false });

  const token = localStorage.getItem('token');

  const fetchNextBooking = async () => {
    if (!token) return;
    try {
      const res = await axios.get('http://localhost:3000/api/my-bookings/upcoming', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success && res.data.data.length > 0) {
        setNextBooking(res.data.data[0]);
      } else {
        setNextBooking(null);
      }
    } catch (err) {
      console.error("Hiba a foglalás betöltésekor:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNextBooking();
  }, []);

  const handleCancel = async () => {
    if (!nextBooking) return;
    if (!window.confirm("Biztosan lemondod a közelgő időpontodat?")) return;

    setFeedback({ text: '', isError: false });

    try {
      const res = await axios.delete(`http://localhost:3000/api/cancel-booking/${nextBooking.foglalas_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setFeedback({ text: res.data.message, isError: false });
        setNextBooking(null);
        fetchNextBooking();
      }
    } catch (err) {
      setFeedback({
        text: err.response?.data?.message || "A lemondás nem sikerült.",
        isError: true
      });
    }
  };

  return (
    <div className="container mt-5 mb-5 d-flex justify-content-center">
      <div 
        className="card-powder w-100 p-4 p-md-5 shadow-sm d-flex flex-column justify-content-center"
        style={{ maxWidth: '1150px', minHeight: '520px' }}
      >
        <h1 className="fw-bold mb-5" style={{ fontSize: '2.8rem' }}>
          Üdvözöljük {userName}!
        </h1>

        {feedback.text && (
          <div className={`alert ${feedback.isError ? 'alert-danger' : 'alert-salon'} py-2 text-center mb-4`}>
            {feedback.text}
          </div>
        )}

        <div className="row g-4">
          
          {/* Bal oldal: Közelgő időpont */}
          <div className="col-lg-6">
            <div 
              className="card-pink p-4 p-xl-5 d-flex align-items-center gap-4 h-100 shadow-sm"
              style={{ minHeight: '230px' }}
            >
              <div style={{ flexShrink: 0 }}>
                <svg width="75" height="75" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>

              <div className="d-flex flex-column justify-content-center flex-grow-1">
                <h3 className="fw-bold m-0 mb-3" style={{ fontSize: '1.45rem' }}>
                  Közelgő időpontod:&nbsp;&nbsp;
                  <span className="fw-normal">
                    {loading ? "Betöltés..." : nextBooking ? dayjs(nextBooking.kezdo_idopont).format('YYYY.MM.DD. HH:mm') : "Nincs"}
                  </span>
                </h3>

                <div>
                  <button 
                    className="btn btn-dark px-4 py-2"
                    style={{ 
                      opacity: nextBooking ? 1 : 0.5,
                      cursor: nextBooking ? 'pointer' : 'not-allowed'
                    }}
                    disabled={!nextBooking}
                    onClick={handleCancel}
                  >
                    Lemondás
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Jobb oldal: Foglalás kártya */}
          <div className="col-lg-6">
            <div 
              className="card-pink p-4 p-xl-5 d-flex align-items-center gap-4 h-100 shadow-sm"
              style={{ minHeight: '230px' }}
            >
              <div style={{ flexShrink: 0 }}>
                <svg width="75" height="75" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>

              <div className="d-flex flex-column justify-content-center flex-grow-1">
                <h3 className="fw-bold m-0 mb-3" style={{ fontSize: '1.55rem' }}>
                  Szeretnél foglalni?
                </h3>

                <div>
                  <Link to="/foglalas" className="btn btn-dark px-4 py-2 text-decoration-none">
                    Foglalás
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Welcome;