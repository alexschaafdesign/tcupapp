import React from 'react';
import RedirectPage from '../RedirectPage';

const VenueReportCardPage = () => {
  // Replace this URL with your actual external venue report card URL
  const externalUrl = 'https://airtable.com/appBxG22efe9yoPaa/pagoL9lvXsNovlvak/form';
  
  return (
    <RedirectPage
      title="Venue Report Card"
      description="You are being redirected to the Venue Report Card. This tool allows performers to share their experiences with venues in the Minneapolis music scene."
      targetUrl={externalUrl}
      autoRedirect={true}
      redirectDelay={3000}
    />
  );
};

export default VenueReportCardPage;