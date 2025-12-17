export type GardenType = 'indoor' | 'outdoor';

export interface JournalEntry {
    id: string;
    date: string;
    note: string;
    heightCm?: number;
}

export interface Plant {
    id: string;
    name: string;
    species: string;
    type: GardenType;
    location: string; // e.g., "Living Room", "Backyard"
    waterFrequencyDays: number;
    lastWateredDate: string; // ISO date string
    imageUrl?: string;
    notes?: string;
    dateAdded: string;
    journal?: JournalEntry[];
    perenualId?: number;
    room?: string; // P9: Room Grouping
}

export interface GardenStats {
    totalPlants: number;
    plantsNeedingWater: number;
    healthScore: number; // 0-100
}
