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
  Tooltip,
  Collapse,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import HeaderUserProfile from "./HeaderUserProfile";
import { Link } from "react-router-dom";

const Header = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTcupExpanded, setIsTcupExpanded] = useState(false);

  const navigate = useNavigate();
  const { isAuthenticated, isLoading, loginWithRedirect, logout, user } = useAuth0();
  const isDevMode = process.env.NODE_ENV === "development";

  const navLinks = [
    { text: "chat", path: "/forum", devOnly: true },
    { text: "show list", path: "/shows" },
    { text: "resources", path: "/resources", isDropdown: true, devOnly: true },
  ];

  const resourceLinks = [
    { text: "venues", path: "/venues" },
    { text: "bands", path: "/bands", devOnly: true },
    { text: "session musicians", path: "/sessionmusicians", devOnly: true },
    { text: "venue report card", path: "/vrc", devOnly: true },
    { text: "power pledge", path: "/powerpledge" },
  ];

  const displayedLinks = navLinks.map((link) => ({
    ...link,
    disabled: !isDevMode && link.devOnly,
  }));

  const displayedResourceLinks = resourceLinks.map((link) => ({
    ...link,
    disabled: !isDevMode && link.devOnly,
  }));

  const toggleDrawer = (open) => (event) => {
    if (
      event?.type === 'keydown' &&
      (event?.key === 'Tab' || event?.key === 'Shift')
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const NavLink = ({ link }) => {
    const content = link.external ? (
      <ListItem
        component="a"
        href={link.path}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          color: "#000000",
          cursor: "pointer",
          fontFamily: "'Geist Mono', 'SF Mono', Menlo, monospace",
          textTransform: "lowercase",
          "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
          py: 1,
        }}
      >
        <ListItemText
          primary={link.text}
          primaryTypographyProps={{ 
            fontFamily: "'Geist Mono', 'SF Mono', Menlo, monospace",
            textTransform: "lowercase",
            fontSize: "16px",
          }}
        />
      </ListItem>
    ) : (
      <ListItem
        button
        disabled={link.disabled}
        onClick={() => {
          if (!link.disabled) {
            navigate(link.path);
            setDrawerOpen(false);
          }
        }}
        sx={{
          color: "#000000",
          cursor: link.disabled ? "not-allowed" : "pointer",
          opacity: link.disabled ? 0.5 : 1,
          fontFamily: "'Courier New', monospace",
          textTransform: "lowercase",
          "&:hover": {
            backgroundColor: link.disabled ? "transparent" : "rgba(0, 0, 0, 0.04)",
          },
          py: .5,
          
        }}
      >
        <ListItemText
          primary={link.text}
          primaryTypographyProps={{ 
            fontFamily: "'Courier New', monospace",
            textTransform: "lowercase",
            fontSize: "16px",
          }}
        />
      </ListItem>
    );
  
    return link.disabled ? (
      <Tooltip title="Coming Soon" arrow placement="right">
        <Box>{content}</Box>
      </Tooltip>
    ) : (
      content
    );
  };

  const ResourcesMenu = () => (
    <>
      <ListItem
        button
        onClick={() => setIsTcupExpanded(!isTcupExpanded)}
        sx={{
          color: "#000000",
          cursor: "pointer",
          fontFamily: "'Courier New', monospace",
          textTransform: "lowercase",
          "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
          py: 0,
        }}
      >
        <ListItemText
          primary="resources"
          primaryTypographyProps={{ 
            fontFamily: "'Courier New', monospace",
            textTransform: "lowercase",
            fontSize: "16px",
          }}
        />
        {isTcupExpanded ? <ExpandMoreIcon sx={{ transform: 'rotate(180deg)' }} /> : <ExpandMoreIcon />}
      </ListItem>
      <Collapse in={isTcupExpanded}>
        <Box sx={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.02)',
          borderLeft: '2px solid rgba(0, 0, 0, 0.1)',
          ml: 2,
          mr: 1,
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          {displayedResourceLinks.map((link, index) => (
            <NavLink
              key={index}
              link={{
                ...link,
                text: link.text
              }}
            />
          ))}
        </Box>
      </Collapse>
    </>
  );

  const AuthButtons = () => (
    <ListItem
      button
      onClick={() =>
        isAuthenticated
          ? logout({ 
              logoutParams: {
                returnTo: process.env.REACT_APP_AUTH0_REDIRECT_URI || window.location.origin
              }
            })
          : loginWithRedirect()
      }
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
          display: { xs: "none", md: "block" }, // Hide on mobile
          "& *": { zIndex: 2 },
          "&::before": {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'url("https://res.cloudinary.com/dsll3ms2c/image/upload/v1740149767/noisebg2_for_header_mf37pv.png")',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            opacity: 0.4,
            zIndex: 1,
          },
        }}
      >
        {/* Desktop header content remains the same */}
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {/* Logo Section */}
          <Box sx={{ pt: 2, pb: 1, px: 2, textAlign: "center" }}>
            <Link to="/">
              <Box
                component="img"
                src="https://res.cloudinary.com/dsll3ms2c/image/upload/v1740082499/TCUPlogo-traced_BLACK_a0wwot.png"
                alt="TCUP Logo"
                sx={{
                  width: "140px",
                  height: "auto",
                  mb: 1,
                }}
              />
            </Link>
            <Box
              sx={{
                fontFamily: "'Geist Mono', monospace",
                textAlign: "center",
                mb: 0
              }}
            >
              <Box sx={{ fontSize: "16px", fontWeight: 400, lineHeight: 1 }}>
                the
              </Box>
              <Box sx={{ fontSize: "25px", fontWeight: 900 }}>
                CUPBOARD
              </Box>
            </Box>
          </Box>
          
          <Divider sx={{ mx: 2, backgroundColor: "rgba(0, 0, 0, 0.1)" }} />
  
          {/* Navigation Links */}
          <List sx={{ width: "100%", px: 2, py: 1 }}>
            {displayedLinks.filter(link => !link.isDropdown).map((link, index) => (
              <NavLink key={index} link={link} />
            ))}
            <Divider sx={{ mx: 0, my: 2, backgroundColor: "rgba(0, 0, 0, 0.1)" }} />
            <ResourcesMenu />
          </List>
  
          {/* Auth Section */}
          <Box sx={{ mt: "auto" }}>
            {isAuthenticated && (
              <>
                <Divider sx={{ mx: 3, backgroundColor: "rgba(0, 0, 0, 0.1)" }} />
                <HeaderUserProfile />
              </>
            )}
            <Divider sx={{ mx: 3, backgroundColor: "rgba(0, 0, 0, 0.1)" }} />
            <List sx={{ px: 2 }}>
              <AuthButtons />
            </List>
          </Box>
        </Box>
      </AppBar>
  
      {/* Mobile Header */}
      <AppBar
        position="sticky"
        sx={{
          backgroundColor: "#F5F5F5",
          display: { xs: "flex", md: "none" }, // Show only on mobile
          flexDirection: "row",
          padding: "10px 20px",
          height: "60px",
          width: "100%",
          alignItems: "center",
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
          color: '#000000',
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
          },
        }}
      >
        <Box
          component="img"
          src="https://res.cloudinary.com/dsll3ms2c/image/upload/v1740082499/TCUPlogo-traced_BLACK_a0wwot.png"
          alt="TCUP Logo"
          sx={{
            width: "40px",
            height: "40px",
            zIndex: 2,
          }}
        />
        <Box 
          sx={{ 
            ml: 2, 
            zIndex: 2,
            fontFamily: "'Geist Mono', monospace",
          }}
        >
          <Box sx={{ fontSize: "12px", fontWeight: 400, lineHeight: 1 }}>
            the
          </Box>
          <Box sx={{ fontSize: "18px", fontWeight: 900 }}>
            CUPBOARD
          </Box>
        </Box>
  
        <IconButton
          sx={{ marginLeft: "auto", color: "#000000", zIndex: 2 }}
          onClick={toggleDrawer(true)}
        >
          <MenuIcon />
        </IconButton>
      </AppBar>
  
      {/* Mobile Drawer - Update mobile drawer to match desktop styling */}
      <Drawer 
        anchor="left" 
        open={drawerOpen} 
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            width: "250px",
            background: 'linear-gradient(180deg, #ECECEC 0%, #FFFFFF 100%)',
            color: '#000000',
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
            },
          }
        }}
      >
        <Box sx={{ py: 2, display: "flex", flexDirection: "column", height: "100%" }}>
          <Box sx={{ px: 2, textAlign: "center", mb: 2 }}>
            <Link to="/" onClick={() => setDrawerOpen(false)}>
              <Box
                component="img"
                src="https://res.cloudinary.com/dsll3ms2c/image/upload/v1740082499/TCUPlogo-traced_BLACK_a0wwot.png"
                alt="TCUP Logo"
                sx={{
                  width: "100px",
                  height: "auto",
                  mb: 1,
                  zIndex: 2,
                }}
              />
            </Link>
            <Box
              sx={{
                fontFamily: "'Geist Mono', monospace",
                textAlign: "center",
                mb: 0,
                zIndex: 2,
              }}
            >
              <Box sx={{ fontSize: "16px", fontWeight: 400, lineHeight: 1 }}>
                the
              </Box>
              <Box sx={{ fontSize: "25px", fontWeight: 900 }}>
                CUPBOARD
              </Box>
            </Box>
          </Box>
          
          <Divider sx={{ mx: 2, backgroundColor: "rgba(0, 0, 0, 0.1)" }} />
          
          <List sx={{ px: 2, py: 1, zIndex: 2 }}>
            {displayedLinks.filter(link => !link.isDropdown).map((link, index) => (
              <NavLink key={index} link={link} />
            ))}
            <Divider sx={{ mx: 0, my: 2, backgroundColor: "rgba(0, 0, 0, 0.1)" }} />
            <ResourcesMenu />
          </List>
  
          <Box sx={{ mt: "auto", zIndex: 2 }}>
            {isAuthenticated && (
              <>
                <Divider sx={{ mx: 2, backgroundColor: "rgba(0, 0, 0, 0.1)" }} />
                <HeaderUserProfile />
              </>
            )}
            <Divider sx={{ mx: 2, backgroundColor: "rgba(0, 0, 0, 0.1)" }} />
            <List sx={{ px: 2 }}>
              <AuthButtons />
            </List>
          </Box>
        </Box>
      </Drawer>
  
      {/* Content Margin Offset */}
      <Box sx={{ marginLeft: { xs: 0, md: "224px" } }} />
    </>
  );
};

export default Header;