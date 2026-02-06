import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Container,
  Paper,
  CircularProgress, // For loading indicator
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// Import specific icons you might want to use
import ArticleIcon from '@mui/icons-material/Article'; // For Docs
import TableChartIcon from '@mui/icons-material/TableChart'; // For Sheets
import MailOutlineIcon from '@mui/icons-material/MailOutline'; // Example
import ContactsIcon from '@mui/icons-material/Contacts'; // Example
import LinkIcon from '@mui/icons-material/Link'; // Default/Fallback icon
import SlideshowIcon from '@mui/icons-material/Slideshow'; // For Slides
import AssignmentIcon from '@mui/icons-material/Assignment'; // For Forms
import EmailIcon from '@mui/icons-material/Email';

// --- 1. Data Definition ---
// NOTE: Replace '[YOUR_DOC_ID_...]' etc., with your actual published embed URLs!
const radioResources = [
  {
    id: 'radio-best-practices',
    title: 'RADIO: BEST PRACTICES',
    description: 'Tips and guidelines for approaching radio stations.',
    embedUrl: 'https://docs.google.com/document/d/e/2PACX-1vQjPyd_kTl3GYNODV6u5QYYxdQ69mHBQ21VOz2yHN3UH_wow5hMOf0PiuWU1hq8hqDWTI7ykUyr46tM/pub?embedded=true',
    icon: 'Article', // Maps to ArticleIcon
  },
  {
    id: 'radio-campaign-template',
    title: 'RADIO CAMPAIGN TEMPLATE',
    description: 'A template sheet for planning your radio campaign.',
    embedUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRJ0uRg5BZlT-si5Swo9ihjf6Sja9PdjdACsZ8i899kvAccba9T9b_h-mfeb4mo9YS-GkEhptUutRED/pubhtml?widget=true&amp;headers=false',
    icon: 'TableChart', // Maps to TableChartIcon
  },
  {
    id: 'outreach-email-image', // Example using an image for the email example
    title: 'OUTREACH E-MAIL EXAMPLE',
    description: 'Example of an outreach email format.',
    embedUrl: 'https://res.cloudinary.com/dsll3ms2c/image/upload/v1745380075/OUTREACH_E-MAIL_EXAMPLE_abmcyi.png', // <--- DIRECT URL TO YOUR IMAGE
    icon: 'Email',  // Maps to EmailIcon
    type: 'image'   // <--- Specify the type as 'image'
  },
  {
    id: 'radio-contacts',
    title: 'RADIO CONTACTS',
    description: 'A shared list of potential radio contacts.',
    embedUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQkJ_M6rSpyASZ3RnHZbHcFuKa8fIKGkbaVCXJe2fIHV0vQpbMFThvRf5xap_2CySOz-BLf7apbH-Bw/pubhtml?widget=true&amp;headers=false',
    icon: 'Contacts', // Maps to ContactsIcon
  },
  {
    id: 'helpful-links',
    title: 'HELPFUL LINKS',
    description: 'Additional helpful links',
    embedUrl: 'https://docs.google.com/document/d/e/2PACX-1vRfe-KJDghkSHTOKy5K8JU06PuXkl3dN1WLUf4mFNX4c_aEfLugToZVaLNMhTolaKdizVedKjUTKhfW/pub?embedded=true',
    icon: 'Links', // Maps to ContactsIcon
  },
];

