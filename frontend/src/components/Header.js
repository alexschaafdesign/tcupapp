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
    { text: "TCUP", devOnly: true, isDropdown: true },
    { text: "CUPBOARD 1.0", path: "https://tcupboard.org", external: true },
    { text: "CHAT", path: "/forum", devOnly: true },
    { text: "SHOWS", path: "/shows" },
    { text: "VENUES", path: "/venues" },
    { text: "BANDS", path: "/bands", devOnly: true },
  ];

  const tcupLinks = [
    { text: "CALENDAR", path: "/calendar", devOnly:true },
    { text: "VENUE REPORT CARD", path: "/vrc", devOnly: true },
    { text: "POWER PLEDGE", path: "/powerpledge" },
    { text: "PLEDGE PHOTOS", path: "/pledgephotos", devOnly: true },
  ];

  const displayedLinks = navLinks.map((link) => ({
    ...link,
    disabled: !isDevMode && link.devOnly,
  }));

  const displayedTcupLinks = tcupLinks.map((link) => ({
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

  const TcupMenu = () => (
    <>
      <ListItem
        button
        onClick={() => setIsTcupExpanded(!isTcupExpanded)}
        sx={{
          color: "white",
          cursor: "pointer",
          "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
        }}
      >
        <ListItemText
          primary="TCUP"
          primaryTypographyProps={{ fontWeight: "bold" }}
        />
        <ExpandMoreIcon />
      </ListItem>
      <Collapse in={isTcupExpanded}>
        <Box sx={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderLeft: '3px solid rgba(255, 255, 255, 0.2)',
          mx: 2,
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          {displayedTcupLinks.map((link, index) => (
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
          <TcupMenu />
          {displayedLinks.filter(link => !link.isDropdown).map((link, index) => (
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
            <Box sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderLeft: '3px solid rgba(255, 255, 255, 0.2)',
              mx: 2,
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <ListItem
                button
                onClick={() => {
                  navigate("/sessionmusicians");
                  setDrawerOpen(false);
                }}
                sx={{
                  color: "white",
                  cursor: "pointer",
                  "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
                }}
              >
                <ListItemText
                  primary="SESSION MUSICIANS"
                  primaryTypographyProps={{ fontWeight: "bold" }}
                />
              </ListItem>
            </Box>
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
      <Drawer 
        anchor="right" 
        open={drawerOpen} 
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            backgroundColor: "primary.main",
            width: "250px",
            color: "white",
          }
        }}
      >
        <Box sx={{ py: 2 }}>
          <List>
            <TcupMenu />
            {displayedLinks.filter(link => !link.isDropdown).map((link, index) => (
              <NavLink key={index} link={link} />
            ))}

            {/* People Section */}
            {!isDevMode ? (
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
              <>
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
                <Collapse in={isExpanded}>
                  <Box sx={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderLeft: '3px solid rgba(255, 255, 255, 0.2)',
                    mx: 2,
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <ListItem
                      button
                      onClick={() => {
                        navigate("/sessionmusicians");
                        setDrawerOpen(false);
                      }}
                      sx={{
                        color: "white",
                        cursor: "pointer",
                        "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
                      }}
                    >
                      <ListItemText
                        primary="SESSION MUSICIANS"
                        primaryTypographyProps={{ fontWeight: "bold" }}
                      />
                    </ListItem>
                  </Box>
                </Collapse>
              </>
            )}

            {isAuthenticated && (
              <>
                <Divider sx={{ my: 2, backgroundColor: "rgba(255, 255, 255, 0.2)" }} />
                <HeaderUserProfile />
              </>
            )}
            <Divider sx={{ my: 2, backgroundColor: "rgba(255, 255, 255, 0.2)" }} />
            <AuthButtons />
          </List>
        </Box>
      </Drawer>

      {/* Content Margin Offset */}
      <Box sx={{ marginLeft: { xs: 0, md: "250px" } }} />
    </>
  );
};

export default Header;