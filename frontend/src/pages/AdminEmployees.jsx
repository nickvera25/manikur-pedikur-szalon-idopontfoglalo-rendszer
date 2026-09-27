// src/pages/AdminEmployees.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [services, setServices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({ 
    id: null, 
    vezeteknev: '', 
    keresztnev: '', 
    email: '', 
    telefonszam: '', 
    szolgaltatas_id_lista: [] 
  });

  const fetchData = async () => {
    try {
      const [empRes, servRes] = await Promise.all([
        axios.get('http://localhost:3000/api/admin/employees'),
        axios.get('http://localhost:3000/api/admin/services')
      ]);
      if (empRes.data.success) setEmployees(empRes.data.data);
      if (servRes.data.success) setServices(servRes.data.data);
    } catch (error) { 
      console.error("Hiba az adatok betöltésekor", error); 
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddNew = () => {
    setFormData({ id: null, vezeteknev: '', keresztnev: '', email: '', telefonszam: '', szolgaltatas_id_lista: [] });
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEdit = (emp) => {
    setFormData({
      id: emp.felhasznalo_id,
      vezeteknev: emp.vezeteknev,
      keresztnev: emp.keresztnev,
      email: emp.email,
      telefonszam: emp.telefon || '', 
      szolgaltatas_id_lista: emp.szolgaltatasok ? emp.szolgaltatasok.map(s => s.szolgaltatas_id) : []
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (empId) => {
    if (!window.confirm("Biztosan törölni szeretnéd ezt az alkalmazottat?")) return;
    try {
      const response = await axios.delete(`http://localhost:3000/api/admin/employees/${empId}`);
      if (response.data.success) {
        fetchData();
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Hiba történt a törlés során.");
    }
  };

  const handleCheckboxChange = (serviceId) => {
    setFormData((prev) => {
      const lista = prev.szolgaltatas_id_lista;
      return {
        ...prev,
        szolgaltatas_id_lista: lista.includes(serviceId)
          ? lista.filter(id => id !== serviceId)
          : [...lista, serviceId]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`http://localhost:3000/api/admin/employees/${formData.id}`, formData);
        setShowModal(false);
        fetchData();
      } else {
        const response = await axios.post('http://localhost:3000/api/admin/employees', formData);
        if (response.data.success) {
          alert(`${response.data.message}\nAz automatikusan generált jelszó: ${response.data.defaultPassword}\nKérjük, adja át a dolgozónak!`);
          setShowModal(false);
          fetchData();
        }
      }
    } catch (error) { 
      alert("Hiba az adatok mentésekor."); 
    }
  };

  return (
    <div className="container mt-5 mb-5 d-flex justify-content-center">
      <div className="card-pink p-4 p-md-5 w-100 shadow-sm" style={{ maxWidth: '900px' }}>
        <h2 className="fw-bold text-center mb-5">Alkalmazottak kezelése</h2>

        {/* Dolgozói lista */}
        <div className="employees-list mb-4">
          {employees.map((emp) => (
            <div key={emp.felhasznalo_id} className="card-powder p-3 mb-3 d-flex justify-content-between align-items-center shadow-sm">
              <div>
                <div className="fs-5 fw-bold">{emp.vezeteknev} {emp.keresztnev}</div>
                <div className="small">{emp.email} | {emp.telefon || 'Nincs megadva telefon'}</div>
                <div className="small fw-bold mt-1">
                  {emp.szolgaltatasok?.length > 0 
                    ? emp.szolgaltatasok.map(asz => asz.szolgaltatas.szolgaltatas_neve).join(', ') 
                    : 'Nincs hozzárendelt szolgáltatás'}
                </div>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-outline-dark btn-sm" onClick={() => handleEdit(emp)}>Szerkesztés</button>
                <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(emp.felhasznalo_id)}>Törlés</button>
              </div>
            </div>
          ))}
          {employees.length === 0 && <p className="text-center">Nincsenek még alkalmazottak felvéve.</p>}
        </div>

        <div className="text-end">
          <button className="btn btn-dark py-2 px-4" onClick={handleAddNew}>
            Új alkalmazott hozzáadása
          </button>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(79, 70, 70, 0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content card-pink shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">
                  {isEditing ? 'Alkalmazott módosítása' : 'Új alkalmazott regisztrálása'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>

              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Vezetéknév</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={formData.vezeteknev} 
                        onChange={(e) => setFormData({...formData, vezeteknev: e.target.value})} 
                        required 
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Keresztnév</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={formData.keresztnev} 
                        onChange={(e) => setFormData({...formData, keresztnev: e.target.value})} 
                        required 
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">E-mail cím</label>
                      <input 
                        type="email" 
                        className="form-control" 
                        value={formData.email} 
                        onChange={(e) => setFormData({...formData, email: e.target.value})} 
                        required 
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Telefonszám</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={formData.telefonszam} 
                        onChange={(e) => setFormData({...formData, telefonszam: e.target.value})} 
                      />
                    </div>
                  </div>

                  <h6 className="fw-bold mb-3">Végezhető szolgáltatások:</h6>
                  <div className="row g-2 mb-4">
                    {services.map(service => {
                      const isChecked = formData.szolgaltatas_id_lista.includes(service.szolgaltatas_id);
                      return (
                        <div key={service.szolgaltatas_id} className="col-md-6">
                          <div 
                            className={`p-2 d-flex align-items-center gap-2 ${isChecked ? 'card-powder' : 'card-white'}`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleCheckboxChange(service.szolgaltatas_id)}
                          >
                            <input 
                              className="form-check-input m-0" 
                              type="checkbox" 
                              checked={isChecked}
                              onChange={() => {}} 
                            />
                            <span className={isChecked ? 'fw-bold' : ''}>
                              {service.szolgaltatas_neve}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="d-flex justify-content-end gap-2">
                    <button type="button" className="btn btn-outline-dark" onClick={() => setShowModal(false)}>
                      Mégse
                    </button>
                    <button type="submit" className="btn btn-dark px-4">
                      Mentés
                    </button>
                  </div>
                </form>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmployees;