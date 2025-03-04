
import React from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Box, Typography, ToggleButtonGroup, ToggleButton } from '@mui/material';

const DateRangeFilter = ({ startDate, endDate, onChange }) => {
  const [filterType, setFilterType] = React.useState('range');

  const handleDateChange = (dates) => {
    if (filterType === 'single') {
      onChange([dates, dates]);
    } else {
      onChange(dates);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <ToggleButtonGroup
          size="small"
          value={filterType}
          exclusive
          onChange={(e, newValue) => {
            if (newValue) {
              setFilterType(newValue);
              onChange([null, null]); // Reset dates on type change
            }
          }}
        >
          <ToggleButton value="single">Single Day</ToggleButton>
          <ToggleButton value="range">Date Range</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <DatePicker
        selectsRange={filterType === 'range'}
        selected={filterType === 'single' ? startDate : undefined}
        startDate={startDate}
        endDate={endDate}
        onChange={handleDateChange}
        isClearable
        placeholderText={filterType === 'single' ? "Select date" : "Select date range"}
        className="date-picker-custom"
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        dateFormat="MMM d, yyyy"
      />
    </Box>
  );
};

export default DateRangeFilter;
