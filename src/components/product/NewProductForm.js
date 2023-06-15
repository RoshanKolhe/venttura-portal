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
import { Timestamp, addDoc, collection, doc, getFirestore, setDoc, updateDoc } from 'firebase/firestore';
import { LoadingButton } from '@mui/lab';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { getCurrentMonthAndYear, variationJson } from '../../utils/constants';
import LoadingScreen from '../../common/LoadingScreen';
import CustomBox from '../../common/CustomBox';
import account from '../../_mock/account';
import CommonSnackBar from '../../common/CommonSnackBar';
import { app } from '../../firebase_setup/firebase';

const NewProductForm = ({ initialValues, handleClose, onDataSubmit }) => {
  console.log(initialValues);
  const location = useLocation();
  const navigate = useNavigate();
  const currentDate = new Date();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const year = currentDate.getFullYear();
  const auth = getAuth();
  const { currentUser } = auth;
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
    productName: yup.string('Enter Product Name').required('Product Name is required'),
    variationName: yup.string('Enter Variation Name').required('Variation Name is required'),
    varitaionPrice: yup.string('Enter Varitaion Price').required('Variation Price is required'),
  });

  const formik = useFormik({
    initialValues: {
      id: initialValues?.variationId,
      productName: initialValues?.productName || '',
      variationName: initialValues?.variationName || '',
      varitaionPrice: initialValues?.variationPrice || '',
    },
    enableReinitialize: true,
    validationSchema: userFormValidationSchema,
    onSubmit: async (values) => {
      console.log(values);
      try {
        setLoading(true);
        if (!initialValues) {
          const productData = {
            ProductName: values.productName,
          };
          const docRef = await addDoc(collection(firestore, 'Products'), productData);
          const vriationData = {
            productRefrence: docRef,
            variationName: values.variationName,
            variationPrice: values.varitaionPrice,
          };
          await addDoc(collection(firestore, 'Variation'), vriationData);
          setLoading(false);
          onDataSubmit('New Product created successfully');
        } else {
          const productRef = doc(firestore, 'Products', initialValues?.productRefrence?.id);
          const productData = {
            ProductName: values.productName,
          };

          await updateDoc(productRef, productData);
          console.log(values?.id);
          const variationRef = doc(firestore, 'Variation', values?.id);
          const variationData = {
            productRefrence: productRef,
            variationName: values.variationName,
            variationPrice: values.varitaionPrice,
          };

          await updateDoc(variationRef, variationData);

          setLoading(false);
          onDataSubmit('Product updated successfully');
        }
      } catch (err) {
        console.log(err);
        setErrorMessage('Something went wrong!');
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
      <form onSubmit={formik.handleSubmit} id="productForm">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            p: 1,
            m: 1,
          }}
        >
          <Typography variant="h6" gutterBottom>
            {initialValues ? 'Update Product' : 'New Product'}
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
              id="productName"
              name="productName"
              label="Product Name"
              type="text"
              value={formik.values.productName}
              onChange={formik.handleChange}
              error={formik.touched.productName && Boolean(formik.errors.productName)}
              helperText={formik.touched.productName && formik.errors.productName}
            />
          </Grid>
          <Grid item xs={12} lg={12} margin={2}>
            <TextField
              InputProps={{ disableUnderline: true }}
              fullWidth
              id="variationName"
              name="variationName"
              label="Variation Name"
              type="text"
              value={formik.values.variationName}
              onChange={formik.handleChange}
              error={formik.touched.variationName && Boolean(formik.errors.variationName)}
              helperText={formik.touched.variationName && formik.errors.variationName}
            />
          </Grid>
          <Grid item xs={12} lg={12} margin={2}>
            <TextField
              InputProps={{ disableUnderline: true }}
              fullWidth
              id="varitaionPrice"
              name="varitaionPrice"
              label="Price"
              type="number"
              value={formik.values.varitaionPrice}
              onChange={formik.handleChange}
              error={formik.touched.varitaionPrice && Boolean(formik.errors.varitaionPrice)}
              helperText={formik.touched.varitaionPrice && formik.errors.varitaionPrice}
            />
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
              form="productForm"
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

export default NewProductForm;
