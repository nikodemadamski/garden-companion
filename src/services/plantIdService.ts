import { PlantTemplate } from '@/data/popularPlants';
import { searchPlants } from './plantService';

const PLANT_ID_API_URL = 'https://plant.id/api/v3/identification';
const PLANT_ID_KEY = process.env.NEXT_PUBLIC_PLANT_ID_KEY || ''; // User needs to provide this

// Helper to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

export async function identifyPlant(file: File): Promise<PlantTemplate> {
    // 1. Check for API Key
    if (!PLANT_ID_KEY) {
        console.warn("Missing Plant.id API Key. Using mock fallback.");
        // Fallback to mock if no key (so app doesn't crash for user right now)
        await new Promise(resolve => setTimeout(resolve, 1500));
        return {
            common_name: "Mock Plant (No API Key)",
            scientific_name: ["Mockus plantus"],
            water_frequency_days: 7,
            sunlight: ["part shade"],
            default_image: URL.createObjectURL(file),
            cycle: "Perennial",
            watering: "Average"
        };
    }

    try {
        // 2. Prepare Image
        const base64Image = await fileToBase64(file);

        // 3. Call Plant.id API
        const response = await fetch(PLANT_ID_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Api-Key': PLANT_ID_KEY
            },
            body: JSON.stringify({
                images: [base64Image],
                similar_images: true
            })
        });

        if (!response.ok) {
            throw new Error(`Plant.id API Error: ${response.statusText}`);
        }

        const data = await response.json();

        // 4. Parse Result
        if (!data.result || !data.result.classification || !data.result.classification.suggestions || data.result.classification.suggestions.length === 0) {
            throw new Error("No plants identified.");
        }

        const bestMatch = data.result.classification.suggestions[0];
        const plantName = bestMatch.name;

        console.log(`Identified as: ${plantName} (${bestMatch.probability})`);

        // 5. Fetch Details from Perenual (our care database)
        // We use the scientific name for better accuracy
        const searchResults = await searchPlants(plantName);

        if (searchResults.length > 0) {
            return searchResults[0];
        }

        // 6. Fallback if Perenual has no data but Plant.id did
        return {
            common_name: bestMatch.name,
            scientific_name: [bestMatch.name],
            water_frequency_days: 7, // Default
            sunlight: ["part shade"], // Default
            default_image: base64Image, // Use the uploaded image
            cycle: "Unknown",
            watering: "Average"
        };

    } catch (error) {
        console.error("Plant Identification Failed", error);
        throw error;
    }
}
