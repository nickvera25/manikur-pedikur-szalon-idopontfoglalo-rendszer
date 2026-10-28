// src/pages/WorkerCalendar.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import huLocale from '@fullcalendar/core/locales/hu';
import dayjs from 'dayjs';

const WorkerCalendar = () => {
  const calendarRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [currentTitle, setCurrentTitle] = useState('');
  const [activeView, setActiveView] = useState('timeGridWeek');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  const token = localStorage.getItem('token');

  const fetchCalendarEvents = async () => {
    if (!token) return;
    try {
      const res = await axios.get('http://localhost:3000/api/employee-calendar', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setEvents(res.data.data);
      }
    } catch (err) {
      console.error("Nem sikerült lekérni a naptár adatait", err);
    }
  };

  useEffect(() => {
    fetchCalendarEvents();
  }, []);

  const updateTitle = () => {
    if (calendarRef.current) {
      const api = calendarRef.current.getApi();
      const date = api.getDate();
      const viewType = api.view.type;

      let viewPrefix = "Heti áttekintés";
      if (viewType === 'timeGridDay') viewPrefix = "Napi áttekintés";
      if (viewType === 'dayGridMonth') viewPrefix = "Havi áttekintés";

      const formattedDate = dayjs(date).format('YYYY. MMMM');
      setCurrentTitle(`${viewPrefix} ${formattedDate}`);
    }
  };

  const handleViewChange = (viewName) => {
    if (calendarRef.current) {
      const api = calendarRef.current.getApi();
      api.changeView(viewName);
      setActiveView(viewName);
      updateTitle();
    }
  };

  const handlePrev = () => {
    calendarRef.current?.getApi().prev();
    updateTitle();
  };

  const handleNext = () => {
    calendarRef.current?.getApi().next();
    updateTitle();
  };

  const handleToday = () => {
    calendarRef.current?.getApi().today();
    updateTitle();
  };

  const handleEventClick = (info) => {
    setSelectedEvent(info.event);
  };

  const handleCancelAppointment = async (bookingId) => {
    if (!window.confirm("Biztosan lemondod ezt az időpontot? A vendég azonnali értesítést kap.")) return;

    try {
      const res = await axios.delete(`http://localhost:3000/api/cancel-appointment/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setStatusMessage(res.data.message);
        setSelectedEvent(null);
        fetchCalendarEvents();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Hiba történt a törlés során.");
    }
  };

  return (
    <div className="container-fluid py-3 py-md-4 d-flex justify-content-center px-2 px-sm-3" style={{ minHeight: '85vh' }}>
      
      <div 
        className="card-powder w-100 p-3 p-sm-4 p-md-5 shadow-sm d-flex flex-column"
        style={{ maxWidth: '1200px' }}
      >
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3 mb-md-4 gap-2">
          <div className="d-flex justify-content-center gap-2">
            <button className="btn btn-dark btn-sm px-3" onClick={handlePrev}>&lt;</button>
            <button className="btn btn-dark btn-sm px-3" onClick={handleToday}>Ma</button>
            <button className="btn btn-dark btn-sm px-3" onClick={handleNext}>&gt;</button>
          </div>

          <h2 className="fw-bold m-0 text-center flex-grow-1" style={{ fontSize: 'clamp(1.25rem, 3.5vw, 1.8rem)' }}>
            {currentTitle || "Heti áttekintés"}
          </h2>

          <div style={{ width: '110px' }} className="d-none d-md-block"></div>
        </div>

        {statusMessage && (
          <div className="alert alert-salon py-2 text-center mb-3">
            {statusMessage}
          </div>
        )}

        <div className="custom-worker-calendar flex-grow-1 card-white p-1 p-sm-2">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            locale={huLocale}
            headerToolbar={false}
            allDaySlot={false}
            slotMinTime="08:00:00"
            slotMaxTime="18:00:00"
            slotDuration="01:00:00"
            events={events}
            eventClick={handleEventClick}
            height="auto"
            datesSet={updateTitle}
            dayMaxEvents={true}
            slotLabelFormat={{
              hour: 'numeric',
              minute: '2-digit',
              hour12: false
            }}
          />
        </div>

        <div className="d-flex justify-content-center gap-2 gap-sm-3 mt-3 mt-md-4 pt-2 w-100">
          <button 
            type="button"
            className={`btn px-2 px-sm-4 py-2 flex-fill flex-sm-grow-0 ${activeView === 'timeGridDay' ? 'btn-dark' : 'btn-outline-dark'}`}
            style={{ maxWidth: '120px' }}
            onClick={() => handleViewChange('timeGridDay')}
          >
            Napi
          </button>
          <button 
            type="button"
            className={`btn px-2 px-sm-4 py-2 flex-fill flex-sm-grow-0 ${activeView === 'timeGridWeek' ? 'btn-dark' : 'btn-outline-dark'}`}
            style={{ maxWidth: '120px' }}
            onClick={() => handleViewChange('timeGridWeek')}
          >
            Heti
          </button>
          <button 
            type="button"
            className={`btn px-2 px-sm-4 py-2 flex-fill flex-sm-grow-0 ${activeView === 'dayGridMonth' ? 'btn-dark' : 'btn-outline-dark'}`}
            style={{ maxWidth: '120px' }}
            onClick={() => handleViewChange('dayGridMonth')}
          >
            Havi
          </button>
        </div>
      </div>

      {selectedEvent && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ backgroundColor: 'rgba(79, 70, 70, 0.7)', zIndex: 1050 }}
        >
          <div className="card-white p-4 shadow-lg" style={{ maxWidth: '450px', width: '90%' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold m-0">
                {selectedEvent.extendedProps.type === 'booking' ? 'Időpont részletei' : 'Távollét részletei'}
              </h5>
              <button className="btn-close" onClick={() => setSelectedEvent(null)}></button>
            </div>

            {selectedEvent.extendedProps.type === 'booking' ? (
              <div>
                <p className="mb-1"><strong>Vendég:</strong> {selectedEvent.extendedProps.guestName}</p>
                <p className="mb-1"><strong>Telefon:</strong> {selectedEvent.extendedProps.guestPhone}</p>
                <p className="mb-1"><strong>E-mail:</strong> {selectedEvent.extendedProps.guestEmail}</p>
                <hr className="salon-divider my-2" />
                <p className="mb-1"><strong>Szolgáltatás:</strong> {selectedEvent.extendedProps.serviceName} ({selectedEvent.extendedProps.duration} perc)</p>
                <p className="mb-1"><strong>Ár:</strong> {selectedEvent.extendedProps.price?.toLocaleString('hu-HU')} Ft</p>
                <p className="mb-1"><strong>Időpont:</strong> {dayjs(selectedEvent.start).format('YYYY.MM.DD HH:mm')} – {dayjs(selectedEvent.end).format('HH:mm')}</p>
                <p className="mb-3"><strong>Megjegyzés:</strong> {selectedEvent.extendedProps.note}</p>

                <div className="d-flex justify-content-between gap-2 mt-4">
                  <button 
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleCancelAppointment(selectedEvent.extendedProps.bookingId || selectedEvent.id.replace('booking-', ''))}
                  >
                    Időpont lemondása
                  </button>
                  <button 
                    className="btn btn-dark btn-sm px-3" 
                    onClick={() => setSelectedEvent(null)}
                  >
                    Bezárás
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="mb-1"><strong>Típus:</strong> Szabadság / Egyéni távollét</p>
                <p className="mb-1"><strong>Időtartam:</strong> {dayjs(selectedEvent.start).format('YYYY.MM.DD HH:mm')} – {dayjs(selectedEvent.end).format('YYYY.MM.DD HH:mm')}</p>
                <p className="mb-3"><strong>Indok:</strong> {selectedEvent.extendedProps.note}</p>
                <div className="text-end">
                  <button className="btn btn-dark btn-sm px-3" onClick={() => setSelectedEvent(null)}>
                    Bezárás
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .custom-worker-calendar .fc-col-header-cell,
        .custom-worker-calendar .fc-timegrid-axis,
        .custom-worker-calendar .fc-timegrid-slot-label {
          background-color: var(--card-bg) !important;
          color: var(--text-and-btn) !important;
          font-weight: bold;
          border-color: var(--login-bg) !important;
        }
        .custom-worker-calendar .fc-timegrid-slot {
          height: 48px !important;
          border-color: var(--login-bg) !important;
        }
        .custom-worker-calendar .fc-timegrid-slot-minor {
          border-style: dotted !important;
        }
        .custom-worker-calendar .fc-event {
          cursor: pointer;
          border-radius: 4px;
          padding: 1px 3px;
          font-size: 0.82rem;
        }

        @media (max-width: 768px) {
          .custom-worker-calendar .fc-timegrid-slot {
            height: 30px !important;
          }
          .custom-worker-calendar .fc-timegrid-slot-label {
            font-size: 0.75rem !important;
          }
          .custom-worker-calendar .fc-col-header-cell-cushion {
            font-size: 0.7rem !important;
            padding: 2px 0 !important;
          }
          .custom-worker-calendar .fc-timegrid-axis {
            width: 38px !important;
          }

          .custom-worker-calendar .fc-daygrid-day-frame {
            min-height: 58px !important;
            display: flex !important;
            flex-direction: column !important;
          }

          .custom-worker-calendar .fc-daygrid-day-top {
            flex-direction: row !important;
            justify-content: center !important;
            padding: 1px 0 !important;
          }

          .custom-worker-calendar .fc-daygrid-day-number {
            font-size: 0.75rem !important;
            padding: 1px 2px !important;
          }

          .custom-worker-calendar .fc-daygrid-event {
            font-size: 0.65rem !important;
            line-height: 1.1 !important;
            margin: 1px 0 !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
          }

          .custom-worker-calendar .fc-daygrid-block-event .fc-event-title {
            padding: 1px 2px !important;
            font-weight: normal !important;
          }

          .custom-worker-calendar .fc-daygrid-more-link {
            font-size: 0.65rem !important;
            color: var(--text-and-btn) !important;
          }
        }
      `}</style>
    </div>
  );
};

export default WorkerCalendar;