// src/components/CookieBanner.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // 1.8 másodperc késleltetés a természetes megjelenésért
      const timer = setTimeout(() => setIsVisible(true), 1800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="cookie-banner-wrapper fixed-bottom shadow-lg animate-cookie-slide">
      <div className="container py-3">
        <div className="row align-items-center justify-content-between g-3">
          
          <div className="col-lg-8 col-md-7 text-center text-md-start">
            <h6 className="fw-bold mb-1 text-salon" style={{ letterSpacing: '0.4px' }}>
              🍪 Weboldalunkon funkcionális sütiket használunk
            </h6>
            <p className="small mb-0 text-salon" style={{ lineHeight: '1.55', opacity: 0.9 }}>
              A Nails by Vera oldalán kizárólag a működéshez feltétlenül szükséges és a munkamenetet támogató, az online foglalás biztonságát garantáló adatokat alkalmazunk. Marketing és statisztikai célú nyomkövetést nem végzünk. Bővebb információ az önálló{' '}
              <Link to="/suti-tajekoztato" className="text-decoration-underline fw-bold text-salon">
                Süti tájékoztató
              </Link>{' '}
              oldalunkon érhető el.
            </p>
          </div>

          <div className="col-lg-4 col-md-5 d-flex justify-content-center justify-content-md-end gap-2">
            <Link 
              to="/suti-tajekoztato" 
              className="btn btn-outline-dark btn-sm px-3 py-2 rounded-pill fw-semibold"
            >
              Részletek
            </Link>
            <button 
              type="button" 
              className="btn btn-dark btn-sm px-4 py-2 rounded-pill fw-semibold shadow-sm"
              onClick={handleAccept}
            >
              Megértettem és elfogadom
            </button>
          </div>

        </div>
      </div>

      <style>{`
        .cookie-banner-wrapper {
          background-color: var(--login-bg, #ebe5e3);
          border-top: 1px solid rgba(0, 0, 0, 0.12);
          z-index: 1060;
        }

        /* Finom, elegáns alulról felcsúszó animáció */
        .animate-cookie-slide {
          animation: cookieSlideUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes cookieSlideUp {
          from {
            opacity: 0;
            transform: translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default CookieBanner;