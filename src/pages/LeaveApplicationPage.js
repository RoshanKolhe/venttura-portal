/* eslint-disable camelcase */
import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
import { sentenceCase } from 'change-case';
import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, getDoc, doc, updateDoc } from 'firebase/firestore';
// @mui
import {
  Card,
  Table,
  Stack,
  Paper,
  Chip,
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
} from '@mui/material';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { app } from '../firebase_setup/firebase';
// components
import { ListHead, ListToolbar } from '../sections/@dashboard/table';
import Label from '../components/label';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
// sections
// mock

// ----------------------------------------------------------------------
const firestore = getFirestore(app);
const TABLE_HEAD = [
  { id: 'store_vet', label: 'Name', alignRight: false },
  { id: 'distributor', label: 'Email', alignRight: false },
  { id: 'total', label: 'Start Date ', alignRight: false },
  { id: 'date', label: 'End Date', alignRight: false },
  { id: 'Reason', label: 'Reason', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
  { id: '' },
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
  console.log('query', query);
  if (query) {
    return filter(array, (_user) => _user?.creator.display_name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function OrdersPage() {
  const [open, setOpen] = useState(null);
  const navigate = useNavigate();
  const [page, setPage] = useState(0);

  const [selectedRow, setSelectedRow] = useState();

  const [order, setOrder] = useState('asc');

  const [orders, setOrders] = useState([]);

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const db = getFirestore();

  const handleOpenMenu = (event, row) => {
    setOpen(event.currentTarget);
    setSelectedRow(row);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };
  const handleChangeStatusApprove = (e, selectedRow) => {
    // console.log('Application state changed Approve Event', e);
    // console.log('Application state changed Approve ', selectedRow);
    const docRef = doc(firestore, 'leaveApplication', selectedRow.id);

    const newUser = {
      isApproved: 1,
    };
    updateDoc(docRef, newUser)
      .then(() => {
        console.log('Application state changed to Approve', selectedRow);
        fetchData();
        handleCloseMenu();
      })
      .catch((error) => {
        console.error('Error updating document:', error);
      });
  };
  const handleChangeStatusReject = (e, selectedRow) => {
    // console.log('Application state changed Reject Event', e);
    // console.log('Application state changed Reject ', selectedRow);
    const docRef = doc(firestore, 'leaveApplication', selectedRow.id);

    const newUser = {
      isApproved: 2,
    };
    updateDoc(docRef, newUser)
      .then(() => {
        console.log('Application state changed to Rejected', selectedRow);
        fetchData();
        handleCloseMenu();
      })
      .catch((error) => {
        console.error('Error updating document:', error);
      });
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = orders.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
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
  const handleOnReload = (event) => {
    fetchData();
    console.log('OnReload');
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - orders.length) : 0;

  const filteredUsers = applySortFilter(orders, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredUsers.length && !!filterName;

  // ################################################
  const fetchData = async () => {
    const querySnapshot = await getDocs(collection(db, 'leaveApplication'));
    const results = [];

    console.log('leaveApplication Snapshot :', querySnapshot);
    await Promise.all(
      querySnapshot.docs.map(async (element) => {
        const data = element.data();
        console.log('DATA :', data);
        const id = element.id;
        if (data.creator) {
          if (data.creator) {
            const referenceDoc = doc(db, data.creator.path);
            const referenceDocSnap = await getDoc(referenceDoc);
            const referenceData = referenceDocSnap.data();

            data.creator = referenceData;
          }

          results.push({ id, ...data });
          // spread operator
        }
      })
    );
    setOrders(results);
    console.log('Leave ', results);
  };

  const getFormattedDate = (orderDate) => {
    if (orderDate) {
      const date = new Date(orderDate.seconds * 1000 + orderDate.nanoseconds / 1000000);
      const formattedDate = date.toLocaleString(); //  change the format to your preferred date format
      return formattedDate;
    }
    return '';
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <Helmet>
        <title> Leave Applications | Admin </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Leave Applications
          </Typography>
          {/* <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />}>
            New User
          </Button> */}
        </Stack>

        <Card>
          <ListToolbar
            numSelected={selected.length}
            filterName={filterName}
            onFilterName={handleFilterByName}
            onReload={handleOnReload}
          />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <ListHead
                  isCheckbox={false}
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={orders.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const {
                      uid,
                      creator,
                      dateCreated,
                      endDate,
                      reaseon,
                      startDate,
                      display_name,
                      email,
                      isApproved,
                      city,
                    } = row;

                    const selectedUser = selected.indexOf(row?.dateCreated) !== -1;

                    return (
                      <TableRow hover key={row?.dateCreated} tabIndex={-1} role="checkbox" selected={selectedUser}>
                        {/* <TableCell padding="checkbox">
                          <Checkbox checked={selectedUser} onChange={(Reject) => handleClick(event, row?.OrderId)} />
                        </TableCell> */}
                        <TableCell component="th" scope="row">
                          <Typography variant="subtitle2" noWrap>
                            {creator?.display_name}
                          </Typography>
                        </TableCell>
                        <TableCell align="left">{creator?.email}</TableCell>
                        <TableCell align="left">{getFormattedDate(startDate)}</TableCell>
                        <TableCell align="left">{getFormattedDate(endDate)}</TableCell>
                        <TableCell align="left">{reaseon}</TableCell>
                        {/* <TableCell align="left">{isApproved}</TableCell> */}

                        <TableCell align="left">
                          {isApproved === 0 && (
                            <Chip label="Pending" style={{ backgroundColor: 'rgb(255 206 19)', color: 'white' }} />
                          )}
                          {isApproved === 1 && (
                            <Chip label="Approved" style={{ backgroundColor: '#5cb85c', color: 'white' }} />
                          )}
                          {isApproved === 2 && (
                            <Chip label="Rejected" style={{ backgroundColor: '#d9534f', color: 'white' }} />
                          )}
                        </TableCell>
                        <TableCell align="left">
                          {/* label="Approved"
                            style={{ backgroundColor: isApproved === 0 ? 'rgb(255, 72, 66)' : '',
                              color: 'black',
                            }} */}
                          {/* <Label color={(status === 'banned' && 'error') || 'success'}>{sentenceCase(status)}</Label> */}
                          {/* {status} */}
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
            count={orders.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
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
        <MenuItem onClick={(e) => handleChangeStatusApprove(e, selectedRow)}>
          <DoneIcon sx={{ mr: 2, color: 'success.main' }} />
          {/* <Icon
            icon="material-symbols:order-approve-sharp"
            style={{ marginRight: '5px' }}
            sx={{ color: 'success.main' }}
          /> */}
          Approve
        </MenuItem>
        <MenuItem onClick={(e) => handleChangeStatusReject(e, selectedRow)}>
          <CloseIcon sx={{ mr: 2, color: 'error.main' }} />
          {/* <Icon
            icon="fluent:text-change-reject-24-filled"
            style={{ marginRight: '5px' }}
            sx={{ color: 'error.main' }}
          /> */}
          Reject
        </MenuItem>

        {/* <MenuItem sx={{ color: 'error.main' }}>
          <Iconify icon={'eva:trash-2-outline'} sx={{ mr: 2 }} />
          Delete
        </MenuItem> */}
      </Popover>
    </>
  );
}
