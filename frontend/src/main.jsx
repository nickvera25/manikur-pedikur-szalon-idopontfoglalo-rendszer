import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import dayjs from 'dayjs';
import 'dayjs/locale/hu';

dayjs.locale('hu'); // Globálisan magyar nyelvre állítja a teljes alkalmazást

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);