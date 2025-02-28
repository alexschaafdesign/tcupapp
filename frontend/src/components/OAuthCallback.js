import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useXenforoAuth } from '../auth/XenforoAuth';

function OAuthCallback() {
  const { handleCallback } = useXenforoAuth();
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      handleCallback(code);
    }
  }, []);

  return <div>Logging in...</div>;
}

export default OAuthCallback;