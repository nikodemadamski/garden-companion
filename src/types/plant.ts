export type GardenType = 'indoor' | 'outdoor';
export type PlantCategory = 'fruit' | 'vegetable' | 'herb' | 'flower';
export type WeatherAlertType = 'yellow' | 'orange' | 'red';
export type WeatherAlertCategory = 'wind' | 'rain' | 'storm' | 'temperature';
export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskCategory = 'planting' | 'maintenance' | 'harvesting' | 'preparation';
export type SymptomCategory = 'leaves' | 'stems' | 'roots' | 'growth';
export type PotMaterial = 'terracotta' | 'ceramic' | 'plastic' | 'fabric' | 'hanging';

export interface JournalEntry {
    id: string;
    date: string;
    note: string;
    heightCm?: number;
    imageUrl?: string; // P6: Growth Tape
}

// Enhanced plant interface with new fields for comprehensive garden companion
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
    snoozeUntil?: string; // P4: Snooze Button (ISO date)

    // P7: Hospital Wing
    status?: 'healthy' | 'hospital';

    // P8: Pet Profiles
    nickname?: string;
    gotchaDate?: string; // ISO date
    potType?: PotMaterial;

    // Enhanced fields for comprehensive garden companion
    category?: PlantCategory;
    companionPlants?: string[];
    seasonalCare?: SeasonalCareGuide;
    pollinatorFriendly?: boolean;
    harvestInfo?: HarvestInfo;
    commonIssues?: PlantIssue[];
    soilRequirements?: SoilRequirements;
}

// New interfaces for enhanced functionality
export interface SeasonalTask {
    id: string;
    title: string;
    description: string;
    month: number;
    priority: TaskPriority;
    category: TaskCategory;
    climateZone: string;
    plantTypes?: string[];
    createdAt: string;
}

export interface WeatherAlert {
    id: string;
    userId: string;
    alertType: WeatherAlertCategory;
    severity: WeatherAlertType;
    startTime: string;
    endTime?: string;
    description: string;
    actionsTaken?: string[];
    createdAt: string;
}

export interface PlantDiagnostic {
    id: string;
    plantId: string;
    symptoms: string[];
    diagnosis?: string;
    treatmentPlan?: TreatmentPlan;
    resolved: boolean;
    createdAt: string;
}

export interface PlantPhoto {
    id: string;
    plantId: string;
    userId: string;
    url: string;
    thumbnailUrl?: string;
    isPrimary: boolean;
    metadata?: PhotoMetadata;
    createdAt: string;
}

export interface EnhancedPlantData {
    id: string;
    perenualId?: number;
    category: PlantCategory;
    nativeRegion: string;
    companionPlants: string[];
    pollinatorFriendly: boolean;
    harvestInfo?: HarvestInfo;
    seasonalCare: SeasonalCareGuide;
    commonIssues: PlantIssue[];
    soilRequirements: SoilRequirements;
    updatedAt: string;
}

// Supporting interfaces
export interface HarvestInfo {
    season: string[];
    timeToHarvest: string;
    harvestSigns: string[];
    storageInstructions: string;
}

export interface SeasonalCareGuide {
    spring?: SeasonalCareInstructions;
    summer?: SeasonalCareInstructions;
    autumn?: SeasonalCareInstructions;
    winter?: SeasonalCareInstructions;
}

export interface SeasonalCareInstructions {
    watering: string;
    fertilizing?: string;
    pruning?: string;
    protection?: string;
    specialCare?: string[];
}

export interface PlantIssue {
    name: string;
    symptoms: string[];
    causes: string[];
    treatments: string[];
    prevention: string[];
}

export interface SoilRequirements {
    type: string;
    ph: { min: number; max: number };
    drainage: 'excellent' | 'good' | 'moderate' | 'poor';
    nutrients: string[];
    amendments?: string[];
}

export interface TreatmentPlan {
    diagnosis: string;
    immediateActions: string[];
    ongoingCare: string[];
    followUpSchedule: string[];
    potRecommendations?: PotRecommendation[];
}

export interface PotRecommendation {
    size: string;
    material: PotMaterial;
    drainage: boolean;
    reasoning: string;
}

export interface PhotoMetadata {
    size: number;
    dimensions: { width: number; height: number };
    format: string;
    captureDate?: string;
}

export interface PlantSymptom {
    id: string;
    name: string;
    category: SymptomCategory;
    description: string;
    imageUrl?: string;
}

export interface GardenStats {
    totalPlants: number;
    plantsNeedingWater: number;
    healthScore: number; // 0-100
}
