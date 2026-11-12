// src/pages/Gallery.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/gallery');
        if (res.data.success) {
          setImages(res.data.data);
        }
      } catch (err) {
        console.error("Nem sikerült betölteni a galériát", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, []);

  return (
    <div className="container mt-4 mt-md-5 mb-5 d-flex justify-content-center px-2 px-sm-3">
      
      <div className="card-pink p-4 p-md-5 w-100 shadow-sm animate-fade-up" style={{ maxWidth: '1200px' }}>
        
        <div className="text-center mb-4 animate-fade-up delay-1">
          <h1 className="fw-bold mb-3" style={{ fontSize: 'clamp(2rem, 3.8vw, 2.8rem)' }}>
            Munkáink & Galéria
          </h1>
          <p className="lead mx-auto mb-0 text-center" style={{ maxWidth: '700px' }}>
            Tekintsd meg szakembereink legfrissebb körmös munkáit! Meríts ihletet a következő szettedhez az elkészült manikűrökből és pedikűrökből.
          </p>
        </div>

        <hr className="salon-divider my-4 my-md-4" style={{ opacity: 0.2 }} />

        {loading ? (
          <p className="text-center fw-bold fs-5 py-5">Képek betöltése...</p>
        ) : images.length === 0 ? (
          <div className="card-powder p-5 text-center shadow-sm rounded">
            <h4 className="fw-bold m-0">Még nincsenek feltöltött képek a galériában.</h4>
          </div>
        ) : (
          <div className="row g-4">
            {images.map((item, index) => (
              <div 
                key={item.kep_id} 
                className="col-sm-6 col-md-4 col-lg-3 animate-fade-up"
                style={{ animationDelay: `${Math.min(index * 0.08, 0.6)}s` }}
              >
                <div 
                  className="card-white h-100 overflow-hidden shadow-sm d-flex flex-column card-hover-effect"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedImage(item)}
                >
                  <div 
                    style={{ 
                      height: '240px', 
                      overflow: 'hidden', 
                      backgroundColor: 'var(--login-bg)',
                      borderBottom: 'var(--salon-border)' 
                    }}
                  >
                    <img 
                      src={item.kep_url} 
                      alt={item.leiras || 'Köröm minta'} 
                      className="w-100 h-100"
                      style={{ objectFit: 'cover', display: 'block' }}
                    />
                  </div>

                  <div className="p-3 d-flex flex-column justify-content-between flex-grow-1 text-center">
                    <div>
                      <h6 className="fw-bold mb-1">
                        {item.leiras || 'Köröm mintázat'}
                      </h6>
                      <p className="m-0 small">
                        Készítette: <strong>{item.alkalmazott?.vezeteknev} {item.alkalmazott?.keresztnev}</strong>
                      </p>
                    </div>
                    <div className="salon-divider pt-2 mt-2 text-center">
                      <small className="opacity-75" style={{ fontSize: '0.75rem' }}>
                        📅 {dayjs(item.feltoltes_ideje).format('YYYY.MM.DD.')}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {selectedImage && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center p-3"
          style={{ backgroundColor: 'rgba(79, 70, 70, 0.7)', zIndex: 1050 }}
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="card-white p-4 shadow-lg text-center" 
            style={{ maxWidth: '650px', width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={selectedImage.kep_url} 
              alt="Nagyított kép" 
              className="w-100 rounded mb-3"
              style={{ maxHeight: '70vh', objectFit: 'contain' }}
            />
            <h5 className="fw-bold">{selectedImage.leiras || 'Köröm minta'}</h5>
            <p className="mb-3">
              Készítette: {selectedImage.alkalmazott?.vezeteknev} {selectedImage.alkalmazott?.keresztnev}
            </p>
            <button className="btn btn-dark px-4 py-2" onClick={() => setSelectedImage(null)}>
              Bezárás
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Gallery;