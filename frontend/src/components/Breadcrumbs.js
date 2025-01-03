import React from "react";
import { Breadcrumbs, Link, Typography } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

const AppBreadcrumbs = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
      <Link
        underline="hover"
        color="inherit"
        onClick={() => navigate("/")}
        sx={{ cursor: "pointer" }}
      >
        HOME
      </Link>
      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;

        return last ? (
          <Typography key={to} color="text.primary">
            {value.replace(/-/g, " ").toUpperCase()}
          </Typography>
        ) : (
          <Link
            key={to}
            underline="hover"
            color="inherit"
            onClick={() => navigate(to)}
            sx={{ cursor: "pointer" }}
          >
            {value.replace(/-/g, " ").toUpperCase()}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
};

export default AppBreadcrumbs;