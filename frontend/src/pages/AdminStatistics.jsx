// src/pages/AdminStatistics.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

const AdminStatistics = () => {
  const currentYear = dayjs().year();
  const currentMonth = dayjs().month() + 1;

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const token = localStorage.getItem('token');

  const fetchStats = async () => {
    if (!token) return;
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await axios.get('http://localhost:3000/api/admin/statistics', {
        headers: { Authorization: `Bearer ${token}` },
        params: { year: selectedYear, month: selectedMonth }
      });

      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Nem sikerült betölteni a statisztikákat.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [selectedYear, selectedMonth]);

  const monthNames = [
    "Január", "Február", "Március", "Április", "Május", "Június",
    "Július", "Augusztus", "Szeptember", "Október", "November", "December"
  ];

  return (
    <div className="container mt-5 mb-5">
      
      <div className="card-pink p-4 p-md-5 mb-4 shadow-sm">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h1 className="fw-bold m-0" style={{ fontSize: '2.4rem' }}>
              Szalon Forgalmi Statisztika
            </h1>
            <p className="m-0 mt-1 fw-semibold">
              Időpontok, vendégforgalom és megbízhatósági mutatók
            </p>
          </div>

          <div className="d-flex gap-2 align-items-center">
            <select 
              className="form-select form-control fw-bold shadow-sm"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {[currentYear - 1, currentYear, currentYear + 1].map(y => (
                <option key={y} value={y}>{y}. év</option>
              ))}
            </select>

            <select 
              className="form-select form-control fw-bold shadow-sm"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
            >
              {monthNames.map((name, index) => (
                <option key={index + 1} value={index + 1}>{name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="alert alert-salon py-2 text-center mb-4">
          {errorMessage}
        </div>
      )}

      {loading ? (
        <p className="text-center fw-bold fs-5 mt-5">Forgalmi adatok összesítése...</p>
      ) : stats ? (
        <>

          <div className="row g-4 mb-5">
            <div className="col-sm-6 col-lg-3">
              <div className="card-powder p-4 shadow-sm text-center h-100 d-flex flex-column justify-content-between">
                <div className="mb-2"><i className="fa-regular fa-calendar-check fa-2x"></i></div>
                <h6 className="fw-bold m-0">Összes foglalás</h6>
                <h2 className="fw-bold my-2">{stats.totalBookings} db</h2>
                <small className="opacity-75">Ebben a hónapban</small>
              </div>
            </div>

            <div className="col-sm-6 col-lg-3">
              <div className="card-powder p-4 shadow-sm text-center h-100 d-flex flex-column justify-content-between">
                <div className="mb-2"><i className="fa-solid fa-circle-check fa-2x"></i></div>
                <h6 className="fw-bold m-0">Teljesített kezelés</h6>
                <h2 className="fw-bold my-2">{stats.completedCount} db</h2>
                <small className="opacity-75">Sikeresen megjelent vendég</small>
              </div>
            </div>

            <div className="col-sm-6 col-lg-3">
              <div className="card-powder p-4 shadow-sm text-center h-100 d-flex flex-column justify-content-between">
                <div className="mb-2"><i className="fa-solid fa-user-xmark fa-2x"></i></div>
                <h6 className="fw-bold m-0">Nem jelent meg</h6>
                <h2 className="fw-bold my-2">{stats.noShowCount} db</h2>
                <small className="opacity-75">Elmulasztott időpontok</small>
              </div>
            </div>

            <div className="col-sm-6 col-lg-3">
              <div className="card-powder p-4 shadow-sm text-center h-100 d-flex flex-column justify-content-between">
                <div className="mb-2"><i className="fa-solid fa-percent fa-2x"></i></div>
                <h6 className="fw-bold m-0">Megjelenési arány</h6>
                <h2 className="fw-bold my-2">{stats.attendanceRate}%</h2>
                <small className="opacity-75">Vendégmegbízhatóság</small>
              </div>
            </div>
          </div>


          <div className="row g-4">
            

            <div className="col-lg-6">
              <div className="card-white p-4 shadow-sm h-100">
                <h4 className="fw-bold mb-4">Leggyakrabban kért szolgáltatások</h4>

                {(!stats.topServices || stats.topServices.length === 0) ? (
                  <p>Nincs rögzített foglalás ebben a hónapban.</p>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {(stats.topServices || []).map((srv, idx) => {
                      const sharePercent = stats.totalBookings > 0 ? Math.round((srv.count / stats.totalBookings) * 100) : 0;
                      return (
                        <div key={idx} className="card-powder p-3">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="fw-bold">{idx + 1}. {srv.name}</span>
                            <span className="fw-bold">{srv.count} alkalom ({sharePercent}%)</span>
                          </div>
                          
                          <div className="progress" style={{ height: '8px', backgroundColor: 'var(--page-bg)' }}>
                            <div className="progress-bar" style={{ width: `${sharePercent}%`, backgroundColor: 'var(--text-and-btn)' }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>


            <div className="col-lg-6">
              <div className="card-white p-4 shadow-sm h-100">
                <h4 className="fw-bold mb-4">Munkatársak leterheltsége & vendégszáma</h4>

                {(!stats.employeeWorkload || stats.employeeWorkload.length === 0) ? (
                  <p>Nincs rögzített adat a kiválasztott időszakban.</p>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {(stats.employeeWorkload || []).map((emp, idx) => {
                      const sharePercent = stats.totalBookings > 0 ? Math.round((emp.total / stats.totalBookings) * 100) : 0;
                      return (
                        <div key={idx} className="card-pink p-3">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="fw-bold">
                              <i className="fa-solid fa-user-nurse me-2"></i>
                              {emp.name}
                            </span>
                            <span className="fw-bold">
                              {emp.total} vendég (Ebből kész: {emp.completed})
                            </span>
                          </div>

                          <div className="progress" style={{ height: '8px', backgroundColor: 'var(--page-bg)' }}>
                            <div className="progress-bar" style={{ width: `${sharePercent}%`, backgroundColor: 'var(--text-and-btn)' }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

          </div>
        </>
      ) : null}

    </div>
  );
};

export default AdminStatistics;