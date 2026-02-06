import { Chip } from '@mui/material';

const StatusBadge = ({ playShows }) => {

  if (!playShows) {
    return null;
  }

  const getStatusDisplay = () => {
    switch (playShows?.toLowerCase()) {
      case 'yes':
        return { label: 'Looking to play shows now!', color: 'success' };
      case 'not right now':
        return { label: 'Not looking to play shows right now', color: 'default' };
      case 'maybe':
        return { label: 'Maybe looking to play shows', color: 'warning' };
      default:
        return { label: 'Unknown', color: 'default' };
    }
  };

  const status = getStatusDisplay();

  return (
    <Chip
      label={status.label}
      color={status.color}
      size="small"
      sx={{ 
        width: "fill",
        height: "auto",
      }}
    />
  );
};

export default StatusBadge;