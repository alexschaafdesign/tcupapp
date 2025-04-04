// FeaturedContentSelector component
const FeaturedContentSelector = ({ formData, selectedFeatures, onFeaturesChange }) => {
    // Generate options based on data already in the form
    const getContentOptions = () => {
      const options = [];
      
      // Latest release
      if (formData.releases?.length > 0) {
        formData.releases.forEach(release => {
          if (release.title) {
            options.push({
              id: `release-${release.title}`,
              type: 'release',
              title: release.title,
              description: `${release.type || 'Release'} - ${release.releaseDate || 'Recent'}`
            });
          }
        });
      }
      
      // Merch
      if (formData.hasMerch && formData.merchUrl) {
        options.push({
          id: 'merch',
          type: 'merch',
          title: 'Merchandise',
          description: 'Your band merchandise store'
        });
      }
      
      // Add more options based on other form data
      
      return options;
    };
    
    const contentOptions = getContentOptions();
    
    return (
      <Box>
        <Typography variant="h6" gutterBottom>Feature Content (Select up to 3)</Typography>
        <List>
          {contentOptions.map((option) => (
            <ListItem key={option.id} disablePadding>
              <ListItemButton 
                onClick={() => {
                  const isSelected = selectedFeatures.includes(option.id);
                  let newSelected = [...selectedFeatures];
                  
                  if (isSelected) {
                    // Remove if already selected
                    newSelected = newSelected.filter(id => id !== option.id);
                  } else if (newSelected.length < 3) {
                    // Add if not already selected and fewer than 3 items selected
                    newSelected.push(option.id);
                  }
                  
                  onFeaturesChange(newSelected);
                }}
                selected={selectedFeatures.includes(option.id)}
              >
                <ListItemIcon>
                  {option.type === 'release' && <AlbumIcon />}
                  {option.type === 'merch' && <StoreIcon />}
                  {/* Icons for other types */}
                </ListItemIcon>
                <ListItemText 
                  primary={option.title} 
                  secondary={option.description} 
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        {contentOptions.length === 0 && (
          <Alert severity="info">
            Add releases, merchandise, or other content in previous steps to select featured content.
          </Alert>
        )}
        {selectedFeatures.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Selected Features ({selectedFeatures.length}/3)
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {selectedFeatures.map(id => {
                const option = contentOptions.find(opt => opt.id === id);
                return option ? (
                  <Chip 
                    key={id} 
                    label={option.title}
                    onDelete={() => {
                      const newSelected = selectedFeatures.filter(item => item !== id);
                      onFeaturesChange(newSelected);
                    }}
                  />
                ) : null;
              })}
            </Box>
          </Box>
        )}
      </Box>
    );
  };