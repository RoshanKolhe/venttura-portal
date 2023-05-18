import { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, getDoc, doc } from 'firebase/firestore';

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
  Grid,
  Typography,
  //   IconButton,
  //   TableContainer,
  //   TablePagination,
} from '@mui/material';

import { useNavigate, useParams } from 'react-router-dom';

export default function ViewDetails() {
  const params = useParams();
  const [data, setData] = useState([]);

  // const [open, setOpen] = useState(null);
  // const navigate = useNavigate();
  // const [page, setPage] = useState(0);

  // const [selectedRow, setSelectedRow] = useState();

  // const [order, setOrder] = useState('asc');

  // const [orders, setOrders] = useState([]);

  // const [selected, setSelected] = useState([]);

  // const [orderBy, setOrderBy] = useState('name');

  // const [filterName, setFilterName] = useState('');

  // const [rowsPerPage, setRowsPerPage] = useState(5);

  const db = getFirestore();
  const collectionName = 'Orders';
  const documentId = params.id;
  // eslint-disable-next-line consistent-return
  const getDataFromFirebase = async (collectionName, documentId) => {
    try {
      const firestore = getFirestore();
      const documentRef = doc(firestore, collectionName, documentId);
      const documentSnapshot = await getDoc(documentRef);
      const results = [];
      if (documentSnapshot.data()) {
        const data = documentSnapshot.data();
        const id = documentSnapshot.id;
        console.log('documentData ', data);

        if (data.status) {
          if (data.BuyerRefrence) {
            const referenceDoc = doc(firestore, data.BuyerRefrence.path);
            const referenceDocSnap = await getDoc(referenceDoc);
            const referenceData = referenceDocSnap.data();

            data.BuyerRefrence = referenceData;
          }
          if (data.DistributorRefrence) {
            const referenceDoc = doc(firestore, data.DistributorRefrence.path);
            const referenceDocSnap = await getDoc(referenceDoc);
            const referenceData = referenceDocSnap.data();

            data.DistributorRefrence = referenceData;
          }
          if (data.orderCreator) {
            const referenceDoc = doc(firestore, data.orderCreator.path);
            const referenceDocSnap = await getDoc(referenceDoc);
            const referenceData = referenceDocSnap.data();

            data.orderCreator = referenceData;
          }
          if (data.products) {
            // eslint-disable-next-line no-plusplus
            for (let i = 0; i < data.products.length; i++) {
              // console.log('data.products.', data.products[i].productRefrence.path);
              const referenceDoc = doc(firestore, data.products[i].productRefrence.path);
              // eslint-disable-next-line no-await-in-loop
              const referenceDocSnap = await getDoc(referenceDoc);
              const referenceData = referenceDocSnap.data();
              // console.log('referenceData', referenceData);

              data.products[i].productRefrence = referenceData;
            }
          }
          if (data.products) {
            // eslint-disable-next-line no-plusplus
            for (let i = 0; i < data.products.length; i++) {
              // console.log('data.products.', data.products[i].productRefrence.path);
              const referenceDoc = doc(firestore, data.products[i].variationRefrence.path);
              // eslint-disable-next-line no-await-in-loop
              const referenceDocSnap = await getDoc(referenceDoc);
              const referenceData = referenceDocSnap.data();
              // console.log('referenceData', referenceData);

              data.products[i].variationRefrence = referenceData;
            }
          }

          // results.push(data);
          results.push({ id, ...data });
          // spread operator
        }
        setData(results);
        // return data;
      }
    } catch (error) {
      console.error('Error retrieving data from Firebase:', error);
      return null;
    }
  };
  // ######################################################

  const getFormattedDate = (orderDate) => {
    if (orderDate) {
      const date = new Date(orderDate.seconds * 1000 + orderDate.nanoseconds / 1000000);
      const formattedDate = date.toLocaleString(); // change the format to your preferred date format
      return formattedDate;
    }
    return '';
  };

  useEffect(() => {
    console.log('useeffect q1');
    // fetchData();
    getDataFromFirebase(collectionName, documentId);
  }, []);

  return (
    <>
      {console.log('Data gathered', data)}
      {data.map((row) => {
        const {
          OrderId,
          BuyerRefrence,
          DistributorRefrence,
          OrderDate,
          orderCreator,
          products,
          totalAfterDiscount,
          totalBeforeDiscount,
        } = row;
        // eslint-disable-next-line no-lone-blocks
        {
          console.log('Data products', products);
        }

        return (
          <>
            <Grid container px={20} style={{ width: '100%', color: '#757575 ' }}>
              <Grid item xs={12} mb={1}>
                <Typography variant="h6" style={{ color: '', fontWeight: '700' }}>
                  Buyers Details
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>Buyers Name : {BuyerRefrence?.BuyerName}</Typography>
                {console.log('Buyers Details : ', data)}
              </Grid>
              <Grid item xs={12}>
                <Typography>Buyers Contact : {BuyerRefrence?.ContactNumber}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>Buyers Address : {BuyerRefrence?.Address}</Typography>
              </Grid>
              <Grid item xs={12} mt={7} mb={1}>
                <Typography variant="h6" style={{ color: '', fontWeight: '700' }}>
                  Distributor Details
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>Distributor Name : {DistributorRefrence?.VendorName}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>Distributor Contact : {DistributorRefrence?.DistrbutorContactNumber}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>Distributor Address : {DistributorRefrence?.Address}</Typography>
              </Grid>
              <Grid item xs={12} mt={10} mb={3}>
                <Typography variant="h3" style={{ color: 'rgb(168, 114, 154)', fontWeight: '400' }}>
                  Products
                </Typography>
              </Grid>

              {products.map((product, index) => {
                const {
                  DiscountedPrice,
                  percentDiscount,
                  pricePerUnit,
                  quantity,
                  totalBeforeDiscount,
                  productRefrence,
                  variationRefrence,
                } = product;

                console.log('index', index);
                console.log('line', productRefrence.ProductName);
                return (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      border: '2px solid',
                      borderRadius: '5px',
                      borderColor: '#e5e5e5',
                      // #c8c8c8
                      // margin: '25px',
                      marginTop: '25px',
                      padding: '20px',
                      width: '100%',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Grid item xs={12} mt={0}>
                      <Typography style={{ justifyContent: 'center', display: 'flex' }}>
                        {productRefrence.ProductName}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} mt={0}>
                      <Typography style={{ justifyContent: 'center', display: 'flex' }}>
                        {variationRefrence.variationName} (₹{pricePerUnit})
                      </Typography>
                    </Grid>
                    <Grid item xs={12} mt={0}>
                      <Typography style={{ justifyContent: 'center', display: 'flex' }}>
                        Qty: {quantity}
                        <br />
                      </Typography>
                      <Typography style={{ justifyContent: 'center', display: 'flex' }}>
                        Discount: {percentDiscount}%
                      </Typography>
                    </Grid>
                    <Grid item xs={12} mt={0}>
                      <Typography style={{ justifyContent: 'center', display: 'flex' }}>
                        ₹{totalBeforeDiscount}
                      </Typography>
                      <Typography style={{ justifyContent: 'center', display: 'flex' }}>
                        Item Total: ₹{DiscountedPrice}
                      </Typography>
                    </Grid>
                  </div>
                );
              })}

              <Grid item xs={12} mt={3}>
                <Typography style={{ fontWeight: '700' }}>Total Before Discount : ₹{totalBeforeDiscount}</Typography>
              </Grid>
              <Grid item xs={12} mt={1} mb={2}>
                <Typography style={{ fontWeight: '700' }}>Total After Discount : ₹{totalAfterDiscount}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>Order ID : {params.id}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>Order Date : {getFormattedDate(OrderDate)}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>Sales Person : {orderCreator.display_name}</Typography>
              </Grid>
              <Grid
                item
                xs={12}
                mt={5}
                py={5}
                style={{
                  backgroundColor: 'rgb(255, 80, 3)',
                  // borderRadius: '10px',
                  borderBottomLeftRadius: '10px',
                  borderBottomRightRadius: '10px  ',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flex: '1',
                    alignItems: 'center',
                    justifyContent: 'end',
                    paddingRight: '20px',
                    color: 'white',
                  }}
                >
                  <Typography variant="h2" style={{ fontSize: '2rem', fontWeight: '500' }}>
                    Total : ₹{totalAfterDiscount}
                  </Typography>
                  {/* <Typography style={{ fontSize: '25px', fontWeight: '600' }}></Typography> */}
                </div>
              </Grid>
            </Grid>
          </>
        );
      })}
    </>
  );
}
