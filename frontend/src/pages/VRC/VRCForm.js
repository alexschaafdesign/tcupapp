import React, { useState } from 'react';
import { Box, Container, Typography, Paper, Button, CircularProgress } from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import FormStepper from './Components/FormStepper';
import steps from './Components/Steps';

const VRCForm = () => {
  const { isAuthenticated, isLoading } = useAuth0();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    basicInfo: {},
    payment: {},
    managementAndCommunication: {},
    safety: {},
    accessibility: {},
    sound: {},
    hospitality: {},
    overall: {}
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleStepSubmit = async (stepData) => {
    setFormData(prev => ({
      ...prev,
      [Object.keys(stepData)[0]]: stepData[Object.keys(stepData)[0]]
    }));

    if (activeStep === steps.length - 1) {
      await handleFinalSubmit();
    } else {
      handleNext();
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/airtable/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: formData })
      });

      if (!response.ok) throw new Error('Submission failed');
      
      setStatus({
        type: 'success',
        message: 'Venue review submitted successfully!'
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Failed to submit review. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box className="flex justify-center items-center min-h-[200px]">
        <CircularProgress />
      </Box>
    );
  }

  const CurrentStepComponent = steps[activeStep].component;

  return (
    <Container maxWidth="md">
      <Paper elevation={3} className="p-6 sm:p-8 mt-4 sm:mt-8" sx={{
        padding: '2rem',
      }}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4
        }}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4
        }}>
        <Typography variant="h2" align="center" className="mb-8">
          VENUE REPORT CARD
        </Typography>
        
        <Box className="mb-12">
          <FormStepper activeStep={activeStep} />
        </Box>
        </Box>

        <Box className="mb-12">
          {status.message && (
            <Typography 
              color={status.type === 'error' ? 'error' : 'success'} 
              className="mb-6 text-center"
            >
              {status.message}
            </Typography>
          )}

         <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}>

          <CurrentStepComponent
            formData={formData}
            onSubmit={handleStepSubmit}
            isSubmitting={isSubmitting}
          />
        </Box>
        </Box>

        <Box className="flex justify-between items-center">
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={activeStep === 0 || isSubmitting}
            sx={{
              width: 'auto',
            }}
          >
            Back
          </Button>
        </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default VRCForm;