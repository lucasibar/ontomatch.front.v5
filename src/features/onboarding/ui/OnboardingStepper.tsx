import { useState, useEffect } from 'react';
import { Box, Stepper, Step, StepLabel, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { BasicInfoStep } from './BasicInfoStep';
import { IdentityStep } from './IdentityStep';
import { BioStep } from './BioStep';
import { LocationStep } from './LocationStep';
import { PreferencesStep } from './PreferencesStep';
import { PhotosStep } from './PhotosStep';
import { useUpdateProfileMutation, useGetMeQuery, useUpdatePreferencesMutation, useGetPreferencesQuery } from '../api/profileApi';
import { showToast } from '../../../shared/model/uiSlice';

const steps = ['Datos Personales', 'Identidad', 'Sobre mí', 'Ubicación', 'Preferencias', 'Fotos'];

export const OnboardingStepper = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState<any>({});
    const [updateProfile, { isLoading }] = useUpdateProfileMutation();
    const [updatePreferences] = useUpdatePreferencesMutation();
    const { data: profile } = useGetMeQuery(undefined);
    const { data: preferences } = useGetPreferencesQuery(undefined);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Preload local draft on mount
    useEffect(() => {
        const draft = localStorage.getItem('ontomatch_onboarding_draft');
        if (draft) {
            try {
                const parsed = JSON.parse(draft);
                if (parsed.formData) {
                    setFormData((prev: any) => ({ ...prev, ...parsed.formData }));
                }
                if (typeof parsed.activeStep === 'number') {
                    setActiveStep(parsed.activeStep);
                }
            } catch (e) {
                console.error('Failed to parse onboarding draft:', e);
            }
        }
    }, []);

    // Save draft on change of formData or activeStep
    useEffect(() => {
        if (Object.keys(formData).length > 0) {
            localStorage.setItem('ontomatch_onboarding_draft', JSON.stringify({
                formData,
                activeStep
            }));
        }
    }, [formData, activeStep]);

    // Preload existing data if user already has a profile
    useEffect(() => {
        if (profile) {
            const p: any = profile;
            const existingData: any = {};
            
            if (p.name && p.name !== 'New User') existingData.name = p.name;
            if (p.birthdate) {
                const d = new Date(p.birthdate);
                if (!isNaN(d.getTime())) {
                    existingData.birthdate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
                }
            }
            if (p.height) existingData.height = p.height;
            if (p.gender) existingData.gender = p.gender;
            if (p.genderCustom) existingData.genderCustom = p.genderCustom;
            if (p.bio) existingData.bio = p.bio;
            if (p.locationText) existingData.locationText = p.locationText;
            if (p.neighborhood) existingData.neighborhood = p.neighborhood;
            if (p.coachingSchool || p.coaching_school) existingData.coachingSchool = p.coachingSchool || p.coaching_school;
            if (p.looking_for || p.lookingFor) existingData.lookingFor = p.looking_for || p.lookingFor;

            // Only set if we actually have data to preload
            if (Object.keys(existingData).length > 0) {
                setFormData((prev: any) => ({ ...existingData, ...prev }));
            }
        }
    }, [profile]);

    // Preload preferences
    useEffect(() => {
        if (preferences) {
            const prefs: any = preferences;
            setFormData((prev: any) => ({
                ...prev,
                distanceKm: prev.distanceKm || prefs.distanceKm,
                ageRange: prev.ageRange || [prefs.ageMin || 18, prefs.ageMax || 99],
                gendersAllowed: prev.gendersAllowed || prefs.gendersAllowed || [],
                gendersAllowedCustom: prev.gendersAllowedCustom || prefs.gendersAllowedCustom || [],
                gendersAllowedCustomStr: prev.gendersAllowedCustomStr || (prefs.gendersAllowedCustom || []).join(', '),
            }));
        }
    }, [preferences]);

    const formatDateForApi = (dateStr: string) => {
        if (!dateStr) return null;
        const ddmmyyyy = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        const match = dateStr.match(ddmmyyyy);

        if (match) {
            const [, day, month, year] = match;
            return new Date(`${year}-${month}-${day}`).toISOString();
        }

        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
            return date.toISOString();
        }
        return null;
    };

    const handleNext = async () => {
        // Validation logic per step
        if (activeStep === 0) {
            const formattedDate = formatDateForApi(formData.birthdate);
            if (!formData.birthdate || !formattedDate) {
                dispatch(showToast({ message: 'Por favor ingresá una fecha de nacimiento válida (DD/MM/YYYY)', severity: 'warning' }));
                return;
            }

            // Calculate age and ensure >= 18
            const birthObj = new Date(formattedDate);
            const today = new Date();
            let age = today.getFullYear() - birthObj.getFullYear();
            const m = today.getMonth() - birthObj.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthObj.getDate())) {
                age--;
            }
            if (age < 18) {
                dispatch(showToast({ message: 'Debés tener al menos 18 años para registrarte en OntoMatch', severity: 'warning' }));
                return;
            }

            if (!formData.name || formData.name.trim().length < 2) {
                dispatch(showToast({ message: 'Por favor ingresá tu nombre', severity: 'warning' }));
                return;
            }

            if (!formData.coachingSchool || formData.coachingSchool.trim().length === 0) {
                dispatch(showToast({ message: 'Por favor ingresá tu escuela de coaching', severity: 'warning' }));
                return;
            }

            if (!formData.lookingFor) {
                dispatch(showToast({ message: 'Por favor seleccioná qué estás buscando', severity: 'warning' }));
                return;
            }
        }

        if (activeStep === 1) {
            // Identity Validation
            if (!formData.gender) {
                dispatch(showToast({ message: 'Por favor seleccioná tu identidad de género', severity: 'warning' }));
                return;
            }
            if (formData.gender === 'other' && (!formData.genderCustom || formData.genderCustom.trim().length === 0)) {
                dispatch(showToast({ message: 'Por favor especificá tu identidad de género alternativa', severity: 'warning' }));
                return;
            }
            if (!formData.gendersAllowed || formData.gendersAllowed.length === 0) {
                dispatch(showToast({ message: 'Por favor seleccioná al menos un género que buscás', severity: 'warning' }));
                return;
            }
        }

        if (activeStep === 2) {
            // Bio Validation
            if (!formData.bio || formData.bio.trim().length < 20) {
                dispatch(showToast({ message: 'Por favor escribí una breve descripción de al menos 20 caracteres', severity: 'warning' }));
                return;
            }
        }

        if (activeStep === 3) {
            // Location Validation
            if (!formData.locationText) {
                dispatch(showToast({ message: 'Por favor buscá y seleccioná tu ubicación / localidad', severity: 'warning' }));
                return;
            }
        }

        if (activeStep === steps.length - 1) {
            // Final Step (Photos) Validation
            const p: any = profile;
            const photoCount = p?.user?.photos?.length || 0;
            if (photoCount < 3) {
                dispatch(showToast({ message: `Necesitás subir al menos 3 fotos de perfil. Actualmente tenés ${photoCount}.`, severity: 'warning' }));
                return;
            }
        }

        if (activeStep < steps.length - 1) {
            setActiveStep((prev) => prev + 1);
            return;
        }

        // Final Step: Submit onboarding
        try {
            const birthdateISO = formatDateForApi(formData.birthdate);

            if (!birthdateISO) {
                dispatch(showToast({ message: 'Error en la fecha de nacimiento. Verificá el formato DD/MM/YYYY', severity: 'error' }));
                return;
            }

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
            await updateProfile(profilePayload).unwrap();

            const customs = formData.gendersAllowedCustomStr
                ? formData.gendersAllowedCustomStr.split(',').map((s: string) => s.trim()).filter(Boolean)
                : (formData.gendersAllowedCustom || []);

            await updatePreferences({
                distanceKm: formData.distanceKm || 50,
                ageMin: formData.ageRange?.[0] || 18,
                ageMax: formData.ageRange?.[1] || 99,
                gendersAllowed: formData.gendersAllowed || [],
                gendersAllowedCustom: customs
            }).unwrap();

            dispatch(showToast({ message: '¡Perfil completado! Bienvenido a OntoMatch 🎉', severity: 'success' }));
            localStorage.removeItem('ontomatch_onboarding_draft');
            navigate('/');
        } catch (err) {
            console.error(err);
            dispatch(showToast({ message: 'Error al guardar el perfil. Intentá de nuevo.', severity: 'error' }));
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
            case 3: return <LocationStep data={formData} onChange={setFormData} />;
            case 4: return <PreferencesStep data={formData} onChange={setFormData} />;
            case 5: return <PhotosStep />;
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
