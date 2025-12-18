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
    imageUrl?: string; // P6: Growth Tape
    heightCm?: number;
    type?: 'note' | 'photo' | 'milestone' | 'harvest';
    harvestAmount?: number;
    harvestUnit?: string; // e.g., 'g', 'kg', 'units'
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
    xp: number; // New: Experience points
    level: number; // New: Plant level
    rarity?: 'Common' | 'Rare' | 'Legendary'; // New: Rarity tier
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

    // Phase 9: Productive Patch
    isPerennial?: boolean;
    difficulty?: 'Easy' | 'Medium' | 'Hard';
    harvestDays?: number;
    companionIds?: string[]; // IDs of other plants in the garden that help this one
}

export interface Seed {
    id: string;
    species: string;
    quantity: number;
    unit: 'packets' | 'seeds' | 'grams';
    expiryDate?: string; // ISO date
    viability?: number; // 0-100 percentage
    notes?: string;
    dateAdded: string;
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
    special_care?: string[];
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

// Validation schemas and utility types for enhanced plant database
export const PLANT_CATEGORIES = ['fruit', 'vegetable', 'herb', 'flower'] as const;
export const GARDEN_TYPES = ['indoor', 'outdoor'] as const;
export const WEATHER_ALERT_TYPES = ['yellow', 'orange', 'red'] as const;
export const WEATHER_ALERT_CATEGORIES = ['wind', 'rain', 'storm', 'temperature'] as const;
export const TASK_PRIORITIES = ['high', 'medium', 'low'] as const;
export const TASK_CATEGORIES = ['planting', 'maintenance', 'harvesting', 'preparation'] as const;
export const SYMPTOM_CATEGORIES = ['leaves', 'stems', 'roots', 'growth'] as const;
export const POT_MATERIALS = ['terracotta', 'ceramic', 'plastic', 'fabric', 'hanging'] as const;
export const PLANT_STATUSES = ['healthy', 'hospital'] as const;
export const DRAINAGE_LEVELS = ['excellent', 'good', 'moderate', 'poor'] as const;
export const SEASONS = ['spring', 'summer', 'autumn', 'winter'] as const;

// Validation functions
export const isValidPlantCategory = (category: string): category is PlantCategory => {
    return PLANT_CATEGORIES.includes(category as PlantCategory);
};

export const isValidGardenType = (type: string): type is GardenType => {
    return GARDEN_TYPES.includes(type as GardenType);
};

export const isValidWeatherAlertType = (type: string): type is WeatherAlertType => {
    return WEATHER_ALERT_TYPES.includes(type as WeatherAlertType);
};

export const isValidTaskPriority = (priority: string): priority is TaskPriority => {
    return TASK_PRIORITIES.includes(priority as TaskPriority);
};

export const isValidPotMaterial = (material: string): material is PotMaterial => {
    return POT_MATERIALS.includes(material as PotMaterial);
};

// Plant data validation schema
export interface PlantValidationSchema {
    name: {
        required: true;
        minLength: 1;
        maxLength: 100;
    };
    species: {
        required: false;
        maxLength: 100;
    };
    category: {
        required: false;
        enum: typeof PLANT_CATEGORIES;
    };
    waterFrequencyDays: {
        required: false;
        min: 1;
        max: 365;
    };
    companionPlants: {
        required: false;
        maxItems: 20;
    };
}

// Enhanced plant data validation
export const validatePlantData = (plant: Partial<Plant>): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Required fields
    if (!plant.name || plant.name.trim().length === 0) {
        errors.push('Plant name is required');
    }
    if (plant.name && plant.name.length > 100) {
        errors.push('Plant name must be 100 characters or less');
    }

    // Category validation
    if (plant.category && !isValidPlantCategory(plant.category)) {
        errors.push('Invalid plant category');
    }

    // Garden type validation
    if (plant.type && !isValidGardenType(plant.type)) {
        errors.push('Invalid garden type');
    }

    // Water frequency validation
    if (plant.waterFrequencyDays && (plant.waterFrequencyDays < 1 || plant.waterFrequencyDays > 365)) {
        errors.push('Water frequency must be between 1 and 365 days');
    }

    // Companion plants validation
    if (plant.companionPlants && plant.companionPlants.length > 20) {
        errors.push('Maximum 20 companion plants allowed');
    }

    // Pot material validation
    if (plant.potType && !isValidPotMaterial(plant.potType)) {
        errors.push('Invalid pot material');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

// Harvest info validation
export const validateHarvestInfo = (harvestInfo: Partial<HarvestInfo>): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (harvestInfo.season && harvestInfo.season.length === 0) {
        errors.push('At least one harvest season is required');
    }

    if (harvestInfo.timeToHarvest && harvestInfo.timeToHarvest.trim().length === 0) {
        errors.push('Time to harvest information is required');
    }

    if (harvestInfo.harvestSigns && harvestInfo.harvestSigns.length === 0) {
        errors.push('At least one harvest sign is required');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

// Soil requirements validation
export const validateSoilRequirements = (soil: Partial<SoilRequirements>): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (soil.ph) {
        if (soil.ph.min < 0 || soil.ph.min > 14) {
            errors.push('Minimum pH must be between 0 and 14');
        }
        if (soil.ph.max < 0 || soil.ph.max > 14) {
            errors.push('Maximum pH must be between 0 and 14');
        }
        if (soil.ph.min >= soil.ph.max) {
            errors.push('Minimum pH must be less than maximum pH');
        }
    }

    if (soil.drainage && !DRAINAGE_LEVELS.includes(soil.drainage)) {
        errors.push('Invalid drainage level');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

// Utility types for plant database operations
export type PlantSearchFilters = {
    category?: PlantCategory;
    pollinatorFriendly?: boolean;
    nativeRegion?: string;
    harvestSeason?: string;
    companionWith?: string;
};

export type PlantSortOptions = {
    field: 'name' | 'category' | 'nativeRegion' | 'pollinatorFriendly';
    direction: 'asc' | 'desc';
};

export interface PlantDatabaseQuery {
    filters?: PlantSearchFilters;
    sort?: PlantSortOptions;
    limit?: number;
    offset?: number;
    searchTerm?: string;
}

// Irish climate specific types
export interface IrishClimateData {
    hardiness_zone: string; // e.g., "8a", "8b", "9a"
    frost_dates: {
        last_spring_frost: string; // MM-DD format
        first_autumn_frost: string; // MM-DD format
    };
    growing_season_length: number; // days
    rainfall_pattern: 'high' | 'moderate' | 'low';
    wind_exposure: 'high' | 'moderate' | 'low';
}

export interface IrishPlantData {
    id: string;
    common_name: string;
    scientific_name: string[];
    category: PlantCategory;
    default_image?: string;
    watering: string;
    sunlight: string[];
    care_level: string;
    description: string;
    native_region?: string;
    companion_plants?: string[];
    pollinator_friendly: boolean;
    harvest_info?: HarvestInfo;
    seasonal_care?: SeasonalCareGuide;
    common_issues?: PlantIssue[];
    soil_requirements?: SoilRequirements;
    climate_data?: IrishClimateData;
    irish_growing_tips?: string[];
    protection_requirements?: {
        wind: boolean;
        frost: boolean;
        excessive_rain: boolean;
    };
}
