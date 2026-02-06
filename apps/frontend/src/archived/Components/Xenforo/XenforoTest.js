import React, { useState } from 'react';
import { checkUserAuth } from '../../utils/xenforoAuth';

const XenforoTest = () => {
    const [apiResponse, setApiResponse] = useState(null);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState('1');
  
    const testXenforoAPI = async () => {
      try {
        const response = await fetch(`/xenforo/api/users/${userId}`, {
          headers: {
            'XF-Api-Key': 'p3vmEGOs9kD-WpvBG_7R1N0Zhy1T715f'
          }
        });
        const data = await response.json();
        setApiResponse(data);
      } catch (error) {
        setError(error.message);
      }
    };
  
    return (
      <div>
        <input 
          type="text" 
          value={userId} 
          onChange={(e) => setUserId(e.target.value)} 
          placeholder="Enter user ID"
        />
        <button onClick={testXenforoAPI}>Test User Auth</button>
        {apiResponse && <pre>{JSON.stringify(apiResponse, null, 2)}</pre>}
        {error && <div style={{ color: 'red' }}>{error}</div>}
      </div>
    );
  };

export default XenforoTest;