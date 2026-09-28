// src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
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
      <div className="container-fluid px-5">
        
        {/* logo */}
        <Link className="navbar-brand d-flex align-items-center fw-bold fs-4" to={getHomeLink()}>
          <img 
            src="/logo.png" 
            alt="Logo" 
            style={{ height: '48px', width: 'auto' }} 
            className="d-inline-block align-text-top me-2" 
          />
          NAILS BY VERA
        </Link>
        
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul className="navbar-nav align-items-center">
            
            {/* vendeg menu */}
            {(!isLoggedIn || userRole === 'Vendég') && (
              <>
                <li className="nav-item me-4"><Link className="nav-link" to="/">Rólunk</Link></li>
                <li className="nav-item me-4"><Link className="nav-link" to="/hazirend">Házirend</Link></li>
                
                {isLoggedIn && (
                  <li 
                    className="nav-item dropdown me-4"
                    onMouseEnter={() => setIsDropdownOpen(true)}
                    onMouseLeave={() => setIsDropdownOpen(false)}
                  >
                    <Link className="nav-link" to="/foglalas" role="button">
                      Időpontok <i className="fa-solid fa-arrow-down ms-1"></i>
                    </Link>
                    <ul className={`dropdown-menu custom-dropdown-menu ${isDropdownOpen ? 'show' : ''}`}>
                      <li><Link className="dropdown-item custom-dropdown-item" to="/foglalas">Foglalni szeretnék!</Link></li>
                      <li><Link className="dropdown-item custom-dropdown-item" to="/korabbi-foglalasok">Korábbi foglalásaim</Link></li>
                      <li><Link className="dropdown-item custom-dropdown-item" to="/kozelgo-foglalasok">Közelgő foglalások</Link></li>
                    </ul>
                  </li>
                )}
                <li className="nav-item me-4"><Link className="nav-link" to="/galeria">Galéria</Link></li>
              </>
            )}

            {/* alkalmazott menu */}
            {isLoggedIn && userRole === 'Alkalmazott' && (
              <>
                <li className="nav-item me-4"><Link className="nav-link" to="/naptaram">Naptáram</Link></li>
                <li className="nav-item me-4"><Link className="nav-link" to="/schedule-setting">Munkarendem</Link></li>
                <li className="nav-item me-4"><Link className="nav-link" to="/kepfeltoltes">Képfeltöltés</Link></li>
              </>
            )}

            {/* admin menu */}
            {isLoggedIn && userRole === 'Admin' && (
              <>
                <li className="nav-item me-4"><Link className="nav-link" to="/admin-naptar">Naptár</Link></li>
                <li className="nav-item me-4"><Link className="nav-link" to="/admin-szolgaltatasok">Szolgáltatások</Link></li>
                <li className="nav-item me-4"><Link className="nav-link" to="/admin-alkalmazottak">Alkalmazottak</Link></li>
                <li className="nav-item me-4"><Link className="nav-link" to="/admin-statisztika">Statisztika</Link></li>
              </>
            )}

            {/* kijelentkezes */}
            {isLoggedIn && (
              <li className="nav-item me-4"><Link className="nav-link" to="/profil">Profilom</Link></li>
            )}
            
            <li className="nav-item ms-2">
              {isLoggedIn ? (
                <Link className="nav-link fw-bold" to="#" onClick={handleLogout}>
                  Kijelentkezés <i className="fa-solid fa-arrow-right-from-bracket ms-1"></i>
                </Link>
              ) : (
                <Link className="nav-link fw-bold" to="/login">
                  Bejelentkezés <i className="fa-solid fa-arrow-right-to-bracket ms-1"></i>
                </Link>
              )}
            </li>
            
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;