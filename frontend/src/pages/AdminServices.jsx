// src/pages/AdminServices.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [serviceError, setServiceError] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [categorySuccess, setCategorySuccess] = useState('');

  const [newCatName, setNewCatName] = useState('');
  const [formData, setFormData] = useState({ id: null, nev: '', ar: '', idotartam: '', kategoria_id: '', leiras: '' });
  const [isEditing, setIsEditing] = useState(false);

  const fetchData = async () => {
    try {
      const [servRes, catRes] = await Promise.all([
        axios.get('http://localhost:3000/api/admin/services'),
        axios.get('http://localhost:3000/api/admin/categories')
      ]);
      if (servRes.data.success) setServices(servRes.data.data);
      if (catRes.data.success) setCategories(catRes.data.data);
    } catch (error) { 
      console.error("Nem sikerült betölteni az adatokat", error); 
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddNew = () => {
    setFormData({ id: null, nev: '', ar: '', idotartam: '', kategoria_id: '', leiras: '' });
    setIsEditing(false);
    setServiceError('');
    setShowModal(true);
  };

  const handleEdit = (service) => {
    setFormData({ 
      id: service.szolgaltatas_id, 
      nev: service.szolgaltatas_neve, 
      ar: service.ar, 
      idotartam: service.idotartam_perc,
      kategoria_id: service.kategoria_id || '',
      leiras: service.leiras || ''
    });
    setIsEditing(true);
    setServiceError('');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Biztosan törölni szeretnéd ezt a szolgáltatást?")) return;
    try {
      const response = await axios.delete(`http://localhost:3000/api/admin/services/${id}`);
      if (response.data.success) {
        fetchData(); 
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Hiba történt a törlés során.");
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setCategoryError('');
    setCategorySuccess('');

    if (!newCatName.trim()) {
      setCategoryError("A kategória neve kötelező!");
      return;
    }

    try {
      const res = await axios.post('http://localhost:3000/api/admin/categories', { nev: newCatName });
      if (res.data.success) {
        setNewCatName('');
        setCategorySuccess("Kategória sikeresen létrehozva!");
        await fetchData();
      }
    } catch (error) {
      setCategoryError("Nem sikerült létrehozni a kategóriát.");
    }
  };

  const handleDeleteCategory = async (catId) => {
    setCategoryError('');
    setCategorySuccess('');

    if (!window.confirm("Biztosan törölni szeretnéd ezt a kategóriát?")) return;
    try {
      const response = await axios.delete(`http://localhost:3000/api/admin/categories/${catId}`);
      if (response.data.success) {
        setCategorySuccess("Kategória törölve!");
        fetchData(); 
      } else {
        setCategoryError(response.data.message); 
      }
    } catch (error) {
      setCategoryError(error.response?.data?.message || "Hiba történt a törlés során.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServiceError('');
    try {
      if (isEditing) await axios.put(`http://localhost:3000/api/admin/services/${formData.id}`, formData);
      else await axios.post('http://localhost:3000/api/admin/services', formData);
      setShowModal(false);
      fetchData();
    } catch (error) { 
      setServiceError("Hiba az adatok mentésekor."); 
    }
  };

  return (
    <div className="container mt-5 mb-5 d-flex justify-content-center">
      <div className="card-pink p-4 p-md-5 w-100 shadow-sm" style={{ maxWidth: '900px' }}>
        <h2 className="fw-bold text-center mb-5">Szolgáltatások kezelése</h2>

        {/* Szolgáltatások listája */}
        <div className="services-list mb-4">
          {services.map((service) => (
            <div key={service.szolgaltatas_id} className="card-powder p-3 mb-3 d-flex justify-content-between align-items-center shadow-sm">
              <div className="fs-5 fw-bold">
                {service.szolgaltatas_neve} - {service.ar.toLocaleString('hu-HU')} Ft <span className="fs-6 fw-normal">({service.idotartam_perc} perc)</span>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-outline-dark btn-sm" onClick={() => handleEdit(service)}>Szerkesztés</button>
                <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(service.szolgaltatas_id)}>Törlés</button>
              </div>
            </div>
          ))}
          {services.length === 0 && <p className="text-center">Nincsenek még szolgáltatások feltöltve.</p>}
        </div>

        <div className="d-flex justify-content-between align-items-center mt-4 flex-wrap gap-2">
          <button className="btn btn-outline-dark py-2 px-4" onClick={() => { setCategoryError(''); setCategorySuccess(''); setShowCategoryModal(true); }}>
            Kategóriák kezelése
          </button>
          <button className="btn btn-dark py-2 px-4" onClick={handleAddNew}>
            Új szolgáltatás hozzáadása
          </button>
        </div>
      </div>

      {/* Szolgáltatás Modal */}
      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(79, 70, 70, 0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content card-pink shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">{isEditing ? 'Szolgáltatás módosítása' : 'Új szolgáltatás'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                {serviceError && <div className="alert alert-salon py-2 text-center mb-3">{serviceError}</div>}
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Megnevezés</label>
                    <input type="text" className="form-control" value={formData.nev} onChange={(e) => setFormData({...formData, nev: e.target.value})} required />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Ár (Ft)</label>
                      <input type="number" className="form-control" value={formData.ar} onChange={(e) => setFormData({...formData, ar: e.target.value})} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Időtartam (perc)</label>
                      <input type="number" className="form-control" value={formData.idotartam} onChange={(e) => setFormData({...formData, idotartam: e.target.value})} required />
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label fw-bold">Kategória</label>
                    <select className="form-select form-control" value={formData.kategoria_id} onChange={(e) => setFormData({...formData, kategoria_id: e.target.value})} required>
                      <option value="">Válassz kategóriát...</option>
                      {categories.map(cat => (
                        <option key={cat.kategoria_id} value={cat.kategoria_id}>{cat.kategoria_neve}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-bold">Leírás</label>
                    <textarea className="form-control" rows="2" value={formData.leiras} onChange={(e) => setFormData({...formData, leiras: e.target.value})} required></textarea>
                  </div>

                  <div className="d-flex justify-content-end gap-2">
                    <button type="button" className="btn btn-outline-dark" onClick={() => setShowModal(false)}>Mégse</button>
                    <button type="submit" className="btn btn-dark px-4">Mentés</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Kategóriák kezelése Modal */}
      {showCategoryModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(79, 70, 70, 0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content card-pink shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Kategóriák kezelése</h5>
                <button type="button" className="btn-close" onClick={() => setShowCategoryModal(false)}></button>
              </div>
              <div className="modal-body">
                {categoryError && <div className="alert alert-salon py-2 text-center mb-3">{categoryError}</div>}
                {categorySuccess && <div className="alert alert-salon py-2 text-center mb-3">{categorySuccess}</div>}

                <form onSubmit={handleCreateCategory} className="mb-4">
                  <label className="form-label fw-bold">Új kategória létrehozása</label>
                  <div className="d-flex gap-2">
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Kategória neve" 
                      value={newCatName} 
                      onChange={(e) => setNewCatName(e.target.value)} 
                      required 
                    />
                    <button type="submit" className="btn btn-dark text-nowrap">Hozzáadás</button>
                  </div>
                </form>

                <hr className="salon-divider my-3" />

                <label className="form-label fw-bold mb-2">Létező kategóriák:</label>
                <div className="list-group mb-4" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {categories.map(cat => (
                    <div key={cat.kategoria_id} className="card-powder p-2 mb-2 d-flex justify-content-between align-items-center shadow-sm">
                      <span className="fw-semibold">{cat.kategoria_neve}</span>
                      <button 
                        className="btn btn-sm btn-outline-danger" 
                        onClick={() => handleDeleteCategory(cat.kategoria_id)}
                      >
                        Törlés
                      </button>
                    </div>
                  ))}
                  {categories.length === 0 && <p className="text-center">Nincsenek kategóriák.</p>}
                </div>

                <div className="d-flex justify-content-end">
                  <button type="button" className="btn btn-dark" onClick={() => setShowCategoryModal(false)}>Bezárás</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServices;