import React, { useState, useEffect, useRef } from 'react';
import { Badge, IconButton, Typography, Box, Avatar, Paper, ClickAwayListener } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const NotificationBell = () => {
 const [notifications, setNotifications] = useState([]);
 const [unreadCount, setUnreadCount] = useState(0);
 const [notificationOpen, setNotificationOpen] = useState(false);
 const { isAuthenticated, getAccessTokenSilently } = useAuth0();
 const navigate = useNavigate();
 const bellRef = useRef(null);
 const notificationDropdownRef = useRef(null);

 const getDropdownStyle = (buttonRef) => {
   if (!buttonRef.current) return {};
   const rect = buttonRef.current.getBoundingClientRect();
   return {
     position: 'fixed',
     top: rect.bottom + 5,
     right: window.innerWidth - rect.right,
     zIndex: 9999,
     boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
     backgroundColor: 'white',
     borderRadius: '4px',
     overflow: 'hidden',
     width: '320px',
     maxHeight: '400px',
     overflowY: 'auto'
   };
 };

 const fetchNotifications = async () => {
   if (!isAuthenticated) return;
   try {
     const token = await getAccessTokenSilently();
     const response = await fetch(`${process.env.REACT_APP_API_URL}/notifications`, {
       headers: { Authorization: `Bearer ${token}` }
     });
     if (response.ok) {
       const data = await response.json();
       console.log('Notification data:', data); // Add this
       setNotifications(data.filter(n => !n.is_read));     }
   } catch (error) {
     console.error('Error fetching notifications:', error);
   }
 };

 const fetchUnreadCount = async () => {
   if (!isAuthenticated) return;
   try {
     const token = await getAccessTokenSilently();
     const response = await fetch(`${process.env.REACT_APP_API_URL}/notifications/unread/count`, {
       headers: { Authorization: `Bearer ${token}` }
     });
     if (response.ok) {
       const data = await response.json();
       setUnreadCount(data.count);
     }
   } catch (error) {
     console.error('Error fetching unread count:', error);
   }
 };

 const markAsRead = async (notification) => {
    try {
      const token = await getAccessTokenSilently();
      await fetch(`${process.env.REACT_APP_API_URL}/notifications/${notification.id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (notification.reply_id) {
        navigate(`/chat/${notification.thread_id}?highlight=${notification.reply_id}`);
      } else {
        navigate(`/chat/${notification.thread_id}`);
      }
      
      setNotifications(prevNotifications => prevNotifications.filter(n => n.id !== notification.id));
      setUnreadCount(prev => Math.max(0, prev - 1));
      setNotificationOpen(false);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

 const handleBellClick = () => {
   setNotificationOpen(prev => !prev);
   fetchNotifications();
 };

 const handleNotificationClose = () => {
   setNotificationOpen(false);
 };

 useEffect(() => {
   if (isAuthenticated) {
     fetchUnreadCount();
     const interval = setInterval(fetchUnreadCount, 60000);
     return () => clearInterval(interval);
   }
 }, [isAuthenticated]);

 if (!isAuthenticated) return null;

 return (
   <Box>
     <IconButton
       ref={bellRef}
       color="inherit"
       onClick={handleBellClick}
     >
       <Badge badgeContent={unreadCount} color="error">
         <NotificationsIcon />
       </Badge>
     </IconButton>

     {notificationOpen && (
       <ClickAwayListener onClickAway={handleNotificationClose}>
         <Paper 
           ref={notificationDropdownRef}
           sx={getDropdownStyle(bellRef)}
         >
           <Typography variant="subtitle1" sx={{ px: 2, py: 1, fontWeight: 'bold', borderBottom: '1px solid #f0f0f0' }}>
             Notifications
           </Typography>
           
           {notifications.length === 0 ? (
             <Box sx={{ px: 2, py: 1 }}>
               <Typography variant="body2">No notifications</Typography>
             </Box>
           ) : (
             notifications.map((notification) => (
               <Box
                 key={notification.id}
                 onClick={() => markAsRead(notification)}
                 sx={{
                   px: 2,
                   py: 1.5,
                   borderBottom: '1px solid #f0f0f0',
                   cursor: 'pointer',
                   borderLeft: notification.is_read ? 'none' : '3px solid #3f51b5',
                   bgcolor: notification.is_read ? 'transparent' : 'rgba(63, 81, 181, 0.08)',
                   '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
                 }}
               >
                 <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                   <Avatar 
                     src={notification.actor_avatar} 
                     alt={notification.actor_name}
                     sx={{ width: 36, height: 36 }}
                   />
                   <Box sx={{ flexGrow: 1 }}>
                     <Typography 
                       variant="body2" 
                       sx={{ 
                         fontWeight: notification.is_read ? 'normal' : 'bold',
                         whiteSpace: 'normal',
                         wordBreak: 'break-word'
                       }}
                     >
                       <strong>{notification.actor_name}</strong> replied to your post {notification.post_title && `"${notification.post_title}"`}
                     </Typography>
                     <Typography variant="caption" color="text.secondary">
                       {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                     </Typography>
                   </Box>
                 </Box>
               </Box>
             ))
           )}
         </Paper>
       </ClickAwayListener>
     )}
   </Box>
 );
};

export default NotificationBell;