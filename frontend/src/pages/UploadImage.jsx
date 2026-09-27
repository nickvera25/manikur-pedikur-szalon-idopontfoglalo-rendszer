// src/pages/UploadImage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UploadImage = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [leiras, setLeiras] = useState('');
  const [myImages, setMyImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });

  const token = localStorage.getItem('token');

  const fetchMyImages = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/gallery');
      if (res.data.success) {
        setMyImages(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMyImages();
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage({ text: "Kérlek, válassz ki egy képet!", isError: true });
      return;
    }

    setLoading(true);
    setMessage({ text: '', isError: false });

    const formData = new FormData();
    formData.append('kep', file);
    formData.append('leiras', leiras);

    try {
      const res = await axios.post('http://localhost:3000/api/gallery/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        setMessage({ text: res.data.message, isError: false });
        setFile(null);
        setPreview(null);
        setLeiras('');
        fetchMyImages();
      }
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Hiba történt a feltöltés során.",
        isError: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (kepId) => {
    if (!window.confirm("Biztosan törölni szeretnéd ezt a képet a galériából?")) return;

    try {
      const res = await axios.delete(`http://localhost:3000/api/gallery/${kepId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setMessage({ text: res.data.message, isError: false });
        fetchMyImages();
      }
    } catch (err) {
      alert("Nem sikerült törölni a képet.");
    }
  };

  return (
    <div className="container mt-5 mb-5 d-flex justify-content-center">
      <div className="card-pink p-4 p-md-5 w-100 shadow-sm" style={{ maxWidth: '900px' }}>
        <h2 className="fw-bold text-center mb-2">Új referencia munka feltöltése</h2>
        <p className="text-center mb-4 small">
          Töltsd fel a frissen elkészült manikűrt a szalon nyilvános galériájába!
        </p>

        {message.text && (
          <div className={`alert ${message.isError ? 'alert-danger' : 'alert-salon'} py-2 text-center mb-4`}>
            {message.text}
          </div>
        )}

        {/* Feltöltő űrlap */}
        <form onSubmit={handleUpload} className="card-white p-4 shadow-sm mb-5">
          <div className="mb-3">
            <label className="form-label fw-bold">Válassz képet:</label>
            <input 
              type="file" 
              className="form-control" 
              accept="image/*"
              onChange={handleFileChange}
              required
            />
          </div>

          {preview && (
            <div className="mb-3 text-center">
              <p className="m-1 fw-bold small">Előnézet:</p>
              <img 
                src={preview} 
                alt="Előnézet" 
                className="rounded shadow-sm"
                style={{ maxHeight: '200px', objectFit: 'cover', border: 'var(--salon-border)' }}
              />
            </div>
          )}

          <div className="mb-4">
            <label className="form-label fw-bold">Rövid leírás (opcionális):</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="pl. Nude géllakk kövekkel, Francia manikűr..."
              value={leiras}
              onChange={(e) => setLeiras(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-dark w-100 py-2"
            disabled={loading}
          >
            {loading ? "Feltöltés folyamatban..." : "Kép közzététele a galériában"}
          </button>
        </form>

        {/* Képek listája */}
        <h4 className="fw-bold mb-3">Galéria képek kezelése</h4>
        <div className="row g-3">
          {myImages.map((img) => (
            <div key={img.kep_id} className="col-6 col-md-4">
              <div className="card-white p-2 shadow-sm text-center">
                <img 
                  src={img.kep_url} 
                  alt={img.leiras || ''} 
                  className="w-100 rounded mb-2"
                  style={{ height: '120px', objectFit: 'cover' }}
                />
                <p className="text-truncate m-0 fw-semibold small">
                  {img.leiras || 'Köröm'}
                </p>
                <button 
                  className="btn btn-sm btn-outline-danger w-100 mt-2 py-1"
                  onClick={() => handleDelete(img.kep_id)}
                >
                  Törlés
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default UploadImage;