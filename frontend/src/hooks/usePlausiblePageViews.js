import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function usePlausiblePageViews() {
  const location = useLocation();

  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      // Send a pageview event whenever the route changes
      window.plausible?.("pageview", { props: { path: location.pathname } });
      console.log("📊 Plausible pageview:", location.pathname);
    }
  }, [location]);
}