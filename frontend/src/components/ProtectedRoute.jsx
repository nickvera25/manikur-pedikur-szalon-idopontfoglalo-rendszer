// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user.szerep;

  // 1. Ha nincs bejelentkezve, a bejelentkezéshez irányítjuk
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. Ha meg van adva elvárt szerepkör, de nincs hozzá jogosultsága
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  // 3. Ha minden rendben, kirajzolja a csoportba tartozó aloldalt
  return <Outlet />;
};

export default ProtectedRoute;