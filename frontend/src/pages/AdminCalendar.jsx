// frontend/src/pages/AdminCalendar.jsx
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import huLocale from '@fullcalendar/core/locales/hu';
import axios from 'axios';

const AdminCalendar = () => {
  const [events, setEvents] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState(null);

  const token = localStorage.getItem('token');

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
    <div className="container-fluid py-3 py-md-4 px-2 px-sm-3 d-flex justify-content-center" style={{ minHeight: '85vh' }}>
      <div className="w-100" style={{ maxWidth: '1200px' }}>
        
        {/* Szalon fejléckártya és szűrő */}
        <div className="card-powder d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 mb-md-4 p-3 p-md-4 shadow-sm gap-2">
          <div>
            <h2 className="fw-bold mb-1 text-salon" style={{ fontSize: 'clamp(1.3rem, 3.5vw, 1.8rem)' }}>
              Szalon Összesített Naptár
            </h2>
            <p className="mb-0 text-salon" style={{ fontSize: '14px', opacity: 0.85 }}>
              Rálátás a teljes csapat beosztására és foglalásaira
            </p>
          </div>
          
          <div className="d-flex align-items-center w-100 w-md-auto mt-2 mt-md-0 justify-content-between justify-content-md-end">
            <label className="fw-bold me-2 text-salon text-nowrap">Szakember szűrése:</label>
            <select 
              className="form-select form-select-salon" 
              style={{ maxWidth: '240px' }}
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

        {/* Naptár fehér doboza */}
        <div className="custom-admin-calendar card-white p-2 p-sm-3 p-md-4 shadow-sm">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            locale={huLocale}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            buttonText={{
              today: 'Ma',
              month: 'Hónap',
              week: 'Hét',
              day: 'Nap'
            }}
            allDaySlot={false}
            slotMinTime="07:00:00"
            slotMaxTime="20:00:00"
            slotDuration="01:00:00"
            dayMaxEvents={true}
            height="auto"
            events={events}
            eventClick={handleEventClick}
            slotLabelFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }}
          />
        </div>

      </div>

      {/* Részletek modal ablak */}
      {selectedEvent && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(79, 70, 70, 0.7)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered px-3">
            <div className="modal-content card-white p-0 overflow-hidden shadow-lg border-0">
              <div className="modal-header card-pink rounded-0 border-bottom">
                <h5 className="modal-title fw-bold text-salon">Esemény részletei</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedEvent(null)}></button>
              </div>
              <div className="modal-body text-salon p-3 p-md-4">
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
              <div className="modal-footer card-powder rounded-0 border-top">
                <button type="button" className="btn btn-dark px-4" onClick={() => setSelectedEvent(null)}>
                  Bezárás
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reszponzív és arculati CSS */}
      <style>{`
        /* Szalon stílusú naptár színek */
        .custom-admin-calendar .fc-col-header-cell,
        .custom-admin-calendar .fc-timegrid-axis,
        .custom-admin-calendar .fc-timegrid-slot-label {
          background-color: var(--card-bg) !important;
          color: var(--text-and-btn) !important;
          font-weight: bold;
          border-color: var(--login-bg) !important;
        }

        .custom-admin-calendar .fc-timegrid-slot {
          height: 44px !important;
          border-color: var(--login-bg) !important;
        }

        .custom-admin-calendar .fc-timegrid-slot-minor {
          border-style: dotted !important;
        }

        .custom-admin-calendar .fc-event {
          cursor: pointer;
          border-radius: 4px;
          padding: 1px 3px;
          font-size: 0.82rem;
        }

        /* Fejléckezelő gombok szalon stílusa */
        .custom-admin-calendar .fc-button-primary {
          background-color: var(--text-and-btn, #4a3b32) !important;
          border-color: var(--text-and-btn, #4a3b32) !important;
          color: #fff !important;
          font-weight: 500;
        }

        .custom-admin-calendar .fc-button-primary:hover,
        .custom-admin-calendar .fc-button-primary:focus,
        .custom-admin-calendar .fc-button-primary.fc-button-active {
          background-color: #2b221d !important;
          border-color: #2b221d !important;
        }

        /* Mobil nézet javítása (különösen telefonos felbontáson) */
        @media (max-width: 768px) {
          /* A fejléc gombjai nem csúsznak össze, hanem 3 kulturált sorba rendeződnek */
          .custom-admin-calendar .fc-header-toolbar {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            gap: 0.6rem !important;
            margin-bottom: 0.8rem !important;
          }

          .custom-admin-calendar .fc-toolbar-chunk {
            display: flex !important;
            justify-content: center !important;
            width: 100% !important;
          }

          .custom-admin-calendar .fc-toolbar-title {
            font-size: 1.15rem !important;
            text-align: center !important;
          }

          .custom-admin-calendar .fc-button {
            padding: 0.25rem 0.55rem !important;
            font-size: 0.8rem !important;
          }

          /* Heti nézet slot magasság mobilon */
          .custom-admin-calendar .fc-timegrid-slot {
            height: 30px !important;
          }

          .custom-admin-calendar .fc-timegrid-slot-label {
            font-size: 0.75rem !important;
          }

          .custom-admin-calendar .fc-col-header-cell-cushion {
            font-size: 0.7rem !important;
            padding: 2px 0 !important;
          }

          .custom-admin-calendar .fc-timegrid-axis {
            width: 38px !important;
          }

          /* Havi nézet mobilos javítása */
          .custom-admin-calendar .fc-daygrid-day-frame {
            min-height: 58px !important;
            display: flex !important;
            flex-direction: column !important;
          }

          .custom-admin-calendar .fc-daygrid-day-top {
            flex-direction: row !important;
            justify-content: center !important;
            padding: 1px 0 !important;
          }

          .custom-admin-calendar .fc-daygrid-day-number {
            font-size: 0.75rem !important;
            padding: 1px 2px !important;
          }

          .custom-admin-calendar .fc-daygrid-event {
            font-size: 0.65rem !important;
            line-height: 1.1 !important;
            margin: 1px 0 !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminCalendar;