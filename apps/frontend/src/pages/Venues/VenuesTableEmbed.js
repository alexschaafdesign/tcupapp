import React from 'react';
import { Box, Paper, Typography, Container } from '@mui/material';

// Optional: Reusable Embed Component (adapted slightly for clarity)
function GoogleSheetEmbed({ embedUrl, title = "Embedded Google Sheet", height = "700px" }) {
    // Basic check for a valid URL structure
    if (!embedUrl || !embedUrl.startsWith('https://docs.google.com/spreadsheets/')) {
       console.warn("Invalid embedUrl provided to GoogleSheetEmbed:", embedUrl);
       return <Typography color="error" sx={{p: 2}}>Invalid or missing Google Sheet embed URL.</Typography>;
    }

    return (
        <Box sx={{ height: height, position: 'relative', border: '1px solid #e0e0e0', borderRadius: 1, overflow: 'hidden', mt: 2 }}>
            <iframe
                src={embedUrl}
                title={title}
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ display: 'block' }} // Ensures iframe takes up the block space
            >
                Loading Google Sheet... Please ensure the link is published correctly and the URL is valid.
            </iframe>
        </Box>
    );
}

// The simplified Venues page component using the embedded sheet
function VenuesTableEmbed() {

  // --- !!! IMPORTANT !!! ---
  // Replace this placeholder with the actual 'src' URL you copied
  // from the "Publish to the web" embed code in Google Sheets.
  // Consider adding ?widget=true&headers=false to the end if desired.
  const venuesSheetEmbedUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ9D7dQQUW8VlFgHL3H_9S3pn56zdmr4v6GzGkAHsKwX7VcKZbLkYADsdK-Ocg1IPWN-VgmJDbOyJlN/pubhtml?widget=true&amp;headers=false';
  // Example: const venuesSheetEmbedUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQk.../pubhtml?widget=true&headers=false';


  return (
    // Using Container and Paper for consistent page structure
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        <Paper elevation={2} sx={{ p: { xs: 2, sm: 3, md: 4 }, borderRadius: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                tcup's VENUEPEDIA
            </Typography>


            {/* Embed the Google Sheet */}
            <GoogleSheetEmbed
                embedUrl={venuesSheetEmbedUrl}
                title="Venue List Google Sheet"
                height="80vh" // Adjust height: e.g., '700px' or use viewport height '80vh'
            />

        </Paper>
    </Container>
  );
}

export default VenuesTableEmbed;