import React, { useState, useEffect, useRef } from 'react';
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
  Modal,
  FormControl,
  Select,
} from '@mui/material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import closefill from '@iconify/icons-eva/close-fill';
import { Timestamp, collection, doc, getDoc, getDocs, getFirestore, setDoc, updateDoc } from 'firebase/firestore';
import { LoadingButton } from '@mui/lab';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import axiosInstance from '../../helpers/axios';
import { WarningPopup } from '../../common/WarningPopup';
import { variationJson } from '../../utils/constants';
import LoadingScreen from '../../common/LoadingScreen';
import CustomBox from '../../common/CustomBox';
import account from '../../_mock/account';
import CommonSnackBar from '../../common/CommonSnackBar';
import { app } from '../../firebase_setup/firebase';
import WarningGoalPopup from '../warningGoalPopup/warningGoalPopup';

const EditOrderForm = ({ initialValues, handleClose, onDataSubmit }) => {
  const currentDate = new Date();
  const [selectedDate, setSelectedDate] = useState(null);
  // const [userAllGoals, setUserAllGoals] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const dateTimePickerRef = useRef(null);
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const [goalsWithProductData, setGoalsWithProductData] = useState([]);
  const [allBuyers, setAllBuyers] = useState([]);
  const [allDistributors, setAllDistributors] = useState([]);
  const [allProductsWithOrderData, setAllProductsWithOrderData] = useState([]);

  const year = currentDate.getFullYear();
  const params = useParams();
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const db = getFirestore(app);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const handleOpenSnackBar = () => setOpenSnackBar(true);
  const handleCloseSnackBar = () => setOpenSnackBar(false);

  const editOrderFormValidationSchema = yup.object({
    status: yup.string('Select status'),
    buyer: yup.string('Select buyer'),
  });

  const formik = useFormik({
    initialValues: {
      status: initialValues?.status || '',
      buyer: initialValues?.BuyerRefrence?.id || '',
      distributor: initialValues?.DistributorRefrence?.id || '',
    },
    enableReinitialize: true,
    validationSchema: editOrderFormValidationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);

        // Check if buyer and distributor references are provided
        if (!values.buyer || !values.distributor) {
          throw new Error('Buyer and distributor references are required.');
        }

        const buyerRef = doc(db, 'Buyers', values.buyer);
        const distributorRef = doc(db, 'Distributor', values.distributor);

        let totalAfterDiscount = 0;
        let totalBeforeDiscount = 0;

        const updatedArray = allProductsWithOrderData.reduce((accumulator, { total, ...res }) => {
          const variationRef = doc(db, 'Variation', res.variationId);

          totalAfterDiscount += total;
          totalBeforeDiscount += res.totalBeforeDiscount;

          const productRef = doc(db, 'Products', res.variationRefrence.productRefrence.id);

          if (total !== 0) {
            accumulator.push({
              ...res,
              DiscountedPrice: total,
              variationRefrence: variationRef,
              productRefrence: productRef,
            });
          }

          return accumulator;
        }, []);

        const inputData = {
          BuyerRefrence: buyerRef,
          DistributorRefrence: distributorRef,
          status: values.status,
          totalAfterDiscount,
          totalBeforeDiscount,
          products: updatedArray,
        };
        const docRef = doc(db, 'Orders', initialValues?.id);
        await updateDoc(docRef, inputData);

        setLoading(false);
        onDataSubmit('Order updated successfully');
      } catch (error) {
        console.error('Error updating order:', error);
        setLoading(false);
        onDataSubmit('Failed to update order. Please try again.');
      }
    },
  });

  const handleItemChanged = (e, row, targetField) => {
    const foundIndex = allProductsWithOrderData.findIndex((x) => x.variationId === row.variationId);
    const rowData = allProductsWithOrderData[foundIndex];
    const updatedData = { ...rowData, [targetField]: parseFloat(e.target.value || 0) };

    const updatedFilteredGoals = allProductsWithOrderData.map((item, index) => {
      if (index === foundIndex)
        return {
          ...updatedData,
          totalBeforeDiscount: updatedData?.quantity * updatedData?.pricePerUnit,
          total:
            updatedData?.quantity * updatedData?.pricePerUnit -
            (updatedData?.percentDiscount / 100) * (updatedData?.quantity * updatedData?.pricePerUnit),
        };
      return { ...item };
    });
    setAllProductsWithOrderData(updatedFilteredGoals);
  };

  const handleCancelClick = () => {
    setOpenModal(false);
  };

  const handleChange = (event) => {
    formik.setFieldValue('status', event.target.value);
  };

  const handleChangeBuyer = (event) => {
    formik.setFieldValue('buyer', event.target.value);
  };

  const handleChangeDistributor = (event) => {
    formik.setFieldValue('distributor', event.target.value);
  };

  useEffect(() => {
    const fetchData = async () => {
      const productsWithDiscountAndTotal = [];

      await Promise.all(
        goalsWithProductData.map(async (res) => {
          const variationRef = doc(db, 'Variation', res.id);
          const variationDocumentSnapshot = await getDoc(variationRef);
          const matchingObj1 = initialValues.products.find((obj1) => obj1.variationId === res.id);
          let inputData;
          if (matchingObj1) {
            inputData = {
              ...matchingObj1,
              productRefrence: res?.productrefrence,
              total:
                matchingObj1?.totalBeforeDiscount -
                (matchingObj1?.percentDiscount / 100) * matchingObj1?.totalBeforeDiscount,
            };
          } else {
            inputData = {
              DiscountedPrice: 0,
              percentDiscount: 0,
              pricePerUnit: res.productrefrence.variationPrice,
              quantity: 0,
              total: 0,
              totalBeforeDiscount: 0,
              variationId: res.id,
              variationRefrence: variationDocumentSnapshot.data(),
              productRefrence: res.productrefrence,
            };
          }
          productsWithDiscountAndTotal.push(inputData);
        })
      );

      setAllProductsWithOrderData(productsWithDiscountAndTotal);
    };

    fetchData();
  }, [initialValues.products.length, goalsWithProductData]);

  useEffect(() => {
    const fetchDataVariation = async () => {
      try {
        const res = await variationJson();
        const variation = res;

        const filteredData = await Promise.all(
          variation.map(async (reference) => {
            const referenceDocRef = doc(db, 'Variation', reference.productrefrence.id);
            const referenceDocSnap = await getDoc(referenceDocRef);

            if (referenceDocSnap.exists()) {
              reference.productrefrence = referenceDocSnap.data();
              const productRefId = reference.productrefrence.productRefrence?.id;

              if (productRefId) {
                const referenceChildDocRef = doc(db, 'Products', productRefId);
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

        const filteredAndNonNullData = filteredData.filter(Boolean);
        setGoalsWithProductData(filteredAndNonNullData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const fetchBuyers = async () => {
      const querySnapshot = await getDocs(collection(db, 'Buyers'));

      const updatedDocuments = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setAllBuyers(updatedDocuments);
    };
    const fetchDistributors = async () => {
      const querySnapshot = await getDocs(collection(db, 'Distributor'));

      const updatedDocuments = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setAllDistributors(updatedDocuments);
    };

    fetchDistributors();
    fetchBuyers();
    fetchDataVariation();
  }, []);

  return (
    <div>
      <form onSubmit={formik.handleSubmit} id="editOrderForm">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            p: 1,
            m: 1,
          }}
        >
          <Typography variant="h6" gutterBottom>
            {'Edit Order'}
          </Typography>
          <Tooltip password="Close">
            <IconButton onClick={handleClose}>
              <Icon icon={closefill} />
            </IconButton>
          </Tooltip>
        </Box>
        <Grid container>
          <Grid item xs={12} lg={12} margin={2}>
            <FormControl fullWidth error={formik?.touched?.status && formik?.errors?.status}>
              <InputLabel id="type-label">Status</InputLabel>
              <Select
                labelId="type-label"
                id="status"
                value={formik.values.status}
                label="status"
                onChange={handleChange}
                className={formik?.touched?.status && formik?.errors?.status ? 'red-border' : ''}
              >
                <MenuItem value="placed">Placed</MenuItem>
                <MenuItem value="cancel">Cancel</MenuItem>
                <MenuItem value="complete">Complete</MenuItem>
              </Select>
              <FormHelperText error>{formik?.touched?.status && formik?.errors?.status}</FormHelperText>
            </FormControl>
          </Grid>
          <Grid item xs={12} lg={12} margin={2}>
            <FormControl fullWidth error={formik?.touched?.buyer && formik?.errors?.buyer}>
              <InputLabel id="type-label">Buyer</InputLabel>
              <Select
                labelId="type-label"
                id="buyer"
                value={formik.values.buyer}
                label="buyer"
                onChange={handleChangeBuyer}
                className={formik?.touched?.buyer && formik?.errors?.buyer ? 'red-border' : ''}
              >
                {allBuyers.length > 0
                  ? allBuyers.map((res) => <MenuItem value={res.id}>{res.BuyerName}</MenuItem>)
                  : null}
              </Select>
              <FormHelperText error>{formik?.touched?.buyer && formik?.errors?.buyer}</FormHelperText>
            </FormControl>
          </Grid>
          <Grid item xs={12} lg={12} margin={2}>
            <FormControl fullWidth error={formik?.touched?.distributor && formik?.errors?.distributor}>
              <InputLabel id="type-label">Distributor</InputLabel>
              <Select
                labelId="type-label"
                id="distributor"
                value={formik.values.distributor}
                label="distributor"
                onChange={handleChangeDistributor}
                className={formik?.touched?.distributor && formik?.errors?.distributor ? 'red-border' : ''}
              >
                {allDistributors.length > 0
                  ? allDistributors.map((res) => <MenuItem value={res.id}>{res.VendorName}</MenuItem>)
                  : null}
              </Select>
              <FormHelperText error>{formik?.touched?.distributor && formik?.errors?.distributor}</FormHelperText>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product Name</TableCell>
                    <TableCell>Variation Name</TableCell>
                    <TableCell>Variation Price</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Discount(%)</TableCell>
                    <TableCell>SubTotal</TableCell>
                    <TableCell>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allProductsWithOrderData.map((product) => (
                    <TableRow key={product?.variationId}>
                      <TableCell>{product?.productRefrence?.productRefrence?.ProductName}</TableCell>
                      <TableCell>{product?.productRefrence?.variationName}</TableCell>
                      <TableCell>{product?.productRefrence?.variationPrice}</TableCell>

                      <TableCell>
                        <TextField
                          InputProps={{ disableUnderline: true }}
                          fullWidth
                          id="quantity"
                          variant="standard"
                          type="text"
                          value={product.quantity}
                          onChange={(e) => handleItemChanged(e, product, 'quantity')}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          InputProps={{ disableUnderline: true }}
                          fullWidth
                          id="percentDiscount"
                          variant="standard"
                          type="text"
                          value={product.percentDiscount}
                          onChange={(e) => handleItemChanged(e, product, 'percentDiscount')}
                        />
                      </TableCell>
                      <TableCell>{product?.totalBeforeDiscount || 0}</TableCell>

                      <TableCell>{product?.total || 0}</TableCell>
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
              form="editOrderForm"
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

export default EditOrderForm;
