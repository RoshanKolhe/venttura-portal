import { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, getDoc, doc } from 'firebase/firestore';

import { Grid, Modal, Typography } from '@mui/material';

import { useNavigate, useParams } from 'react-router-dom';
import CommonSnackBar from '../common/CommonSnackBar';
import CustomBox from '../common/CustomBox';
import EditOrderForm from '../components/Orders/EditOrderForm';

export default function ViewDetails() {
  const params = useParams();
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const [openModal, setOpenMdal] = useState(false);
  const handleOpen = () => setOpenMdal(true);
  const [msg, setMsg] = useState('');
  const handleClose = () => setOpenMdal(false);
  const db = getFirestore();
  const collectionName = 'Orders';
  const documentId = params.id;
  const [openSnackBar, setOpenSnackBar] = useState(false);

  const handleOpenSnackBar = () => setOpenSnackBar(true);
  const handleCloseSnackBar = () => setOpenSnackBar(false);

  const handleEditClick = () => {
    handleOpen();
  };
  // eslint-disable-next-line consistent-return
  const getDataFromFirebase = async (collectionName, documentId) => {
    try {
      const firestore = getFirestore();
      const documentRef = doc(firestore, collectionName, documentId);
      const documentSnapshot = await getDoc(documentRef);
      const results = [];
      if (documentSnapshot.data()) {
        const data = documentSnapshot.data();
        const { id } = documentSnapshot;

        if (data.status) {
          if (data.BuyerRefrence) {
            const referenceDoc = doc(firestore, data.BuyerRefrence.path);
            const referenceDocSnap = await getDoc(referenceDoc);
            const referenceData = { ...referenceDocSnap.data(), id: referenceDocSnap.id };

            data.BuyerRefrence = referenceData;
          }
          if (data.DistributorRefrence) {
            const referenceDoc = doc(firestore, data.DistributorRefrence.path);
            const referenceDocSnap = await getDoc(referenceDoc);
            const referenceData = { ...referenceDocSnap.data(), id: referenceDocSnap.id };

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
              const referenceDoc = doc(firestore, data.products[i].productRefrence.path);
              // eslint-disable-next-line no-await-in-loop
              const referenceDocSnap = await getDoc(referenceDoc);
              const referenceData = referenceDocSnap.data();

              data.products[i].productRefrence = referenceData;
            }
          }
          if (data.products) {
            // eslint-disable-next-line no-plusplus
            for (let i = 0; i < data.products.length; i++) {
              const referenceDoc = doc(firestore, data.products[i].variationRefrence.path);
              // eslint-disable-next-line no-await-in-loop
              const referenceDocSnap = await getDoc(referenceDoc);
              const referenceData = referenceDocSnap.data();

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

  const getFormattedDate = (orderDate) => {
    if (orderDate) {
      const date = new Date(orderDate.seconds * 1000 + orderDate.nanoseconds / 1000000);

      const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      };

      const formattedDate = date.toLocaleString('en-IN', options);
      return formattedDate;
    }

    return '';
  };

  useEffect(() => {
    getDataFromFirebase(collectionName, documentId);
  }, []);
  return (
    <>
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

        return (
          <>
            <Grid container px={10} style={{ color: '#757575 ' }}>
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  onClick={() => {
                    handleEditClick();
                  }}
                  style={{
                    display: 'flex',
                    alignITems: 'center',
                    justifyContent: 'end',
                    cursor: 'pointer',
                    color: '#007FFF',
                    fontWeight: '500px',
                  }}
                >
                  Edit
                </Typography>
              </Grid>
              <Grid item xs={12} sm={12} mb={1}>
                <Typography variant="h6" style={{ fontWeight: '700' }}>
                  Buyers Details
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>Buyers Name : {BuyerRefrence?.BuyerName}</Typography>
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

                return (
                  <Grid item xs={12} marginBottom={5}>
                    <Grid container style={{ padding: '20px', border: '2px solid' }}>
                      <Grid
                        item
                        xs={12}
                        sm={3}
                        mt={0}
                        style={{ justifyContent: 'center', display: 'flex', alignItems: 'center' }}
                      >
                        <Typography style={{ justifyContent: 'center', display: 'flex' }}>
                          {productRefrence?.ProductName}
                        </Typography>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        sm={3}
                        mt={0}
                        style={{ justifyContent: 'center', display: 'flex', alignItems: 'center' }}
                      >
                        <Typography>
                          {variationRefrence?.variationName} (₹{pricePerUnit})
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={3} mt={0}>
                        <Typography style={{ justifyContent: 'center', display: 'flex' }}>
                          Qty: {quantity}
                          <br />
                        </Typography>
                        <Typography style={{ justifyContent: 'center', display: 'flex' }}>
                          Discount: {percentDiscount}%
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={3} mt={0}>
                        <Typography style={{ justifyContent: 'center', display: 'flex' }}>
                          ₹{totalBeforeDiscount}
                        </Typography>
                        <Typography style={{ justifyContent: 'center', display: 'flex' }}>
                          Item Total: ₹{DiscountedPrice}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                );
              })}

              <Grid item xs={12} mt={3}>
                <Typography style={{ fontWeight: '700' }}>
                  Total Before Discount : ₹{totalBeforeDiscount.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={12} mt={1} mb={2}>
                <Typography style={{ fontWeight: '700' }}>
                  Total After Discount : ₹{totalAfterDiscount.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>Order ID : {params.id}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>Order Date : {getFormattedDate(OrderDate)}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>Sales Person : {orderCreator?.display_name}</Typography>
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
                    Total : ₹{totalAfterDiscount.toFixed(2)}
                  </Typography>
                  {/* <Typography style={{ fontSize: '25px', fontWeight: '600' }}></Typography> */}
                </div>
              </Grid>
            </Grid>
            <Modal
              open={openModal}
              onClose={handleClose}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
            >
              <CustomBox>
                <EditOrderForm
                  handleClose={handleClose}
                  onDataSubmit={(msg) => {
                    handleClose();
                    getDataFromFirebase(collectionName, documentId);
                    setMsg(msg);
                    handleOpenSnackBar();
                  }}
                  initialValues={data[0]}
                />
              </CustomBox>
            </Modal>
            <CommonSnackBar
              openSnackBar={openSnackBar}
              handleCloseSnackBar={handleCloseSnackBar}
              msg={msg}
              severity="success"
            />
          </>
        );
      })}
    </>
  );
}
