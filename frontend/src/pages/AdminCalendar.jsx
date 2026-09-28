// frontend/src/pages/AdminCalendar.jsx
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';

const AdminCalendar = () => {
  const [events, setEvents] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState(null);

  const token = localStorage.getItem('token');

  // Alkalmazottak lekérése a szűrőhöz
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/admin/employees', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setEmployees(res.data.data);
        }
      } catch (err) {
        console.error("Nem sikerült lekérni a dolgozókat:", err);
      }
    };
    fetchEmployees();
  }, [token]);

  // Események lekérése a kiválasztott szűrő alapján
  const fetchEvents = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/api/admin/calendar-events?employeeId=${selectedEmployee}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setEvents(res.data.data);
      }
    } catch (err) {
      console.error("Naptáresemények betöltési hiba:", err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedEmployee]);

  const handleEventClick = (info) => {
    setSelectedEvent(info.event);
  };

  return (
    <div className="container py-4">
      {/* FEJLÉC ÉS SZŰRŐ - card-powder osztállyal */}
      <div className="card-powder d-flex flex-wrap justify-content-between align-items-center mb-4 p-3 shadow-sm">
        <div>
          <h2 className="fw-bold mb-1 text-salon">Szalon Összesített Naptár</h2>
          <p className="mb-0 text-salon" style={{ fontSize: '14px', opacity: 0.85 }}>
            Rálátás a teljes csapat beosztására és foglalásaira
          </p>
        </div>
        
        <div className="d-flex align-items-center mt-2 mt-md-0">
          <label className="fw-bold me-2 text-salon">Szakember szűrése:</label>
          <select 
            className="form-select form-select-salon" 
            style={{ width: '220px' }}
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
          >
            <option value="all">Mindenki (Összes naptár)</option>
            {employees.map(emp => (
              <option key={emp.felhasznalo_id} value={emp.felhasznalo_id}>
                {emp.vezeteknev} {emp.keresztnev}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card-white p-3 shadow-sm">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          locale="hu"
          buttonText={{
            today: 'Ma',
            month: 'Hónap',
            week: 'Hét',
            day: 'Nap'
          }}
          allDaySlot={true}
          slotMinTime="07:00:00"
          slotMaxTime="20:00:00"
          events={events}
          eventClick={handleEventClick}
          height="750px"
        />
      </div>

      {selectedEvent && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content card-white p-0 overflow-hidden shadow">
              <div className="modal-header card-pink rounded-0 border-bottom border-dark">
                <h5 className="modal-title fw-bold text-salon">Esemény részletei</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedEvent(null)}></button>
              </div>
              <div className="modal-body text-salon p-4">
                {selectedEvent.extendedProps.type === 'booking' ? (
                  <>
                    <p className="mb-2"><strong>💅 Szolgáltatás:</strong> {selectedEvent.extendedProps.serviceName}</p>
                    <p className="mb-2"><strong>👤 Kezelő szakember:</strong> {selectedEvent.extendedProps.employeeName}</p>
                    <p className="mb-2"><strong>🙋 Vendég:</strong> {selectedEvent.extendedProps.guestName}</p>
                    <p className="mb-2"><strong>📞 Telefonszám:</strong> {selectedEvent.extendedProps.guestPhone}</p>
                    <p className="mb-2"><strong>💰 Ár:</strong> {selectedEvent.extendedProps.price} Ft</p>
                    <p className="mb-0"><strong>🕒 Időpont:</strong> {new Date(selectedEvent.start).toLocaleString('hu-HU')}</p>
                  </>
                ) : (
                  <>
                    <p className="mb-2"><strong>🏖️ Típus:</strong> Szabadság / Távollét</p>
                    <p className="mb-2"><strong>👤 Szakember:</strong> {selectedEvent.extendedProps.employeeName}</p>
                    <p className="mb-2"><strong>📝 Megjegyzés:</strong> {selectedEvent.extendedProps.note}</p>
                    <p className="mb-0"><strong>📅 Kezdete:</strong> {new Date(selectedEvent.start).toLocaleDateString('hu-HU')}</p>
                  </>
                )}
              </div>
              <div className="modal-footer card-powder rounded-0 border-top border-dark">
                <button type="button" className="btn btn-dark" onClick={() => setSelectedEvent(null)}>
                  Bezárás
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCalendar;