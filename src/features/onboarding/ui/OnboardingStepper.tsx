import { useState } from 'react';
import { Box, Stepper, Step, StepLabel, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { BasicInfoStep } from './BasicInfoStep';
import { IdentityStep } from './IdentityStep';
import { BioStep } from './BioStep';
import { PreferencesStep } from './PreferencesStep';
import { PhotosStep } from './PhotosStep';
import { useUpdateProfileMutation } from '../api/profileApi';
// import { useUpdatePreferencesMutation } from '../api/profileApi'; // To be added

const steps = ['Datos Personales', 'Identidad', 'Sobre mí', 'Preferencias', 'Fotos'];

export const OnboardingStepper = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState<any>({});
    const [updateProfile, { isLoading }] = useUpdateProfileMutation();
    // const [updatePreferences] = useUpdatePreferencesMutation();
    const navigate = useNavigate();

    const handleNext = async () => {
        // Validation logic per step could go here

        if (activeStep < steps.length - 1) {
            setActiveStep((prev) => prev + 1);
            return;
        }

        // Final Step: Finish
        try {
            // 1. Save Profile Data
            // We strip preferences fields to avoid errors if strict
            const profilePayload = {
                name: formData.name,
                birthdate: formData.birthdate,
                height: formData.height,
                gender: formData.gender,
                genderCustom: formData.genderCustom,
                bio: formData.bio,
                locationText: formData.locationText,
                locationId: formData.locationId,
                neighborhood: formData.neighborhood,
                // ... other profile fields
            };
            await updateProfile(profilePayload).unwrap();

            // 2. Save Preferences Data
            // const preferencesPayload = {
            //    distanceKm: formData.distanceKm,
            //    gendersAllowed: formData.gendersAllowed,
            //    ageMin: formData.ageRange?.[0],
            //    ageMax: formData.ageRange?.[1]
            // };
            // await updatePreferences(preferencesPayload).unwrap();

            // For now, if we haven't implemented updatePreferences in backend, we might skip or put in updateProfile if modified.
            // Assumption: User asked to analyze DB. Preferences is stored in Preference entity.
            // I will implement updatePreferences endpoint next.

            navigate('/'); // Go to feed
        } catch (err) {
            console.error(err);
            alert('Failed to save profile. Please try again.');
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const getStepContent = (step: number) => {
        switch (step) {
            case 0: return <BasicInfoStep data={formData} onChange={setFormData} />;
            case 1: return <IdentityStep data={formData} onChange={setFormData} />;
            case 2: return <BioStep data={formData} onChange={setFormData} />;
            case 3: return <PreferencesStep data={formData} onChange={setFormData} />;
            case 4: return <PhotosStep />;
            default: return 'Unknown step';
        }
    };

    return (
        <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto', mt: 4 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
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
                        Atrás
                    </Button>
                    <Button variant="contained" onClick={handleNext} disabled={isLoading}>
                        {activeStep === steps.length - 1 ? 'Empezar' : 'Siguiente'}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};
