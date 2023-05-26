import React, { useState, useEffect } from 'react';
import { Field, useFormik } from 'formik';
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

const NewBuyerForm = ({ initialValues, handleClose, onDataSubmit }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentDate = new Date();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const year = currentDate.getFullYear();
  const auth = getAuth();
  const formattedDate = `${month}-${year}`;
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const firestore = getFirestore(app);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const handleOpenSnackBar = () => setOpenSnackBar(true);
  const handleCloseSnackBar = () => setOpenSnackBar(false);

  const buyerFormValidationSchema = yup.object({
    BuyerName: yup.string('Enter Buyer name').required('Buyer name is required'),
    ContactPerson: yup.string('Enter ContactPerson').required('Contact Person is required'),
    Address: yup.string('Enter Address').required('Address is required'),
    GSTIN: yup.string('Enter GSTIN'),
    ContactNumber: yup
      .string('Enter Contact Number')
      .required('Contact Number is required')
      .max(10, 'Must be less than 10 characters'),
    Location: yup.string('Select Location').required('Location is required'),
  });

  const formik = useFormik({
    initialValues: {
      id: initialValues?.id,
      BuyerName: initialValues?.BuyerName || '',
      ContactPerson: initialValues?.ContactPerson || '',
      Location: initialValues?.Location || '',
      Address: initialValues?.Address || '',
      ContactNumber: initialValues?.ContactNumber || '',
      GSTIN: initialValues?.GSTIN || '',
    },
    enableReinitialize: true,
    validationSchema: buyerFormValidationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        if (!initialValues) {
          const usersRef = collection(firestore, 'Buyers');
          const docRef = doc(usersRef);
          const newUser = {
            Address: values.Address,
            BuyerName: values.BuyerName,
            ContactNumber: `${values.ContactNumber}`,
            ContactPerson: values.ContactPerson,
            Location: values.Location,
            GSTIN: values.GSTIN || '',
            Status: 'verified',
          };
          await setDoc(docRef, newUser);
          setLoading(false);
        } else {
          const docRef = doc(firestore, 'Buyers', initialValues?.id);
          const newUser = {
            Address: values.Address,
            BuyerName: values.BuyerName,
            ContactNumber: `${values.ContactNumber}`,
            ContactPerson: values.ContactPerson,
            Location: values.Location,
            GSTIN: values.GSTIN || '',
          };
          await updateDoc(docRef, newUser);
          setLoading(false);
        }
        onDataSubmit(initialValues ? 'Buyer updated successfully' : 'Buyer created successfully');
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    },
  });

  const handleChange = (event) => {
    formik.setFieldValue('Location', event.target.value);
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
            {initialValues ? 'Update Buyer' : 'New Buyer'}
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
              id="BuyerName"
              name="BuyerName"
              label="Buyer Name"
              type="text"
              value={formik.values.BuyerName}
              onChange={formik.handleChange}
              error={formik.touched.BuyerName && Boolean(formik.errors.BuyerName)}
              helperText={formik.touched.BuyerName && formik.errors.BuyerName}
            />
          </Grid>
          <Grid item xs={12} lg={12} margin={2}>
            <TextField
              InputProps={{ disableUnderline: true }}
              fullWidth
              id="ContactPerson"
              name="ContactPerson"
              label="Contact Person"
              type="text"
              value={formik.values.ContactPerson}
              onChange={formik.handleChange}
              error={formik.touched.ContactPerson && Boolean(formik.errors.ContactPerson)}
              helperText={formik.touched.ContactPerson && formik.errors.ContactPerson}
            />
          </Grid>
          <Grid item xs={12} lg={12} margin={2}>
            <TextField
              InputProps={{ disableUnderline: true }}
              fullWidth
              id="GSTIN"
              name="GSTIN"
              label="GSTIN"
              type="text"
              value={formik.values.GSTIN}
              onChange={formik.handleChange}
              error={formik.touched.GSTIN && Boolean(formik.errors.GSTIN)}
              helperText={formik.touched.GSTIN && formik.errors.GSTIN}
            />
          </Grid>
          <Grid item xs={12} lg={12} margin={2}>
            <TextField
              InputProps={{ disableUnderline: true }}
              fullWidth
              id="ContactNumber"
              name="ContactNumber"
              label="Contact Number"
              type="number"
              value={formik.values.ContactNumber}
              onChange={formik.handleChange}
              error={formik.touched.ContactNumber && Boolean(formik.errors.ContactNumber)}
              helperText={formik.touched.ContactNumber && formik.errors.ContactNumber}
            />
            <FormHelperText>Please provide your WhatsApp contact number without the "+91" country code.</FormHelperText>
          </Grid>
          <Grid item xs={12} lg={12} margin={2}>
            <TextField
              InputProps={{ disableUnderline: true }}
              fullWidth
              id="Address"
              name="Address"
              label="Address"
              type="text"
              value={formik.values.Address}
              onChange={formik.handleChange}
              error={formik.touched.Address && Boolean(formik.errors.Address)}
              helperText={formik.touched.Address && formik.errors.Address}
            />
          </Grid>
          <Grid item xs={12} lg={12} margin={2}>
            <FormControl fullWidth error={formik?.touched?.Location && formik?.errors?.Location}>
              <InputLabel id="type-label">Location</InputLabel>
              <Select
                labelId="type-label"
                id="Location"
                value={formik.values.Location}
                label="Location"
                onChange={handleChange}
                className={formik?.touched?.Location && formik?.errors?.Location ? 'red-border' : ''}
              >
                <MenuItem value="Pune">Pune</MenuItem>
                <MenuItem value="Mumbai">Mumbai</MenuItem>
                <MenuItem value="Kolkata">Kolkata</MenuItem>
                <MenuItem value="Bangalore">Bangalore</MenuItem>
              </Select>
              <FormHelperText error>{formik?.touched?.Location && formik?.errors?.Location}</FormHelperText>
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

export default NewBuyerForm;
