import PropTypes from 'prop-types';
// @mui
import { styled, alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import Select, { SelectChangeEvent } from '@mui/material/Select';
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
  showSearch = true,
  isFilter = false,
}) {
  // const [startDate, setStartDateData] = useState();
  // const [endDate, setEndDateData] = useState();
  const [isFilterClicked, setIsFilterClicked] = useState(false);
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