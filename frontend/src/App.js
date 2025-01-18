import React, { useState, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import ShowsTable from "./pages/Shows/ShowsTable.js";
import "./styles/App.css";
import 'draft-js/dist/Draft.css';
import VenuesTable from "./pages/Venues/VenuesTable.js";
import VenueProfile from "./pages/Venues/VenueProfile.js";
import { Box } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./styles/theme"; // Import your custom theme
import TCUPBandForm from "./pages/Bands/TCUPBandForm.js";
import TCUPBandsGrid from "./pages/Bands/TCUPBandsGrid.js";
import TCUPBandProfile from "./pages/Bands/TCUPBandProfile.js";
import Header from "./components/Header.js"; // Import your custom Header component
import TCUPPeopleForm from "./pages/TCUPPeopleForm.js";
import TCUPPeopleTable from "./pages/TCUPPeopleTable.js";
import TCUPPeopleProfile from "./pages/TCUPPeopleProfile.js";
import Organize from "./pages/Organize.js";
import ShowProfile from "./pages/Shows/ShowProfile.js";
import ShowsMinimal from "./pages/WithoutHeader/ShowsMinimal.js";
import ShowForm from "./pages/Shows/ShowForm.js";
import EditShowPage from "./components/EditShowPage.js";
import RootLayout from "./components/layout/RootLayout.js";
import { Login, ProtectedRoute } from './auth/XenforoAuth';
import OAuthCallback from "./components/OAuthCallback.js";
import ShowFormMinimal from "./pages/WithoutHeader/ShowFormMinimal.js";
import ShowProfileMinimal from "./pages/WithoutHeader/ShowProfileMinimal.js";
import EditShowPageMinimal from "./pages/WithoutHeader/EditShowPageMinimal.js";
import Callback from "./components/Callback.js";
import UserProfile from "./pages/UserProfile.js";
import AuthTest from "./components/AuthTest.js";
import SessionMusiciansTable from "./pages/SessionMusicians/SessionMusiciansTable.js";
import SessionMusicianProfile from "./pages/SessionMusicians/SessionMusiciansProfile.js";
import useApi from "./hooks/useApi.js";
import { useAuth0 } from "@auth0/auth0-react";
import VenueForm from "./pages/Venues/VenueForm.js";
import CalendarEvents from "./components/CalendarEvents.js";
import ThreadList from "./components/messageboard/ThreadList.js";
import ForumContainer from "./pages/ForumContainer.js";
import ThreadView from "./components/forum/ThreadView.js";
import LandingPage from "./pages/LandingPage.js";
import Privacy from "./pages/Privacy.js";
import AdminImportPost from "./pages/AdminImportPost.js";
import VRCForm from "./pages/VRC/VRCForm.js";
import PowerPledgeForm from "./pages/PowerPledge.js";
import ImageDisplayPage from "./pages/ImageDisplayPage.js";
import FlyeringForm from "./pages/Flyering/FlyeringForm.js";
import FlyeringTable from "./pages/Flyering/FlyeringTable.js";
import EditFlyeringForm from "./pages/Flyering/EditFlyeringForm.js";

function App() {
  const [allShows, setAllShows] = useState([]);
  const { isAuthenticated, user, isLoading } = useAuth0();
  const { callApi } = useApi();
  const location = useLocation(); // Get the current route location
  const getMaxWidth = () => {
    return location.pathname === '/sessionmusicians' ? false : 'md';
  };

  console.log("NODE_ENV:", process.env.NODE_ENV);

  const hasAttemptedRegistration = React.useRef(false);

  const showHeader = process.env.NODE_ENV === 'development';

  useEffect(() => {
      console.log('Auth state changed:', {
        isLoading,
        isAuthenticated,
        user,
        hasAttempted: hasAttemptedRegistration.current
      });
  
      const registerUser = async () => {
        if (!hasAttemptedRegistration.current && isAuthenticated && user && !isLoading) {
          try {
            console.log('Attempting registration with user:', user);
            hasAttemptedRegistration.current = true;
            const response = await callApi(`${process.env.REACT_APP_API_URL}/auth/register`, {
              method: 'POST'
            });
            console.log('Registration response:', response);
          } catch (error) {
            console.error('Error registering user:', error);
          }
        }
      };
  
      registerUser();
    }, [isAuthenticated, user, isLoading, callApi]);
  

  return (
    <ThemeProvider theme={theme}>
      {/* Conditionally render Header based on the current route */}
      {showHeader && <Header />}

      <RootLayout maxWidth={getMaxWidth()}>
     
        <Routes>
          
          {/* Home */}
          <Route path="/" element={<ShowsTable />} />
          <Route path="/home" element={<LandingPage />} />

          {/* Shows */}
          <Route path="/shows" element={<ShowsTable allShows={allShows} />} />
          <Route path="/shows/minimal" element={<ShowsMinimal />} />
          <Route path="/shows/add" element={<ShowForm />} />
          <Route path="/shows/add/minimal" element={<ShowFormMinimal />} />
          <Route path="/shows/:id/edit" element={<EditShowPage />} />
          <Route path="/shows/:id" element={<ShowProfile />} />
          <Route path="/shows/:id/minimal" element={<ShowProfileMinimal />} />
          <Route path="/shows/:id/edit/minimal" element={<EditShowPageMinimal />} />

          <Route path="/forum" element={<ForumContainer />} />
          <Route path="/test-auth" element={<AuthTest />} />

          <Route path="/messages" element={<ThreadList category="General" />} />
          <Route path="/thread/:threadId" element={<ThreadView />} />
          <Route path="/import" element={<AdminImportPost />} />

          <Route path="/vrc" element={<VRCForm />} />
          <Route path="/powerpledge" element={<PowerPledgeForm />} />




          <Route path="/calendar" element={<CalendarEvents />} />


          {/* Organize */}
          <Route path="/organize" element={<Organize />} />

          <Route path="/callback" element={<Callback />} />

          <Route path="/privacy" element={<Privacy />} />


          {/* Flyering */}
          <Route path="/flyering/" element={<FlyeringTable />} />
          <Route path="/flyering/add" element={<FlyeringForm />} />
          <Route path="/flyering/edit/:id" element={<EditFlyeringForm />} />





          {/* TCUP Bands */}
          <Route path="/bands" element={<TCUPBandsGrid />} />
          <Route path="/bands/:bandSlug" element={<TCUPBandProfile />} />
          <Route path="/bands/add" element={<TCUPBandForm isEdit={false} />} />

          <Route path="/bands/:bandid/edit" element={<TCUPBandForm isEdit={true} />} />

          {/* Venues */}
          <Route path="/venues" element={<VenuesTable />} />
          <Route path="/venues/:id" element={<VenueProfile />} />
          <Route path="/venues/add" element={<VenueForm />} />
          <Route path="/venues/edit/:id" element={<VenueForm />} />

          <Route path="/interviewtest" element={<ImageDisplayPage />} />


          {/* People */}
          <Route path="/people/add" element={<TCUPPeopleForm />} />
          <Route
            path="/people/:personId/edit"
            element={<TCUPPeopleForm isEdit />}
          />
          <Route 
            path="/people/:personID"
            element={<TCUPPeopleProfile />}
          />
          <Route path="/people" element={<TCUPPeopleTable />} />

          <Route path="/profile" element={<UserProfile />} />

          <Route path="/sessionmusicians" element={<SessionMusiciansTable />} />
          <Route path="/sessionmusicians/:id" element={<SessionMusicianProfile />} />





          {/* Catch-All */}
          <Route
            path="*"
            element={<div style={{ textAlign: "center", padding: "20px" }}>Page Not Found</div>}
          />
        </Routes>
      </RootLayout>
    </ThemeProvider>
  );
}

export default App;