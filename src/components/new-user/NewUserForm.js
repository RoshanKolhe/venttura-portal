import React, { useState, useEffect } from 'react';
import { Field, useFormik } from 'formik';
import * as yup from 'yup';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';
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
} from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import { omit } from 'lodash';
import { useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import closefill from '@iconify/icons-eva/close-fill';
import { Timestamp, collection, doc, getFirestore, setDoc } from 'firebase/firestore';
import { variationJson } from '../../utils/constants';
import LoadingScreen from '../../common/LoadingScreen';
import CustomBox from '../../common/CustomBox';
import account from '../../_mock/account';
import CommonSnackBar from '../../common/CommonSnackBar';
import { app } from '../../firebase_setup/firebase';

const NewUserForm = ({ initialValues, handleClose, onDataSubmit }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const firestore = getFirestore(app);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const handleOpenSnackBar = () => setOpenSnackBar(true);
  const handleCloseSnackBar = () => setOpenSnackBar(false);

  const userFormValidationSchema = yup.object({
    name: yup
      .string('Enter name')
      .required('name is required')
      .test('len', 'Must be less than 20 characters', (val) => {
        if (val) return val.toString().length < 20;
        return true;
      }),
    email: yup.string().email('Email must be a valid email address').required('email is required'),
    city: yup.string('Select city').required('city is required'),
  });

  const formik = useFormik({
    initialValues: {
      id: initialValues?.uid,
      name: initialValues?.name || '',
      email: initialValues?.email || '',
      city: initialValues?.city || '',
    },
    enableReinitialize: true,
    validationSchema: userFormValidationSchema,
    onSubmit: async (values) => {
      // setLoading(true);
      // Add the new document to the collection and get the document ID
      const usersRef = collection(firestore, 'users');
      const docRef = doc(usersRef);
      const allGoals = await variationJson();
      const newUser = {
        display_name: values.name,
        email: values.email,
        city: values.city,
        uid: docRef.id,
        revenuegenerated: 0.0,
        unitsSold: 0,
        created_time: Timestamp.now(),
        goals: allGoals,
      };
      await setDoc(docRef, newUser);
      onDataSubmit();
    },
  });

  const handleChange = (event) => {
    formik.setFieldValue('city', event.target.value);
  };

  return (
    <div>
      {loading ? <LoadingScreen /> : null}
      <form onSubmit={formik.handleSubmit} id="profileForm">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            p: 1,
            m: 1,
          }}
        >
          <Typography variant="h6" gutterBottom>
            New User
          </Typography>
          <Tooltip password="Close">
            <IconButton onClick={handleClose}>
              <Icon icon={closefill} />
            </IconButton>
          </Tooltip>
        </Box>
        <Grid container>
          <Grid item xs={12} lg={12} margin={2}>
            <TextField
              InputProps={{ disableUnderline: true }}
              fullWidth
              id="name"
              name="name"
              label="Name"
              type="text"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
          </Grid>
          <Grid item xs={12} lg={12} margin={2}>
            <TextField
              InputProps={{ disableUnderline: true }}
              fullWidth
              id="email"
              name="email"
              label="Email"
              type="text"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
          </Grid>
          <Grid item xs={12} lg={12} margin={2}>
            <FormControl fullWidth error={formik?.touched?.city && formik?.errors?.city}>
              <InputLabel id="type-label">City</InputLabel>
              <Select
                labelId="type-label"
                id="city"
                value={formik.values.city}
                label="City"
                onChange={handleChange}
                className={formik?.touched?.city && formik?.errors?.city ? 'red-border' : ''}
              >
                <MenuItem value="Pune">Pune</MenuItem>
                <MenuItem value="Mumbai">Mumbai</MenuItem>
                <MenuItem value="Kolkata">Kolkata</MenuItem>
                <MenuItem value="Bangalore">Bangalore</MenuItem>
              </Select>
              <FormHelperText error>{formik?.touched?.city && formik?.errors?.city}</FormHelperText>
            </FormControl>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item margin={2}>
            <Button color="primary" variant="contained" fullWidth type="submit" form="profileForm">
              Submit
            </Button>
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

export default NewUserForm;
