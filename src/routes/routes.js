import { useNavigate, useRoutes } from 'react-router-dom';
// layouts
import React, { useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import DashboardLayout from '../layouts/dashboard';
import LoginPage from '../pages/LoginPage';
import Page404 from '../pages/Page404';
import DashboardAppPage from '../pages/DashboardAppPage';
// eslint-disable-next-line import/no-named-as-default
import PrivateRoutes from './PrivateRoute';
import app from '../firebase_setup/firebase';
// ----------------------------------------------------------------------

export default function Router() {
  const navigate = useNavigate();
  const auth = getAuth(app);

  useEffect(() => {
    const isAuthenticated = !!auth.currentUser;
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, []);

  const routes = useRoutes([
    {
      path: '/',
      element: <PrivateRoutes />,
      children: [
        {
          path: '/',
          element: <DashboardLayout />,
          children: [{ path: '/dashboard', element: <DashboardAppPage /> }],
        },
      ],
    },

    { path: '/login', element: <LoginPage /> },
    {
      path: '*',
      element: <Page404 />,
    },
    {
      path: '/404',
      element: <Page404 />,
    },
  ]);

  return routes;
}
