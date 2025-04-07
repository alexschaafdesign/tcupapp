// ProfileBadgesSelector component
const ProfileBadgesSelector = ({ selectedBadges, onBadgesChange }) => {
    // Badge options that would be available to all bands
    const badgeOptions = [
      { id: 'local-favorite', name: 'Local Favorite', icon: '🏆', description: 'Highlight your local scene presence' },
      { id: 'new-release', name: 'New Release', icon: '🎵', description: 'Show you have new music out' },
      { id: 'touring', name: 'Currently Touring', icon: '🚐', description: 'Indicate you\'re actively touring' },
      { id: 'booking', name: 'Open for Bookings', icon: '📅', description: 'Let venues know you\'re available' },
      { id: 'collab', name: 'Open to Collabs', icon: '🤝', description: 'Interested in collaborating with others' },
      // More badges...
    ];
    
    return (
      <Box>
        <Typography variant="h6" gutterBottom>Profile Badges</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Select badges to display on your profile (up to 3)
        </Typography>
        
        <Grid container spacing={2}>
          {badgeOptions.map((badge) => (
            <Grid item key={badge.id} xs={12} sm={6} md={4}>
              <Paper 
                elevation={selectedBadges.includes(badge.id) ? 3 : 1}
                onClick={() => {
                  const isSelected = selectedBadges.includes(badge.id);
                  let newSelected = [...selectedBadges];
                  
                  if (isSelected) {
                    // Remove if already selected
                    newSelected = newSelected.filter(id => id !== badge.id);
                  } else if (newSelected.length < 3) {
                    // Add if not already selected and fewer than 3 badges selected
                    newSelected.push(badge.id);
                  }
                  
                  onBadgesChange(newSelected);
                }}
                sx={{
                  p: 2, 
                  cursor: 'pointer',
                  border: selectedBadges.includes(badge.id) ? 
                    `2px solid ${colorTokens.primary.main}` : '2px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Box 
                  sx={{ 
                    fontSize: 28, 
                    mr: 2, 
                    width: 40, 
                    height: 40, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}
                >
                  {badge.icon}
                </Box>
                <Box>
                  <Typography variant="subtitle1">{badge.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {badge.description}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
        
        {selectedBadges.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1">Selected Badges:</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
              {selectedBadges.map(id => {
                const badge = badgeOptions.find(b => b.id === id);
                return badge ? (
                  <Chip 
                    key={id} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: 8 }}>{badge.icon}</span>
                        {badge.name}
                      </Box>
                    }
                    onDelete={() => {
                      const newSelected = selectedBadges.filter(item => item !== id);
                      onBadgesChange(newSelected);
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