import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import EditableBandList from "../../components/shows/EditableBandList";
import { useAuth } from "../../hooks/useAuth";
import { useAuth0 } from "@auth0/auth0-react";

const ShowForm = ({ isEdit = false, initialData = null }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
    const { getAccessTokenSilently, isAuthenticated, user } = useAuth0();
  
  const [formData, setFormData] = useState({
    flyer_image: "",
    event_link: "",
    start: "",
    venue_id: "",
    bands: [],
  });

  const [venues, setVenues] = useState([]);
  const [bandInput, setBandInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isReadyToSubmit, setIsReadyToSubmit] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;

  // Store the return URL with filters when component mounts
  const [returnUrl, setReturnUrl] = useState('/shows');
  useEffect(() => {
    // Capture the return URL with filters when component mounts
    const searchParams = new URLSearchParams(location.search);
    const filters = searchParams.get('returnFilters');
    if (filters) {
      setReturnUrl(`/shows?${filters}`);
    }
  }, [location]);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await fetch(`${apiUrl}/venues`);
        if (!response.ok) throw new Error("Failed to fetch venues.");
        const { data } = await response.json();
        setVenues(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        setErrorMessage("Could not load venues. Please try again later.");
        setVenues([]);
      }
    };
  
    fetchVenues();
  }, [apiUrl]);

  useEffect(() => {
    const canSubmit = formData.start && formData.venue_id && formData.bands.length > 0;
    setIsReadyToSubmit(canSubmit);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddBand = () => {
    if (bandInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        bands: [...prev.bands, { name: bandInput.trim() }],
      }));
      setBandInput("");
    }
  };

  const handleDelete = async () => {
    if (!isEdit) return;
    
    if (!window.confirm("Are you sure you want to delete this show?")) {
      return;
    }

    try {
      const token = await getAccessTokenSilently();

      const response = await fetch(`${apiUrl}/shows/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      // Only navigate after successful deletion
      navigate(returnUrl);
    } catch (err) {
      console.error(err);
      setErrorMessage("An error occurred while deleting the show.");
    }
  };

  const handleSubmit = async (e) => {
    console.log("Starting form submission...");
    console.log("Current formData:", formData);
    e.preventDefault();
      
    if (!isReadyToSubmit) {
      setErrorMessage("Please fill out all required fields.");
      return;
    }
  
    const bandsFormatted = formData.bands
    .map((band, index) => `${index + 1}:${band.name}`)
    .join(", ");
          
    const dataToSubmit = {
      ...formData,
      bands: bandsFormatted,
    };
  
    console.log("Submitting data:", dataToSubmit);
  
    const endpoint = isEdit
      ? `${apiUrl}/shows/${id}`
      : `${apiUrl}/shows/add`;
  
    try {
      console.log("Making fetch request to:", endpoint);
      console.log("With data:", dataToSubmit);
      
      const token = await getAccessTokenSilently();
      
      const response = await fetch(endpoint, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(dataToSubmit),
      });
  
      console.log("Response received:", response);
      
      if (!response.ok) {
        console.log("Response not OK, status:", response.status);
        const errorData = await response.json();
        console.log("Error data:", errorData);
        throw new Error(errorData.details || "Failed to submit show data");
      }
  
      navigate(returnUrl);
    } catch (err) {
      console.error("Form submission error:", err);
      console.error("Full error object:", err);
      setErrorMessage(`Error: ${err.message}. Please check the console for more details.`);
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        {isEdit ? "Edit Show" : "Add New Show"}
      </Typography>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          label="Event Link"
          name="event_link"
          value={formData.event_link}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="Flyer Image URL"
          name="flyer_image"
          value={formData.flyer_image}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Start Time"
          name="start"
          type="datetime-local"
          value={formData.start}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
          InputLabelProps={{
            shrink: true,
          }}
        />

        <FormControl fullWidth required sx={{ mb: 2 }}>
          <InputLabel>Venue</InputLabel>
          <Select
            name="venue_id"
            value={formData.venue_id}
            onChange={handleChange}
          >
            {venues.map((venue) => (
              <MenuItem key={venue.id} value={venue.id}>
                {venue.venue}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography variant="h6" sx={{ mb: 1 }}>
          Bands
        </Typography>
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            label="Add Band"
            value={bandInput}
            onChange={(e) => setBandInput(e.target.value)}
            fullWidth
          />
          <Button variant="contained" onClick={handleAddBand}>
            Add
          </Button>
        </Box>

        <EditableBandList 
          bands={formData.bands} 
          onChange={(newBands) => setFormData(prev => ({ ...prev, bands: newBands }))}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 4 }}
          disabled={!isReadyToSubmit}
        >
          {isEdit ? "Update Show" : "Add Show"}
        </Button>

        {isEdit && (
          <Button
            variant="contained"
            color="error"
            fullWidth
            sx={{ mt: 2 }}
            onClick={handleDelete}
          >
            Delete Show
          </Button>
        )}
      </form>
    </Box>
  );
};

export default ShowForm;