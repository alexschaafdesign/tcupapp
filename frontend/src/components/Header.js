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

  const navigate = useNavigate();
  const { isAuthenticated, isLoading, loginWithRedirect, logout, user } = useAuth0();
  const isDevMode = process.env.NODE_ENV === "development";

  const navLinks = [
    { text: "CUPBOARD 1.0", path: "https:/tcupboard.org", external: true },
    { text: "CALENDAR", path: "/calendar" },
    { text: "CHAT", path: "/forum", devOnly: true },
    { text: "SHOWS", path: "/shows" },
    { text: "VENUES", path: "/venues" },
    { text: "BANDS", path: "/bands", devOnly: true },
    { text: "VENUE REPORT CARD", path: "/vrc", devOnly: true },
    { text: "POWER PLEDGES", path: "/powerpledge" },
  ];

  const displayedLinks = navLinks.map((link) => ({
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
          color: "white",
          cursor: "pointer",
          "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
        }}
      >
        <ListItemText
          primary={link.text}
          primaryTypographyProps={{ fontWeight: "bold" }}
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
          color: "white",
          cursor: link.disabled ? "not-allowed" : "pointer",
          opacity: link.disabled ? 0.5 : 1,
          "&:hover": {
            backgroundColor: link.disabled ? "transparent" : "rgba(255, 255, 255, 0.1)",
          },
        }}
      >
        <ListItemText
          primary={link.text}
          primaryTypographyProps={{ fontWeight: "bold" }}
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



  const AuthButtons = () => (
    <ListItem
      button
      onClick={() =>
        isAuthenticated
          ? logout({ returnTo: window.location.origin })
          : loginWithRedirect()
      }
      sx={{
        color: "white",
        cursor: "pointer",
        "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
      }}
    >
      <ListItemText
        primary={isAuthenticated ? "LOGOUT" : "LOGIN"}
        primaryTypographyProps={{ fontWeight: "bold" }}
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
        <Box sx={{ display: "flex", justifyContent: "center", mb: "30px" }}>
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

        <List sx={{ width: "100%", display: "flex", flexDirection: "column", height: "100%" }}>
          {displayedLinks.map((link, index) => (
            <NavLink key={index} link={link} />
          ))}

          {/* People section with devMode handling */}
          {(!isDevMode ? (
            <Tooltip title="Coming Soon" arrow placement="right">
              <Box>
                <ListItem
                  button
                  disabled={true}
                  sx={{
                    color: "white",
                    cursor: "not-allowed",
                    opacity: 0.5,
                    "&:hover": { backgroundColor: "transparent" },
                  }}
                >
                  <ListItemText
                    primary="PEOPLE"
                    primaryTypographyProps={{ fontWeight: "bold" }}
                  />
                  <ExpandMoreIcon />
                </ListItem>
              </Box>
            </Tooltip>
          ) : (
            <ListItem
              button
              onClick={() => setIsExpanded(!isExpanded)}
              sx={{
                color: "white",
                cursor: "pointer",
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
              }}
            >
              <ListItemText
                primary="PEOPLE"
                primaryTypographyProps={{ fontWeight: "bold" }}
              />
              <ExpandMoreIcon />
            </ListItem>
          ))}

          {isExpanded && (
            <ListItem
              button
              onClick={() => {
                navigate("/sessionmusicians");
                setDrawerOpen(false);
              }}
              sx={{
                color: "white",
                cursor: "pointer",
                paddingLeft: 3,
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
              }}
            >
              <ListItemText
                primary="SESSION MUSICIANS"
                primaryTypographyProps={{ fontWeight: "bold" }}
              />
            </ListItem>
          )}

          <Box sx={{ mt: "auto" }}>
            {isAuthenticated && (
              <>
                <Divider sx={{ my: 2, backgroundColor: "rgba(255, 255, 255, 0.2)" }} />
                <HeaderUserProfile />
              </>
            )}
            <Divider sx={{ my: 2, backgroundColor: "rgba(255, 255, 255, 0.2)" }} />
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
          sx={{ marginLeft: "auto", color: "white" }}
          onClick={toggleDrawer(true)}
        >
          <MenuIcon />
        </IconButton>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        <List>
          {displayedLinks.map((link, index) => (
            <NavLink key={index} link={link} />
          ))}

          <ListItem
            button
            onClick={() => setIsExpanded(!isExpanded)}
            sx={{ cursor: "pointer" }}
          >
            <ListItemText
              primary="PEOPLE"
              primaryTypographyProps={{ fontWeight: "bold" }}
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
              sx={{ cursor: "pointer", paddingLeft: 1 }}
            >
              <ListItemText
                primary="SESSION MUSICIANS"
                primaryTypographyProps={{ fontWeight: "bold" }}
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