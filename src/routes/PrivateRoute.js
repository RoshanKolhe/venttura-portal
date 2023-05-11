import { Navigate, Outlet, useLocation } from 'react-router-dom';
import React from 'react';
import { getAuth } from 'firebase/auth';
import app from '../firebase_setup/firebase';

export const PrivateRoutes = () => {
  const auth = getAuth(app);

  const isAuthenticated = !!auth.currentUser;
  const location = useLocation();
  if (isAuthenticated === undefined || isAuthenticated === null) {
    return null; // or loading indicator/spinner/etc
  }

  return isAuthenticated === 'true' ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
};

export default PrivateRoutes;
