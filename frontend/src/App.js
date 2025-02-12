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
import ForumContainer from "./pages/Chat/ForumContainer.js";
import ThreadView from "./pages/Chat/Components/ThreadView.js";
import LandingPage from "./pages/LandingPage.js";
import LandingPageTemp from "./pages/LandingPage2.js";
import Privacy from "./pages/Privacy.js";
import AdminImportPost from "./pages/Chat/AdminImportPost.js";
import VRCForm from "./pages/VRC/VRCForm.js";
import PowerPledgeForm from "./pages/PledgeAndAdvance/PowerPledge.js";
import ImageDisplayPage from "./pages/ImageDisplayPage.js";
import FlyeringForm from "./pages/Flyering/FlyeringForm.js";
import FlyeringTable from "./pages/Flyering/FlyeringTable.js";
import EditFlyeringForm from "./pages/Flyering/EditFlyeringForm.js";
import PledgePhotos from "./pages/PledgeAndAdvance/PledgePhotos.js";
import TCUPNewsletter from "./pages/Newsletter.js";
import TCUPAdvance from "./pages/PledgeAndAdvance/TCUPAdvance.js";
import PledgeSuccess from "./pages/PledgeAndAdvance/PledgeSuccess.js";
import PledgeTracker from "./pages/PledgeAndAdvance/PledgeTracker.js";

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

  const isDevMode = process.env.NODE_ENV === 'development';

  const showHeader = isDevMode;


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
        <Routes>
          <Route path="/" element={<LandingPageTemp />} />
          <Route path="/landing" element={<LandingPage />} />

          <Route path="/powerpledge" element={<PowerPledgeForm />} />
          <Route path="/advance" element={<TCUPAdvance />} />
          <Route path="/pledgesuccess" element={<PledgeSuccess />} />
          <Route path="/pledgetracker" element={<PledgeTracker />} />


          

          <Route path="/*" element={
            <>
              <Header />
              <RootLayout maxWidth={getMaxWidth()}>
                <Routes>
                  <Route path="/home" element={<ShowsTable />} />
                  <Route path="/shows" element={<ShowsTable allShows={allShows} />} />
                  <Route path="/shows/minimal" element={<ShowsMinimal />} />
                  <Route path="/shows/add" element={<ShowForm />} />
                  <Route path="/shows/add/minimal" element={<ShowFormMinimal />} />
                  <Route path="/shows/:id/edit" element={<EditShowPage />} />
                  <Route path="/shows/:id" element={<ShowProfile />} />
                  <Route path="/shows/:id/minimal" element={<ShowProfileMinimal />} />
                  <Route path="/shows/:id/edit/minimal" element={<EditShowPageMinimal />} />
                  <Route path="/forum" element={<ForumContainer />} />
                  <Route path="/messages" element={<ThreadList category="General" />} />
                  <Route path="/thread/:threadId" element={<ThreadView />} />
                  <Route path="/import" element={<AdminImportPost />} />
                  <Route path="/test-auth" element={<AuthTest />} />
                  <Route path="/vrc" element={<VRCForm />} />
                  <Route path="/newsletter" element={<TCUPNewsletter />} />
                  <Route path="/pledgephotos" element={<PledgePhotos />} />
                  <Route path="/calendar" element={<CalendarEvents />} />
                  <Route path="/organize" element={<Organize />} />
                  <Route path="/callback" element={<Callback />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/flyering/" element={<FlyeringTable />} />
                  <Route path="/flyering/add" element={<FlyeringForm />} />
                  <Route path="/flyering/edit/:id" element={<EditFlyeringForm />} />
                  <Route path="/bands" element={<TCUPBandsGrid />} />
                  <Route path="/bands/:bandSlug" element={<TCUPBandProfile />} />
                  <Route path="/bands/add" element={<TCUPBandForm isEdit={false} />} />
                  <Route path="/bands/:bandid/edit" element={<TCUPBandForm isEdit={true} />} />
                  <Route path="/venues" element={<VenuesTable />} />
                  <Route path="/venues/:id" element={<VenueProfile />} />
                  <Route path="/venues/add" element={<VenueForm />} />
                  <Route path="/venues/edit/:id" element={<VenueForm />} />
                  <Route path="/interviewtest" element={<ImageDisplayPage />} />
                  <Route path="/people/add" element={<TCUPPeopleForm />} />
                  <Route path="/people/:personId/edit" element={<TCUPPeopleForm isEdit />} />
                  <Route path="/people/:personID" element={<TCUPPeopleProfile />} />
                  <Route path="/people" element={<TCUPPeopleTable />} />
                  <Route path="/profile" element={<UserProfile />} />
                  <Route path="/sessionmusicians" element={<SessionMusiciansTable />} />
                  <Route path="/sessionmusicians/:id" element={<SessionMusicianProfile />} />
                  <Route path="*" element={<div style={{ textAlign: "center", padding: "20px" }}>Page Not Found</div>} />
                </Routes>
              </RootLayout>
            </>
          } />
        </Routes>
      </ThemeProvider>
    );
   }

export default App;