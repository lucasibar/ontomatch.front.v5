
export interface Profile {
    user_id: string;
    name: string;
    birthdate: string;
    distanceKm?: number;
    bio: string;
    photos?: { url: string }[];
    gender?: string;
    neighborhood?: string;
    coachingSchool?: string;
    locationText?: string;
    isLiker?: boolean;
}
