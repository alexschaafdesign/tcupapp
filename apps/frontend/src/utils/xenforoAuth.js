export const checkUserAuth = async (userId) => {
    try {
      const response = await fetch(`/xenforo/api/users/${userId}`, {
        headers: {
          'XF-Api-Key': 'p3vmEGOs9kD-WpvBG_7R1N0Zhy1T715f'
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Auth check failed:', error);
      return null;
    }
  };