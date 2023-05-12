import { Navigate, Outlet, useLocation } from 'react-router-dom';
import React, { useContext } from 'react';
import { getAuth } from 'firebase/auth';
import { FirebaseContext } from '../firebase_setup/firebase';

export const PrivateRoutes = () => {
  const { user } = useContext(FirebaseContext);
  const location = useLocation();
  if (user === undefined || user === null) {
    return null; // or loading indicator/spinner/etc
  }

  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
};

export default PrivateRoutes;
