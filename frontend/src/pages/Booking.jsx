// src/pages/Booking.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import huLocale from '@fullcalendar/core/locales/hu';
import dayjs from 'dayjs';

const Booking = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [professionals, setProfessionals] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedProfessional, setSelectedProfessional] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [note, setNote] = useState('');

  const [availableTimes, setAvailableTimes] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [dayStatus, setDayStatus] = useState('');
  const [showWaitlistForm, setShowWaitlistForm] = useState(false);
  const [waitlistPref, setWaitlistPref] = useState('ALL_DAY');
  const [customFrom, setCustomFrom] = useState('08:00');
  const [customTo, setCustomTo] = useState('12:00');
  const [waitlistFeedback, setWaitlistFeedback] = useState({ text: '', isSuccess: false });

  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    axios.get('http://localhost:3000/api/categories')
      .then(res => { if (res.data.success) setCategories(res.data.data); })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      axios.get(`http://localhost:3000/api/services/${selectedCategory}`)
        .then(res => { if (res.data.success) setServices(res.data.data); })
        .catch(err => console.error(err));
    } else {
      setServices([]);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedService) {
      axios.get(`http://localhost:3000/api/professionals/${selectedService}`)
        .then(res => { if (res.data.success) setProfessionals(res.data.data); })
        .catch(err => console.error(err));
    } else {
      setProfessionals([]);
    }
  }, [selectedService]);

  const fetchAvailableSlots = (date) => {
    if (!selectedProfessional || !selectedService || !date) return;

    setLoadingSlots(true);
    setSelectedTime('');
    setErrorMessage('');
    setDayStatus('');
    setShowWaitlistForm(false);
    setWaitlistFeedback({ text: '', isSuccess: false });

    axios.get('http://localhost:3000/api/available-slots', {
      params: { employeeId: selectedProfessional, serviceId: selectedService, date: date }
    })
    .then(res => {
      if (res.data.success) {
        setAvailableTimes(res.data.data);
        setDayStatus(res.data.status);
      }
    })
    .catch(() => {
      setErrorMessage("Nem sikerült lekérni a szabad időpontokat.");
    })
    .finally(() => {
      setLoadingSlots(false);
    });
  };

  const handleDateClick = (arg) => {
    if (!selectedCategory || !selectedService || !selectedProfessional) {
      setErrorMessage("Kérlek, előbb válaszd ki a kategóriát, szolgáltatást és a szakembert!");
      return; 
    }

    setErrorMessage('');
    setSelectedDate(arg.dateStr);
    fetchAvailableSlots(arg.dateStr);

    document.querySelectorAll('.fc-daygrid-day').forEach(el => {
      el.style.backgroundColor = 'transparent';
    });
    arg.dayEl.style.backgroundColor = 'var(--login-bg)';
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!isLoggedIn) {
      setErrorMessage("Időpontfoglaláshoz be kell jelentkezned!");
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    if (!selectedDate || !selectedTime) {
      setErrorMessage("Kérlek, válassz egy napot és egy szabad időpontot!");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3000/api/book',
        {
          alkalmazott_id: selectedProfessional,
          szolgaltatas_id: selectedService,
          datum: selectedDate,
          ido: selectedTime,
          megjegyzes: note
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccessMessage(response.data.message);
        fetchAvailableSlots(selectedDate);
        setSelectedTime('');
        setNote('');
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Hiba történt a foglalás során.");
    }
  };

  const handleWaitlistSubmit = async () => {
    setWaitlistFeedback({ text: '', isSuccess: false });

    if (!isLoggedIn) {
      setWaitlistFeedback({ text: "A várólistához előbb be kell jelentkezned!", isSuccess: false });
      return;
    }

    let tol = null;
    let ig = null;
    if (waitlistPref === 'MORNING') { tol = '08:00'; ig = '12:00'; }
    else if (waitlistPref === 'AFTERNOON') { tol = '12:00'; ig = '18:00'; }
    else if (waitlistPref === 'CUSTOM') { tol = customFrom; ig = customTo; }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:3000/api/waitlist', {
        szolgaltatas_id: selectedService,
        datum: selectedDate,
        idosav_tol: tol,
        idosav_ig: ig
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (res.data.success) {
        setWaitlistFeedback({ text: res.data.message, isSuccess: true });
      }
    } catch (err) {
      setWaitlistFeedback({ 
        text: err.response?.data?.message || "Nem sikerült feliratkozni a várólistára.", 
        isSuccess: false 
      });
    }
  };

  return (
    <div className="container mt-5 mb-5 d-flex justify-content-center">
      <div className="card-pink p-4 p-md-5 w-100 shadow-sm" style={{ maxWidth: '1100px' }}>
        <h2 className="fw-bold text-center mb-4">Új időpont foglalása</h2>

        {errorMessage && <div className="alert alert-salon text-center mb-4 py-2">{errorMessage}</div>}
        {successMessage && <div className="alert alert-salon text-center mb-4 py-2 fw-bold">{successMessage}</div>}

        {/* 1. Kategória, Szolgáltatás, Szakember választó */}
        <div className="card-powder p-4 mb-4 shadow-sm">
          <div className="row mb-3 align-items-center">
            <div className="col-md-4 text-md-end fw-bold">Kategória:</div>
            <div className="col-md-8">
              <select 
                className="form-select form-control" 
                value={selectedCategory} 
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedService(''); 
                  setSelectedProfessional('');
                  setAvailableTimes([]);
                  setSelectedDate(null);
                  setDayStatus('');
                }}
              >
                <option value="">-- Válassz kategóriát --</option>
                {categories.map(cat => (
                  <option key={cat.kategoria_id} value={cat.kategoria_id}>{cat.kategoria_neve}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="row mb-3 align-items-center">
            <div className="col-md-4 text-md-end fw-bold">Szolgáltatás:</div>
            <div className="col-md-8">
              <select 
                className="form-select form-control" 
                value={selectedService} 
                onChange={(e) => {
                  setSelectedService(e.target.value);
                  setSelectedProfessional('');
                  setAvailableTimes([]);
                  setSelectedDate(null);
                  setDayStatus('');
                }} 
                disabled={!selectedCategory || services.length === 0}
              >
                <option value="">-- Válassz szolgáltatást --</option>
                {services.map(srv => (
                  <option key={srv.szolgaltatas_id} value={srv.szolgaltatas_id}>
                    {srv.szolgaltatas_neve} ({srv.ar.toLocaleString('hu-HU')} Ft - {srv.idotartam_perc} perc)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="row align-items-center">
            <div className="col-md-4 text-md-end fw-bold">Szakember:</div>
            <div className="col-md-8">
              <select 
                className="form-select form-control" 
                value={selectedProfessional} 
                onChange={(e) => {
                  setSelectedProfessional(e.target.value);
                  if (selectedDate) fetchAvailableSlots(selectedDate);
                }} 
                disabled={!selectedService || professionals.length === 0}
              >
                <option value="">-- Válassz szakembert --</option>
                {professionals.map(prof => (
                  <option key={prof.felhasznalo_id} value={prof.felhasznalo_id}>{prof.nev}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 2. Naptár és Elérhető idősávok */}
        <div className="row g-4">
          <div className="col-lg-7">
            <div className="card-white p-4 h-100 shadow-sm">
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                locale={huLocale}
                dateClick={handleDateClick}
                height="auto"
                validRange={{ start: dayjs().format('YYYY-MM-DD') }}
                headerToolbar={{ left: 'prev', center: 'title', right: 'next' }}
              />
            </div>
          </div>

          <div className="col-lg-5">
            <div className="card-white p-4 h-100 d-flex flex-column shadow-sm">
              <h5 className="fw-bold mb-3">
                {selectedDate ? `${selectedDate} időpontjai:` : 'Elérhető időpontok:'}
              </h5>

              {loadingSlots && <p>Időpontok kalkulációja...</p>}

              {/* Időpont gombok */}
              {!loadingSlots && selectedDate && availableTimes.length > 0 && (
                <div className="d-flex flex-wrap gap-2 mb-3" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                  {availableTimes.map((time) => (
                    <button 
                      key={time}
                      type="button"
                      className={`btn btn-sm ${selectedTime === time ? 'btn-dark' : 'btn-outline-dark'}`}
                      style={{ width: '85px' }}
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              )}

              {/* Pihenőnap / Szabadság */}
              {!loadingSlots && selectedDate && (dayStatus === 'NOT_WORKING' || dayStatus === 'ON_VACATION') && (
                <div className="card-powder p-3 rounded text-center my-3">
                  <p className="mb-0 fw-bold">
                    {dayStatus === 'ON_VACATION' ? 'A szakember ezen a napon szabadságon van.' : 'A szakember ezen a napon nem dolgozik (pihenőnap).'}
                  </p>
                </div>
              )}

              {/* Lenyitható várólista gomb */}
              {!loadingSlots && selectedDate && dayStatus === 'AVAILABLE' && availableTimes.length > 0 && !showWaitlistForm && (
                <div className="text-center mt-2 mb-3">
                  <button 
                    type="button" 
                    className="btn btn-link p-0 text-decoration-underline text-salon small" 
                    onClick={() => setShowWaitlistForm(true)}
                  >
                    Nem találsz megfelelő időpontot? Iratkozz fel várólistára!
                  </button>
                </div>
              )}

              {/* Várólista űrlap */}
              {!loadingSlots && selectedDate && (dayStatus === 'FULLY_BOOKED' || showWaitlistForm) && (
                <div className="card-powder p-3 my-3" style={{ border: '1px dashed var(--text-and-btn)' }}>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <h6 className="fw-bold mb-0">
                      {dayStatus === 'FULLY_BOOKED' ? 'Minden időpont betelt!' : 'Várólista erre a napra'}
                    </h6>
                    {showWaitlistForm && dayStatus !== 'FULLY_BOOKED' && (
                      <button type="button" className="btn-close btn-close-sm" onClick={() => setShowWaitlistForm(false)} />
                    )}
                  </div>
                  
                  <p className="mb-2 small">Melyik idősáv felel meg, ha felszabadulna egy hely?</p>

                  <select 
                    className="form-select form-control form-select-sm mb-2" 
                    value={waitlistPref}
                    onChange={(e) => setWaitlistPref(e.target.value)}
                  >
                    <option value="ALL_DAY">Egész nap (bármikor jó)</option>
                    <option value="MORNING">Csak délelőtt (08:00 – 12:00)</option>
                    <option value="AFTERNOON">Csak délután (12:00 – 18:00)</option>
                    <option value="CUSTOM">Egyéni idősáv megadása</option>
                  </select>

                  {waitlistPref === 'CUSTOM' && (
                    <div className="d-flex gap-2 align-items-center mb-2">
                      <input type="time" className="form-control form-control-sm" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
                      <span>-</span>
                      <input type="time" className="form-control form-control-sm" value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
                    </div>
                  )}

                  <button 
                    type="button" 
                    className="btn btn-dark btn-sm w-100 mt-1"
                    onClick={handleWaitlistSubmit}
                  >
                    Feliratkozás a várólistára
                  </button>

                  {waitlistFeedback.text && (
                    <div className={`mt-2 p-2 rounded text-center small fw-bold ${waitlistFeedback.isSuccess ? 'card-white' : 'card-pink'}`}>
                      {waitlistFeedback.text}
                    </div>
                  )}
                </div>
              )}

              {!selectedDate && (
                <p className="opacity-75">Válassz ki egy napot a naptárban a szabad idősávok megtekintéséhez!</p>
              )}

              {/* Megjegyzés mező */}
              <div className="mt-3 mb-3">
                <label className="form-label small fw-bold">Megjegyzés (opcionális):</label>
                <textarea 
                  className="form-control card-powder" 
                  rows="2"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Különleges kérés, minta..."
                />
              </div>

              <div className="mt-auto text-end pt-2">
                <button 
                  className="btn btn-dark py-2 px-4 w-100" 
                  disabled={!selectedDate || !selectedTime}
                  onClick={handleBooking}
                  style={{ opacity: (!selectedDate || !selectedTime) ? 0.6 : 1 }}
                >
                  Időpont lefoglalása
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Booking;