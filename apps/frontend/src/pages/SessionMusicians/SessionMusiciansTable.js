// SessionMusiciansTable.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import parseSocialLinks from "../../utils/parseSocialLinks";
import BandSocialLinks from "../../components/bands/BandSocialLinks";

const SessionMusiciansTable = () => {
  const [musicians, setMusicians] = useState([]);
  const [filteredMusicians, setFilteredMusicians] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchMusicians = async () => {
      try {
        const response = await fetch(`${apiUrl}/sessionmusicians`);
        if (!response.ok) throw new Error("Failed to fetch musicians");
        const data = await response.json();
        setMusicians(data.data || []);
        setFilteredMusicians(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMusicians();
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    const filtered = musicians.filter(musician =>
      musician.name.toLowerCase().includes(query) ||
      musician.first_instrument.toLowerCase().includes(query)
    );
    setFilteredMusicians(filtered);
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">Error: {error}</Typography>;

  return (
      <Box sx={{ 
        width: '100%',
        mt: 1  // Reduced top margin from 4 to 1
      }}>
        {/* Add Musician button temporarily hidden
        <Box sx={{ mb: 3 }}>
          <Button 
            variant="contained" 
            sx={{ 
              bgcolor: '#8B2626',
              '&:hover': { bgcolor: '#6B1C1C' }
            }}
            onClick={() => navigate("/sessionmusicians/add")}
          >
            Add Musician
          </Button>
        </Box>
        */}

        <Typography sx={{ mb: 2 }}>
          Many thanks to <a href="https://www.minnehaharecording.com/session-musician-database" target="_blank" rel="noopener noreferrer" style={{ color: '#9B4F96', fontWeight: 'bold', textDecoration: 'none' }}>Minnehaha Recording Company</a> for putting together this list!
        </Typography>

        <TextField
          label="Search by Name or Instrument"
          value={searchQuery}
          onChange={handleSearch}
          variant="outlined"
          fullWidth
          sx={{ mb: 3 }}
        />

        <Box 
          sx={{ 
            width: '100%',
            overflowX: 'auto'
          }}
        >
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
            <TableRow sx={{ bgcolor: '#9B4F96' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 120 }}>NAME</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 120 }}>PRIMARY INSTRUMENT</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 150 }}>OTHER INSTRUMENTS</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 200 }}>STYLES/GENRES</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 100 }}>LOCATION</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 150 }}>CONTACT</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 120 }}>WEBSITE</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 100 }}>SOCIAL</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMusicians.length > 0 ? (
                filteredMusicians.map((musician) => (
                  <TableRow
                    key={musician.id}
                    onClick={() => navigate(`/sessionmusicians/${musician.id}`)}
                    sx={{ 
                      '&:hover': { bgcolor: '#f5f5f5', cursor: 'pointer' },
                      '&:nth-of-type(even)': { bgcolor: '#fafafa' }
                    }}
                  >
                    <TableCell sx={{ wordBreak: 'break-word' }}>{musician.name}</TableCell>
                    <TableCell sx={{ wordBreak: 'break-word' }}>{musician.first_instrument}</TableCell>
                    <TableCell sx={{ wordBreak: 'break-word' }}>
                      {[musician.second_instrument, musician.third_instrument]
                        .filter(Boolean)
                        .join(", ") || "None"}
                    </TableCell>
                    <TableCell sx={{ wordBreak: 'break-word' }}>{musician.primary_styles}</TableCell>
                    <TableCell sx={{ wordBreak: 'break-word' }}>{musician.location}</TableCell>
                    <TableCell sx={{ wordBreak: 'break-word' }}>{musician.contact_info}</TableCell>
                    <TableCell sx={{ wordBreak: 'break-word' }}>{musician.website_samples}</TableCell>
                    <TableCell>
                      <BandSocialLinks 
                        links={parseSocialLinks(musician.website_samples)}
                        contactInfo={musician.contact_info}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No Musicians Found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      </Box>
  );
};

export default SessionMusiciansTable;