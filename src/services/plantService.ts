import { PlantTemplate } from '@/data/popularPlants';
import localDatabase from '@/data/plantDatabase.json';

const API_KEY = 'sk-zHbO6942da5b77a2214001'; // In production, use process.env.NEXT_PUBLIC_PERENUAL_KEY
const API_BASE_URL = 'https://perenual.com/api';

export interface PerenualPlant {
    id: number;
    common_name: string;
    scientific_name: string[];
    other_name?: string[];
    cycle: string;
    watering: string;
    sunlight: string[];
    default_image?: {
        license: number;
        license_name: string;
        license_url: string;
        original_url: string;
        regular_url: string;
        medium_url: string;
        small_url: string;
        thumbnail: string;
    } | string; // Allow string for local DB
    care_level?: string;
    description?: string;
    hardiness?: {
        min: string;
        max: string;
    };
}

export interface PerenualDetail extends PerenualPlant {
    care_level: string;
    description: string;
    hardiness: {
        min: string;
        max: string;
    };
    // Add other fields as needed
}

// Map Perenual watering string to days
const mapWateringToDays = (watering: string): number => {
    const w = watering.toLowerCase();
    if (w.includes('frequent')) return 3;
    if (w.includes('average')) return 7;
    if (w.includes('minimum')) return 14;
    if (w.includes('none')) return 30;
    return 7; // Default
};

// Map Perenual sunlight array to string
const mapSunlightToString = (sunlight: string[]): string => {
    return sunlight.join(', ');
};

export const searchPlants = async (query: string): Promise<PlantTemplate[]> => {
    if (!query) return [];

    // 1. Search Local Database First
    const lowerQuery = query.toLowerCase();
    const localResults = localDatabase.filter(p =>
        p.common_name.toLowerCase().includes(lowerQuery) ||
        p.scientific_name.some(s => s.toLowerCase().includes(lowerQuery))
    );

    if (localResults.length > 0) {
        return localResults.map(p => ({
            id: p.id.toString(),
            common_name: p.common_name,
            scientific_name: p.scientific_name,
            cycle: "Perennial", // Default for local
            watering: p.watering,
            sunlight: p.sunlight,
            default_image: p.default_image, // Local DB always has string
            water_frequency_days: mapWateringToDays(p.watering)
        }));
    }

    // 2. Fallback to API
    try {
        const response = await fetch(`${API_BASE_URL}/species-list?key=${API_KEY}&q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Failed to fetch from Perenual');

        const data = await response.json();
        const results: PerenualPlant[] = data.data;

        return results.map(p => ({
            id: p.id.toString(),
            common_name: p.common_name,
            scientific_name: p.scientific_name,
            cycle: p.cycle,
            watering: p.watering,
            sunlight: p.sunlight,
            default_image: typeof p.default_image === 'string' ? p.default_image : p.default_image?.regular_url,
            water_frequency_days: mapWateringToDays(p.watering)
        }));
    } catch (error) {
        console.error("Perenual Search Error:", error);
        return [];
    }
};

export const fetchPlantDetails = async (id: string): Promise<Partial<PerenualDetail> | null> => {
    // 1. Check Local Database
    const localPlant = localDatabase.find(p => p.id.toString() === id);
    if (localPlant) {
        return localPlant as unknown as Partial<PerenualDetail>;
    }

    // 2. Fallback to API
    try {
        const response = await fetch(`${API_BASE_URL}/species/details/${id}?key=${API_KEY}`);
        if (!response.ok) throw new Error('Failed to fetch details');

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Perenual Details Error:", error);
        return null;
    }
};
