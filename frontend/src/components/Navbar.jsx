// src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const isLoggedIn = !!localStorage.getItem('token');
  const userRole = localStorage.getItem('role') || 'Vendég'; 

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('role'); 
    navigate('/login');
  };

  const getHomeLink = () => {
    if (userRole === 'Admin') return '/admin-dashboard';
    if (userRole === 'Alkalmazott') return '/worker-dashboard';
    return '/';
  };

  return (
    <nav className="navbar navbar-expand-lg custom-navbar py-2">
      <div className="container-fluid px-3 px-lg-5">
        
        {/* Logó és Cím */}
        <Link 
          className="navbar-brand d-flex align-items-center fw-bold fs-4 m-0 figma-text-effect" 
          to={getHomeLink()}
        >
          <img 
            src="/logo.png" 
            alt="Logo" 
            style={{ height: '42px', width: 'auto' }} 
            className="d-inline-block align-text-top me-2" 
          />
          <span style={{ letterSpacing: '0.5px' }}>NAILS BY VERA</span>
        </Link>
        
        {/* Hamburger gomb mobilon (csak ez csukja be és nyitja ki a menüt) */}
        <button 
          className={`navbar-toggler border-0 shadow-none ${isNavCollapsed ? 'collapsed' : ''}`}
          type="button" 
          aria-expanded={!isNavCollapsed}
          aria-label="Toggle navigation"
          onClick={() => setIsNavCollapsed(prev => !prev)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Lenyíló menü animációval */}
        <div className={`collapse navbar-collapse justify-content-end ${!isNavCollapsed ? 'show mobile-nav-animated' : ''}`} id="navbarNav">
          <ul className="navbar-nav align-items-lg-center text-center text-lg-start pt-3 pt-lg-0">
            
            {/* Vendég menü */}
            {(!isLoggedIn || userRole === 'Vendég') && (
              <>
                <li className="nav-item my-2 my-lg-0 me-lg-4">
                  <Link className="nav-link figma-text-effect" to="/">Kezdőlap</Link>
                </li>
                <li className="nav-item my-2 my-lg-0 me-lg-4">
                  <Link className="nav-link figma-text-effect" to="/hazirend">Házirend</Link>
                </li>
                
                {isLoggedIn && (
                  <li 
                    className="nav-item dropdown my-2 my-lg-0 me-lg-4"
                    onMouseEnter={() => window.innerWidth >= 992 && setIsDropdownOpen(true)}
                    onMouseLeave={() => window.innerWidth >= 992 && setIsDropdownOpen(false)}
                  >
                    <span 
                      className="nav-link figma-text-effect d-inline-flex align-items-center justify-content-center" 
                      role="button"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setIsDropdownOpen(prev => !prev)}
                    >
                      Időpontok 
                      <i 
                        className="fa-solid fa-arrow-down ms-1"
                        style={{ 
                          fontSize: '0.85rem',
                          transition: 'transform 0.2s ease',
                          transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                        }}
                      ></i>
                    </span>

                    {/* Figma stílusú almenü aláhúzásos/félkövér kiemeléssel */}
                    <ul className={`dropdown-menu figma-dropdown-menu ${isDropdownOpen ? 'show' : ''}`}>
                      <li>
                        <Link className="dropdown-item figma-dropdown-item" to="/foglalas">
                          Foglalni szeretnék!
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item figma-dropdown-item" to="/korabbi-foglalasok">
                          Korábbi foglalásaim
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item figma-dropdown-item" to="/kozelgo-foglalasok">
                          Közelgő foglalások
                        </Link>
                      </li>
                    </ul>
                  </li>
                )}
                <li className="nav-item my-2 my-lg-0 me-lg-4">
                  <Link className="nav-link figma-text-effect" to="/galeria">Galéria</Link>
                </li>
              </>
            )}

            {/* Alkalmazott menü */}
            {isLoggedIn && userRole === 'Alkalmazott' && (
              <>
                <li className="nav-item my-2 my-lg-0 me-lg-4">
                  <Link className="nav-link figma-text-effect" to="/naptaram">Naptáram</Link>
                </li>
                <li className="nav-item my-2 my-lg-0 me-lg-4">
                  <Link className="nav-link figma-text-effect" to="/schedule-setting">Munkarendem</Link>
                </li>
                <li className="nav-item my-2 my-lg-0 me-lg-4">
                  <Link className="nav-link figma-text-effect" to="/kepfeltoltes">Képfeltöltés</Link>
                </li>
              </>
            )}

            {/* Admin menü */}
            {isLoggedIn && userRole === 'Admin' && (
              <>
                <li className="nav-item my-2 my-lg-0 me-lg-4">
                  <Link className="nav-link figma-text-effect" to="/admin-naptar">Naptár</Link>
                </li>
                <li className="nav-item my-2 my-lg-0 me-lg-4">
                  <Link className="nav-link figma-text-effect" to="/admin-szolgaltatasok">Szolgáltatások</Link>
                </li>
                <li className="nav-item my-2 my-lg-0 me-lg-4">
                  <Link className="nav-link figma-text-effect" to="/admin-alkalmazottak">Alkalmazottak</Link>
                </li>
                <li className="nav-item my-2 my-lg-0 me-lg-4">
                  <Link className="nav-link figma-text-effect" to="/admin-statisztika">Statisztika</Link>
                </li>
              </>
            )}

            {/* Profil */}
            {isLoggedIn && (
              <li className="nav-item my-2 my-lg-0 me-lg-4">
                <Link className="nav-link figma-text-effect" to="/profil">Profilom</Link>
              </li>
            )}
            
            {/* Be-/Kijelentkezés */}
            <li className="nav-item my-2 my-lg-0 ms-lg-2">
              {isLoggedIn ? (
                <Link className="nav-link fw-bold figma-text-effect" to="#" onClick={handleLogout}>
                  Kijelentkezés <i className="fa-solid fa-arrow-right-from-bracket ms-1"></i>
                </Link>
              ) : (
                <Link className="nav-link fw-bold figma-text-effect" to="/login">
                  Bejelentkezés <i className="fa-solid fa-arrow-right-to-bracket ms-1"></i>
                </Link>
              )}
            </li>
            
          </ul>
        </div>
      </div>

