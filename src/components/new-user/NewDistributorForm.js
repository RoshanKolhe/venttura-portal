import React, { useState, useEffect } from 'react';
import { Field, FieldArray, FormikProvider, useFormik } from 'formik';
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
import { Timestamp, collection, doc, getDocs, getFirestore, setDoc, updateDoc } from 'firebase/firestore';
import { LoadingButton } from '@mui/lab';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { getCurrentMonthAndYear, variationJson } from '../../utils/constants';
import LoadingScreen from '../../common/LoadingScreen';
import CustomBox from '../../common/CustomBox';
import account from '../../_mock/account';
import CommonSnackBar from '../../common/CommonSnackBar';
import { app } from '../../firebase_setup/firebase';

const NewDistributorForm = ({ initialValues, handleClose, onDataSubmit }) => {
  console.log('initialValues', initialValues);
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
  const [allLocations, setAllLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const handleOpenSnackBar = () => setOpenSnackBar(true);
  const handleCloseSnackBar = () => setOpenSnackBar(false);

  const buyerFormValidationSchema = yup.object({
    VendorName: yup.string('Enter Buyer name').required('Buyer name is required'),
    ContactPerson: yup.string('Enter ContactPerson').required('Contact Person is required'),
    Address: yup.string('Enter Address').required('Address is required'),
    GstIn: yup.string('Enter GSTIN'),
    DistrbutorContactNumber: yup
      .string('Enter Distrbutor Contact Number')
      .required(' Distrbutor Contact Number is required'),

    ContactList: yup.array().of(yup.string()),
    location: yup.string('Select location').required('location is required'),
  });

  const formik = useFormik({
    initialValues: {
      id: initialValues?.id,
      VendorName: initialValues?.VendorName || '',
      ContactPerson: initialValues?.ContactPerson || '',
      location: initialValues?.LocationRefrence?.id || '',
      DistrbutorContactNumber: initialValues?.DistrbutorContactNumber || '',
      Address: initialValues?.Address || '',
      ContactList: initialValues?.ContactList || [''],
      GstIn: initialValues?.GSTIN || '',
    },
    enableReinitialize: true,
    validationSchema: buyerFormValidationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        if (!initialValues) {
          const usersRef = collection(firestore, 'Distributor');
          const docRef = doc(usersRef);
          const locationRef = doc(firestore, 'Locations', values.location);
          const newUser = {
            Address: values.Address,
            VendorName: values.VendorName,
            ContactList: values.ContactList,
            ContactPerson: values.ContactPerson,
            DistrbutorContactNumber: values.DistrbutorContactNumber,
            LocationRefrence: locationRef,
            GSTIN: values.GstIn || '',
          };
          await setDoc(docRef, newUser);
          setLoading(false);
        } else {
          const docRef = doc(firestore, 'Distributor', initialValues?.id);
          const locationRef = doc(firestore, 'Locations', values.location);
          const newUser = {
            Address: values.Address,
            VendorName: values.VendorName,
            ContactList: values.ContactList,
            ContactPerson: values.ContactPerson,
            DistrbutorContactNumber: values.DistrbutorContactNumber,
            LocationRefrence: locationRef,
            GSTIN: values.GstIn || '',
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

  const handleChangeLocation = (event) => {
    formik.setFieldValue('location', event.target.value);
  };

  useEffect(() => {
    const fetchLocations = async () => {
      const querySnapshot = await getDocs(collection(firestore, 'Locations'));

      const updatedDocuments = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setAllLocations(updatedDocuments);
    };

    fetchLocations();
  }, []);

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
            {initialValues ? 'Update Distributor' : 'New Distributor'}
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
              id="VendorName"
              name="VendorName"
              label="Distributor Name"
              type="text"
              value={formik.values.VendorName}
              onChange={formik.handleChange}
              error={formik.touched.VendorName && Boolean(formik.errors.VendorName)}
              helperText={formik.touched.VendorName && formik.errors.VendorName}
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
              id="GstIn"
              name="GstIn"
              label="GstIn"
              type="text"
              value={formik.values.GstIn}
              onChange={formik.handleChange}
              error={formik.touched.GstIn && Boolean(formik.errors.GstIn)}
              helperText={formik.touched.GstIn && formik.errors.GstIn}
            />
          </Grid>
          <Grid item xs={12} lg={12} margin={2}>
            <TextField
              InputProps={{ disableUnderline: true }}
              fullWidth
              id="DistrbutorContactNumber"
              name="DistrbutorContactNumber"
              label="Distrbutor Contact Number"
              type="number"
              value={formik.values.DistrbutorContactNumber}
              onChange={formik.handleChange}
              error={formik.touched.DistrbutorContactNumber && Boolean(formik.errors.DistrbutorContactNumber)}
              helperText={formik.touched.DistrbutorContactNumber && formik.errors.DistrbutorContactNumber}
            />
            <FormHelperText>Please provide your WhatsApp contact number without the "+91" country code.</FormHelperText>
          </Grid>
          <Grid item xs={12} lg={12} margin={2}>
            <FormikProvider value={formik}>
              <FieldArray
                name="ContactList"
                render={(arrayHelpers) => (
                  <div>
                    {formik.values.ContactList.map((ContactList, index) => (
                      <div key={index} style={{ display: 'flex', alignItems: 'center', paddingBottom: '20px' }}>
                        <Field
                          as={TextField}
                          name={`ContactList[${index}]`}
                          style={{ width: '85%' }}
                          label="Contact Number"
                        />

                        <Button
                          style={{ marginLeft: '10px' }}
                          type="button"
                          variant="outlined"
                          onClick={() => arrayHelpers.remove(index)}
                        >
                          -
                        </Button>
                      </div>
                    ))}
                    <Button type="button" variant="outlined" onClick={() => arrayHelpers.push('')}>
                      + Add
                    </Button>
                  </div>
                )}
              />
            </FormikProvider>

            {/*  */}
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
            <FormControl fullWidth error={formik?.touched?.location && formik?.errors?.location}>
              <InputLabel id="type-label">Location</InputLabel>
              <Select
                labelId="type-label"
                id="location"
                value={formik.values.location}
                label="Location"
                onChange={handleChangeLocation}
                className={formik?.touched?.location && formik?.errors?.location ? 'red-border' : ''}
              >
                {allLocations.length > 0
                  ? allLocations.map((res) => <MenuItem value={res.id}>{res.locationName}</MenuItem>)
                  : null}
              </Select>
              <FormHelperText error>{formik?.touched?.location && formik?.errors?.location}</FormHelperText>
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

export default NewDistributorForm;
