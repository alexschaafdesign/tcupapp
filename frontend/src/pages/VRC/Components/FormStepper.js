import React from 'react';
import { Box, Stepper, Step, StepLabel } from '@mui/material';
import steps from './Steps';
import { useMediaQuery } from '@mui/material';

const FormStepper = ({ activeStep = 0 }) => {
  const isMobile = useMediaQuery('(max-width:680px)');
  const isTablet = useMediaQuery('(max-width:768px)');

  return (
    <Box className="w-full mb-8 overflow-x-auto">
      <Stepper 
        activeStep={activeStep} 
        alternativeLabel={!isMobile}
        sx={{
          '& .MuiStepLabel-label': {
            fontSize: {
              xs: '0.7rem',
              sm: '0.8rem',
              md: '0.8rem'
            },
            display: { xs: 'none', sm: 'block' },
            whiteSpace: 'normal',
            wordBreak: 'break-word',
            mt: { xs: 0.5, sm: 1 }
          },
          '& .MuiStepConnector-line': {
            minWidth: { xs: '15px', sm: '40px' },
            display: { xs: 'none', sm: 'none', md: 'block' },

          },
          '& .MuiStep-root': {
            padding: { xs: '0 4px', sm: '0 8px' }
          },
          '& .MuiStepIcon-text': {
            fontSize: '0.75rem'
          }
        }}
      >
        {steps.map((step, index) => (
          <Step key={index}>
            <StepLabel>{!isMobile && (isTablet ? step.short : step.label)}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default FormStepper;