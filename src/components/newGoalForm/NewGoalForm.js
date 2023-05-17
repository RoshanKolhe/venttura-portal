import React, { useState, useEffect } from 'react';
import { Field, useFormik } from 'formik';
import * as yup from 'yup';
import 'react-phone-input-2/lib/material.css';
import SaveIcon from '@mui/icons-material/Save';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {
  FormHelperText,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  MenuItem,
  InputLabel,
  Tooltip,
  IconButton,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import closefill from '@iconify/icons-eva/close-fill';
import { Timestamp, collection, doc, getDoc, getFirestore, setDoc, updateDoc } from 'firebase/firestore';
import { LoadingButton } from '@mui/lab';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { getCurrentMonthAndYear, variationJson } from '../../utils/constants';
import LoadingScreen from '../../common/LoadingScreen';
import CustomBox from '../../common/CustomBox';
import account from '../../_mock/account';
import CommonSnackBar from '../../common/CommonSnackBar';
import { app } from '../../firebase_setup/firebase';

const NewGoalForm = ({ handleClose, onDataSubmit }) => {
  const currentDate = new Date();
  const [selectedDate, setSelectedDate] = useState();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const [defaultGoals, setDefaultGoals] = useState([]);
  const [goalsWithProductData, setGoalsWithProductData] = useState([]);
  const year = currentDate.getFullYear();
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const db = getFirestore(app);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const handleOpenSnackBar = () => setOpenSnackBar(true);
  const handleCloseSnackBar = () => setOpenSnackBar(false);

  const goalFormValidationSchema = yup.object({
    monthAndYear: yup.string('Select month and year').required('Month and year is required'),
  });

  const formik = useFormik({
    initialValues: {
      monthAndYear: '',
    },
    enableReinitialize: true,
    validationSchema: goalFormValidationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      console.log(values.monthAndYear);
      setLoading(false);

      //   onDataSubmit('User created successfully');
    },
  });

  const handleDateChange = (date) => {
    console.log('here');
    setSelectedDate(date);
    formik.setFieldValue('monthAndYear', date);
  };

  const handleItemChanged = (e, row, targetField) => {
    const foundIndex = defaultGoals.findIndex((x) => x.id === row.id);
    const rowData = defaultGoals[foundIndex];
    const updatedData = { ...rowData, [targetField]: parseFloat(e.target.value) };
    const updatedFilteredGoals = defaultGoals.map((item, index) => {
      if (index === foundIndex) return { ...updatedData };
      return { ...item };
    });
    const rowStateData = goalsWithProductData[foundIndex];
    const updatedrowStateData = { ...rowStateData, [targetField]: parseFloat(e.target.value) };
    const updatedStateGoals = goalsWithProductData.map((item, index) => {
      if (index === foundIndex) return { ...updatedrowStateData };
      return { ...item };
    });

    setDefaultGoals(updatedStateGoals);
    setGoalsWithProductData(updatedFilteredGoals);
  };

  useEffect(() => {
    variationJson().then(async (res) => {
      setDefaultGoals(res);

      const data = await Promise.all(
        res.map(async (reference) => {
          const referenceDocRef = doc(db, 'Variation', reference.productrefrence.id);
          const referenceDocSnap = await getDoc(referenceDocRef);

          if (referenceDocSnap.exists()) {
            reference.productrefrence = referenceDocSnap.data();

            if (reference.productrefrence.productRefrence) {
              const referenceChildDocRef = doc(db, 'Products', reference.productrefrence.productRefrence.id);
              const referenceDocChildSnap = await getDoc(referenceChildDocRef);

              if (referenceDocChildSnap.exists()) {
                reference.productrefrence.productRefrence = referenceDocChildSnap.data();
                return reference;
              }
              console.log('Child document does not exist!');
            }
          } else {
            console.log('Referenced document does not exist!');
          }

          return null;
        })
      );

      const filteredData = data.filter(Boolean); // Remove any null values

      setGoalsWithProductData(filteredData);
    });
  }, []);
  return (
    <div>
      <form onSubmit={formik.handleSubmit} id="goalForm">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            p: 1,
            m: 1,
          }}
        >
          <Typography variant="h6" gutterBottom>
            {'New Goals'}
          </Typography>
          <Tooltip password="Close">
            <IconButton onClick={handleClose}>
              <Icon icon={closefill} />
            </IconButton>
          </Tooltip>
        </Box>
        <Grid container>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid item xs={12} lg={12} margin={2}>
              <DateTimePicker
                inputFormat="MM-YYYY"
                views={['year', 'month']}
                label="Month and Year"
                value={selectedDate}
                onChange={handleDateChange}
                renderInput={(params) => <TextField {...params} style={{ width: '100%' }} />}
              />
              <FormHelperText error>{formik?.touched?.monthAndYear && formik?.errors?.monthAndYear}</FormHelperText>
            </Grid>
          </LocalizationProvider>
          <Grid item xs={12}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product Name</TableCell>
                    <TableCell>Goal Quantity</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {goalsWithProductData.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.productrefrence.productRefrence.ProductName}</TableCell>
                      <TableCell>
                        <TextField
                          InputProps={{ disableUnderline: true }}
                          fullWidth
                          id="name"
                          variant="standard"
                          type="text"
                          value={product.goalQuantity}
                          onChange={(e) => handleItemChanged(e, product, 'goalQuantity')}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item margin={2}>
            <LoadingButton
              loading={loading}
              loadingPosition="start"
              variant="contained"
              startIcon={<SaveIcon />}
              color="primary"
              fullWidth
              type="submit"
              form="goalForm"
              disabled={loading}
            >
              Submit
            </LoadingButton>
          </Grid>
        </Grid>
        <CommonSnackBar
          openSnackBar={openSnackBar}
          handleCloseSnackBar={handleCloseSnackBar}
          msg={errorMessage !== '' ? errorMessage : successMessage}
          severity={errorMessage !== '' ? 'error' : 'success'}
        />
      </form>
    </div>
  );
};

export default NewGoalForm;