const oneSheetExamples = [
   {
    id: 'onesheet-template',
    title: 'RADIO ONE SHEET TEMPLATE',
    description: 'A template for you to use for your One Sheet',
    embedUrl: 'https://docs.google.com/document/d/e/2PACX-1vQOLSejgaeOQ6HFkxhBeCvCqk2pLql8wbZtDVWktuwMYKdn9jUExhmhfeMkxMVK_BSC52L_swanlTZE/pub?embedded=true',
    icon: 'TableChart', // Maps to TableChartIcon
  },
  {
    id: 'heavybreathing-press-release',
    title: 'HEAVY BREATHING PRESS RELEASE',
    description: 'An example of a press release',
    embedUrl: 'https://res.cloudinary.com/dsll3ms2c/image/upload/v1745381479/HEAVY_BREATHING_PRESS_RELEASE_vazuv0.pdf', // <-- URL TO YOUR HOSTED PDF
    // Or Google Drive Link: 'https://drive.google.com/file/d/YOUR_FILE_ID/view?usp=sharing'
    // Or Public Folder Link: '/my-guide.pdf'
    icon: 'Article', // Maps to PictureAsPdfIcon
    type: 'pdf'  // <-- Specify the type as 'pdf'
  },
  {
    id: 'watw-onesheet',
    title: 'ONE SHEET EXAMPLE',
    description: 'An example of a one sheet',
    embedUrl: 'https://res.cloudinary.com/dsll3ms2c/image/upload/v1745381482/watw-oe-onesheet-2_fpjxfn.pdf', // <-- URL TO YOUR HOSTED PDF
    // Or Google Drive Link: 'https://drive.google.com/file/d/YOUR_FILE_ID/view?usp=sharing'
    // Or Public Folder Link: '/my-guide.pdf'
    icon: 'Article', // Maps to PictureAsPdfIcon
    type: 'pdf'  // <-- Specify the type as 'pdf'
  },
];

const miscResources = [
    {
      id: 'outreach-email-image', // Example using an image for the email example
      title: 'OUTREACH E-MAIL EXAMPLE',
      description: 'Visual example of an outreach email format.',
      embedUrl: 'https://res.cloudinary.com/dsll3ms2c/image/upload/v1745380075/OUTREACH_E-MAIL_EXAMPLE_abmcyi.png', // <--- DIRECT URL TO YOUR IMAGE
      icon: 'Email',  // Maps to EmailIcon
      type: 'image'   // <--- Specify the type as 'image'
    }
  ];


// --- 2. Icon Mapping ---
const iconMap = {
  Article: <ArticleIcon />,
  TableChart: <TableChartIcon />,
  MailOutline: <MailOutlineIcon />,
  Contacts: <ContactsIcon />,
  Slideshow: <SlideshowIcon />,
  Assignment: <AssignmentIcon />,
  Links: <LinkIcon />,
  Email: <EmailIcon />,
  Default: <LinkIcon />, // Fallback icon
};

// --- 3. Helper Component for Embedding ---
function GoogleEmbed({ embedUrl, title }) {
  const [isLoading, setIsLoading] = React.useState(true);

  // Basic check for a valid URL structure (optional but recommended)
  if (!embedUrl || !embedUrl.startsWith('https://docs.google.com/')) {
     console.warn("Invalid embedUrl provided to GoogleEmbed:", embedUrl);
     return <Typography color="error" sx={{p: 2}}>Invalid or missing embed URL.</Typography>;
  }


  return (
    <Box sx={{ height: '600px', position: 'relative', border: '1px solid #e0e0e0', borderRadius: 1, overflow: 'hidden', mt: 1 }}>
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', position: 'absolute', width: '100%', top: 0, left: 0, background: 'rgba(255,255,255,0.8)', zIndex: 1 }}>
          <CircularProgress />
        </Box>
      )}
      <iframe
        src={embedUrl}
        title={title}
        width="100%"
        height="100%"
        frameBorder="0"
        onLoad={() => setIsLoading(false)}
        style={{ display: isLoading ? 'none' : 'block', position: 'relative', zIndex: 0 }} // Hide iframe until loaded
        allowFullScreen // Allows fullscreen for Slides/etc.
      >
        Loading document... If this takes a long time, the embed link might be invalid or the document unpublished.
      </iframe>
    </Box>
  );
}

