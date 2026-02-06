import React, { useState } from 'react';

const AuthTest = () => {
  const [userData, setUserData] = useState(null);

  const checkAuth = async () => {
    try {
      const response = await fetch('/auth/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'XF-Api-Key': 'p3vmEGOs9kD-WpvBG_7R1N0Zhy1T715f'
        },
        body: JSON.stringify({
          login: 'alex.schaaf@gmail.com',
          password: 'Bbt1wsdxe!'
        }),
        credentials: 'include'
      });
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  return (
    <div>
      <button onClick={checkAuth}>Check Current User</button>
      {userData && <pre>{JSON.stringify(userData, null, 2)}</pre>}
    </div>
  );
};

export default AuthTest;