import { Helmet } from 'react-helmet-async';
import { faker } from '@faker-js/faker';
// @mui
import { useTheme } from '@mui/material/styles';
import { Grid, Container, Typography } from '@mui/material';
// components
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../helpers/axios';
import Iconify from '../components/iconify';
// sections
import {
  AppTasks,
  AppNewsUpdate,
  AppOrderTimeline,
  AppCurrentVisits,
  AppWebsiteVisits,
  AppTrafficBySite,
  AppWidgetSummary,
  AppCurrentSubject,
  AppConversionRates,
} from '../sections/@dashboard/app';
import AttendancePage from './AttendancePage';

// ----------------------------------------------------------------------

export default function DashboardAppPage() {
  const theme = useTheme();
  const [totalCount, setTotalCount] = useState();
  const navigate = useNavigate();

  useEffect((res) => {
    axiosInstance.post('/getDashboardCounts').then((res) => {
      const countData = res.data.data;
      setTotalCount(countData);
    });
  }, []);

  return (
    <>
      <Helmet>
        <title> Dashboard | Minimal UI </title>
      </Helmet>

      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Hi, Welcome back
        </Typography>

        <Grid container spacing={3}>
          <Grid
            item
            xs={12}
            sm={6}
            md={3}
            onClick={() => {
              navigate('/buyers');
            }}
            style={{ cursor: 'pointer' }}
          >
            <AppWidgetSummary title="Buyers" total={totalCount?.buyersCount} icon={'mdi:account-check'} />
          </Grid>

          <Grid
            item
            xs={12}
            sm={6}
            md={3}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              navigate('/distributors');
            }}
          >
            <AppWidgetSummary
              title="Distributors"
              total={totalCount?.distributorCount}
              color="info"
              icon={'mdi:account-cash-outline'}
            />
          </Grid>

          <Grid
            item
            xs={12}
            sm={6}
            md={3}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              navigate('/orders');
            }}
          >
            <AppWidgetSummary
              title="Orders"
              total={totalCount?.totalOrdersPlaced}
              color="warning"
              icon={'material-symbols:order-approve'}
            />
          </Grid>

          <Grid item xs={12} md={12} lg={12}>
            <AttendancePage styles={{margin:0,padding:0}}/>
          </Grid>
          
        </Grid>
      </Container>
    </>
  );
}
