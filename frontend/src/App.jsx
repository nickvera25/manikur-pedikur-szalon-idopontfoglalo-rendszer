// src/App.jsx
import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Footer from "./components/Footer";
import CookieBanner from "./components/CookieBanner";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Hazirend from './pages/Hazirend';
import Gallery from './pages/Gallery';
import Welcome from "./pages/Welcome";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CookiePolicy from "./pages/CookiePolicy";

import Booking from "./pages/Booking";
import Profile from "./pages/Profile";
import UpcomingBookings from './pages/UpcomingBookings';
import PastBookings from './pages/PastBookings';
import ForcedPasswordChange from './pages/ForcedPasswordChange';

import WorkerDashboard from './pages/WorkerDashboard';
import WorkerCalendar from './pages/WorkerCalendar';
import ScheduleSetting from './pages/ScheduleSetting';
import UploadImage from './pages/UploadImage';

import AdminDashboard from './pages/AdminDashboard';
import AdminCalendar from './pages/AdminCalendar';
import AdminServices from './pages/AdminServices';
import AdminEmployees from './pages/AdminEmployees';
import AdminStatistics from './pages/AdminStatistics';

const AppContent = () => {
  const location = useLocation();

  // AUTOMATIKUS FELGÖRGETÉS MINDEN OLDALVÁLTÁSKOR (Külön fájl nélkül)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      
      <main key={location.pathname} className="flex-grow-1 animate-fade-up">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/hazirend" element={<Hazirend />} />
          <Route path="/galeria" element={<Gallery />} />
          <Route path="/udvozoljuk" element={<Welcome />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/suti-tajekoztato" element={<CookiePolicy />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/profil" element={<Profile />} />
            <Route path="/kotelezo-jelszocsere" element={<ForcedPasswordChange />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['Vendég', 'Admin']} />}>
            <Route path="/foglalas" element={<Booking />} />
            <Route path="/kozelgo-foglalasok" element={<UpcomingBookings />} />
            <Route path="/korabbi-foglalasok" element={<PastBookings />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['Alkalmazott', 'Admin']} />}>
            <Route path="/worker-dashboard" element={<WorkerDashboard />} />
            <Route path="/naptaram" element={<WorkerCalendar />} />
            <Route path="/schedule-setting" element={<ScheduleSetting />} />
            <Route path="/kepfeltoltes" element={<UploadImage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin-naptar" element={<AdminCalendar />} />
            <Route path="/admin-szolgaltatasok" element={<AdminServices />} />
            <Route path="/admin-alkalmazottak" element={<AdminEmployees />} />
            <Route path="/admin-statisztika" element={<AdminStatistics />} />
          </Route>
        </Routes>
      </main>

      <Footer />
      <CookieBanner />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;