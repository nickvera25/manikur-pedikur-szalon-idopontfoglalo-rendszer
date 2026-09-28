// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user.szerep;

  console.log("Mit lát a ProtectedRoute?", { token, userRole, allowedRoles });

  if (!token) {
    return <Navigate to="/login" replace />;
  }


  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }


  return <Outlet />;
};

export default ProtectedRoute;