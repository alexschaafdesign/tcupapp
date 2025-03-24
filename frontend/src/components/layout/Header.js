import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useAuth } from "../../hooks/useAuth";

// Material UI components
import {
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  AppBar,
  Divider,
  Collapse,
} from "@mui/material";

// Icons
import MenuIcon from "@mui/icons-material/Menu";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import LoginIcon from "@mui/icons-material/Login";

// Local components and data
import HeaderUserProfile from "./HeaderUserProfile";
import palette from "../../styles/colors/palette";
import getNavLinks from "./NavigationItems";
import { typography } from "../../styles/typography"; // Update this path as needed

// Layout constants
const LAYOUT = {
  SIDEBAR_WIDTH: '224px',
  DRAWER_WIDTH: '250px',
  MOBILE_HEADER_HEIGHT: '60px'
};


// Shared typography style
const menuTypographyProps = {
  fontFamily: typography.h5.fontFamily,
  textTransform: "lowercase",
  fontSize: typography.body2.fontSize,
  letterSpacing: "0.2px !important", 
};

// Common icon style
const iconStyle = {
  minWidth: 30,
  mr: 0.5
};

// Common styles for nav items
const navItemStyles = {
  borderRadius: "8px",
  fontFamily: typography.h5.fontFamily,
  textTransform: "lowercase",
  px: 1.5, 
  py: 0.25,
  mb: 0.5,
  "&:hover": {
    backgroundColor: "rgba(97, 56, 179, 0.15)",
  },
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

// Component for consistent dividers
const CustomDivider = ({ container = false }) => (
  <Divider sx={{ 
    width: container ? '100%' : 'calc(100% - 32px)', 
    mx: 'auto', 
    my: 0.5,
    color: palette.neutral.twenty
  }} />
);

// NavLink component
const NavLink = ({ link, closeDrawer }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = location.pathname === link.path;

  const handleClick = () => {
    if (!link.external && !link.disabled) {
      navigate(link.path);
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
      {link.icon && (
        <ListItemIcon sx={{ 
          ...iconStyle,
          color: isActive ? palette.primary.main : palette.neutral.twenty,
        }}>
          {link.icon}
        </ListItemIcon>
      )}
      <ListItemText
        primary={link.text}
        primaryTypographyProps={menuTypographyProps}
      />
    </ListItem>
  );
};

// ExpandableMenu component
const ExpandableMenu = ({ title, isExpanded, setIsExpanded, links, closeDrawer, icon }) => {
  return (
    <Box sx={{ mb: 1 }}>
      <ListItem
        button
        onClick={() => setIsExpanded(!isExpanded)}
        sx={{
          ...navItemStyles,
          mb: -1,
          color: title === "admin" ? "green" : "#000000",
          cursor: "pointer",
          backgroundColor: isExpanded ? "rgba(97, 56, 179, 0.15)" : "transparent",
          ml: 0
        }}
      >
        {icon && (
          <ListItemIcon sx={{ 
            ...iconStyle,
            color: palette.neutral.twenty,
          }}>            
            {icon}
          </ListItemIcon>
        )}
        <ListItemText
          primary={title}
          primaryTypographyProps={menuTypographyProps}
        />
{isExpanded ? 
  <ExpandMoreIcon sx={{ 
    transform: 'rotate(180deg)', 
    fontSize: '1rem',  // Make smaller (default is ~1.5rem)
    color: 'rgba(0, 0, 0, 0.4)', // Make lighter
    opacity: 0.7  // Additional subtlety
  }} /> 
  : 
  <ExpandMoreIcon sx={{ 
    fontSize: '1rem',  // Make smaller
    color: 'rgba(0, 0, 0, 0.4)', // Make lighter
    opacity: 0.7  // Additional subtlety
  }} />
}      </ListItem>
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

// Auth buttons component
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
    
    if (closeDrawer) closeDrawer();
  };

  return (
    <ListItem
  button
  onClick={handleAuth}
  sx={{
    ...navItemStyles, // Add this to maintain consistency
    color: "#000000",
    cursor: "pointer",
    "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
  }}
>
      <ListItemIcon sx={{ 
        ...iconStyle,
        color: palette.error.main,
      }}>
        {isAuthenticated ? <ExitToAppIcon fontSize="small" /> : <LoginIcon fontSize="small" />}
      </ListItemIcon>
      <ListItemText
        primary={isAuthenticated ? "logout" : "login"}
        primaryTypographyProps={menuTypographyProps}
      />
    </ListItem>
  );
};

// Logo component
const Logo = ({ size = "desktop", onClick = null }) => {
  const sizes = {
    desktop: { logo: "100px", theFont: "16px", cupboardFont: "25px" },
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
          fontFamily: typography.h5.fontFamily,
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

// Main Header component
const Header = () => {
  // Initialize hooks
  const navigate = useNavigate();
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0();
  const { isAdmin } = useAuth();
  const isDevMode = process.env.NODE_ENV === "development";
  
  // Get navigation items
  const { 
    mainLinks, 
    resourceLinks, 
    organizeLinks, 
    adminLinks,
    contactLink,
    menuIcons
  } = getNavLinks(isDevMode);
  
  // State management
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({
    resources: false,
    tcup: false,
    admin: false
  });
  
  // Event handlers
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

  const toggleDrawer = (open) => (event) => {
    if (event?.type === 'keydown' && (event?.key === 'Tab' || event?.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  // Render methods
  const renderDesktopSidebar = () => (
    <AppBar 
      position="fixed"
      sx={{
        width: LAYOUT.SIDEBAR_WIDTH,
        height: '100vh',
        left: 0,
        top: 0,
        background: 'linear-gradient(180deg, #ECECEC 0%, #FFFFFF 100%)',
        boxShadow: '1px 0px 4px rgba(0, 0, 0, 0.1)',
        color: '#000000',
        display: { xs: "none", md: "block" },
        "& *": { zIndex: 2 },
        zIndex: 1200,
        ...noiseBackground,
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      <Box 
        sx={{ 
          display: "flex", 
          flexDirection: "column", 
          minHeight: "100%",
          pb: 2
        }}
      >
        {/* Logo Section */}
        <Box 
          sx={{ 
            pt: 1.5, 
            pb: 3, 
            px: 2, 
            textAlign: "center", 
            position: "sticky", 
            top: 0, 
            zIndex: 3,
            backgroundColor: "rgba(236, 236, 236, 0.9)",
            backdropFilter: "blur(5px)"
          }}
        >
          <Logo size="desktop" />
        </Box>
        
        {/* Navigation Links */}
        <List sx={{ width: "100%", px: 2, py: 0 }}>
          <Box sx={{ mb: 1 }}>
            <ExpandableMenu 
              title="tcup"
              isExpanded={expandedMenus.tcup}
              setIsExpanded={() => toggleMenu('tcup')}
              links={organizeLinks}
              closeDrawer={closeDrawer}
              icon={menuIcons.tcup}
            />
          </Box>
          
          {mainLinks.map((link, index) => (
            <NavLink 
              key={index} 
              link={link} 
              closeDrawer={closeDrawer}
            />
          ))}
          
          <Box sx={{ mb: 1 }}>
            <ExpandableMenu 
              title="resources"
              isExpanded={expandedMenus.resources}
              setIsExpanded={() => toggleMenu('resources')}
              links={resourceLinks}
              closeDrawer={closeDrawer}
              icon={menuIcons.resources}
            />
          </Box>
        </List>

        {/* Auth Section */}
        <Box sx={{ mt: "auto", zIndex: 2 }}>
          {/* Admin section remains conditional */}
          {/* Admin link: only on mobile drawer */}
          {isAuthenticated && isAdmin && (
            <>
              <Box 
                sx={{ 
                  mb: 2, 
                  px: 2, 
                  // Hide on md+ so it only shows in the mobile drawer
                  display: { xs: 'block', md: 'none', lg: 'none', xl: 'none' } 
                }}
              >
                <NavLink
                  link={{
                    path: '/admin',
                    text: 'Admin Dashboard',
                    icon: adminLinks[0]?.icon,
                  }}
                  closeDrawer={closeDrawer}
                />
              </Box>
              <CustomDivider />
            </>
          )}
          
          <List sx={{ px: 2 }}>
            <NavLink 
              link={contactLink}
              closeDrawer={closeDrawer}
            />
            <AuthButtons 
              isAuthenticated={isAuthenticated} 
              loginWithRedirect={loginWithRedirect}
              logout={logout}
              closeDrawer={closeDrawer}
            />
          </List>
        </Box>
      </Box>
    </AppBar>
  );

  const renderMobileHeader = () => (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: "#F5F5F5",
        display: { xs: "flex", md: "none" },
        flexDirection: "row",
        padding: "10px 20px",
        height: LAYOUT.MOBILE_HEADER_HEIGHT,
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
  );

  const renderMobileDrawer = () => (
    <Drawer 
      anchor="left" 
      open={drawerOpen} 
      onClose={toggleDrawer(false)}
      PaperProps={{
        sx: {
          width: LAYOUT.DRAWER_WIDTH,
          background: 'linear-gradient(180deg, #ECECEC 0%, #FFFFFF 100%)',
          color: '#000000',
          ...noiseBackground,
          overflowY: 'auto'
        }
      }}
    >
      <Box sx={{ py: 2, display: "flex", flexDirection: "column", height: "100%" }}>
        <Box sx={{ px: 2, textAlign: "center", mb: 2 }}>
          <Logo size="drawer" onClick={closeDrawer} />
        </Box>
        
        
        <List sx={{ px: 2, py: 0, zIndex: 2 }}>
          <Box sx={{ mb: 2 }}>
            <ExpandableMenu 
              title="tcup"
              isExpanded={expandedMenus.tcup}
              setIsExpanded={() => toggleMenu('tcup')}
              links={organizeLinks}
              closeDrawer={closeDrawer}
              icon={menuIcons.tcup}
            />
          </Box>
          
          
          {mainLinks.map((link, index) => (
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
              icon={menuIcons.resources}
            />
          </Box>
        </List>

        <Box sx={{ mt: "auto", zIndex: 2 }}>
          {/* Keep HeaderUserProfile ONLY in the mobile drawer */}
          {isAuthenticated && (
            <>
              <HeaderUserProfile closeDrawer={closeDrawer} />
            </>
          )}
          
          {/* Admin section remains conditional */}
          {/* Admin link: only on mobile drawer */}
          {isAuthenticated && isAdmin && (
            <>
              <Box 
                sx={{ 
                  mb: 2, 
                  px: 2, 
                  // Hide on md+ so it only shows in the mobile drawer
                  display: { xs: 'block', md: 'none' } 
                }}
              >
                <NavLink
                  link={{
                    path: '/admin',
                    text: 'Admin Dashboard',
                    icon: adminLinks[0]?.icon,
                  }}
                  closeDrawer={closeDrawer}
                />
              </Box>
              <CustomDivider />
            </>
          )}

          <List sx={{ px: 2 }}>
            <NavLink 
              link={contactLink}
              closeDrawer={closeDrawer}
            />
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
  );

  // Main render
  return (
    <>
      {renderDesktopSidebar()}
      {renderMobileHeader()}
      {renderMobileDrawer()}
      <Box sx={{ marginLeft: { xs: 0, md: LAYOUT.SIDEBAR_WIDTH } }} />
    </>
  );
};

export default Header;