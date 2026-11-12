// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer 
      className="py-4 mt-auto text-salon"
      style={{ 
        backgroundColor: 'var(--login-bg, #ebe5e3)',
        borderTop: '1px solid rgba(0, 0, 0, 0.08)'
      }}
    >
      <div className="container">
        <div className="row g-3 align-items-center justify-content-between">
          
          <div className="col-md-6 text-center text-md-start">
            <h5 className="fw-bold mb-1">Nails by Vera</h5>
            <p className="small mb-2 text-muted">Online időpontfoglaló rendszer</p>
            <div className="small" style={{ lineHeight: '1.6' }}>
              <div><strong>Üzemeltető:</strong> Nick Veronika e.v.</div>
              <div><strong>Nyilvántartási szám:</strong> 54981234</div>
              <div><strong>Adószám:</strong> 68912345-1-28</div>
            </div>
          </div>

          <div className="col-md-5 text-center text-md-end">
            <div className="small" style={{ lineHeight: '1.7' }}>
              <div><strong>Cím:</strong> 9026 Győr, Egyetem tér 1.</div>
              <div><strong>Telefon:</strong> +36 30 123 4567</div>
              <div><strong>E-mail:</strong> nailsbyvera.szalon@gmail.com</div>
            </div>
          </div>

        </div>

        <hr className="my-3" style={{ opacity: 0.12 }} />

        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center small text-muted gap-2">
          <div>
            &copy; {new Date().getFullYear()} <strong>Nails by Vera</strong>. Minden jog fenntartva.
          </div>
          <div>
            <Link to="/suti-tajekoztato" className="text-muted text-decoration-none hover-underline">
              Süti tájékoztató
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;