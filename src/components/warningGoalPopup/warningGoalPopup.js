import React, { useState, useEffect } from 'react';
import { Field, useFormik } from 'formik';
import * as yup from 'yup';
import 'react-phone-input-2/lib/material.css';
import SaveIcon from '@mui/icons-material/Save';
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
import { Timestamp, collection, doc, getFirestore, setDoc, updateDoc } from 'firebase/firestore';
import { LoadingButton } from '@mui/lab';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { getCurrentMonthAndYear, variationJson } from '../../utils/constants';
import LoadingScreen from '../../common/LoadingScreen';
import CustomBox from '../../common/CustomBox';
import account from '../../_mock/account';
import CommonSnackBar from '../../common/CommonSnackBar';
import { app } from '../../firebase_setup/firebase';

const WarningGoalPopup = ({ handleOkClick, handleCancelClick, isModalOpen, setIsModalOpen }) => {
  return (
    <>
      <Grid container>
        <Grid item xs={12}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              marginY: '10px',
              paddingY: '10px',
            }}
          >
            <Typography variant="h4" style={{ color: '#FFC107' }}>
              Warning
            </Typography>
            <Tooltip password="Close">
              <IconButton onClick={handleCancelClick}>
                <Icon icon={closefill} />
              </IconButton>
            </Tooltip>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6">
            Are you sure you want to continue? A goal for this month and year already exists, and if you proceed, the
            previous data will be updated.
          </Typography>
        </Grid>
      </Grid>
      <Grid container>
        <Grid item marginY={2} style={{ display: 'flex' }}>
          <Button
            loadingPosition="start"
            variant="contained"
            color="primary"
            fullWidth
            type="submit"
            form="profileForm"
            onClick={handleOkClick}
          >
            OK
          </Button>
          <Button
            loadingPosition="start"
            variant="contained"
            color="error"
            fullWidth
            type="submit"
            form="profileForm"
            style={{ marginLeft: '10px' }}
            onClick={handleCancelClick}
          >
            Cancel
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

export default WarningGoalPopup;
