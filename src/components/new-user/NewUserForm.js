import React, { useState, useEffect } from 'react';
import { Field, useFormik } from 'formik';
import eyeFill from '@iconify/icons-eva/eye-fill';
import eyeOffFill from '@iconify/icons-eva/eye-off-fill';
import * as yup from 'yup';
import 'react-phone-input-2/lib/material.css';
import SaveIcon from '@mui/icons-material/Save';
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
  InputAdornment,
} from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import { initial, omit } from 'lodash';
import { useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import closefill from '@iconify/icons-eva/close-fill';
import { Timestamp, collection, doc, getFirestore, setDoc, updateDoc } from 'firebase/firestore';
import { LoadingButton } from '@mui/lab';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { getCurrentMonthAndYear, variationJson } from '../../utils/constants';
import LoadingScreen from '../../common/LoadingScreen';
import CustomBox from '../../common/CustomBox';
import account from '../../_mock/account';
import CommonSnackBar from '../../common/CommonSnackBar';
import { app } from '../../firebase_setup/firebase';

const NewUserForm = ({ initialValues, handleClose, onDataSubmit }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentDate = new Date();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const year = currentDate.getFullYear();
  const auth = getAuth();
  const [showPassword, setShowPassword] = useState(false);
  const formattedDate = `${month}-${year}`;
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const firestore = getFirestore(app);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const handleOpenSnackBar = () => setOpenSnackBar(true);
  const handleCloseSnackBar = () => setOpenSnackBar(false);

  const userFormValidationSchema = yup.object({
    name: yup.string('Enter name').required('name is required'),
    email: yup.string().email('Email must be a valid email address').required('email is required'),
    password: yup
      .string()
      .min(8, 'Password is too short - should be 8 chars minimum.')
      .matches(
        // eslint-disable-next-line no-useless-escape
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
        'Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character'
      )
      .test('', (value, context) => {
        // Check if the condition is true
        if (!initialValues) {
          // Apply the required validation
          return yup.string().required('Password is required').isValidSync(value);
        }
        // Skip the required validation
        return true;
      }),
    city: yup.string('Select city').required('city is required'),
  });

  const formik = useFormik({
    initialValues: {
      id: initialValues?.uid,
      name: initialValues?.display_name || '',
      email: initialValues?.email || '',
      city: initialValues?.city || '',
    },
    enableReinitialize: true,
    validationSchema: userFormValidationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        if (!initialValues) {
          const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
          const usersRef = collection(firestore, 'users');
          const docRef = doc(usersRef, userCredential.user.uid);
          const allGoals = await variationJson();
          const currentMonthAndYeaer = getCurrentMonthAndYear();
          const newUser = {
            display_name: values.name,
            email: values.email,
            city: values.city,
            uid: userCredential.user.uid,
            revenuegenerated: 0.0,
            unitsSold: 0,
            created_time: Timestamp.now(),
            currentGoalsMonthAndYear: formattedDate,
          };

          await setDoc(docRef, newUser);

          const goalsRef = collection(docRef, 'goals');
          const goalsDocRef = doc(goalsRef, currentMonthAndYeaer);
          await setDoc(goalsDocRef, { allGoals });
          setLoading(false);
          onDataSubmit('User created successfully');
        } else {
          const docRef = doc(firestore, 'users', initialValues?.id);
          const newUser = {
            display_name: values.name,
            email: values.email,
            city: values.city,
          };
          await updateDoc(docRef, newUser);
          setLoading(false);
          onDataSubmit('User updated successfully');
        }
      } catch (err) {
        console.log('firebaseEerro', err);
        setErrorMessage('Email already exists');
        setSuccessMessage('');
        handleOpenSnackBar();
        setLoading(false);
      }
    },
  });
  const { errors, touched, isSubmitting, handleSubmit, getFieldProps } = formik;

  const handleShowPassword = () => {
    setShowPassword((show) => !show);
  };

  const handleChange = (event) => {
    formik.setFieldValue('city', event.target.value);
  };

  return (
    <div>
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
            {initialValues ? 'Update User' : 'New User'}
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
              autoComplete="off"
              value={formik.values.email}
              onChange={formik.handleChange}
              disabled={!!initialValues}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
          </Grid>
          {!initialValues ? (
            <Grid item xs={12} lg={12} margin={2}>
              <TextField
                fullWidth
                autoComplete="current-password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                {...getFieldProps('password')}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleShowPassword} edge="end">
                        <Icon icon={showPassword ? eyeFill : eyeOffFill} />
                      </IconButton>
                    </InputAdornment>
                  ),
                  disableUnderline: true,
                }}
                error={Boolean(touched.password && errors.password)}
                helperText={touched.password && errors.password}
                inputProps={{
                  'data-testid': 'password-input',
                }}
              />
            </Grid>
          ) : null}

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
            <LoadingButton
              loading={loading}
              loadingPosition="start"
              variant="contained"
              startIcon={<SaveIcon />}
              color="primary"
              fullWidth
              type="submit"
              form="profileForm"
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

export default NewUserForm;
