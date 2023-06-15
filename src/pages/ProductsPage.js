/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint-disable object-shorthand */
import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
import { sentenceCase } from 'change-case';
import { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, getDoc, doc, updateDoc } from 'firebase/firestore';
// @mui
import CancelIcon from '@mui/icons-material/Cancel';
import {
  Card,
  Table,
  Stack,
  Paper,
  Avatar,
  Button,
  Popover,
  Checkbox,
  TableRow,
  MenuItem,
  TableBody,
  TableCell,
  Container,
  Typography,
  IconButton,
  TableContainer,
  TablePagination,
  TextField,
  Tooltip,
  Modal,
  Grid,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DoneIcon from '@mui/icons-material/Done';
// components
import { ErrorMessage } from 'formik';
import { FormControlLabel } from '@material-ui/core';
import NewProductForm from '../components/product/NewProductForm';
import axiosInstance from '../helpers/axios';
import CustomBox from '../common/CustomBox';
import CommonSnackBar from '../common/CommonSnackBar';
import { allProductsWIthVariation, getCurrentMonthRange, getDatesInRange } from '../utils/constants';
import { app } from '../firebase_setup/firebase';
import { ListHead, ListToolbar } from '../sections/@dashboard/table';
import Label from '../components/label';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';

const TABLE_HEAD = [
  { id: 'productName', label: 'Product Name', alignRight: false },
  { id: 'variationName', label: 'variation', alignRight: false },
  { id: 'variationPrice', label: 'Price', alignRight: false },
  { id: '' },
];

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(array, (_user) => _user?.productName.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

const useStyles = makeStyles((theme) => ({
  textField: {
    outline: 'none',
    border: 'none',
    width: 'auto',
    minWidth: '180px',
    margin: '0px',
    paddingLeft: '15px',
  },
  absent: {
    backgroundColor: theme.palette.error.main,
    width: '30px',
    height: '30px',
  },
  present: {
    backgroundColor: theme.palette.success.main,
    width: '30px',
    height: '30px',
  },
}));

export default function ProductsPage({ styles }) {
  const [open, setOpen] = useState(null);
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const params = useParams();
  const [selectedRow, setSelectedRow] = useState();
  const [openModal, setOpenMdal] = useState(false);
  const [datesRange, setDatesRange] = useState([]);
  const [productsWithVariation, setProductsWithVariation] = useState([]);
  const [attendanceUserData, setAttendanceUserData] = useState();
  const [order, setOrder] = useState('asc');
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [selected, setSelected] = useState([]);
  const [isChecked, setIsChecked] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarErrorMsg, setSnackbarErrorMsg] = useState('');
  const [labelName, setLabelName] = useState('');

  const [orderBy, setOrderBy] = useState('users');

  const [openSnackBar, setOpenSnackBar] = useState(false);

  const [filterName, setFilterName] = useState('');
  const currentDate = new Date().toISOString().split('T')[0];
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleOpenSnackBar = () => setOpenSnackBar(true);

  const handleCloseSnackBar = () => setOpenSnackBar(false);

  const handleOpen = () => setOpenMdal(true);
  const handleClose = () => setOpenMdal(false);

  const db = getFirestore(app);
  const classes = useStyles();

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = productsWithVariation.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - productsWithVariation.length) : 0;

  const filteredUsers = applySortFilter(productsWithVariation, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredUsers.length && !!filterName;

  const fetchData = async () => {
    try {
      const res = await allProductsWIthVariation();
      const variation = res;

      const filteredData = await Promise.all(
        variation.map(async (reference) => {
          const referenceDocRef = doc(db, 'Variation', reference.productrefrence.id);

          const referenceDocSnap = await getDoc(referenceDocRef);

          if (referenceDocSnap.exists()) {
            reference = {
              ...referenceDocSnap.data(),
            };
            reference.variationId = referenceDocRef.id;

            const productRefId = reference?.productRefrence?.id;
            if (productRefId) {
              const referenceChildDocRef = doc(db, 'Products', productRefId);
              const referenceDocChildSnap = await getDoc(referenceChildDocRef);

              if (referenceDocChildSnap.exists()) {
                reference.productName = referenceDocChildSnap.data().ProductName;
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
      setProductsWithVariation(filteredAndNonNullData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleOpenMenu = (event, row) => {
    setSelectedRow(row);
    setOpen(event.currentTarget);
  };

  const handleItemChanged = (e, row, targetField) => {
    const foundIndex = productsWithVariation.findIndex((x) => x.variationId === row.variationId);
    const rowData = productsWithVariation[foundIndex];
    const updatedData = { ...rowData, [targetField]: parseFloat(e.target.value || 0) };
    const updatedFilteredGoals = productsWithVariation.map((item, index) => {
      if (index === foundIndex) return { ...updatedData };
      return { ...item };
    });
    setProductsWithVariation(updatedFilteredGoals);
  };

  const handleVariationUpdate = async (e, row) => {
    try {
      const docRef = doc(db, 'Variation', row.variationId);
      if (!docRef) {
        throw new Error('Document not found');
      }

      const inputData = {
        variationPrice: row.variationPrice,
      };

      await updateDoc(docRef, inputData);

      setSnackbarMsg('Variation updated successfully');
      setSnackbarErrorMsg('');
      handleOpenSnackBar();
    } catch (error) {
      setSnackbarMsg('');
      setSnackbarErrorMsg('Something went wrong!');
      handleOpenSnackBar();
      console.error('Error updating document: ', error);
    }
  };

  const handleEditClick = () => {
    setOpen(null);
    handleOpen();
  };

  const handleDeleteClick = () => {
    setOpen(null);
    handleOpen();
  };

  const handleReload = () => {
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <Helmet>
        <title> Products | Admin </title>
      </Helmet>

      <Container style={styles}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Products
          </Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={() => {
              setSelectedRow();
              setOpen(null);
              handleOpen();
            }}
          >
            New Product
          </Button>
        </Stack>

        <Card>
          <ListToolbar
            numSelected={selected.length}
            filterName={filterName}
            onFilterName={handleFilterByName}
            startDate={startDate}
            endDate={endDate}
            setEndDate={setEndDate}
            setStartDate={setStartDate}
            onReload={handleReload}
          />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <ListHead
                  isCheckbox={false}
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={productsWithVariation.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const { productName, variationName, variationPrice } = row;
                    const selectedUser = selected.indexOf(row?.id) !== -1;
                    return (
                      <TableRow hover key={row?.id} tabIndex={-1} role="checkbox" selected={selectedUser}>
                        {/* <TableCell padding="checkbox">
                          <Checkbox checked={selectedUser} onChange={(event) => handleClick(event, row?.id)} />
                        </TableCell> */}

                        <TableCell component="th" scope="row">
                          <Typography variant="subtitle2" noWrap>
                            {productName}
                          </Typography>
                        </TableCell>
                        <TableCell component="th" scope="row">
                          <Typography variant="subtitle2" noWrap>
                            {variationName}
                          </Typography>
                        </TableCell>
                        <TableCell component="th" scope="row">
                          <Typography variant="subtitle2" noWrap>
                            <TextField
                              InputProps={{ disableUnderline: true }}
                              fullWidth
                              id="name"
                              variant="standard"
                              type="text"
                              value={variationPrice}
                              onChange={(e) => handleItemChanged(e, row, 'variationPrice')}
                              onBlur={(e) => {
                                handleVariationUpdate(e, row);
                              }}
                            />
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="large"
                            color="inherit"
                            onClick={(e) => {
                              handleOpenMenu(e, row);
                            }}
                          >
                            <Iconify icon={'eva:more-vertical-fill'} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>

                {isNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <Paper
                          sx={{
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="h6" paragraph>
                            Not found
                          </Typography>

                          <Typography variant="body2">
                            No results found for &nbsp;
                            <strong>&quot;{filterName}&quot;</strong>.
                            <br /> Try checking for typos or using complete words.
                          </Typography>
                        </Paper>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={productsWithVariation.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
        <Popover
          open={Boolean(open)}
          anchorEl={open}
          onClose={handleCloseMenu}
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{
            sx: {
              p: 1,
              width: 140,
              '& .MuiMenuItem-root': {
                px: 1,
                typography: 'body2',
                borderRadius: 0.75,
              },
            },
          }}
        >
          <MenuItem onClick={handleEditClick}>
            <Iconify icon={'eva:edit-fill'} sx={{ mr: 2 }} />
            Edit
          </MenuItem>
          <MenuItem sx={{ color: 'error.main' }}>
            <Iconify icon={'eva:trash-2-outline'} sx={{ mr: 2 }} />
            Delete
          </MenuItem>
        </Popover>
        <Modal
          open={openModal}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <CustomBox>
            <NewProductForm
              handleClose={handleClose}
              onDataSubmit={(msg) => {
                handleClose();
                fetchData();
                setSnackbarMsg(msg);
                setSnackbarErrorMsg('');
                handleOpenSnackBar();
              }}
              initialValues={selectedRow}
            />
          </CustomBox>
        </Modal>
      </Container>

      <CommonSnackBar
        openSnackBar={openSnackBar}
        handleCloseSnackBar={handleCloseSnackBar}
        msg={snackbarErrorMsg !== '' ? snackbarErrorMsg : snackbarMsg}
        severity={snackbarErrorMsg !== '' ? 'error' : 'success'}
      />
    </>
  );
}
