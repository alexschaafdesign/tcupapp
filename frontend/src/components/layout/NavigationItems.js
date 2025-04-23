// navigationItems.js
import ChatIcon from "@mui/icons-material/Chat";
import EventIcon from "@mui/icons-material/Event";
import PlaceIcon from "@mui/icons-material/Place";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import LocalActivityIcon from "@mui/icons-material/LocalActivity";
import CampaignIcon from "@mui/icons-material/Campaign";
import InfoIcon from "@mui/icons-material/Info";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import AddBoxIcon from "@mui/icons-material/AddBox";
import ContactSupportIcon from "@mui/icons-material/ContactSupport";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import WorkIcon from "@mui/icons-material/Work";
import React from "react";
import RateReviewIcon from "@mui/icons-material/RateReview";
import AssessmentIcon from "@mui/icons-material/Assessment";
import NewspaperIcon from '@mui/icons-material/Newspaper';
import RadioIcon from '@mui/icons-material/Radio';



const getNavLinks = (isDevMode) => {
  return {
    mainLinks: [
      { text: "chat", path: "/chat", icon: <ChatIcon fontSize="small" /> },
      { text: "show list", path: "/shows", icon: <EventIcon fontSize="small" /> }
    ],
    resourceLinks: [
      { text: "venues", path: "/venues", icon: <PlaceIcon fontSize="small" /> },
      { text: "session musicians", path: "/sessionmusicians", icon: <MusicNoteIcon fontSize="small" /> },
      { text: "flyering", path: "/flyering", icon: <CampaignIcon fontSize="small" /> },
      { text: "radio", path: "/radio", icon: <RadioIcon fontSize="small" /> }

    ].map(link => ({
      ...link,
      disabled: !isDevMode && link.devOnly,
    })),
    organizeLinks: [
      { text: "about TCUP", path: "/about", icon: <InfoIcon fontSize="small" /> },
      { text: "newsletter", path: "/newsletter", icon: <NewspaperIcon fontSize="small" /> },

      { text: "join TCUP", path: "/join", icon: <GroupAddIcon fontSize="small" /> },
      { text: "power pledge", path: "/powerpledge", icon: <LocalActivityIcon fontSize="small" /> },
      { text: "venue report card", path: "/venuereportcard", icon: <AssessmentIcon fontSize="small" /> },

    ].map(link => ({
      ...link,
      disabled: !isDevMode && link.devOnly,
    })),
    adminLinks: [
      { text: "add update", path: "/admin/updates", icon: <AddBoxIcon fontSize="small" /> },
    ],
    contactLink: { 
      text: "contact", 
      path: "/contact", 
      icon: <ContactSupportIcon fontSize="small" /> 
    },
    menuIcons: {
      tcup: <MenuBookIcon fontSize="small" />,
      resources: <WorkIcon fontSize="small" />
    }
  };
};

export default getNavLinks