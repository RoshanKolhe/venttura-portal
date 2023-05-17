import { Navigate, Outlet, useLocation } from 'react-router-dom';
import React, { useContext } from 'react';
import { getAuth } from 'firebase/auth';
import { FirebaseContext } from '../firebase_setup/firebase';

export const PrivateRoutes = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const location = useLocation();
  if (user === undefined || user === null) {
    return null; // or loading indicator/spinner/etc
  }
  return user && user.permissions && user.permissions.includes('admin') ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
};

export default PrivateRoutes;
