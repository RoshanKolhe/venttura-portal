import PropTypes from 'prop-types';
// @mui
import { styled, alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import {
  Toolbar,
  Tooltip,
  IconButton,
  Typography,
  OutlinedInput,
  InputAdornment,
  TextField,
  Grid,
  MenuItem,
  InputLabel,
} from '@mui/material';
// component
import { useEffect, useState } from 'react';
import roundFilterList from '@iconify/icons-ic/round-filter-list';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Iconify from '../../../components/iconify';
// ----------------------------------------------------------------------

const StyledRoot = styled(Toolbar)(({ theme }) => ({
  height: 96,
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(0, 1, 0, 3),
}));

const StyledSearch = styled(OutlinedInput)(({ theme }) => ({
  width: 240,
  transition: theme.transitions.create(['box-shadow', 'width'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter,
  }),
  '&.Mui-focused': {
    width: 320,
    boxShadow: theme.customShadows.z8,
  },
  '& fieldset': {
    borderWidth: `1px !important`,
    borderColor: `${alpha(theme.palette.grey[500], 0.32)} !important`,
  },
}));

// ----------------------------------------------------------------------

ListToolbar.propTypes = {
  numSelected: PropTypes.number,
  filterName: PropTypes.string,
  onFilterName: PropTypes.func,
  onReload: PropTypes.func,
  onApproveSelected: PropTypes.func,
  showSearch: PropTypes.bool,
  isFilter: PropTypes.bool,
};

export default function ListToolbar({
  numSelected,
  filterName,
  onFilterName,
  onApproveSelected,
  onReload,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  showSearch = true,
  isFilter = false,
  isDateRange = false,
  selectedDate,
  setSelectedDate
}) {
  const [isFilterClicked, setIsFilterClicked] = useState(false);

  const handleDateChange = (date) => {
    setSelectedDate(date); // handle the selected date
  };
  // useEffect(() => {
  //   if (startDate && endDate) {
  //     onFilterDateSelected(new Date(startDate).toISOString(), new Date(endDate).toISOString());
  //   }
  // }, [startDate, endDate]);

  return (
    <StyledRoot
      sx={{
        ...(numSelected > 0 && {
          color: 'primary.main',
          bgcolor: 'primary.lighter',
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography component="div" variant="subtitle1">
          {numSelected} selected
        </Typography>
      ) : showSearch ? (
        <StyledSearch
          value={filterName}
          onChange={onFilterName}
          placeholder="Search ..."
          startAdornment={
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', width: 20, height: 20 }} />
            </InputAdornment>
          }
        />
      ) : null}

      {numSelected > 0 ? (
        <Tooltip title="Approve Selected">
          <IconButton onClick={onApproveSelected}>
            <Iconify icon="material-symbols:order-approve" />
          </IconButton>
        </Tooltip>
      ) : (
        <>
          {isFilterClicked && !isDateRange ? (
            <>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Grid container direction="row" spacing={3}>
                  <Grid item marginLeft={3}>
                    <DateTimePicker
                      inputFormat="MM-YYYY"
                      views={['year', 'month']}
                      label="Month and Year"
                      value={selectedDate}
                      onChange={handleDateChange}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </Grid>
                </Grid>
              </LocalizationProvider>
            </>
          ) : null}
          {isFilterClicked && isDateRange ? (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Grid container direction="row" spacing={3}>
                <Grid item marginLeft={3}>
                  <DateTimePicker
                    inputFormat="YYYY-MM-DD"
                    label="Start Date"
                    value={startDate || null}
                    onChange={(newValue) => setStartDate(newValue)}
                    views={['year', 'month', 'day']}
                    renderInput={(params) => <TextField {...params} autoComplete="off" />}
                  />
                </Grid>
                <Grid item>
                  <DateTimePicker
                    inputFormat="YYYY-MM-DD"
                    views={['year', 'month', 'day']}
                    label="end Date"
                    value={endDate || null}
                    onChange={(newValue) => setEndDate(newValue)}
                    renderInput={(params) => <TextField {...params} autoComplete="off" />}
                  />
                </Grid>
              </Grid>
            </LocalizationProvider>
          ) : null}
          <div style={{ display: 'flex' }}>
            {isFilter ? (
              <Tooltip title="Filter list">
                <IconButton
                  onClick={() => {
                    setIsFilterClicked(!isFilterClicked);
                  }}
                >
                  <Icon icon={roundFilterList} />
                </IconButton>
              </Tooltip>
            ) : null}

            <Tooltip title="Reload">
              <IconButton onClick={onReload}>
                <Iconify icon="mdi:reload" />
              </IconButton>
            </Tooltip>
          </div>
        </>
      )}
    </StyledRoot>
  );
}
