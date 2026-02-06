// ColorThemeSelector component
const ColorThemeSelector = ({ selectedTheme, onThemeChange }) => {
    // Predefined theme options
    const themeOptions = [
      { id: 'default', name: 'Classic', primary: '#3f51b5', secondary: '#f50057' },
      { id: 'dark', name: 'Dark Stage', primary: '#272727', secondary: '#ff4081' },
      { id: 'vintage', name: 'Vintage', primary: '#a67c00', secondary: '#bf360c' },
      { id: 'indie', name: 'Indie', primary: '#1976d2', secondary: '#388e3c' },
      { id: 'punk', name: 'Punk', primary: '#d32f2f', secondary: '#212121' },
      // More themes...
    ];
  
    return (
      <Box>
        <Typography variant="h6" gutterBottom>Select Your Profile Theme</Typography>
        <Grid container spacing={2}>
          {themeOptions.map((theme) => (
            <Grid item key={theme.id} xs={6} sm={4} md={3}>
              <Paper 
                elevation={selectedTheme === theme.id ? 8 : 1}
                onClick={() => onThemeChange(theme.id)}
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  border: selectedTheme === theme.id ? 
                    `2px solid ${theme.primary}` : '2px solid transparent',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '5px',
                    background: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})`,
                  }
                }}
              >
                <Typography variant="subtitle1" gutterBottom align="center">
                  {theme.name}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                  <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: theme.primary }} />
                  <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: theme.secondary }} />
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };