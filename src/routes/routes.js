import { useNavigate, useRoutes } from 'react-router-dom';
// layouts
import React, { useContext, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import OrdersPage from '../pages/OrdersPage';
import DashboardLayout from '../layouts/dashboard';
import LoginPage from '../pages/LoginPage';
import Page404 from '../pages/Page404';
import DashboardAppPage from '../pages/DashboardAppPage';
// eslint-disable-next-line import/no-named-as-default
import PrivateRoutes from './PrivateRoute';
import { FirebaseContext } from '../firebase_setup/firebase';
import UserPage from '../pages/UserPage';
// ----------------------------------------------------------------------

export default function Router() {
  const navigate = useNavigate();
  const { user } = useContext(FirebaseContext);
  console.log(user);
  useEffect(() => {
    if (!user) {
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
          children: [
            { path: '/dashboard', element: <DashboardAppPage /> },
            { path: '/user', element: <UserPage /> },
            { path: '/orders', element: <OrdersPage /> },
          ],
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
