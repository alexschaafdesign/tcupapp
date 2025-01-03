
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const TCUPPeopleTable = () => {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL;  // The backend API URL from the .env file


  useEffect(() => {
    const fetchPeople = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/people`);
        if (!response.ok) throw new Error("Failed to fetch people.");
        const data = await response.json();
        setPeople(data);
      } catch (err) {
        console.error("Error fetching people:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPeople();
  }, [apiUrl]);

  const handleViewProfile = (id) => {
    navigate(`/people/${id}`);
  };

  const handleEditProfile = (id) => {
    navigate(`/people/${id}/edit`);
  };

  const handleAddYourself = () => {
    navigate(`/people/add`);
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return (
      <Typography color="error" sx={{ mb: 2 }}>
        {error}
      </Typography>
    );
  }

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h1" gutterBottom>
        People
      </Typography>

      {/* Add Yourself Button */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddYourself}
        >
          Add Yourself
        </Button>
      </Box>

      {people.length === 0 ? (
        <Typography>No people profiles available.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {people.map((person) => (
                <TableRow key={person.id}>
                  <TableCell>{person.name}</TableCell>
                  <TableCell>{person.email}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleViewProfile(person.id)}
                      sx={{ mr: 1 }}
                    >
                      View
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => handleEditProfile(person.id)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default TCUPPeopleTable;
