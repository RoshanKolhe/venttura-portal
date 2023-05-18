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
    title: 'Orders',
    path: '/orders',
    icon: icon('ic_orders'),
  },
  {
    title: 'Leave Applications',
    path: '/leaveapplications',
    icon: icon('ic_leave'),
  },
  {
    title: 'Attendance',
    path: '/attendance',
    icon: icon('ic_attendance'),
  },
];

export default navConfig;