// --- 4. Reusable Accordion Group Component ---
function ResourceAccordionGroup({ categoryTitle, resources }) {
  // Using default Accordion behavior (multiple can be open)
  // For controlled behavior (only one open), add state like this:
  // const [expanded, setExpanded] = React.useState(false);
  // const handleChange = (panel) => (event, isExpanded) => {
  //   setExpanded(isExpanded ? panel : false);
  // };

  if (!resources || resources.length === 0) {
    return <Typography sx={{ fontStyle: 'italic', color: 'text.secondary', my: 2 }}>No resources available in this category.</Typography>;
  }

  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
        {categoryTitle}
      </Typography>
      {resources.map((resource, index) => (
        <Accordion
           key={resource.id || index}
           disableGutters
           elevation={0} // Remove accordion elevation for a flatter look
           sx={{
             mb: 1.5,
             border: '1px solid #e0e0e0', // Use border with elevation={0}
             borderRadius: 1,
             '&:before': { display: 'none' },
             '&:first-of-type': {
                 borderTopLeftRadius: 'inherit',
                 borderTopRightRadius: 'inherit',
             },
             '&:last-of-type': {
                 borderBottomLeftRadius: 'inherit',
                 borderBottomRightRadius: 'inherit',
                 marginBottom: 0,
             },
             '&.Mui-expanded': {
                margin: 0,
                '&:first-of-type': {
                    borderTopLeftRadius: 'inherit',
                    borderTopRightRadius: 'inherit',
                },
                '&:last-of-type': {
                    borderBottomLeftRadius: 'inherit',
                    borderBottomRightRadius: 'inherit',
                },
             }
           }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`${resource.id}-content`}
            id={`${resource.id}-header`}
            sx={{
              backgroundColor: '#f9f9f9',
              minHeight: '64px',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)', // Subtle hover effect
              },
              '& .MuiAccordionSummary-content': {
                  alignItems: 'center',
                  paddingLeft: 2, // Add padding to compensate for disableGutters
                  paddingRight: 1
              },
              '&.Mui-expanded': {
                 borderBottom: (theme) => `1px solid ${theme.palette.divider}`, // Add divider when expanded
              }
            }}
          >
            <Box sx={{ mr: 1.5, display: 'flex', alignItems: 'center', color: 'primary.main' }}>
              {iconMap[resource.icon] || iconMap.Default}
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 500 }}>{resource.title}</Typography>
              {resource.description && (
                 <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem', mt: 0.5 }}>
                   {resource.description}
                 </Typography>
              )}
            </Box>
          </AccordionSummary>
          {/* Note: Removed borderTop from Details as it's now on expanded Summary */}
          <AccordionDetails sx={{ p: {xs: 1, sm: 2}, backgroundColor: '#ffffff' }}>
            {/* --- UPDATED CONDITIONAL RENDERING --- */}
            {resource.type === 'image' ? (
              // --- Image Rendering ---
              <Box sx={{ textAlign: 'center', p: 1 }}>
                <img
                  src={resource.embedUrl}
                  alt={resource.description || resource.title}
                  style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto', borderRadius: '4px', border: '1px solid #eee' }}
                />
              </Box>
            ) : resource.type === 'pdf' ? (
              // --- PDF Rendering ---
              <Box sx={{ height: '700px', // Adjust height as needed for PDFs
                        position: 'relative',
                        border: '1px solid #e0e0e0',
                        borderRadius: 1,
                        overflow: 'hidden',
                        mt: 1 }}>
                 <iframe
                    src={resource.embedUrl}
                    title={resource.title}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ display: 'block' }} // Ensure it takes block display
                  >
                    Loading PDF... Your browser may not support embedded PDFs, or the link may be incorrect. {' '}
                    <a href={resource.embedUrl} target="_blank" rel="noopener noreferrer">Download PDF</a>
                 </iframe>
              </Box>
            ) : (
              // --- Default: Google Embed Rendering ---
              <GoogleEmbed embedUrl={resource.embedUrl} title={resource.title} />
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );

}


// --- 5. Main Page Component ---
function RadioResourcesPage() {
  return (
    // Using theme defaults, assuming MUI ThemeProvider is setup higher up your app tree
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Paper elevation={2} sx={{ p: { xs: 2, sm: 3, md: 4 }, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          Radio Resources
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Expand the sections below to access helpful documents, templates, and guides.
        </Typography>

        {/* --- Radio Resources Section --- */}
        <ResourceAccordionGroup
          categoryTitle="General radio resources"
          resources={radioResources}
        />

        {/* --- Press Kit Resources Section --- */}
        <ResourceAccordionGroup
          categoryTitle="One sheets"
          resources={oneSheetExamples}
        />

        {/* --- Add more categories/groups as needed --- */}
        {/* Example:
        <ResourceAccordionGroup
          categoryTitle="Social Media Tips"
          resources={socialMediaResources} // Define this data array above
        />
        */}

      </Paper>
    </Container>
  );
}

// --- 6. Export the main page component ---
export default RadioResourcesPage;