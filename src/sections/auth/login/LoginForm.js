/* eslint-disable react/jsx-no-duplicate-props */
import eyeFill from '@iconify/icons-eva/eye-fill';
import eyeOffFill from '@iconify/icons-eva/eye-off-fill';
import { Icon } from '@iconify/react';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import { LoadingButton } from '@mui/lab';
// material
import {
  Checkbox,
  Container,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Form, FormikProvider, useFormik } from 'formik';
import { useState } from 'react';
import { Link as RouterLink, Link, useNavigate } from 'react-router-dom';

import * as Yup from 'yup';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { app } from '../../../firebase_setup/firebase';
import CommonSnackBar from '../../../common/CommonSnackBar';

// ----------------------------------------------------------------------

export default function LoginForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const auth = getAuth();
  const db = getFirestore(app);
  const handleOpenSnackBar = () => setOpenSnackBar(true);
  const handleCloseSnackBar = () => setOpenSnackBar(false);
  const LoginSchema = Yup.object().shape({
    email: Yup.string().email('Email must be a valid email address').required('Email is required'),
    password: Yup.string()
      .required('Password is required')
      .min(8, 'Password is too short - should be 8 chars minimum.')
      .matches(
        // eslint-disable-next-line no-useless-escape
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
        'Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character'
      ),
  });

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      remember: true,
    },
    validationSchema: LoginSchema,
    onSubmit: async (values) => {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
        const docRef = doc(db, 'users', userCredential?.user?.uid); // Replace 'yourCollectionName' with the name of your collection
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data && data.permissions && data.permissions.includes('admin')) {
            localStorage.setItem('user', JSON.stringify(data));
            navigate('/dashboard', { replace: true });
          } else {
            localStorage.removeItem('user');
            setErrorMessage('Not Enough Permissions');
            handleOpenSnackBar();
          }
        } else {
          console.error('No such document!');
        }
      } catch (error) {
        console.log(error);
        setErrorMessage('Wrong email id or password');
        handleOpenSnackBar();
      }
    },
  });

  const { errors, touched, isSubmitting, handleSubmit, getFieldProps } = formik;

  const handleShowPassword = () => {
    setShowPassword((show) => !show);
  };

  return (
    <Container maxWidth="xl">
      <FormikProvider value={formik}>
        <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              InputProps={{ disableUnderline: true }}
              fullWidth
              autoComplete="username"
              type="email"
              label="Email address"
              {...getFieldProps('email')}
              error={Boolean(touched.email && errors.email)}
              helperText={touched.email && errors.email}
              inputProps={{
                'data-testid': 'email-input',
              }}
            />

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
          </Stack>

          <LoadingButton
            fullWidth
            size="large"
            onClick={formik.handleSubmit}
            variant="contained"
            loading={isSubmitting}
            sx={{ marginTop: '1rem' }}
          >
            Login
          </LoadingButton>
        </Form>
      </FormikProvider>

      <CommonSnackBar
        openSnackBar={openSnackBar}
        handleCloseSnackBar={handleCloseSnackBar}
        msg={errorMessage}
        severity="error"
      />
    </Container>
  );
}
