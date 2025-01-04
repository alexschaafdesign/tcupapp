import React, { useState } from "react";
import {
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  AppBar,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from '@auth0/auth0-react';
import HeaderUserProfile from "./HeaderUserProfile";
import { Link } from "react-router-dom";

const Header = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, loginWithRedirect, logout, user } = useAuth0();

  console.log('Header auth state:', { isAuthenticated, isLoading, user });


  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const navLinks = [
    { text: "TCUP CALENDAR", path: "/calendar"},
    { text: "MESSAGE BOARD", path: "/messages" },
    { text: "SHOWS", path: "/shows" },
    { text: "VENUES", path: "/venues" },
    { text: "BANDS", path: "/bands" },
  ];

  const AuthButtons = () => (
    <ListItem
      button
      onClick={() => isAuthenticated ? 
        logout({ returnTo: window.location.origin }) : 
        loginWithRedirect()
      }
      sx={{
        color: "white",
        cursor: "pointer",
        "&:hover": {
          backgroundColor: "rgba(255, 255, 255, 0.1)",
        },
      }}
    >
      <ListItemText 
        primary={isAuthenticated ? "LOGOUT" : "LOGIN"} 
        primaryTypographyProps={{ fontWeight: 'bold' }}
      />
    </ListItem>
  );

  return (
    <>
      {/* Desktop Vertical Header */}
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: "primary.main",
          width: { xs: "0px", md: "200px" },
          height: "100vh",
          left: 0,
          right: "auto",
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          padding: "20px",
          boxShadow: 4,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "30px",
          }}
        >
          <Link to="/shows">
            <Box
              component="img"
              src="https://res.cloudinary.com/dsll3ms2c/image/upload/v1735343525/LOGO_512_3x_t11sld.png"
              alt="TCUP Logo"
              sx={{
                width: "140px",
                height: "140px",
                borderRadius: "50%",
                objectFit: "cover",
                cursor: "pointer",
              }}
            />
          </Link>
        </Box>

        <List sx={{ 
          width: "100%",
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}>
          {navLinks.map((link, index) => (
            <ListItem
              button
              key={index}
              onClick={() => navigate(link.path)}
              sx={{
                color: "white",
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              <ListItemText 
                primary={link.text} 
                primaryTypographyProps={{ fontWeight: 'bold' }}
              />
            </ListItem>
          ))}
          
          <ListItem
            button
            onClick={() => setIsExpanded(!isExpanded)}
            sx={{
              color: "white",
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            <ListItemText 
              primary="PEOPLE" 
              primaryTypographyProps={{ fontWeight: 'bold' }}
            />
            <ExpandMoreIcon />
          </ListItem>
          
          {isExpanded && (
            <ListItem
              button
              onClick={() => navigate("/sessionmusicians")}
              sx={{
                color: "white",
                cursor: "pointer",
                paddingLeft: 3,
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              <ListItemText 
                primary="SESSION MUSICIANS" 
                primaryTypographyProps={{ fontWeight: 'bold' }}
              />
            </ListItem>
          )}

          <Box sx={{ mt: 'auto' }}>
            {isAuthenticated && (
              <>
                <Divider sx={{ my: 2, backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
                <HeaderUserProfile />
              </>
            )}
            <Divider sx={{ my: 2, backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
            <AuthButtons />
          </Box>
        </List>
      </AppBar>

      {/* Mobile Header */}
      <AppBar
        position="sticky"
        sx={{
          backgroundColor: "primary.main",
          display: { xs: "flex", md: "none" },
          flexDirection: "row",
          padding: "10px 20px",
          height: "80px",
          alignItems: "center",
        }}
      >
        <Box
          component="img"
          src={`${process.env.PUBLIC_URL}/assets/icons/tcuplogo.png`}
          alt="TCUP Logo"
          sx={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
        
        <IconButton
          sx={{
            marginLeft: "auto",
            color: "white",
          }}
          onClick={toggleDrawer(true)}
        >
          <MenuIcon />
        </IconButton>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        <List>
          {navLinks.map((link, index) => (
            <ListItem
              button
              key={index}
              onClick={() => {
                navigate(link.path);
                setDrawerOpen(false);
              }}
              sx={{
                cursor: "pointer"
              }}
            >
              <ListItemText 
                primary={link.text}
                primaryTypographyProps={{ fontWeight: 'bold' }}
              />
            </ListItem>
          ))}

          <ListItem
            button
            onClick={() => setIsExpanded(!isExpanded)}
            sx={{
              cursor: "pointer"
            }}
          >
            <ListItemText 
              primary="PEOPLE"
              primaryTypographyProps={{ fontWeight: 'bold' }}
            />
            <ExpandMoreIcon />
          </ListItem>
          
          {isExpanded && (
            <ListItem
              button
              onClick={() => {
                navigate("/sessionmusicians");
                setDrawerOpen(false);
              }}
              sx={{
                cursor: "pointer",
                paddingLeft: 1
              }}
            >
              <ListItemText 
                primary="SESSION MUSICIANS"
                primaryTypographyProps={{ fontWeight: 'bold' }}
              />
            </ListItem>
          )}
          
          {isAuthenticated && (
            <>
              <Divider sx={{ my: 2 }} />
              <HeaderUserProfile />
            </>
          )}
          <Divider sx={{ my: 2 }} />
          <AuthButtons />
        </List>
      </Drawer>

      {/* Content Margin Offset */}
      <Box sx={{ marginLeft: { xs: 0, md: "250px" } }} />
    </>
  );
};

export default Header;