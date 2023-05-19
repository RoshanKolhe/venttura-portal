import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
import { sentenceCase } from 'change-case';
import { useEffect, useState } from 'react';
import { Link as RouterLink, Navigate, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import plusFill from '@iconify/icons-eva/plus-fill';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
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
  Modal,
  Chip,
} from '@mui/material';
// components
import { collection, doc, getDoc, getDocs, getFirestore, updateDoc } from 'firebase/firestore';
import NewBuyerForm from '../components/new-user/NewBuyerForm';
import CommonSnackBar from '../common/CommonSnackBar';
import NewUserForm from '../components/new-user/NewUserForm';
import Label from '../components/label';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
// sections
import { ListHead, ListToolbar } from '../sections/@dashboard/table';
// mock
import users from '../_mock/user';
import CustomBox from '../common/CustomBox';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Name', alignRight: false },
  { id: 'address', label: 'Address', alignRight: false },
  { id: 'contact', label: 'Contact', alignRight: false },
  { id: 'contactPerson', label: 'Contact Person', alignRight: false },
  { id: 'gstin', label: 'GSTIN', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
  { id: '' },
];

// --------------------------------------------------------------------

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
    return filter(array, (_user) => _user.BuyerName.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function BuyersPage() {
  const [open, setOpen] = useState(null);
  const [msg, setMsg] = useState('');
  const [openModal, setOpenMdal] = useState(false);
  const [page, setPage] = useState(0);
  const navigate = useNavigate();
  const [order, setOrder] = useState('asc');
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [selectedRow, setSelectedRow] = useState();
  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openSnackBar, setOpenSnackBar] = useState(false);

  const handleOpenSnackBar = () => setOpenSnackBar(true);
  const handleCloseSnackBar = () => setOpenSnackBar(false);
  const db = getFirestore();
  const handleOpenMenu = (event, row) => {
    setSelectedRow(row);
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };
  const handleChangeStatusApprove = (e, selectedRow) => {
    const docRef = doc(db, 'Buyers', selectedRow.id);

    const newUser = {
      Status: 'verified',
    };
    updateDoc(docRef, newUser)
      .then(() => {
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
    const docRef = doc(db, 'Buyers', selectedRow.id);

    const newUser = {
      Status: 'rejected',
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
      const newSelecteds = users.map((n) => n.name);
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
  const handleOpen = () => setOpenMdal(true);
  const handleClose = () => setOpenMdal(false);
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - users.length) : 0;

  const filteredUsers = applySortFilter(users, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredUsers.length && !!filterName;

  const fetchData = async () => {
    const querySnapshot = await getDocs(collection(db, 'Buyers'));
    const results = [];
    // eslint-disable-next-line no-restricted-syntax
    querySnapshot.docs.map(async (element) => {
      const data = element.data();
      results.push({ id: element.id, ...data });
    });
    console.log(results);
    setUsers(results);
  };

  const handleEditClick = () => {
    setOpen(null);
    handleOpen();
  };

  const handleGoalClick = () => {
    navigate(`/users/goals/${selectedRow.id}`);
  };
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <Helmet>
        <title> Buyers | Admin </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Buyers
          </Typography>
          <Button
            variant="contained"
            component={RouterLink}
            to="#"
            startIcon={<Icon icon={plusFill} />}
            onClick={() => {
              setSelectedRow();
              handleOpen();
            }}
          >
            New Buyer
          </Button>
        </Stack>

        <Card>
          <ListToolbar numSelected={selected.length} filterName={filterName} onFilterName={handleFilterByName} />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <ListHead
                  isCheckbox={false}
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={users.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const { id, Address, BuyerName: name, ContactNumber, ContactPerson, GSTIN, Location, Status } = row;
                    const selectedUser = selected.indexOf(name) !== -1;

                    return (
                      <TableRow hover key={id} tabIndex={-1} role="checkbox" selected={selectedUser}>
                        {/* <TableCell padding="checkbox">
                          <Checkbox checked={selectedUser} onChange={(event) => handleClick(event, name)} />
                        </TableCell> */}

                        <TableCell component="th" scope="row">
                          <Typography variant="subtitle2" noWrap>
                            {name}
                          </Typography>
                        </TableCell>

                        <TableCell align="left">{Address}</TableCell>

                        <TableCell align="left">{ContactNumber}</TableCell>

                        <TableCell align="left">{ContactPerson}</TableCell>

                        <TableCell align="left">{GSTIN}</TableCell>
                        <TableCell align="left">
                          {Status === 'Requested' && (
                            <Chip label="Requested" style={{ backgroundColor: 'rgb(255 206 19)', color: 'white' }} />
                          )}
                          {Status === 'verified' && (
                            <Chip label="Verified" style={{ backgroundColor: '#5cb85c', color: 'white' }} />
                          )}
                          {Status === 'rejected' && (
                            <Chip label="Rejected" style={{ backgroundColor: '#d9534f', color: 'white' }} />
                          )}
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
            count={users.length}
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
            <NewBuyerForm
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
        <MenuItem onClick={handleEditClick}>
          <Iconify icon={'eva:edit-fill'} sx={{ mr: 2 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={(e) => handleChangeStatusApprove(e, selectedRow)}>
          <DoneIcon sx={{ mr: 2, color: 'success.main' }} />
          Approve
        </MenuItem>
        <MenuItem onClick={(e) => handleChangeStatusReject(e, selectedRow)}>
          <CloseIcon sx={{ mr: 2, color: 'error.main' }} />
          Reject
        </MenuItem>
      </Popover>
      <CommonSnackBar
        openSnackBar={openSnackBar}
        handleCloseSnackBar={handleCloseSnackBar}
        msg={msg}
        severity="success"
      />
    </>
  );
}
