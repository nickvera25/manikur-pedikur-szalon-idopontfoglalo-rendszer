// src/pages/ScheduleSetting.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

const alapHetiBeosztas = [
  { nap_id: 1, nev: 'Hétfő', dolgozik: true, tol: '08:00', ig: '16:00' },
  { nap_id: 2, nev: 'Kedd', dolgozik: true, tol: '08:00', ig: '16:00' },
  { nap_id: 3, nev: 'Szerda', dolgozik: true, tol: '08:00', ig: '16:00' },
  { nap_id: 4, nev: 'Csütörtök', dolgozik: true, tol: '08:00', ig: '16:00' },
  { nap_id: 5, nev: 'Péntek', dolgozik: true, tol: '08:00', ig: '16:00' },
  { nap_id: 6, nev: 'Szombat', dolgozik: false, tol: '09:00', ig: '12:00' },
  { nap_id: 7, nev: 'Vasárnap', dolgozik: false, tol: '00:00', ig: '00:00' }
];

const ScheduleSetting = () => {
  const [beosztas, setBeosztas] = useState(alapHetiBeosztas);
  const [szabadsagok, setSzabadsagok] = useState([]);
  
  const [ujSzabi, setUjSzabi] = useState({
    kezdo_datum: '',
    veg_datum: '',
    megjegyzes: ''
  });

  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const token = localStorage.getItem('token');

  const loadData = async () => {
    if (!token) return;
    try {
      const resMunkarend = await axios.get('http://localhost:3000/api/munkarend', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resMunkarend.data.success && resMunkarend.data.data.length > 0) {
        const mentettNapok = resMunkarend.data.data;
        setBeosztas(prev => prev.map(nap => {
          const talalat = mentettNapok.find(m => m.a_het_napja === nap.nap_id);
          if (talalat) {
            const tolStr = new Date(talalat.nyitas_ido).toISOString().substring(11, 16);
            const igStr = new Date(talalat.zaras_ido).toISOString().substring(11, 16);
            return { ...nap, dolgozik: true, tol: tolStr, ig: igStr };
          }
          return { ...nap, dolgozik: false };
        }));
      }

      const resSzabi = await axios.get('http://localhost:3000/api/szabadsagok', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resSzabi.data.success) {
        setSzabadsagok(resSzabi.data.data);
      }
    } catch (err) {
      console.error("Hiba az adatok lekérésekor", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMentes = async (e) => {
    e.preventDefault();
    setStatusMessage('');
    setIsError(false);

    try {
      const response = await axios.post(
        'http://localhost:3000/api/munkarend', 
        { hetiBeosztas: beosztas },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setStatusMessage("Heti munkarended sikeresen elmentve!");
      }
    } catch (error) {
      setIsError(true);
      setStatusMessage("Hiba a mentés során.");
    }
  };

  const handleSzabiHozzaadas = async (e) => {
    e.preventDefault();
    setStatusMessage('');
    setIsError(false);

    try {
      const res = await axios.post(
        'http://localhost:3000/api/szabadsagok',
        ujSzabi,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setStatusMessage(res.data.message);
        setUjSzabi({ kezdo_datum: '', veg_datum: '', megjegyzes: '' });
        loadData();
      }
    } catch (err) {
      setIsError(true);
      setStatusMessage(err.response?.data?.message || "Nem sikerült elmenteni a szabadságot.");
    }
  };

  const handleSzabiTorles = async (id) => {
    if (!window.confirm("Biztosan törölni szeretnéd ezt a távollétet?")) return;

    try {
      const res = await axios.delete(`http://localhost:3000/api/szabadsagok/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setStatusMessage(res.data.message);
        loadData();
      }
    } catch (err) {
      setIsError(true);
      setStatusMessage("Hiba a törlés során.");
    }
  };

  return (
    <div className="container mt-5 mb-5 d-flex justify-content-center">
      <div className="card-pink p-4 p-md-5 w-100 shadow-sm" style={{ maxWidth: '850px' }}>
        
        {statusMessage && (
          <div className={`alert ${isError ? 'alert-danger' : 'alert-salon'} py-2 text-center mb-4`}>
            {statusMessage}
          </div>
        )}

        {/* 1. RÉSZ: HETI MUNKAREND */}
        <h2 className="fw-bold text-center mb-2">Állandó heti munkarend</h2>
        <p className="text-center mb-4 small">
          Állítsd be az általános heti munkaidődet, amely alapján a naptár automatikusan kalkulál.
        </p>

        <form onSubmit={handleMentes} className="mb-5">
          {beosztas.map((nap) => (
            <div 
              key={nap.nap_id} 
              className={`row align-items-center mb-3 p-3 rounded shadow-sm ${nap.dolgozik ? 'card-powder' : 'card-white'}`}
            >
              <div className="col-md-4 d-flex align-items-center mb-2 mb-md-0">
                <div className="form-check d-flex align-items-center gap-2 m-0">
                  <input 
                    className="form-check-input m-0" 
                    type="checkbox" 
                    id={`nap-${nap.nap_id}`}
                    checked={nap.dolgozik}
                    onChange={(e) => setBeosztas(prev => prev.map(n => n.nap_id === nap.nap_id ? { ...n, dolgozik: e.target.checked } : n))}
                    style={{ cursor: 'pointer' }}
                  />
                  <label className="form-check-label fw-bold" htmlFor={`nap-${nap.nap_id}`} style={{ cursor: 'pointer' }}>
                    {nap.nev}
                  </label>
                </div>
              </div>
              <div className="col-md-8 d-flex gap-2">
                <div className="input-group">
                  <span className="input-group-text btn-dark">Tól</span>
                  <input 
                    type="time" 
                    className="form-control" 
                    value={nap.tol}
                    disabled={!nap.dolgozik}
                    onChange={(e) => setBeosztas(prev => prev.map(n => n.nap_id === nap.nap_id ? { ...n, tol: e.target.value } : n))}
                  />
                </div>
                <div className="input-group">
                  <span className="input-group-text btn-dark">Ig</span>
                  <input 
                    type="time" 
                    className="form-control" 
                    value={nap.ig}
                    disabled={!nap.dolgozik}
                    onChange={(e) => setBeosztas(prev => prev.map(n => n.nap_id === nap.nap_id ? { ...n, ig: e.target.value } : n))}
                  />
                </div>
              </div>
            </div>
          ))}
          <div className="text-end">
            <button type="submit" className="btn btn-dark py-2 px-4 shadow-sm">
              Heti munkarend mentése
            </button>
          </div>
        </form>

        <hr className="salon-divider my-5" />

        {/* 2. RÉSZ: SZABADSÁGOK ÉS TÁVOLLÉTEK */}
        <h3 className="fw-bold text-center mb-2">Szabadságok és egyedi távollétek</h3>
        <p className="text-center mb-4 small">
          Itt rögzíthetsz többnapos szabadságot vagy pár órás távollétet (pl. orvos). A rendszer az érintett idősávokat zárolja a vendégek elől.
        </p>

        <form onSubmit={handleSzabiHozzaadas} className="card-powder p-4 mb-4 shadow-sm">
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label fw-bold">Kezdet (Dátum és Idő):</label>
              <input 
                type="datetime-local" 
                className="form-control" 
                value={ujSzabi.kezdo_datum}
                onChange={(e) => setUjSzabi({ ...ujSzabi, kezdo_datum: e.target.value })}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold">Befejezés (Dátum és Idő):</label>
              <input 
                type="datetime-local" 
                className="form-control" 
                value={ujSzabi.veg_datum}
                onChange={(e) => setUjSzabi({ ...ujSzabi, veg_datum: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label fw-bold">Megjegyzés (pl. Szabadság, Orvos):</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Távollét oka..."
              value={ujSzabi.megjegyzes}
              onChange={(e) => setUjSzabi({ ...ujSzabi, megjegyzes: e.target.value })}
            />
          </div>
          <div className="text-end">
            <button type="submit" className="btn btn-dark py-2 px-4 shadow-sm">
              Távollét rögzítése
            </button>
          </div>
        </form>

        {/* Rögzített távollétek listája */}
        <h5 className="fw-bold mb-3">Rögzített távolléteid:</h5>
        {szabadsagok.length === 0 ? (
          <p>Nincs rögzített jövőbeli távolléted.</p>
        ) : (
          <div className="d-flex flex-column gap-2">
            {szabadsagok.map((sz) => (
              <div 
                key={sz.szabadsag_id} 
                className="card-white p-3 d-flex justify-content-between align-items-center flex-wrap gap-2 shadow-sm"
              >
                <div>
                  <div className="fw-bold">{sz.megjegyzes || 'Távollét / Szabadság'}</div>
                  <div className="small">
                    📅 {dayjs(sz.kezdo_datum).format('YYYY.MM.DD HH:mm')} – {dayjs(sz.veg_datum).format('YYYY.MM.DD HH:mm')}
                  </div>
                </div>
                <button 
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => handleSzabiTorles(sz.szabadsag_id)}
                >
                  Törlés
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default ScheduleSetting;