<style>{`
        /* --- FIGMA SZÖVEGÁRNYÉK --- */
        .figma-text-effect {
          text-shadow: 0px 2px 4px rgba(0, 0, 0, 0.28) !important;
          color: var(--text-and-btn, #4a3b32) !important;
          transition: all 0.2s ease-in-out;
        }

        .figma-text-effect:hover {
          text-shadow: 0px 3px 6px rgba(0, 0, 0, 0.38) !important;
          opacity: 0.95;
        }

        /* --- ASZTALI NÉZET: FIGMA DROPDOWN & FIX HOVER HÍD --- */
        @media (min-width: 992px) {
          .figma-dropdown-menu {
            border: 1px solid rgba(0, 0, 0, 0.2) !important;
            border-radius: 6px !important;
            background-color: #ffffff !important;
            box-shadow: 0px 6px 14px rgba(0, 0, 0, 0.12) !important;
            padding: 8px 0 !important;
            min-width: 190px !important;
            margin-top: 4px !important;
          }

          /* LÁTHATATLAN HÍD: megakadályozza, hogy az egér lehúzásakor becsukódjon a menü */
          .figma-dropdown-menu::before {
            content: '';
            position: absolute;
            top: -10px;
            left: 0;
            right: 0;
            height: 10px;
            background: transparent;
          }

          /* Lágy lebegő megjelenési animáció */
          .figma-dropdown-menu.show {
            animation: dropdownEntrance 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }

          .figma-dropdown-item {
            padding: 8px 16px;
            font-size: 0.95rem;
            color: var(--text-and-btn, #4a3b32) !important;
            background: transparent !important;
            text-shadow: 0px 1px 2px rgba(0, 0, 0, 0.15);
            text-decoration: none !important;
            transition: all 0.15s ease;
          }

          .figma-dropdown-item:hover {
            background-color: transparent !important;
            text-decoration: underline !important;
            font-weight: 700 !important;
            color: var(--text-and-btn, #4a3b32) !important;
          }
        }

        /* --- MOBIL NÉZET: LÁGY LECSÚSZÓ ANIMÁCIÓ --- */
        @media (max-width: 991.98px) {
          .navbar-collapse {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            padding-bottom: 1rem;
          }

          .mobile-nav-animated {
            animation: navSlideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }

          .navbar-nav .nav-link {
            padding: 0.55rem 0;
            font-size: 1.1rem;
          }

          .figma-dropdown-menu {
            position: static !important;
            float: none !important;
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0.3rem 0 !important;
            margin: 0 !important;
          }

          .figma-dropdown-item {
            text-align: center;
            padding: 0.45rem 1rem;
            font-size: 0.95rem;
            color: var(--text-and-btn, #4a3b32) !important;
            background: transparent !important;
            text-decoration: none !important;
            text-shadow: 0px 1px 3px rgba(0, 0, 0, 0.2);
            opacity: 0.85;
          }

          .figma-dropdown-item:hover,
          .figma-dropdown-item:active {
            background-color: transparent !important;
            text-decoration: underline !important;
            font-weight: 700 !important;
            color: var(--text-and-btn, #4a3b32) !important;
            opacity: 1;
          }
        }

        /* Kulcskockák */
        @keyframes dropdownEntrance {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes navSlideDown {
          from {
            opacity: 0;
            transform: translateY(-12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;