import React from 'react';
import RedirectPage from '../RedirectPage';

const Newsletter = () => {
  // Replace this URL with your actual external venue report card URL
  const externalUrl = 'https://secure.everyaction.com/xGrCCCak6EWC-liPxFFvEg2';
  
  return (
    <RedirectPage
      title="Newsletter"
      description="You are being redirected to TCUP's newsletter sign-up form"
      targetUrl={externalUrl}
      autoRedirect={true}
      redirectDelay={3000}
    />
  );
};

export default Newsletter;