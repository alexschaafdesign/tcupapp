import React from 'react';
import RedirectPage from '../RedirectPage';

const JoinTCUP = () => {
  // Replace this URL with your actual external venue report card URL
  const externalUrl = 'https://airtable.com/appWhJi1YbIsdiXrw/pagHJycS1fOI0TGLS/form';
  
  return (
    <RedirectPage
      title="Join TCUP"
      description="You are being redirected to the Join TCUP form"
      targetUrl={externalUrl}
      autoRedirect={true}
      redirectDelay={3000}
    />
  );
};

export default JoinTCUP;