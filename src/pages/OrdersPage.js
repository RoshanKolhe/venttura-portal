import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
import { sentenceCase } from 'change-case';
import { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, getDoc, doc } from 'firebase/firestore';
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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
// components
import { ListHead, ListToolbar } from '../sections/@dashboard/table';
import Label from '../components/label';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
// sections
// mock

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'store_vet', label: 'Store/Vet', alignRight: false },
  { id: 'distributor', label: 'Distributor', alignRight: false },
  { id: 'total', label: 'Total', alignRight: false },
  { id: 'date', label: 'Date', alignRight: false },
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
  if (query) {
    return filter(array, (_user) => _user.name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
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

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - orders.length) : 0;

  const filteredUsers = applySortFilter(orders, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredUsers.length && !!filterName;

  // const fetchData = async () => {
  //   const querySnapshot = await getDocs(collection(db, 'Orders'));
  //   const results = [];

  //   // console.log('DATA :', querySnapshot);
  //   await Promise.all(
  //     querySnapshot.docs.map(async (doc) => {
  //       const data = doc.data();
  //       const id = doc.id;

  //       if (data.status) {
  //         if (data.BuyerRefrence) {
  //           const referenceDoc = doc(db, data.BuyerRefrence.path);
  //           const referenceDocSnap = await getDoc(referenceDoc);
  //           const referenceData = referenceDocSnap.data();

  //           data.BuyerRefrence = referenceData;
  //         }
  //         if (data.DistributorRefrence) {
  //           const referenceDoc = doc(db, data.DistributorRefrence.path);
  //           const referenceDocSnap = await getDoc(referenceDoc);
  //           const referenceData = referenceDocSnap.data();

  //           data.DistributorRefrence = referenceData;
  //         }
  //         if (data.orderCreator) {
  //           const referenceDoc = doc(db, data.orderCreator.path);
  //           const referenceDocSnap = await getDoc(referenceDoc);
  //           const referenceData = referenceDocSnap.data();

  //           data.orderCreator = referenceData;
  //         }

  //         results.push({ id, ...data });
  //       }
  //     })
  //   );
  //   setOrders(results);
  // };

  // ################################################
  const fetchData = async () => {
    const querySnapshot = await getDocs(collection(db, 'Orders'));
    const results = [];

    // console.log('DATA :', querySnapshot);
    await Promise.all(
      querySnapshot.docs.map(async (element) => {
        const data = element.data();
        const id = element.id;
        if (data.status) {
          if (data.BuyerRefrence) {
            const referenceDoc = doc(db, data.BuyerRefrence.path);
            const referenceDocSnap = await getDoc(referenceDoc);
            const referenceData = referenceDocSnap.data();

            data.BuyerRefrence = referenceData;
          }
          if (data.DistributorRefrence) {
            const referenceDoc = doc(db, data.DistributorRefrence.path);
            const referenceDocSnap = await getDoc(referenceDoc);
            const referenceData = referenceDocSnap.data();

            data.DistributorRefrence = referenceData;
          }
          if (data.orderCreator) {
            const referenceDoc = doc(db, data.orderCreator.path);
            const referenceDocSnap = await getDoc(referenceDoc);
            const referenceData = referenceDocSnap.data();

            data.orderCreator = referenceData;
          }

          // results.push(data);
          results.push({ id, ...data });
          // spread operator
        }
      })
    );
    setOrders(results);
    console.log('resultsasdas ', results);
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
        <title> Orders | Admin </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Orders
          </Typography>
          {/* <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />}>
            New User
          </Button> */}
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
                  rowCount={orders.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const {
                      OrderId,
                      BuyerRefrence,
                      DistributorRefrence,
                      OrderDate,
                      orderCreator,
                      status,
                      totalAfterDiscount,
                      totalBeforeDiscount,
                    } = row;
                    const selectedUser = selected.indexOf(row?.OrderId) !== -1;

                    return (
                      <TableRow hover key={row?.OrderId} tabIndex={-1} role="checkbox" selected={selectedUser}>
                        {/* <TableCell padding="checkbox">
                          <Checkbox checked={selectedUser} onChange={(event) => handleClick(event, row?.OrderId)} />
                        </TableCell> */}
                        <TableCell component="th" scope="row">
                          <Typography variant="subtitle2" noWrap>
                            {BuyerRefrence?.BuyerName}
                          </Typography>
                        </TableCell>
                        <TableCell align="left">{DistributorRefrence?.VendorName}</TableCell>
                        <TableCell align="left">{totalAfterDiscount}</TableCell>
                        <TableCell align="left">{getFormattedDate(OrderDate)}</TableCell>
                        <TableCell align="left">
                          {/* <Label color={(status === 'banned' && 'error') || 'success'}>{sentenceCase(status)}</Label> */}
                          {status}
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
