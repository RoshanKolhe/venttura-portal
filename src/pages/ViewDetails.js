// import { Helmet } from 'react-helmet-async';
// import { filter } from 'lodash';
// import { sentenceCase } from 'change-case';
// import { useEffect, useState } from 'react';
// import { getFirestore, collection, getDocs, getDoc, doc } from 'firebase/firestore';
// // @mui
import {
  //   Card,
  //   Table,
  //   Stack,
  //   Paper,
  //   Avatar,
  //   Button,
  //   Popover,
  //   Checkbox,
  //   TableRow,
  //   MenuItem,
  //   TableBody,
  //   TableCell,
  //   Container,
  Typography,
  //   IconButton,
  //   TableContainer,
  //   TablePagination,
} from '@mui/material';
// // components
// import { ListHead, ListToolbar } from '../sections/@dashboard/table';
// import Label from '../components/label';
// import Iconify from '../components/iconify';
// import Scrollbar from '../components/scrollbar';
// sections
// mock

// ----------------------------------------------------------------------

// const TABLE_HEAD = [
//   { id: 'store_vet', label: 'Store/Vet', alignRight: false },
//   { id: 'distributor', label: 'Distributor', alignRight: false },
//   { id: 'total', label: 'Total', alignRight: false },
//   { id: 'date', label: 'Date', alignRight: false },
//   { id: 'status', label: 'Status', alignRight: false },
//   { id: '' },
// ];

// // ----------------------------------------------------------------------

// function descendingComparator(a, b, orderBy) {
//   if (b[orderBy] < a[orderBy]) {
//     return -1;
//   }
//   if (b[orderBy] > a[orderBy]) {
//     return 1;
//   }
//   return 0;
// }

// function getComparator(order, orderBy) {
//   return order === 'desc'
//     ? (a, b) => descendingComparator(a, b, orderBy)
//     : (a, b) => -descendingComparator(a, b, orderBy);
// }

// function applySortFilter(array, comparator, query) {
//   const stabilizedThis = array.map((el, index) => [el, index]);
//   stabilizedThis.sort((a, b) => {
//     const order = comparator(a[0], b[0]);
//     if (order !== 0) return order;
//     return a[1] - b[1];
//   });
//   if (query) {
//     return filter(array, (_user) => _user.name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
//   }
//   return stabilizedThis.map((el) => el[0]);
// }

export default function ViewDetails() {
  //   const [open, setOpen] = useState(null);

  //   const [page, setPage] = useState(0);

  //   const [order, setOrder] = useState('asc');

  //   const [orders, setOrders] = useState([]);

  //   const [selected, setSelected] = useState([]);

  //   const [orderBy, setOrderBy] = useState('name');

  //   const [filterName, setFilterName] = useState('');

  //   const [rowsPerPage, setRowsPerPage] = useState(5);

  //   const db = getFirestore();

  //   const handleOpenMenu = (event) => {
  //     setOpen(event.currentTarget);
  //   };

  //   const handleCloseMenu = () => {
  //     setOpen(null);
  //   };
  //   const handleViewPopUpClick = () => {
  //     console.log('popup');
  //     window.open('http://localhost:3000/orders/GbbAq53q5Maw6HvTxN1BzRuZukT2', '_blank', 'width=900,height=500');
  //   };

  //   const handleRequestSort = (event, property) => {
  //     const isAsc = orderBy === property && order === 'asc';
  //     setOrder(isAsc ? 'desc' : 'asc');
  //     setOrderBy(property);
  //   };

  //   const handleSelectAllClick = (event) => {
  //     if (event.target.checked) {
  //       const newSelecteds = orders.map((n) => n.name);
  //       setSelected(newSelecteds);
  //       return;
  //     }
  //     setSelected([]);
  //   };

  //   const handleClick = (event, name) => {
  //     const selectedIndex = selected.indexOf(name);
  //     let newSelected = [];
  //     if (selectedIndex === -1) {
  //       newSelected = newSelected.concat(selected, name);
  //     } else if (selectedIndex === 0) {
  //       newSelected = newSelected.concat(selected.slice(1));
  //     } else if (selectedIndex === selected.length - 1) {
  //       newSelected = newSelected.concat(selected.slice(0, -1));
  //     } else if (selectedIndex > 0) {
  //       newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
  //     }
  //     setSelected(newSelected);
  //   };

  //   const handleChangePage = (event, newPage) => {
  //     setPage(newPage);
  //   };

  //   const handleChangeRowsPerPage = (event) => {
  //     setPage(0);
  //     setRowsPerPage(parseInt(event.target.value, 10));
  //   };

  //   const handleFilterByName = (event) => {
  //     setPage(0);
  //     setFilterName(event.target.value);
  //   };

  //   const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - orders.length) : 0;

  //   const filteredUsers = applySortFilter(orders, getComparator(order, orderBy), filterName);

  //   const isNotFound = !filteredUsers.length && !!filterName;

  //   const fetchData = async () => {
  //     const querySnapshot = await getDocs(collection(db, 'Orders'));
  //     const results = [];
  //     // eslint-disable-next-line no-restricted-syntax
  //     await Promise.all(
  //       querySnapshot.docs.map(async (element) => {
  //         const data = element.data();
  //         if (data.status) {
  //           if (data.BuyerRefrence) {
  //             const referenceDoc = doc(db, data.BuyerRefrence.path);
  //             const referenceDocSnap = await getDoc(referenceDoc);
  //             const referenceData = referenceDocSnap.data();

  //             data.BuyerRefrence = referenceData;
  //           }
  //           if (data.DistributorRefrence) {
  //             const referenceDoc = doc(db, data.DistributorRefrence.path);
  //             const referenceDocSnap = await getDoc(referenceDoc);
  //             const referenceData = referenceDocSnap.data();

  //             data.DistributorRefrence = referenceData;
  //           }
  //           if (data.orderCreator) {
  //             const referenceDoc = doc(db, data.orderCreator.path);
  //             const referenceDocSnap = await getDoc(referenceDoc);
  //             const referenceData = referenceDocSnap.data();

  //             data.orderCreator = referenceData;
  //           }

  //           results.push(data);
  //         }
  //       })
  //     );
  //     setOrders(results);
  //   };

  //   const getFormattedDate = (orderDate) => {
  //     if (orderDate) {
  //       const date = new Date(orderDate.seconds * 1000 + orderDate.nanoseconds / 1000000);
  //       const formattedDate = date.toLocaleString(); // change the format to your preferred date format
  //       return formattedDate;
  //     }
  //     return '';
  //   };

  //   useEffect(() => {
  //     fetchData();
  //   }, []);

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Buyers Details
      </Typography>
      <Typography variant="h5" gutterBottom>
        Buyers Name : TestBuyer
      </Typography>
      <Typography variant="h5" gutterBottom>
        Buyers Contact : +917845127845
      </Typography>
      <Typography variant="h5" gutterBottom>
        Buyers Address : Nashik
      </Typography>
      <Typography variant="h4" gutterBottom>
        Distributor Details
      </Typography>
      <Typography variant="h5" gutterBottom>
        Distributor Name : TestDistributor
      </Typography>
      <Typography variant="h5" gutterBottom>
        Distributor Contact : +917845127845
      </Typography>
      <Typography variant="h5" gutterBottom>
        Distributor Address : Nashik
      </Typography>
    </>
  );
}
