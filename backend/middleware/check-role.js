// middleware/check-role.js
const checkRole = (requiredRoles) => {
    return (req, res, next) => {
      const namespace = 'https://tcupboard.org';
      const userRoles = req.user[`${namespace}/roles`] || [];
      
      const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
      
      if (hasRequiredRole) {
        return next();
      }
      
      return res.status(403).json({ message: 'Insufficient permissions' });
    };
  };
  
  export default checkRole;