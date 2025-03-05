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
  Collapse,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useAuth } from "../../hooks/useAuth";
import HeaderUserProfile from "./HeaderUserProfile";
import palette from "../../styles/colors/palette";
import { ContactSupport } from "@mui/icons-material";

// Component for consistent dividers
const CustomDivider = ({ container = false }) => (
  <Divider sx={{ 
    width: container ? '100%' : 'calc(100% - 32px)', 
    mx: 'auto', 
    my: 1,
    backgroundColor: palette.neutral.gray
  }} />
);

// Component for expandable dropdown menus
const ExpandableMenu = ({ title, isExpanded, setIsExpanded, links, closeOtherMenus, closeDrawer }) => {
  return (
    <Box sx={{ mb: 2 }}>
      <ListItem
        button
        onClick={() => {
          setIsExpanded(!isExpanded);
          if (!isExpanded && closeOtherMenus) closeOtherMenus();
        }}
        sx={{
          ...navItemStyles, // Use shared styles
          mb: -1, // Override mb from navItemStyles
          color: title === "admin" ? "green" : "#000000",
          cursor: "pointer",
          backgroundColor: isExpanded ? "rgba(97, 56, 179, 0.15)" : "transparent",
          ml: 0
        }}
      >
        <ListItemText
          primary={title}
          primaryTypographyProps={{ 
            fontFamily: "'Courier New', monospace",
            textTransform: "lowercase",
            fontSize: "16px",
          }}
        />
        {isExpanded ? <ExpandMoreIcon sx={{ transform: 'rotate(180deg)' }} /> : <ExpandMoreIcon />}
      </ListItem>
      <Collapse in={isExpanded}>
        <Box sx={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.02)',
          borderLeft: '2px solid rgba(0, 0, 0, 0.1)',
          ml: 1,
          mr: 1,
          mt: title !== "admin" ? 2 : 2,
          borderRadius: '2px',
          overflow: 'hidden',
          mb: 1
        }}>
          {links.map((link, index) => (
            <NavLink
              key={index}
              link={link}
              closeDrawer={closeDrawer}
            />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};

// Logo component for reuse
const Logo = ({ size = "desktop", onClick = null }) => {
  const sizes = {
    desktop: { logo: "140px", theFont: "16px", cupboardFont: "25px" },
    mobile: { logo: "40px", theFont: "12px", cupboardFont: "18px" },
    drawer: { logo: "100px", theFont: "16px", cupboardFont: "25px" }
  };
  
  const current = sizes[size];
  const navigate = useNavigate();
  
  const handleClick = (e) => {
    e.preventDefault();
    navigate('/');
    if (onClick) onClick();
  };
  
  return (
    <Box 
      sx={{ 
        textAlign: size !== "mobile" ? "center" : "left", 
        zIndex: 2,
        display: 'flex',
        flexDirection: size !== "mobile" ? 'column' : 'row',
        alignItems: size !== "mobile" ? 'center' : 'center',
      }}
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      <Box
        component="img"
        src="https://res.cloudinary.com/dsll3ms2c/image/upload/v1740082499/TCUPlogo-traced_BLACK_a0wwot.png"
        alt="TCUP Logo"
        sx={{
          width: current.logo,
          height: "auto",
          mb: size !== "mobile" ? 2 : 0,
        }}
      />
      <Box
        sx={{
          fontFamily: "'Geist Mono', monospace",
          ml: size === "mobile" ? 2 : 0,
          textAlign: size !== "mobile" ? "center" : "left",
          mb: -1
        }}
      >
        <Box sx={{ fontSize: current.theFont, fontWeight: 400, lineHeight: 1 }}>
          the
        </Box>
        <Box sx={{ fontSize: current.cupboardFont, fontWeight: 900, color: "#6138B3" }}>
          CUPBOARD
        </Box>
      </Box>
    </Box>
  );
};

const Header = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({
    resources: false,
    tcup: false,
    admin: false
  });
  
  // Function to close the drawer
  const closeDrawer = () => setDrawerOpen(false);
  
  const toggleMenu = (menu) => {
    setExpandedMenus({
      ...expandedMenus,
      [menu]: !expandedMenus[menu],
      // Close other menus when opening this one
      ...(menu === 'resources' && !expandedMenus.resources ? { tcup: false } : {}),
      ...(menu === 'tcup' && !expandedMenus.tcup ? { resources: false } : {})
    });
  };

  const navigate = useNavigate();
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0();
  const isDevMode = process.env.NODE_ENV === "development";
  const { isAdmin } = useAuth();

  // Define all navigation links
  const navLinks = [
    { text: "chat", path: "/chat" },
    { text: "show list", path: "/shows" }
  ];

  const resourceLinks = [
    { text: "venues", path: "/venues" },
    { text: "session musicians", path: "/sessionmusicians" },
    { text: "power pledge", path: "/powerpledge" },
  ].map(link => ({
    ...link,
    disabled: !isDevMode && link.devOnly,
  }));
  
  const organizeLinks = [
    { text: "about TCUP", path: "/about" },
    { text: "join TCUP", path: "https://airtable.com/appWhJi1YbIsdiXrw/pagHJycS1fOI0TGLS/form", external: true },
    { text: "power pledge", path: "/powerpledge" },
  ].map(link => ({
    ...link,
    disabled: !isDevMode && link.devOnly,
  }));
  
  const adminLinks = [
    { text: "add update", path: "/admin/updates" },
  ];

  const toggleDrawer = (open) => (event) => {
    if (event?.type === 'keydown' && (event?.key === 'Tab' || event?.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  // Common background style for noise texture
  const noiseBackground = {
    "&::before": {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'url("https://res.cloudinary.com/dsll3ms2c/image/upload/v1740072216/noisebg_for_header_xyr0ou.png")',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      opacity: 0.15,
      zIndex: 1,
    }
  };

  return (
    <>
      {/* Desktop Vertical Header */}
      <AppBar 
        position="fixed"
        sx={{
          width: '224px',
          height: '100vh',
          left: 0,
          top: 0,
          background: 'linear-gradient(180deg, #ECECEC 0%, #FFFFFF 100%)',
          boxShadow: '1px 0px 4px rgba(0, 0, 0, 0.1)',
          color: '#000000',
          display: { xs: "none", md: "block" },
          "& *": { zIndex: 2 },
          zIndex: 1200, // Ensure it's above other content
          ...noiseBackground
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {/* Logo Section */}
          <Box sx={{ pt: 2, pb: 1, px: 2, textAlign: "center" }}>
            <Logo size="desktop" />
          </Box>
          
          <CustomDivider />
          
          {/* Navigation Links */}
          <List sx={{ width: "100%", px: 2, py: 0 }}>
            <Box sx={{ mb: 2 }}>
              <ExpandableMenu 
                title="tcup"
                isExpanded={expandedMenus.tcup}
                setIsExpanded={() => toggleMenu('tcup')}
                links={organizeLinks}
                closeDrawer={closeDrawer}
              />
            </Box>
            
            <CustomDivider container={true} />
            
            {navLinks.map((link, index) => (
              <NavLink 
                key={index} 
                link={link} 
                closeDrawer={closeDrawer}
              />
            ))}
            
            <Box sx={{ mb: 2 }}>
              <ExpandableMenu 
                title="resources"
                isExpanded={expandedMenus.resources}
                setIsExpanded={() => toggleMenu('resources')}
                links={resourceLinks}
                closeDrawer={closeDrawer}
              />
            </Box>
          </List>
  
         {/* Auth Section */}
          <Box sx={{ mt: "auto" }}>
            {isAuthenticated && isAdmin && (
              <Box sx={{ mb: 2, px: 2 }}>
                <ExpandableMenu 
                  title="admin"
                  isExpanded={expandedMenus.admin}
                  setIsExpanded={() => toggleMenu('admin')}
                  links={adminLinks}
                  closeDrawer={closeDrawer}
                />
              </Box>
            )}
            <CustomDivider />
            {isAuthenticated && (
            <List sx={{ px: 2 }}>
              <NavLink 
                link={{ text: "contact", path: "/contact" }}
                closeDrawer={closeDrawer}
              />
            </List>
          )}
            <List sx={{ px: 2 }}>
              <AuthButtons 
                isAuthenticated={isAuthenticated} 
                loginWithRedirect={loginWithRedirect}
                logout={logout}
              />
            </List>
          </Box>
        </Box>
      </AppBar>
  
      {/* Mobile Header */}
      <AppBar
        position="sticky"
        sx={{
          backgroundColor: "#F5F5F5",
          display: { xs: "flex", md: "none" },
          flexDirection: "row",
          padding: "10px 20px",
          height: "60px",
          width: "100%",
          alignItems: "center",
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
          color: '#000000',
          ...noiseBackground
        }}
      >
        <Logo size="mobile" />
  
        <IconButton
          sx={{ marginLeft: "auto", color: "#000000", zIndex: 2 }}
          onClick={toggleDrawer(true)}
        >
          <MenuIcon />
        </IconButton>
      </AppBar>
  
      {/* Mobile Drawer */}
      <Drawer 
        anchor="left" 
        open={drawerOpen} 
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            width: "250px",
            background: 'linear-gradient(180deg, #ECECEC 0%, #FFFFFF 100%)',
            color: '#000000',
            ...noiseBackground
          }
        }}
      >
        <Box sx={{ py: 2, display: "flex", flexDirection: "column", height: "100%" }}>
          <Box sx={{ px: 2, textAlign: "center", mb: 2 }}>
            <Logo size="drawer" onClick={closeDrawer} />
          </Box>
          
          <CustomDivider />
          
          <List sx={{ px: 2, py: 0, zIndex: 2 }}>
            <Box sx={{ mb: 2 }}>
              <ExpandableMenu 
                title="tcup"
                isExpanded={expandedMenus.tcup}
                setIsExpanded={() => toggleMenu('tcup')}
                links={organizeLinks}
                closeDrawer={closeDrawer}
              />
            </Box>
            
            <CustomDivider container={true} />
            
            {navLinks.map((link, index) => (
              <NavLink 
                key={index} 
                link={link} 
                closeDrawer={closeDrawer}
              />
            ))}
            
            <Box sx={{ mb: 2 }}>
              <ExpandableMenu 
                title="resources"
                isExpanded={expandedMenus.resources}
                setIsExpanded={() => toggleMenu('resources')}
                links={resourceLinks}
                closeDrawer={closeDrawer}
              />
            </Box>
          </List>

          <Box sx={{ mt: "auto", zIndex: 2 }}>
            {/* Show user profile for all authenticated users */}
            {isAuthenticated && (
              <>
            <HeaderUserProfile closeDrawer={closeDrawer} />
            <CustomDivider />
              </>
            )}
            
            {/* Admin section remains conditional */}
            {isAuthenticated && isAdmin && (
              <>
                <Box sx={{ mb: 2, px: 2 }}>
                  <ExpandableMenu 
                    title="admin"
                    isExpanded={expandedMenus.admin}
                    setIsExpanded={() => toggleMenu('admin')}
                    links={adminLinks}
                    closeDrawer={closeDrawer}
                  />
                </Box>
                <CustomDivider />
              </>
            )}
            
            <List sx={{ px: 2 }}>
              <AuthButtons 
                isAuthenticated={isAuthenticated} 
                loginWithRedirect={loginWithRedirect}
                logout={logout}
                closeDrawer={closeDrawer}
              />
            </List>
          </Box>
        </Box>
      </Drawer>
  
      {/* Content Margin Offset */}
      <Box sx={{ marginLeft: { xs: 0, md: "224px" } }} />
    </>
  );
};

// Common styles that can be shared between NavLink and menu items
const navItemStyles = {
  borderRadius: "8px",
  fontFamily: "'Courier New', monospace",
  textTransform: "lowercase",
  px: 1.5, 
  py: 0.5,
  mb: 1,
  "&:hover": {
    backgroundColor: "rgba(97, 56, 179, 0.15)",
  },
};

// Extract NavLink as a functional component
const NavLink = ({ link, closeDrawer }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = location.pathname === link.path;

  const handleClick = () => {
    if (!link.external && !link.disabled) {
      navigate(link.path);
      // Close the drawer
      if (closeDrawer) closeDrawer();
    }
  };

  return (
    <ListItem
      component={link.external ? "a" : "div"}
      href={link.external ? link.path : undefined}
      target={link.external ? "_blank" : undefined}
      rel={link.external ? "noopener noreferrer" : undefined}
      button={!link.external}
      disabled={link.disabled}
      onClick={handleClick}
      sx={{
        ...navItemStyles,
        color: isActive ? "#6138B3" : "#000000",
        backgroundColor: isActive ? "rgba(97, 56, 179, 0.15)" : "transparent",
        cursor: link.disabled ? "not-allowed" : "pointer",
        opacity: link.disabled ? 0.5 : 1,
      }}
    >
      <ListItemText
        primary={link.text}
        sx={{
          fontFamily: "'Courier New', monospace",
          textTransform: "lowercase",
          fontSize: "16px",
        }}
      />
    </ListItem>
  );
};

// Extract Auth buttons as a functional component
const AuthButtons = ({ isAuthenticated, loginWithRedirect, logout, closeDrawer }) => {
  const handleAuth = () => {
    if (isAuthenticated) {
      logout({ 
        logoutParams: {
          returnTo: process.env.REACT_APP_AUTH0_REDIRECT_URI || window.location.origin
        }
      });
    } else {
      loginWithRedirect();
    }
    
    // Close the drawer
    if (closeDrawer) closeDrawer();
  };

  return (
    <ListItem
      button
      onClick={handleAuth}
      sx={{
        color: "#000000",
        cursor: "pointer",
        fontFamily: "'Courier New', monospace",
        textTransform: "lowercase",
        "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
        py: 1.5,
      }}
    >
      <ListItemText
        primary={isAuthenticated ? "logout" : "login"}
        primaryTypographyProps={{ 
          fontFamily: "'Courier New', monospace",
          textTransform: "lowercase",
          fontSize: "16px",
        }}
      />
    </ListItem>
  );
};

export default Header;