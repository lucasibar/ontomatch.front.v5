
export interface Profile {
    user_id: string; // Map from backend 'user_id'
    name: string;
    birthdate: string;
    distanceKm?: number;
    bio: string;
    photos?: { url: string }[];
    gender?: string;
    orientation?: string;
    neighborhood?: string;
    isLiker?: boolean; // Added for debugging/potential UI use
}
