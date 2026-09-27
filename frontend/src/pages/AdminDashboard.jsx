// src/pages/AdminDashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const userName = localStorage.getItem('userName') || "Admin";

  return (
    <div className="container mt-5 mb-5 d-flex justify-content-center">
      <div className="col-lg-10 content-card-wrapper p-5 shadow-sm">
        
        <h1 className="mb-5 fw-bold">Üdvözöljük, {userName}!</h1>

        <div className="row g-4">
          {/* Szolgáltatások kártya */}
          <div className="col-md-4">
            <div className="card h-100 action-card text-center p-4">
              <div className="card-body d-flex flex-column align-items-center justify-content-center">
                <i className="fa-solid fa-list-check fa-2x mb-3"></i>
                <h4 className="card-title fw-bold mb-4">Szolgáltatások</h4>
                <Link to="/admin-szolgaltatasok" className="btn btn-dark w-100 py-2">Kezelés</Link>
              </div>
            </div>
          </div>

          {/* Alkalmazottak kártya */}
          <div className="col-md-4">
            <div className="card h-100 action-card text-center p-4">
              <div className="card-body d-flex flex-column align-items-center justify-content-center">
                <i className="fa-solid fa-users fa-2x mb-3"></i>
                <h4 className="card-title fw-bold mb-4">Alkalmazottak</h4>
                <Link to="/admin-alkalmazottak" className="btn btn-dark w-100 py-2">Kezelés</Link>
              </div>
            </div>
          </div>

          {/* Statisztika kártya */}
          <div className="col-md-4">
            <div className="card h-100 action-card text-center p-4">
              <div className="card-body d-flex flex-column align-items-center justify-content-center">
                <i className="fa-solid fa-chart-line fa-2x mb-3"></i>
                <h4 className="card-title fw-bold mb-4">Statisztika</h4>
                <Link to="/admin-statisztika" className="btn btn-dark w-100 py-2">Megtekintés</Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;