import React from 'react';
import { 
 TextField, 
 Select, 
 MenuItem, 
 FormControl, 
 FormControlLabel,
 Checkbox,
 Paper,
 InputLabel,
 Box,
 Stack,
 Button
} from '@mui/material';
import DateRangeFilter from './DateRangeFilter';
import AddIcon from '@mui/icons-material/Add';


function DynamicFilterComponent({ filters, navigate }) {
 return (
   <Paper 
     elevation={1}
     sx={{
       p: 3,
       mb: 3,
       backgroundColor: 'background.paper',
       borderRadius: 2
     }}
   >
     <Stack spacing={3}>
       {/* Primary Filters */}
       <Box 
         sx={{
           display: 'flex',
           flexWrap: 'wrap',
           gap: 2,
           alignItems: 'flex-start'
         }}
       >
         {filters.map((filter, index) => {
           switch (filter.type) {
             case 'text':
               return (
                 <TextField
                   key={index}
                   label={filter.label || ''}
                   type="text"
                   value={filter.value}
                   onChange={filter.onChange}
                   variant="outlined"
                   sx={{
                     flex: { xs: '1 1 100%', md: '1 1 300px' },
                     '& .MuiOutlinedInput-root': {
                       '&:hover fieldset': {
                         borderColor: 'primary.main',
                       },
                     },
                   }}
                 />
               );

             case 'dropdown':
               return (
                 <FormControl
                   key={index}
                   sx={{
                     flex: { xs: '1 1 100%', md: '1 1 300px' },
                   }}
                 >
                   <InputLabel>{filter.label}</InputLabel>
                   <Select
                     value={filter.value}
                     onChange={filter.onChange}
                     displayEmpty
                     label={filter.label}
                     MenuProps={{
                       PaperProps: {
                         sx: {
                           maxHeight: 300,
                           boxShadow: 3
                         }
                       }
                     }}
                     sx={{
                       '&:hover .MuiOutlinedInput-notchedOutline': {
                         borderColor: 'primary.main',
                       },
                     }}
                   >
                     <MenuItem value="">{filter.placeholder || 'Select an option'}</MenuItem>
                     {filter.options?.map((option, idx) => (
                       <MenuItem 
                         key={idx} 
                         value={option.value}
                         sx={{
                           '&:hover': {
                             backgroundColor: 'action.hover',
                           },
                         }}
                       >
                         {option.label}
                       </MenuItem>
                     ))}
                   </Select>
                 </FormControl>
               );

             default:
               return null;
           }
         })}
       </Box>

    {/* Date Range, Checkbox and Add Button Row */}
    <Box 
    sx={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: 2,
      alignItems: 'flex-end',
      justifyContent: 'space-between'

    }}
    >
    <Box sx={{ 
      flex: '1',
      height: '100%' }}>
      {filters.map((filter, index) => 
        filter.type === 'dateRange' && (
          <DateRangeFilter
            key={index}
            startDate={filter.value[0]}
            endDate={filter.value[1]}
            onChange={filter.onChange}
          />
        )
      )}
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', mt: 4, height: '100%', gap: 0 }}>
      {filters.map((filter, index) => 
        filter.type === 'checkbox' && (
          <FormControlLabel
            key={index}
            control={
              <Checkbox
                checked={filter.value}
                onChange={filter.onChange}
              />
            }
            label={filter.label || ''}
          />
        )
      )}
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', mt: 4, height: '100%' }}>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        color="primary"
        onClick={() => navigate('/shows/add')}
        sx={{ textTransform: "none" }}
      >
        Add a show
      </Button>
    </Box>
    </Box>
     </Stack>
   </Paper>
 );
}

export default DynamicFilterComponent;