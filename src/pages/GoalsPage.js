/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint-disable object-shorthand */
import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
import { sentenceCase } from 'change-case';
import { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, getDoc, doc, updateDoc } from 'firebase/firestore';
// @mui
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
  Modal,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
// components
import CustomBox from '../common/CustomBox';
import NewGoalForm from '../components/newGoalForm/NewGoalForm';
import { getCurrentMonthAndYear } from '../utils/constants';
import { app } from '../firebase_setup/firebase';
import { ListHead, ListToolbar } from '../sections/@dashboard/table';
import Label from '../components/label';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
// sections
// mock

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'product_name', label: 'Product Name', alignRight: false },
  { id: 'variation', label: 'Variation', alignRight: false },
  { id: 'goal_quantity', label: 'Goal Quantity', alignRight: false },
  { id: 'quantity_achieved', label: 'Quantity Achieved', alignRight: false },
];

// ----------------------------------------------------------------------

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
    return filter(
      array,
      (_user) => _user.productrefrence.productRefrence?.ProductName.toLowerCase().indexOf(query.toLowerCase()) !== -1
    );
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
}));

export default function GolasPage() {
  const [open, setOpen] = useState(null);
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [msg, setMsg] = useState('');
  const [openModal, setOpenMdal] = useState(false);
  const params = useParams();
  const [selectedRow, setSelectedRow] = useState();
  const [goalQuantity, setGoalQuantity] = useState(0);
  const [usersGoalsData, setUserGoalsData] = useState([]);
  const [userAllGoals, setUserAllGoals] = useState([]);
  const [updateStateData, setUpdateStateData] = useState([]);
  const [order, setOrder] = useState('asc');

  const handleOpen = () => setOpenMdal(true);

  const handleClose = () => setOpenMdal(false);

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openSnackBar, setOpenSnackBar] = useState(false);

  const handleOpenSnackBar = () => setOpenSnackBar(true);
  const handleCloseSnackBar = () => setOpenSnackBar(false);
  const [currentMonthAndYear, setCurrentMonthAndYear] = useState(getCurrentMonthAndYear());
  const db = getFirestore(app);
  const classes = useStyles();
  const handleOpenMenu = (event, row) => {
    setOpen(event.currentTarget);
    setSelectedRow(row);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };
  const handleViewPopUpClick = () => {
    console.log('popup');
    console.log(selectedRow);
    navigate(`/orders/${selectedRow.id}`);
  };
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = usersGoalsData.map((n) => n.name);
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
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - usersGoalsData.length) : 0;

  const filteredUsers = applySortFilter(usersGoalsData, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredUsers.length && !!filterName;

  const customConverter = {
    fromFirestore: async function (snapshot, options) {
      const data = snapshot.data(options);
      if (data.goals) {
        const filteredData = [];
        let i = 0;
        const currentMonthGoals = data.goals.find((obj) =>
          Object.prototype.hasOwnProperty.call(obj, currentMonthAndYear)
        )[currentMonthAndYear];
        currentMonthGoals.forEach((res) => {
          filteredData.push({
            ...res,
            id: i,
          });
          i++;
        });

        setUpdateStateData(filteredData);
        const promises = currentMonthGoals.map(async (reference) => {
          const referenceDocRef = doc(db, 'Variation', reference.productrefrence.id);
          const referenceDocSnap = await getDoc(referenceDocRef);
          if (referenceDocSnap.exists()) {
            reference.productrefrence = referenceDocSnap.data();

            if (reference.productrefrence.productRefrence) {
              const referenceChildDocRef = doc(db, 'Products', reference.productrefrence.productRefrence.id);

              const referenceDocChildSnap = await getDoc(referenceChildDocRef);
              if (referenceDocChildSnap.exists()) {
                reference.productrefrence.productRefrence = referenceDocChildSnap.data();
              } else {
                console.log('Child document does not exist!');
              }
            }
          } else {
            console.log('Referenced document does not exist!');
          }
        });
        await Promise.all(promises);
      }
      return data;
    },
    toFirestore: function (data, options) {
      return data;
    },
  };

  const fetchData = async () => {
    try {
      const docRef = doc(db, 'users', params.id).withConverter(customConverter);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log(data);
        data.then((res) => {
          if (res.goals && res.goals.length) {
            setUserAllGoals(res.goals);
            const currentMonthGoals = res.goals.find((obj) =>
              Object.prototype.hasOwnProperty.call(obj, currentMonthAndYear)
            )[currentMonthAndYear];
            const filteredData = [];
            let i = 0;
            currentMonthGoals.forEach((res) => {
              filteredData.push({
                ...res,
                id: i,
              });
              i++;
            });
            setUserGoalsData(filteredData);
          }
        });
        return;
      }
      setUserGoalsData([]);
      console.error('No such document!');
    } catch (error) {
      console.error('Error getting document: ', error);
    }
  };

  const handleGoalUpdate = async (e, row) => {
    console.log(userAllGoals);
    const userAllGoalsData = userAllGoals;
    const docRef = doc(db, 'users', params?.id);
    const updatedData = updateStateData.map(({ id, ...rest }) => rest);

    const newUser = {
      goals: [{ [currentMonthAndYear]: updatedData }],
    };
    console.log(newUser);
    await updateDoc(docRef, newUser);
  };

  const handleItemChanged = (e, row, targetField) => {
    const foundIndex = usersGoalsData.findIndex((x) => x.id === row.id);
    console.log(foundIndex);
    const rowData = usersGoalsData[foundIndex];
    const updatedData = { ...rowData, [targetField]: parseFloat(e.target.value) };
    const updatedFilteredGoals = usersGoalsData.map((item, index) => {
      if (index === foundIndex) return { ...updatedData };
      return { ...item };
    });
    const rowStateData = updateStateData[foundIndex];
    const updatedrowStateData = { ...rowStateData, [targetField]: parseFloat(e.target.value) };
    const updatedStateGoals = updateStateData.map((item, index) => {
      if (index === foundIndex) return { ...updatedrowStateData };
      return { ...item };
    });
    console.log('updatedStateGoals', updatedStateGoals);
    console.log('updatedFilteredGoals', updatedFilteredGoals);

    setUpdateStateData(updatedStateGoals);
    setUserGoalsData(updatedFilteredGoals);
  };

  const getFormattedDate = (orderDate) => {
    if (orderDate) {
      const date = new Date(orderDate.seconds * 1000 + orderDate.nanoseconds / 1000000);
      const formattedDate = date.toLocaleString(); // change the format to your preferred date format
      return formattedDate;
    }
    return '';
  };

  useEffect(() => {
    fetchData();
  }, [params.id]);

  return (
    <>
      <Helmet>
        <title> Goals | Admin </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Goals
          </Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={() => {
              handleOpen();
            }}
          >
            New Goals
          </Button>
        </Stack>

        <Card>
          <ListToolbar
            isFilter
            numSelected={selected.length}
            filterName={filterName}
            onFilterName={handleFilterByName}
          />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <ListHead
                  isCheckbox={false}
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={usersGoalsData.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const { goalQuantity, productrefrence, quantity, OrderDate, totalAmount } = row;
                    const selectedUser = selected.indexOf(row?.id) !== -1;

                    return (
                      <TableRow hover key={row?.id} tabIndex={-1} role="checkbox" selected={selectedUser}>
                        {/* <TableCell padding="checkbox">
                          <Checkbox checked={selectedUser} onChange={(event) => handleClick(event, row?.id)} />
                        </TableCell> */}

                        <TableCell component="th" scope="row">
                          <Typography variant="subtitle2" noWrap>
                            {productrefrence?.productRefrence?.ProductName}
                          </Typography>
                        </TableCell>

                        <TableCell align="left">{productrefrence?.variationName}</TableCell>

                        <TableCell align="left">
                          <TextField
                            InputProps={{ disableUnderline: true }}
                            fullWidth
                            id="name"
                            className={`form-control ${classes.textField}`}
                            variant="standard"
                            type="text"
                            value={goalQuantity}
                            onChange={(e) => handleItemChanged(e, row, 'goalQuantity')}
                            onBlur={(e) => {
                              handleGoalUpdate(e, row);
                            }}
                          />
                        </TableCell>

                        <TableCell align="left">{quantity}</TableCell>
                      </TableRow>
                    );
                  })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>

                {isNotFound && usersGoalsData.length === 0 && (
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
            count={usersGoalsData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
        <Modal
          open={openModal}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <CustomBox>
            <NewGoalForm
              handleClose={handleClose}
              onDataSubmit={(msg) => {
                handleClose();
                fetchData();
                setMsg(msg);
                handleOpenSnackBar();
              }}
              initialValues={selectedRow}
            />
          </CustomBox>
        </Modal>
      </Container>

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
        <MenuItem onClick={() => handleViewPopUpClick()}>
          <Iconify icon={'eva:edit-fill'} sx={{ mr: 2 }} />
          View
        </MenuItem>

        {/* <MenuItem sx={{ color: 'error.main' }}>
          <Iconify icon={'eva:trash-2-outline'} sx={{ mr: 2 }} />
          Delete
        </MenuItem> */}
      </Popover>
    </>
  );
}
