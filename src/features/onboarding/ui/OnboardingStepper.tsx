import { useState } from 'react';
import { Box, Stepper, Step, StepLabel, Button, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { BasicInfoStep } from './BasicInfoStep';
import { LocationStep } from './LocationStep';
import { PhotosStep } from './PhotosStep';
import { useUpdateProfileMutation } from '../api/profileApi';

const steps = ['Basic Info', 'Location', 'Photos']; // Simplified for MVP

export const OnboardingStepper = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState<any>({});
    const [updateProfile, { isLoading }] = useUpdateProfileMutation();
    const navigate = useNavigate();

    const handleNext = async () => {
        // If not last step
        if (activeStep < steps.length - 1) {
            setActiveStep((prev) => prev + 1);
            return;
        }

        // If last step (Photos), we assume photos were uploaded individually using the button in that step.
        // However, we need to save the final profile data (name, etc) if we haven't already.
        // Let's save profile data at the end of Basic/Location steps or all at once?
        // Let's save all text data now.

        try {
            await updateProfile(formData).unwrap();
            navigate('/'); // Go to feed
        } catch (err) {
            alert('Failed to save profile');
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const getStepContent = (step: number) => {
        switch (step) {
            case 0: return <BasicInfoStep data={formData} onChange={setFormData} />;
            case 1: return <LocationStep data={formData} onChange={setFormData} />;
            case 2: return <PhotosStep />;
            default: return 'Unknown step';
        }
    };

    return (
        <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto', mt: 4 }}>
            <Stepper activeStep={activeStep}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            <Paper sx={{ p: 4, mt: 4, minHeight: 400 }}>
                {getStepContent(activeStep)}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Button disabled={activeStep === 0} onClick={handleBack}>
                        Back
                    </Button>
                    <Button variant="contained" onClick={handleNext} disabled={isLoading}>
                        {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};
