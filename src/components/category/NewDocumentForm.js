import React, { useState, useEffect } from 'react';
import { Field, useFormik } from 'formik';
import * as yup from 'yup';
import 'react-phone-input-2/lib/material.css';
import SaveIcon from '@mui/icons-material/Save';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  FormHelperText,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  MenuItem,
  InputLabel,
  Tooltip,
  IconButton,
} from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import { initial, omit } from 'lodash';
import { useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import closefill from '@iconify/icons-eva/close-fill';
import { Timestamp, collection, doc, getDocs, getFirestore, setDoc, updateDoc } from 'firebase/firestore';
import { LoadingButton } from '@mui/lab';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ImageIcon from '@mui/icons-material/Image';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import VideoLabelIcon from '@mui/icons-material/VideoLabel';
import zipPlaceholder from '../../assests/placeholders/zip.png';
import { getCurrentMonthAndYear, variationJson } from '../../utils/constants';
import LoadingScreen from '../../common/LoadingScreen';
import CustomBox from '../../common/CustomBox';
import account from '../../_mock/account';
import CommonSnackBar from '../../common/CommonSnackBar';
import { app } from '../../firebase_setup/firebase';

const NewDocumentForm = ({ initialValues, handleClose, onDataSubmit }) => {
  console.log(initialValues);
  const location = useLocation();
  const navigate = useNavigate();
  const currentDate = new Date();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const year = currentDate.getFullYear();
  const auth = getAuth();
  const formattedDate = `${month}-${year}`;
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const firestore = getFirestore(app);
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState('');
  const [categories, setCategories] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const storage = getStorage(app);
  const [loading, setLoading] = useState(false);
  const handleOpenSnackBar = () => setOpenSnackBar(true);
  const handleCloseSnackBar = () => setOpenSnackBar(false);

  const buyerFormValidationSchema = yup.object({
    FileName: yup.string('Enter File name').required('File name is required'),
    fileLink: yup.string('Please upload a file').required('document is required'),
    Category: yup.string('Select category').required('category is required'),
  });

  const formik = useFormik({
    initialValues: {
      id: initialValues?.id,
      FileName: initialValues?.fileName || '',
      fileLink: initialValues?.fileLink || '',
      Category: initialValues?.copyRef || '',
    },
    enableReinitialize: true,
    validationSchema: buyerFormValidationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        if (!initialValues) {
          setLoading(false);
        } else {
          setLoading(false);
        }
        onDataSubmit(initialValues ? 'Document updated successfully' : 'Document created successfully');
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    },
  });

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);

    // Extract file type
    const fileType = selectedFile.type.split('/')[0];
    setFileType(fileType);
  };

  const handleUpload = async () => {
    if (file) {
      console.log(file);
      try {
        // Create a storage reference with a unique filename
        const storageRef = ref(storage, `/files/${file.name}`)

        // Upload file to Firebase Storage
        await uploadBytes(storageRef, file);

        // Get the download URL for the uploaded file
        const downloadURL = await getDownloadURL(storageRef);

        formik.setFieldValue('fileLink', downloadURL);
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    } else {
      console.log('No file selected');
    }
  };

  const handleChange = (event) => {
    formik.setFieldValue('Category', event.target.value);
  };

  const fetchCategories = async () => {
    const querySnapshot = await   getDocs(collection(firestore, 'Categories'));
    const results = [];
    // eslint-disable-next-line no-restricted-syntax
    querySnapshot.docs.map(async (element) => {
      const data = element.data();
      results.push({ id: element.id, ...data, categoryRef: element.ref });
    });
    setCategories(results);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setFileType(initialValues?.type);
  }, [initialValues]);

  return (
    <div>
      <form onSubmit={formik.handleSubmit} id="profileForm">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            p: 1,
            m: 1,
          }}
        >
          <Typography variant="h6" gutterBottom>
            {initialValues ? 'Update Document' : 'New Document'}
          </Typography>
          <Tooltip password="Close">
            <IconButton onClick={handleClose}>
              <Icon icon={closefill} />
            </IconButton>
          </Tooltip>
        </Box>
        <Grid container>
          <Grid item xs={12} lg={12} margin={2}>
            <TextField
              InputProps={{ disableUnderline: true }}
              fullWidth
              id="FileName"
              name="FileName"
              label="Document Name"
              type="text"
              value={formik.values.FileName}
              onChange={formik.handleChange}
              error={formik.touched.FileName && Boolean(formik.errors.FileName)}
              helperText={formik.touched.FileName && formik.errors.FileName}
            />
          </Grid>
          <Grid item xs={12} lg={12} margin={2}>
            <input type="file" onChange={handleFileChange} />
            <Button variant="contained" onClick={handleUpload}>
              Upload File
            </Button>
          </Grid>
          {formik.values.fileLink && (
            <Grid item xs={12} lg={12} margin={2}>
              <Box
                component="img"
                onClick={() => window.open(formik?.values?.fileLink, '_blank')}
                sx={{
                  marginTop: 0,
                  height: 100,
                  width: 100,
                  cursor: 'pointer',
                  maxHeight: { xs: 233, md: 167 },
                  maxWidth: { xs: 350, md: 250 },
                  objectFit: 'contain',
                }}
                alt="placeholder"
                src={fileType === 'pdf' ? zipPlaceholder : formik?.values?.fileLink}
              />
            </Grid>
          )}

          <Grid item xs={12} lg={12} margin={2}>
            <FormControl fullWidth error={formik?.touched?.Category && formik?.errors?.Category}>
              <InputLabel id="type-label">Category</InputLabel>
              <Select
                labelId="type-label"
                id="Category"
                value={formik.values.Category}
                label="Category"
                onChange={handleChange}
                className={formik?.touched?.Category && formik?.errors?.Category ? 'red-border' : ''}
              >
                {categories && categories.length > 0
                  ? categories.map((res) => <MenuItem value={res?.id}>{res?.categoryName}</MenuItem>)
                  : null}
              </Select>
              <FormHelperText error>{formik?.touched?.Category && formik?.errors?.Category}</FormHelperText>
            </FormControl>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item margin={2}>
            <LoadingButton
              loading={loading}
              loadingPosition="start"
              variant="contained"
              startIcon={<SaveIcon />}
              color="primary"
              fullWidth
              type="submit"
              form="profileForm"
              disabled={loading}
            >
              Submit
            </LoadingButton>
          </Grid>
        </Grid>
        <CommonSnackBar
          openSnackBar={openSnackBar}
          handleCloseSnackBar={handleCloseSnackBar}
          msg={errorMessage !== '' ? errorMessage : successMessage}
          severity={errorMessage !== '' ? 'error' : 'success'}
        />
      </form>
    </div>
  );
};

export default NewDocumentForm;
