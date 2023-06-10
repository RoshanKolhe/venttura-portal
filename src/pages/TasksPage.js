/* eslint-disable no-unreachable */
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
import axiosInstance from '../helpers/axios';
import CustomBox from '../common/CustomBox';
import NewGoalForm from '../components/newGoalForm/NewGoalForm';
import { getCurrentMonthAndYear } from '../utils/constants';
import { app } from '../firebase_setup/firebase';
import { ListHead, ListToolbar } from '../sections/@dashboard/table';
import Label from '../components/label';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
import CommonSnackBar from '../common/CommonSnackBar';
// sections
// mock

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'Title', label: 'Title', alignRight: false },
  { id: 'Notes', label: 'Notes', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
  { id: 'TaskDateAndTime', label: 'Task Date', alignRight: false },
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
    return filter(array, (_user) => _user?.Title.toLowerCase().indexOf(query.toLowerCase()) !== -1);
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

export default function TasksPage() {
  const [open, setOpen] = useState(null);
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [msg, setMsg] = useState('');
  const [openModal, setOpenMdal] = useState(false);
  const params = useParams();
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [selectedRow, setSelectedRow] = useState();
  const [usersTasksData, setUserTasksData] = useState([]);
  const [order, setOrder] = useState('asc');

  const handleOpen = () => setOpenMdal(true);

  const handleClose = () => setOpenMdal(false);

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openSnackBar, setOpenSnackBar] = useState(false);

  const handleOpenSnackBar = () => setOpenSnackBar(true);
  const handleCloseSnackBar = () => setOpenSnackBar(false);
  const [currentMonthAndYear, setCurrentMonthAndYear] = useState(getCurrentMonthAndYear());
  const classes = useStyles();

  const handleCloseMenu = () => {
    setOpen(null);
  };
  const handleViewPopUpClick = () => {
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
      const newSelecteds = usersTasksData.map((n) => n.name);
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
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - usersTasksData.length) : 0;

  const filteredUsers = applySortFilter(usersTasksData, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredUsers.length && !!filterName;

  const handleGoalUpdate = async (e, row) => {
    const updatedData = usersTasksData.map(({ id, ...rest }) => rest);
    const payloadData = {
      userId: params.id,
      userGoals: updatedData,
      currentMonthAndYear: currentMonthAndYear,
    };
    axiosInstance
      .post('/addUpdateNewUserGoals', payloadData)
      .then((res) => {})
      .catch((err) => {});
  };

  const fetchData = () => {
    setUserTasksData([]);
    const inputData = {
      userId: params.id,
      startDate: startDate,
      endDate: endDate,
    };
    axiosInstance
      .post('/getUserTasks', inputData)
      .then((res) => {
        setUserTasksData(res.data);
      })
      .catch((err) => {
        setUserTasksData([]);
      });
  };

  const handleReload = () => {
    fetchData();
  };

  const getFormattedDate = (firebaseDate) => {
    if (firebaseDate) {
      const date = new Date(firebaseDate._seconds * 1000 + firebaseDate._nanoseconds / 1000000);
      const formattedDate = date.toLocaleString(); //  change the format to your preferred date format
      return formattedDate;
    }
    return '';
  };
  console.log(isNotFound);
  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [params.id]);

  return (
    <>
      <Helmet>
        <title> Tasks | Admin </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Tasks
          </Typography>
          {/* <Button
            variant="contained"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={() => {
              handleOpen();
            }}
          >
            New Tasks
          </Button> */}
        </Stack>

        <Card>
          <ListToolbar
            isFilter
            isDateRange
            numSelected={selected.length}
            filterName={filterName}
            onFilterName={handleFilterByName}
            onReload={handleReload}
            startDate={startDate}
            endDate={endDate}
            setEndDate={setEndDate}
            setStartDate={setStartDate}
          />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <ListHead
                  isCheckbox={false}
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={usersTasksData.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const { Title, Notes, TaskDateAndTime, isOrdered, status } = row;
                    const selectedUser = selected.indexOf(row?.id) !== -1;

                    return (
                      <TableRow hover key={row?.id} tabIndex={-1} role="checkbox" selected={selectedUser}>
                        {/* <TableCell padding="checkbox">
                          <Checkbox checked={selectedUser} onChange={(event) => handleClick(event, row?.id)} />
                        </TableCell> */}

                        <TableCell component="th" scope="row">
                          <Typography variant="subtitle2" noWrap>
                            {Title}
                          </Typography>
                        </TableCell>

                        <TableCell align="left">{Notes}</TableCell>

                        <TableCell align="left">{status}</TableCell>

                        <TableCell align="left">{getFormattedDate(TaskDateAndTime)}</TableCell>
                      </TableRow>
                    );
                  })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>

                {isNotFound || (usersTasksData && usersTasksData.length === 0) ? (
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
                            <br /> Try changing the start date or end date
                          </Typography>
                        </Paper>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                ) : null}
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={usersTasksData.length}
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
        <CommonSnackBar
          openSnackBar={openSnackBar}
          handleCloseSnackBar={handleCloseSnackBar}
          msg={msg}
          severity="success"
        />
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
