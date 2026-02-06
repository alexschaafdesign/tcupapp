import React, { useState, useEffect } from "react";
import { Box, TextField, Typography, Button, Alert } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

const TCUPPeopleForm = ({ isEdit = false }) => {
  const { personId } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);


  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    profile_photo: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const apiUrl = process.env.REACT_APP_API_URL;  // The backend API URL from the .env file


  useEffect(() => {
    if (isEdit) {
      const fetchPerson = async () => {
        try {
          const response = await fetch(`/${apiUrl}/people/${personId}`);
          if (!response.ok) throw new Error("Failed to fetch person data");
          const data = await response.json();
          setFormData({
            name: data.name || "",
            email: data.email || "",
            bio: data.bio || "",
            profile_photo: data.profile_photo || "",
          });
        } catch (error) {
          console.error("Error fetching person data:", error);
          setErrorMessage("Failed to fetch person data.");
        }
      };

      fetchPerson();
    }
  }, [isEdit, personId, apiUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch(`/${apiUrl}/people/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          bio: formData.bio,
          profile_photo: formData.profile_photo,
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to add person");
      }
  
      const result = await response.json();
      console.log("Person added:", result);
  
      // Navigate back to the table or refresh it
      navigate("/people");
    } catch (err) {
      console.error("Error submitting form:", err);
      setError("Failed to add person. Please try again.");
    }
  
  };

  return (
    <Box sx={{ paddingTop: 2, paddingBottom: 10, paddingX: 4 }}>
      <Typography variant="h1" gutterBottom textAlign="center">
        {isEdit ? "Edit Your Profile" : "Create Your Profile"}
      </Typography>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />

        <TextField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />

        <TextField
          label="Bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          fullWidth
          multiline
          rows={4}
          sx={{ mb: 2 }}
        />

        <TextField
          label="Profile Photo URL"
          name="profile_photo"
          value={formData.profile_photo}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 4 }}
        >
          {isEdit ? "Update Profile" : "Create Profile"}
        </Button>
      </form>
    </Box>
  );
};

export default TCUPPeopleForm;
