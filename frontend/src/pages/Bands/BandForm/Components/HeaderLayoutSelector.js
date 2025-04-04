// HeaderLayoutSelector component
const HeaderLayoutSelector = ({ selectedLayout, onLayoutChange }) => {
    const layoutOptions = [
      { id: 'classic', name: 'Classic', description: 'Image on left, text on right' },
      { id: 'centered', name: 'Centered', description: 'Large centered image with text below' },
      { id: 'hero', name: 'Hero', description: 'Full-width banner with image overlay' },
      { id: 'minimal', name: 'Minimal', description: 'Text-focused with small image' }
    ];
    
    return (
      <Box>
        <Typography variant="h6" gutterBottom>Choose Header Layout</Typography>
        <Grid container spacing={2}>
          {layoutOptions.map((layout) => (
            <Grid item key={layout.id} xs={12} sm={6}>
              <Paper 
                elevation={selectedLayout === layout.id ? 8 : 1}
                onClick={() => onLayoutChange(layout.id)}
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  border: selectedLayout === layout.id ? 
                    `2px solid ${colorTokens.primary.main}` : '2px solid transparent',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {/* Simple layout preview icon */}
                  <Box sx={{ 
                    width: 60, 
                    height: 40, 
                    border: '1px solid #ddd',
                    mr: 2,
                    position: 'relative',
                    // Custom styling for each layout preview
                    ...(layout.id === 'classic' && {
                      background: `linear-gradient(to right, #ddd 30%, transparent 30%)`,
                    }),
                    // Add styles for other layouts
                  }}/>
                  <Typography variant="subtitle1">{layout.name}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {layout.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };