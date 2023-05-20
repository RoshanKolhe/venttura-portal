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
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DoneIcon from '@mui/icons-material/Done';
// components
import { ErrorMessage } from 'formik';
import CommonSnackBar from '../common/CommonSnackBar';
import { getCurrentMonthRange, getDatesInRange } from '../utils/constants';
import { app } from '../firebase_setup/firebase';
import { ListHead, ListToolbar } from '../sections/@dashboard/table';
import Label from '../components/label';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';

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
    return filter(array, (_user) => _user?.display_name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
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

export default function AttendancePage() {
  const [open, setOpen] = useState(null);
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const params = useParams();
  const [selectedRow, setSelectedRow] = useState();
  const [datesRange, setDatesRange] = useState([]);
  const [usersWithAttendance, setUsersWithAttendance] = useState([]);
  const [updateStateData, setUpdateStateData] = useState([]);
  const [order, setOrder] = useState('asc');
  const [tableHead, setTableHead] = useState([]);
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [selected, setSelected] = useState([]);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarErrorMsg, setSnackbarErrorMsg] = useState('');

  const [orderBy, setOrderBy] = useState('name');

  const [openSnackBar, setOpenSnackBar] = useState(false);

  const [filterName, setFilterName] = useState('');
  const currentDate = new Date().toISOString().split('T')[0];
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleOpenSnackBar = () => setOpenSnackBar(true);

  const handleCloseSnackBar = () => setOpenSnackBar(false);

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
    navigate(`/orders/${selectedRow.id}`);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = usersWithAttendance.map((n) => n.name);
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
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - usersWithAttendance.length) : 0;

  const filteredUsers = applySortFilter(usersWithAttendance, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredUsers.length && !!filterName;

  const fetchData = async () => {
    try {
      // Fetch the users collection
      const usersQuerySnapshot = await getDocs(collection(db, 'users'));

      // Create an object to store the merged data
      const mergedData = [];

      // Iterate over each user document
      // eslint-disable-next-line no-restricted-syntax
      for (const userDoc of usersQuerySnapshot.docs) {
        const userId = userDoc.id;
        const user = userDoc.data();

        // Fetch the attendance subcollection for each user
        const attendanceQuerySnapshot = await getDocs(collection(db, 'users', userId, 'attendance'));

        const attendanceData = [];

        // eslint-disable-next-line no-restricted-syntax
        for (const attendanceDoc of attendanceQuerySnapshot.docs) {
          const attendance = attendanceDoc.data();
          attendanceData.push(attendance);
        }
        const mergedUser = { ...user, attendance: attendanceData };
        
        mergedData.push(mergedUser);
      }
      const filteredData = mergedData.filter(obj => !obj.permissions || !obj.permissions.includes("admin"));
      setUsersWithAttendance(filteredData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleApproveAttendance = async (userData, date) => {
    const documentRef = doc(db, 'users', userData?.uid);
    const subcollectionRef = collection(documentRef, 'attendance');
    const subdocumentRef = doc(subcollectionRef, date);
    const attendanceData = {
      status: 1,
    };
    await updateDoc(subdocumentRef, attendanceData);
    fetchData();
  };

  const handleRejectAttendance = async (userData, date) => {
    try {
      const documentRef = doc(db, 'users', userData?.uid);
      const subcollectionRef = collection(documentRef, 'attendance');
      const subdocumentRef = doc(subcollectionRef, date);
      const attendanceData = {
        status: 2,
      };
      await updateDoc(subdocumentRef, attendanceData);
      setSnackbarMsg('Attendance rejected successfully');
      setSnackbarErrorMsg('');
      handleOpenSnackBar();
      fetchData();
    } catch (err) {
      setSnackbarMsg('');
      setSnackbarErrorMsg(err);
      handleOpenSnackBar();
    }
  };

  const generateTableRow = (userData) => {
    const userTableRow = [];
    datesRange.forEach((date) => {
      if (userData.attendance && userData.attendance.length > 0) {
        const attendanceData = userData.attendance.find((attendance) => attendance.date === date);
        if (date <= currentDate) {
          if (attendanceData?.status === 0) {
            userTableRow.push(
              <>
                <TableCell align="left">
                  <Avatar className={`${classes.present}`}>P</Avatar>
                  {!attendanceData?.status ? (
                    <>
                      <div style={{ display: 'flex' }}>
                        <IconButton
                          color="primary"
                          size="small"
                          sx={{ p: 0, width: '25px', height: '25px' }}
                          onClick={() => {
                            handleApproveAttendance(userData, date);
                          }}
                        >
                          <CheckCircleIcon sx={{ fontSize: '25px' }} />
                        </IconButton>
                        <IconButton
                          color="error"
                          size="small"
                          sx={{ p: 0, width: '25px', height: '25px' }}
                          onClick={() => {
                            handleRejectAttendance(userData, date);
                          }}
                        >
                          <CancelIcon sx={{ fontSize: '25px' }} />
                        </IconButton>
                      </div>
                    </>
                  ) : null}
                </TableCell>
              </>
            );
          } else if (attendanceData?.status === 1) {
            userTableRow.push(
              <TableCell align="left">
                <Avatar className={`${classes.present}`}>P</Avatar>
              </TableCell>
            );
          } else if (attendanceData?.status === 2) {
            userTableRow.push(
              <TableCell align="left">
                <Avatar className={`${classes.absent}`}>R</Avatar>
              </TableCell>
            );
          } else {
            userTableRow.push(
              <TableCell align="left">
                <Avatar className={`${classes.absent}`}>A</Avatar>
              </TableCell>
            );
          }
        } else {
          userTableRow.push(<TableCell align="left">-</TableCell>);
        }
      } else if (date <= currentDate) {
        userTableRow.push(
          <TableCell align="left">
            <Avatar className={`${classes.absent} ${classes.letter}`}>A</Avatar>
          </TableCell>
        );
      } else {
        userTableRow.push(<TableCell align="left">-</TableCell>);
      }
    });

    return userTableRow;
  };

  const handleReload = () => {
    fetchData();
  };

  useEffect(() => {
    const datesInRange = getDatesInRange(startDate, endDate);
    setDatesRange(datesInRange);
    const tableHeadAray = [];
    datesInRange.forEach((res) => {
      if (res === currentDate) {
        tableHeadAray.push({
          id: res,
          label: res,
          alignRight: false,
          cellStyles: { backgroundColor: 'rgba(145, 158, 171, 0.08)' },
        });
      } else {
        tableHeadAray.push({ id: res, label: res, alignRight: false });
      }
    });
    setTableHead([{ id: 'users', label: 'Users', alignRight: false }, ...tableHeadAray]);
  }, [startDate, endDate]);

  // useEffect(() => {
  //   generateTableRow();
  // }, [usersWithAttendance]);
  useEffect(() => {
    const defaultDates = getCurrentMonthRange();
    setStartDate(new Date());
    setEndDate(new Date());
    fetchData();
  }, []);

  return (
    <>
      <Helmet>
        <title> Attendance | Admin </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Attendance
          </Typography>
          {/* <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />}>
            New Goals
          </Button> */}
        </Stack>

        <Card>
          <ListToolbar
            isFilter
            isDateRange
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
                  headLabel={tableHead}
                  rowCount={usersWithAttendance.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const { productrefrence, quantity, OrderDate, totalAmount } = row;
                    const selectedUser = selected.indexOf(row?.id) !== -1;

                    return (
                      <TableRow hover key={row?.id} tabIndex={-1} role="checkbox" selected={selectedUser}>
                        {/* <TableCell padding="checkbox">
                          <Checkbox checked={selectedUser} onChange={(event) => handleClick(event, row?.id)} />
                        </TableCell> */}

                        <TableCell component="th" scope="row">
                          <Typography variant="subtitle2" noWrap>
                            {row.display_name}
                          </Typography>
                        </TableCell>

                        {datesRange.length > 0 ? generateTableRow(row) : null}
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
            count={usersWithAttendance.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
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
