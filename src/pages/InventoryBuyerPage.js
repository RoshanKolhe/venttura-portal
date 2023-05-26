/* eslint-disable no-plusplus */
import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
import { sentenceCase } from 'change-case';
import { useEffect, useState } from 'react';
import { Link as RouterLink, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import plusFill from '@iconify/icons-eva/plus-fill';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import { makeStyles } from '@material-ui/core/styles';
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
  TextField,
} from '@mui/material';
// components
import { collection, doc, getDoc, getDocs, getFirestore, updateDoc } from 'firebase/firestore';
import { Inventory2Rounded } from '@mui/icons-material';
import axiosInstance from '../helpers/axios';
import NewDistributorForm from '../components/new-user/NewDistributorForm';
import NewBuyerForm from '../components/new-user/NewBuyerForm';
import CommonSnackBar from '../common/CommonSnackBar';
import NewUserForm from '../components/new-user/NewUserForm';
import Label from '../components/label';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
import { ListHead, ListToolbar } from '../sections/@dashboard/table';
import CustomBox from '../common/CustomBox';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'productName', label: 'Product Name', alignRight: false },
  { id: 'variationName', label: 'Variation', alignRight: false },
  { id: 'inventory', label: 'Inventory', alignRight: false },
];
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
    return filter(array, (_user) => _user.productName.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function InventoryBuyerPage() {
  const [open, setOpen] = useState(null);
  const [msg, setMsg] = useState('');
  const [openModal, setOpenMdal] = useState(false);
  const [page, setPage] = useState(0);
  const params = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState('asc');
  const [inventory, setInventory] = useState([]);
  const [selected, setSelected] = useState([]);
  const [selectedRow, setSelectedRow] = useState();
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const classes = useStyles();
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openSnackBar, setOpenSnackBar] = useState(false);

  const handleOpenSnackBar = () => setOpenSnackBar(true);
  const handleCloseSnackBar = () => setOpenSnackBar(false);
  const db = getFirestore();

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = inventory.map((n) => n.name);
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
  const handleOpen = () => setOpenMdal(true);
  const handleClose = () => setOpenMdal(false);
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - inventory.length) : 0;

  const filteredUsers = applySortFilter(inventory, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredUsers.length && !!filterName;

  const handleReload = () => {
    fetchData();
  };

  const handleBuyerInventoryUpdate = async (e, row) => {
    const updatedData = inventory.map(({ id, productName, variationName, ...rest }) => rest);
    const docRef = doc(db, 'Buyers', params?.id);
    const buyer = {
      inventory: updatedData,
    };
    await updateDoc(docRef, buyer);
    console.log(updatedData);
  };

  const handleItemChanged = (e, row, targetField) => {
    const foundIndex = inventory.findIndex((x) => x.id === row.id);
    const rowData = inventory[foundIndex];

    const updatedData = { ...rowData, [targetField]: parseInt(e.target.value || 0, 10) };
    const updatedFilteredGoals = inventory.map((item, index) => {
      if (index === foundIndex) return { ...updatedData };
      return { ...item };
    });
    setInventory(updatedFilteredGoals);
  };

  const fetchData = async () => {
    const inputData = {
      buyerId: params.id,
    };
    axiosInstance
      .post('/getDefaultBuyerInventoryData', inputData)
      .then((res) => {
        if (res.data.success) {
          const filteredData = [];
          let i = 0;
          res.data.data.forEach((res) => {
            filteredData.push({
              ...res,
              id: i,
            });
            i++;
          });
          setInventory(filteredData);
        }
      })
      .catch((err) => {
        setInventory([]);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <Helmet>
        <title> Inventory | Admin </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Inventory
          </Typography>
        </Stack>

        <Card>
          <ListToolbar
            numSelected={selected.length}
            onReload={handleReload}
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
                  rowCount={inventory.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const { id, productName: name, variationName, inventory } = row;
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

                        <TableCell component="th" scope="row">
                          <Typography variant="subtitle2" noWrap>
                            {variationName}
                          </Typography>
                        </TableCell>

                        <TableCell align="left">
                          <TextField
                            InputProps={{ disableUnderline: true }}
                            fullWidth
                            id="name"
                            className={`form-control ${classes.textField}`}
                            variant="standard"
                            type="text"
                            value={inventory}
                            onChange={(e) => handleItemChanged(e, row, 'inventory')}
                            onBlur={(e) => {
                              handleBuyerInventoryUpdate(e, row);
                            }}
                          />
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
            count={inventory.length}
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
            <NewDistributorForm
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

      {/* <Popover
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
        <MenuItem onClick={handleEditClick}>
          <Iconify icon={'material-symbols:inventory'} sx={{ mr: 2 }} />
          Inventory
        </MenuItem>
      </Popover> */}
      <CommonSnackBar
        openSnackBar={openSnackBar}
        handleCloseSnackBar={handleCloseSnackBar}
        msg={msg}
        severity="success"
      />
    </>
  );
}
