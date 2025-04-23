import React, { useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import ShowsTable from "./pages/Shows/ShowsTable.js";
import "./styles/App.css";
import 'draft-js/dist/Draft.css';
import VenuesTable from "./pages/Venues/VenuesTable.js";
import VenueProfile from "./pages/Venues/VenueProfile.js";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./styles/theme"; // Import your custom theme
import BandForm from "./pages/Bands/BandForm/BandForm.js";
import FullBandList from "./pages/Bands/FullBandList.js";
import BandProfile from "./pages/Bands/BandProfile.js";
import TCUPPeopleForm from "./pages/TCUPPeopleForm.js";
import TCUPPeopleTable from "./pages/TCUPPeopleTable.js";
import TCUPPeopleProfile from "./pages/TCUPPeopleProfile.js";
import ShowProfile from "./pages/Shows/ShowProfile.js";
import ShowForm from "./pages/Shows/ShowForm.js";
import EditShowPage from "./components/EditShowPage.js";
import Callback from "./components/Callback.js";
import UserProfile from "./pages/User/UserProfile.js";
import AuthTest from "./components/AuthTest.js";
import SessionMusiciansTable from "./pages/SessionMusicians/SessionMusiciansTable.js";
import SessionMusicianProfile from "./pages/SessionMusicians/SessionMusiciansProfile.js";
import useApi from "./hooks/useApi.js";
import { useAuth0 } from "@auth0/auth0-react";
import VenueForm from "./pages/Venues/VenueForm.js";
import CalendarEvents from "./components/CalendarEvents.js";
import MainChatPage from "./pages/Chat/MainChatPage.js";
import ViewSingleThread from "./pages/Chat/ViewSingleThread.js";
import LandingPage from "./pages/LandingPage.js";
import Privacy from "./pages/Privacy.js";
import AdminImportPost from "./pages/Chat/Components/OriginalAdminImportPost.js";
import VRCForm from "./pages/VRC/VRCForm.js";
import PowerPledgeForm from "./pages/PledgeAndAdvance/PowerPledge.js";
import ImageDisplayPage from "./pages/ImageDisplayPage.js";
import FlyeringForm from "./pages/Flyering/FlyeringForm.js";
import FlyeringTable from "./pages/Flyering/FlyeringTable.js";
import EditFlyeringForm from "./pages/Flyering/EditFlyeringForm.js";
import PledgePhotos from "./pages/PledgeAndAdvance/PledgePhotos.js";
import TCUPAdvance from "./pages/PledgeAndAdvance/TCUPAdvance.js";
import PledgeSuccess from "./pages/PledgeAndAdvance/PledgeSuccess.js";
import PledgeTracker from "./pages/PledgeAndAdvance/PledgeTracker.js";
import ErrorBoundary from "./components/ErrorBoundary.js";
import Layout from "./components/layout/Layout.js";
import AboutTCUP from "./pages/TCUP/AboutTCUP.js";
import NewUpdate from "./pages/TCUP/Updates/NewUpdate.js";
import UpdatesPage from "./pages/TCUP/Updates/UpdatesPage.js";
import SingleUpdatePost from "./pages/TCUP/Updates/SingleUpdatePost.js";
import UpdateEditForm from "./pages/TCUP/Updates/UpdateEditForm.js";
import ContactForm from "./pages/Contact/ContactForm.js";
import ProfileSync from "./pages/User/Components/ProfileSync.js";
import Resources from "./pages/Resources/Resources.js";
import ConversationDetail from "./pages/DirectMessages.js/ConversationDetail.js";
import ConversationList from "./pages/DirectMessages.js/ConversationList.js";
import WelcomePage from "./pages/Welcome.js";
import PwaUpdatePage from "./pages/PwaUpdatePage.js"; // Create this file
import ForumImportTool from "./pages/Chat/ForumImportTool.js";
import OriginalAdminImportPost from "./pages/Chat/Components/OriginalAdminImportPost.js";
import HistoricalReplyForm from "./pages/Chat/Components/HistoricalReplyForm.js";
import AdminDashboard from "./pages/Admin/AdminDashboard.js";
import ScraperAdminPanel from "./pages/Admin/ScraperAdminPanel.js";
import VenueReportCardPage from "./pages/VRC/VenueReportCardPage.js";
import JoinTCUP from "./pages/TCUP/JoinTCUP.js";
import Newsletter from "./pages/TCUP/Newsletter.js";
import { MessageProvider } from "./pages/DirectMessages.js/MessageBadge.js";
import PublicRoute from "./PublicRoute.js";
import DigitalZine from "./pages/DigitalZine.js";
import RadioResourcesPage from "./pages/Resources/RadioResources.js";

function App() {
  const { isAuthenticated, user, isLoading } = useAuth0();
  const { callApi } = useApi();

  console.log("NODE_ENV:", process.env.NODE_ENV);

  const hasAttemptedRegistration = React.useRef(false);

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

  useEffect(() => {
    const checkForPwa = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        // Instead of redirecting, just log that it's a PWA
        console.log('Running as PWA');
        // No redirect happens now
      }
    };
    
    if (isAuthenticated !== undefined) {
      checkForPwa();
    }
  }, [isAuthenticated]);

  // Show loading state while Auth0 is initializing
  if (isLoading) {
    return <div>Loading...</div>; // You might want to use a proper loading component here
  }

  return (
    <ThemeProvider theme={theme}>
      <MessageProvider>
      <ProfileSync />
      <Routes>
         {/* Public routes outside of any layout */}
         <Route path="/welcome" element={
          isAuthenticated ? <Navigate to="/" /> : <WelcomePage />
        } />
        <Route path="/pwa-update" element={<PwaUpdatePage />} />
        <Route path="/callback" element={<Callback />} />
        <Route path="/privacy" element={<Privacy />} />

        {/* Public routes with layout */}
        <Route element={<Layout publicAccess={true} />}>
          <Route path="/" element={<MainChatPage />} />
          <Route path="/shows" element={<ShowsTable />} />
          <Route path="/shows/:id" element={<ShowProfile />} />
          <Route path="/bands" element={<FullBandList />} />
          <Route path="/bands/:bandSlug" element={<BandProfile />} />
          <Route path="/venues" element={<VenuesTable />} />
          <Route path="/venues/:id" element={<VenueProfile />} />
          <Route path="/about" element={<AboutTCUP />} />
          <Route path="/chat" element={<MainChatPage />} />
          <Route path="landing" element={<LandingPage />} />
          <Route path="contact" element={<ContactForm />} />
          <Route path="/venuereportcard" element={<VenueReportCardPage />} />
          <Route path="/join" element={<JoinTCUP />} />
          <Route path="/updates/:id" element={<SingleUpdatePost />} />
          <Route path="updates" element={<UpdatesPage />} />
          <Route path="powerpledge" element={<PowerPledgeForm />} />
          <Route path="advance" element={<TCUPAdvance />} />
          <Route path="resources" element={<Resources />} />
          <Route path="vrc" element={<VRCForm />} />
          <Route path="newsletter" element={<DigitalZine />} />
          <Route path="calendar" element={<CalendarEvents />} />
          <Route path="flyering" element={<FlyeringTable />} />
          <Route path="sessionmusicians" element={<SessionMusiciansTable />} />
          <Route path="sessionmusicians/:id" element={<SessionMusicianProfile />} />
          <Route path="zine" element={<DigitalZine />} />
          <Route path="radio" element={<RadioResourcesPage />} />



          {/* Add other routes you want to be public */}
        </Route>

        

      {/* Protected routes that require authentication */}
        <Route element={<Layout publicAccess={false} />}>
          {/* Admin*/}
          <Route path="admin" element={<AdminDashboard />} />          
          <Route path="/admin/updates" element={<NewUpdate />} />
          <Route path="/admin/scrapers" element={<ScraperAdminPanel />} />
          <Route path="/admin/import" element={<OriginalAdminImportPost />} />
          <Route path="updates/edit/:id" element={<UpdateEditForm />} />   
          {/* Resources */}

          <Route path="pledgesuccess" element={<PledgeSuccess />} />
          <Route path="pledgetracker" element={<PledgeTracker />} />          
          <Route path="shows/add" element={<ShowForm />} />
          <Route path="shows/:id/edit" element={<EditShowPage />} />

  
          {/* Forum/Thread */}
          <Route path="chat/:threadId" element={<ViewSingleThread />} />
          <Route path="import" element={<AdminImportPost />} />
          <Route path="test-auth" element={<AuthTest />} />

          <Route path="pledgephotos" element={<PledgePhotos />} />
  
          {/* Flyering */}
          <Route path="flyering/add" element={<FlyeringForm />} />
          <Route path="flyering/edit/:id" element={<EditFlyeringForm />} />
  
          {/* Bands */}
          <Route path="bands/add" element={<BandForm isEdit={false} />} />

          <Route path="bands/form/:draftId" element={<BandForm isDraft={true} />} />
          <Route path="bands/:bandSlug" element={<BandProfile />} />

          <Route path="bands/:bandid/edit" element={<BandForm isEdit />} />
  
          {/* Venues */}
          <Route path="venues/add" element={<VenueForm />} />
          <Route path="venues/edit/:id" element={<VenueForm />} />
  
          {/* Other routes */}
          <Route path="interviewtest" element={<ImageDisplayPage />} />
          <Route path="people/add" element={<TCUPPeopleForm />} />
          <Route path="people/:personId/edit" element={<TCUPPeopleForm isEdit />} />
          <Route path="people/:personID" element={<TCUPPeopleProfile />} />
          <Route path="people" element={<TCUPPeopleTable />} />

          {/* User */}
          <Route path="/profile/:userId" element={<UserProfile />} />

          {/* Direct Messages */}
          <Route path="/messages" element={<ConversationList />} />
          <Route path="/messages/:conversationId" element={<ConversationDetail />} />
  
        </Route>
  
    
          {/* Catch-all for unmatched paths */}
          <Route
            path="*"
            element={
              <div style={{ textAlign: "center", padding: "20px" }}>
                Page Not Found
              </div>
            }
          />
      </Routes>
      </MessageProvider>
    </ThemeProvider>
  );
}

export default App;