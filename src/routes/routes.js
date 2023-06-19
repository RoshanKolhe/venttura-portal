import { useNavigate, useRoutes } from 'react-router-dom';
// layouts
import React, { useContext, useEffect } from 'react';
// import { getAuth } from 'firebase/auth';
import LocationsPage from '../pages/LocationsPage';
import ProductsPage from '../pages/ProductsPage';
import TasksPage from '../pages/TasksPage';
import InventoryBuyerPage from '../pages/InventoryBuyerPage';
import DocumentsPage from '../pages/DocumentsPage';
import CategoriesPage from '../pages/CategoriesPage';
import DistributorsPage from '../pages/DistributorsPage';
import BuyersPage from '../pages/BuyersPage';
import UserExpensePage from '../pages/UserExpensePage';
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
import InventoryPage from '../pages/InventoryPage';
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
            { path: '/categories', element: <CategoriesPage /> },
            { path: '/documents', element: <DocumentsPage /> },
            { path: '/locations', element: <LocationsPage /> },
            { path: '/orders', element: <OrdersPage /> },
            { path: '/products', element: <ProductsPage /> },
            { path: '/orders/:id', element: <ViewDetails /> },
            { path: '/users/goals/:id', element: <GolasPage /> },
            { path: '/users/tasks/:id', element: <TasksPage /> },
            { path: '/leaveapplications', element: <LeaveApplicationPage /> },
            { path: '/userExpenses', element: <UserExpensePage /> },
            { path: '/attendance', element: <AttendancePage /> },
            { path: '/buyers', element: <BuyersPage /> },
            { path: '/buyers/inventory/:id', element: <InventoryBuyerPage /> },
            { path: '/distributors', element: <DistributorsPage /> },
            { path: '/distributors/inventory/:id', element: <InventoryPage /> },
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
