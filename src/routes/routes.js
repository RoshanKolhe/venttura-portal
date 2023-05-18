import { useNavigate, useRoutes } from 'react-router-dom';
// layouts
import React, { useContext, useEffect } from 'react';
// import { getAuth } from 'firebase/auth';
import AttendancePage from '../pages/AttendancePage';
import GolasPage from '../pages/GoalsPage';
import OrdersPage from '../pages/OrdersPage';
// eslint-disable-next-line import/no-unresolved
import ViewDetails from '../pages/ViewDetails';
import LeaveApplicationPage from '../pages/LeaveApplicationPage';
// import ViewDetails from '../pages/DashboardAppPage';
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
  const user = JSON.parse(localStorage.getItem('user'));
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
            { path: '/users', element: <UserPage /> },
            { path: '/orders', element: <OrdersPage /> },
            { path: '/orders/:id', element: <ViewDetails /> },
            { path: '/users/goals/:id', element: <GolasPage /> },
            { path: '/leaveapplications', element: <LeaveApplicationPage /> },
            { path: '/attendance', element: <AttendancePage /> },
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
