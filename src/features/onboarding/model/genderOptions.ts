export const genderOptions = [
    { value: 'male', label: 'Hombre' },
    { value: 'female', label: 'Mujer' },
    { value: 'non_binary', label: 'Persona no binaria' },
    { value: 'other', label: 'Otra identidad' },
] as const;

const legacyAllGenderValues = genderOptions
    .filter(option => option.value !== 'other')
    .map(option => option.value);

export function normalizeGenderPreferences(value: string[] = []): string[] {
    return value.includes('all') ? [...legacyAllGenderValues] : value.filter(item => item !== 'all');
}
