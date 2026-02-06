import palette from './colors/palette'; // Import your palette

export const tables = {
  MuiTable: {
    styleOverrides: {
      root: {
        borderCollapse: 'collapse', // Prevents border spacing between table cells
        width: '100%',
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        padding: '8px', // Add padding to table cells
        '@media (max-width: 600px)': {
          display: 'block',
          width: '100%',
          padding: '8px 0', // Reduced padding for smaller screens
          borderBottom: '1px solid #ddd',
          '&:last-child': {
            borderBottom: 'none',
          },
          '&:before': {
            content: 'attr(data-label)',
            fontWeight: 'bold',
            display: 'block',
            marginBottom: '4px',
            color: palette.text.secondary, // Use your palette for text color
          },
        },
      },
      head: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: '1.5rem',
      },
      date: {
        textTransform: 'capitalize',
        color: '#f4f4f4',
      },
    },
  },
  MuiTableHead: {
    styleOverrides: {
      root: {
        textTransform: 'uppercase',
        '@media (max-width: 600px)': {
          display: 'none', // Hide the header on smaller screens
        },
      },
    },
  },
  MuiTableRow: {
    styleOverrides: {
      root: {
        '&:hover': {
          backgroundColor: '#f5f5f5', // Light hover effect for rows
        },
        '@media (max-width: 600px)': {
          display: 'block',
          marginBottom: '16px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '8px',
        },
      },
      head: {
        backgroundColor: '#9454cf', // Light purple background for table headers
        '&:hover': {
          backgroundColor: '#c873e6',
        },
      },
    },
  },
};