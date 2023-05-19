// component
import SvgColor from '../../../components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />;

const navConfig = [
  {
    title: 'dashboard',
    path: '/dashboard',
    icon: icon('ic_analytics'),
  },
  {
    title: 'users',
    path: '/users',
    icon: icon('ic_user'),
  },
  {
    title: 'buyers',
    path: '/buyers',
    icon: icon('ic_buyer'),
  },
  {
    title: 'distributors',
    path: '/distributors',
    icon: icon('ic_distributor'),
  },
  {
    title: 'Orders',
    path: '/orders',
    icon: icon('ic_orders'),
  },

  {
    title: 'Attendance',
    path: '/attendance',
    icon: icon('ic_attendance'),
  },
  {
    title: 'Leave Applications',
    path: '/leaveapplications',
    icon: icon('ic_leave'),
  },
  {
    title: 'Expenses',
    path: '/userExpenses',
    icon: icon('ic_expense'),
  },
];

export default navConfig;
