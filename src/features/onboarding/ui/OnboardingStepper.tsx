import { useState } from 'react';
import { Box, Stepper, Step, StepLabel, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { BasicInfoStep } from './BasicInfoStep';
import { IdentityStep } from './IdentityStep';
import { BioStep } from './BioStep';
import { PreferencesStep } from './PreferencesStep';
import { PhotosStep } from './PhotosStep';
import { useUpdateProfileMutation, useGetMeQuery, useUpdatePreferencesMutation } from '../api/profileApi';

const steps = ['Datos Personales', 'Identidad', 'Sobre mí', 'Preferencias', 'Fotos'];

export const OnboardingStepper = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState<any>({});
    const [updateProfile, { isLoading }] = useUpdateProfileMutation();
    const [updatePreferences] = useUpdatePreferencesMutation();
    const { data: profile } = useGetMeQuery(undefined);
    const navigate = useNavigate();

    const formatDateForApi = (dateStr: string) => {
        if (!dateStr) return null;
        // Check for DD/MM/YYYY format
        const ddmmyyyy = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        const match = dateStr.match(ddmmyyyy);

        if (match) {
            const [, day, month, year] = match;
            return new Date(`${year}-${month}-${day}`).toISOString();
        }

        // Fallback for valid ISO strings or other formats (if any)
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
            return date.toISOString();
        }
        return null;
    };

    const handleNext = async () => {
        // Validation logic per step could go here
        if (activeStep === 0) {
            const formattedDate = formatDateForApi(formData.birthdate);
            if (!formData.birthdate || !formattedDate) {
                alert('Por favor ingresa una fecha de nacimiento válida (DD/MM/YYYY)');
                return;
            }
        }

        if (activeStep === steps.length - 1) {
            // Final Step (Photos) Validation
            const p: any = profile;
            const photoCount = p?.user?.photos?.length || 0;
            if (photoCount < 3) {
                alert(`Debes subir al menos 3 fotos. Tienes ${photoCount}.`);
                return;
            }
        }

        if (activeStep < steps.length - 1) {
            setActiveStep((prev) => prev + 1);
            return;
        }

        // Final Step: Finish
        try {
            // 1. Save Profile Data
            const birthdateISO = formatDateForApi(formData.birthdate);

            if (!birthdateISO) {
                alert('Error en la fecha de nacimiento. Verifique el formato DD/MM/YYYY');
                return;
            }

            console.log('Onboarding: Sending Profile Payload...');
            const profilePayload = {
                name: formData.name,
                birthdate: birthdateISO,
                height: formData.height,
                gender: formData.gender,
                genderCustom: formData.genderCustom,
                bio: formData.bio,
                locationText: formData.locationText,
                locationId: formData.locationId,
                neighborhood: formData.neighborhood,
                coachingSchool: formData.coachingSchool,
                lookingFor: formData.lookingFor,
                isOnboarded: true,
            };
            console.log('Payload:', profilePayload);
            await updateProfile(profilePayload).unwrap();

            // 2. Save Preferences
            // 2. Save Preferences (Force save with defaults if missing)
            console.log('Onboarding: Saving Preferences...');
            await updatePreferences({
                distanceKm: formData.distanceKm || 50,
                ageMin: formData.ageRange?.[0] || 18,
                ageMax: formData.ageRange?.[1] || 99,
                gendersAllowed: formData.gendersAllowed || []
            }).unwrap();

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
