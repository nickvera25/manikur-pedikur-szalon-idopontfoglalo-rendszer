// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Booking from "./pages/Booking";
import Profile from "./pages/Profile";
import Welcome from "./pages/Welcome";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ScheduleSetting from './pages/ScheduleSetting';
import WorkerDashboard from './pages/WorkerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminServices from './pages/AdminServices';
import AdminEmployees from './pages/AdminEmployees';
import ForcedPasswordChange from './pages/ForcedPasswordChange';
import UpcomingBookings from './pages/UpcomingBookings';
import PastBookings from './pages/PastBookings';
import WorkerCalendar from './pages/WorkerCalendar';
import Hazirend from './pages/Hazirend';
import Gallery from './pages/Gallery';
import UploadImage from './pages/UploadImage';
import AdminStatistics from './pages/AdminStatistics';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/foglalas" element={<Booking />} />
        <Route path="/profil" element={<Profile />} />
        <Route path="/udvozoljuk" element={<Welcome />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/schedule-setting" element={<ScheduleSetting />} />
        <Route path="/worker-dashboard" element={<WorkerDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-szolgaltatasok" element={<AdminServices />} />
        <Route path="/admin-alkalmazottak" element={<AdminEmployees />} />
        <Route path="/kotelezo-jelszocsere" element={<ForcedPasswordChange />} />
        <Route path="/kozelgo-foglalasok" element={<UpcomingBookings />} />
        <Route path="/korabbi-foglalasok" element={<PastBookings />} />
        <Route path="/naptaram" element={<WorkerCalendar />} />
        <Route path="/hazirend" element={<Hazirend />} />
        <Route path="/galeria" element={<Gallery />} />
        <Route path="/kepfeltoltes" element={<UploadImage />} />
        <Route path="/admin-statisztika" element={<AdminStatistics />} />
      </Routes>
    </Router>
  );
}

export default App;