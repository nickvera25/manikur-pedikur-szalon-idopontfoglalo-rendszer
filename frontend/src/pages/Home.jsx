// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const isLoggedIn = !!localStorage.getItem('token');
  const bookingLink = isLoggedIn ? '/foglalas' : '/login';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, categoriesRes] = await Promise.all([
          axios.get('http://localhost:3000/api/all-services'),
          axios.get('http://localhost:3000/api/categories')
        ]);

        if (servicesRes.data.success) setServices(servicesRes.data.data);
        if (categoriesRes.data.success) setCategories(categoriesRes.data.data);
      } catch (err) {
        console.error("Hiba az adatok betöltésekor:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredServices = selectedCategory === 'ALL'
    ? services
    : services.filter(srv => srv.kategoria_id === parseInt(selectedCategory));

  return (
    <div className="container mt-5 mb-5">
      
      {/* 1. SZEKCIÓ: HERO / BEMUTATKOZÁS */}
      <div className="card-pink p-4 p-md-5 mb-5 shadow-sm">
        <div className="row align-items-center">
          <div className="col-lg-6 mb-4 mb-lg-0 pe-lg-5">
            <h1 className="fw-bold mb-4" style={{ fontSize: '3rem' }}>
              Szépség és ápoltság <br /> kompromisszumok nélkül
            </h1>
            <p className="lead mb-4" style={{ lineHeight: '1.8' }}>
              Üdvözöljük a Nails by Vera szalonban! Professzionális manikűr és pedikűr szolgáltatásokkal, minőségi anyagokkal és egy csésze finom kávéval várjuk. Lassítson le egy kicsit, és bízza ránk kezei és lábai ápolását.
            </p>
            <div className="d-flex mt-4">
              <Link to={bookingLink} className="btn btn-dark px-5 py-3 fs-5 shadow-sm">
                IDŐPONTOT FOGLALOK
              </Link>
            </div>
          </div>
          
          <div className="col-lg-6">
            <img 
              src="/szalon.jpg" 
              alt="Szalon belső tér" 
              className="w-100 rounded" 
              style={{ 
                height: '420px', 
                objectFit: 'cover', 
                border: 'var(--salon-border)' 
              }} 
            />
          </div>
        </div>
      </div>

      {/* 2. SZEKCIÓ: MIÉRT VÁLASSZA SZALONUNKAT? */}
      <div className="card-pink p-4 p-md-5 mb-5 shadow-sm">
        <h2 className="fw-bold mb-5 text-center">Miért válassza szalonunkat?</h2>
        
        <div className="row g-4 text-center">
          <div className="col-md-4">
            <div className="card-white p-4 h-100 d-flex flex-column align-items-center shadow-sm">
              <div className="mb-4"><i className="fa-solid fa-wand-magic-sparkles fa-2x"></i></div>
              <h4 className="fw-bold mb-3">Prémium anyagok</h4>
              <p className="m-0 small">
                Kizárólag tartós, magas minőségű és bőrbarát termékekkel dolgozunk, hogy a végeredmény hetekig tartós maradjon.
              </p>
            </div>
          </div>
          
          <div className="col-md-4">
            <div className="card-white p-4 h-100 d-flex flex-column align-items-center shadow-sm">
              <div className="mb-4"><i className="fa-solid fa-mug-hot fa-2x"></i></div>
              <h4 className="fw-bold mb-3">Relaxáló környezet</h4>
              <p className="m-0 small">
                Nálunk a szépülés egyben kikapcsolódás is. Kényelmes környezet, halk zene és barátságos légkör fogad.
              </p>
            </div>
          </div>
          
          <div className="col-md-4">
            <div className="card-white p-4 h-100 d-flex flex-column align-items-center shadow-sm">
              <div className="mb-4"><i className="fa-regular fa-calendar-check fa-2x"></i></div>
              <h4 className="fw-bold mb-3">Egyszerű foglalás</h4>
              <p className="m-0 small">
                Online rendszerünkön keresztül a nap 24 órájában, pár kattintással lefoglalhatod a neked legmegfelelőbb időpontot.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SZEKCIÓ: SZOLGÁLTATÁSOK & ÁRLISTA */}
      <div className="card-pink p-4 p-md-5 shadow-sm">
        <h2 className="fw-bold mb-3 text-center">Szolgáltatásaink & Áraink</h2>
        <p className="text-center mb-4 mx-auto" style={{ maxWidth: '650px' }}>
          Válogass folyamatosan frissülő kínálatunkból! Az árak tartalmazzák az előkészítést és a felhasznált prémium anyagokat.
        </p>

        {/* Kategória szűrők */}
        <div className="d-flex justify-content-center flex-wrap gap-2 mb-5">
          <button 
            type="button"
            className={`btn btn-sm px-4 py-2 rounded-pill ${selectedCategory === 'ALL' ? 'btn-dark' : 'btn-outline-dark'}`}
            onClick={() => setSelectedCategory('ALL')}
          >
            Összes szolgáltatás
          </button>
          {categories.map(cat => (
            <button 
              key={cat.kategoria_id}
              type="button"
              className={`btn btn-sm px-4 py-2 rounded-pill ${selectedCategory === String(cat.kategoria_id) ? 'btn-dark' : 'btn-outline-dark'}`}
              onClick={() => setSelectedCategory(String(cat.kategoria_id))}
            >
              {cat.kategoria_neve}
            </button>
          ))}
        </div>

        {/* Szolgáltatás kártyák */}
        {loading ? (
          <p className="text-center fw-bold">Szolgáltatások betöltése...</p>
        ) : filteredServices.length === 0 ? (
          <p className="text-center">Ebben a kategóriában jelenleg nincs elérhető szolgáltatás.</p>
        ) : (
          <div className="row g-4">
            {filteredServices.map(srv => (
              <div key={srv.szolgaltatas_id} className="col-md-6 col-lg-4">
                <div className="card-white p-4 h-100 d-flex flex-column justify-content-between shadow-sm">
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="fw-bold m-0">{srv.szolgaltatas_neve}</h5>
                      <span className="badge badge-salon px-2 py-1 small">
                        {srv.kategoria?.kategoria_neve}
                      </span>
                    </div>

                    <p className="small" style={{ minHeight: '45px' }}>
                      {srv.leiras || "Professzionális kezelés prémium alapanyagokkal a tartós és elegáns végeredményért."}
                    </p>
                  </div>

                  <div className="salon-divider pt-3 mt-2">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="small">
                        <i className="fa-regular fa-clock me-1"></i> {srv.idotartam_perc} perc
                      </span>
                      <span className="fw-bold fs-5">
                        {srv.ar.toLocaleString('hu-HU')} Ft
                      </span>
                    </div>

                    <Link to={bookingLink} className="btn btn-dark w-100 py-2 btn-sm">
                      Időpontfoglalás
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Home;