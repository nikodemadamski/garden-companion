import { ProductivePlantData, ProductiveService, PRODUCTIVE_DATABASE } from './productiveService';
import { fetchPlantDetails, searchPlants } from './plantService';
import { AIService } from './aiService';

export class IngestionService {
    /**
     * Ingests a plant into the productive database by fetching external data
     * and enriching it with AI.
     */
    static async ingestPlant(speciesName: string): Promise<ProductivePlantData | undefined> {
        // 1. Check if already exists
        const existing = ProductiveService.getPlantData(speciesName);
        if (existing) return existing;

        console.log(`Ingesting new plant species: ${speciesName}`);

        try {
            // 2. Search for the plant to get an ID
            const searchResults = await searchPlants(speciesName);
            if (searchResults.length === 0) {
                // If no external data, try pure AI generation
                return await this.enrichWithAI(speciesName, null);
            }

            const bestMatch = searchResults[0];

            // 3. Fetch full details
            const details = await fetchPlantDetails(bestMatch.id);

            // 4. Enrich with AI
            return await this.enrichWithAI(speciesName, details);
        } catch (error) {
            console.error(`Failed to ingest ${speciesName}:`, error);
            return undefined;
        }
    }

    private static async enrichWithAI(speciesName: string, externalData: any): Promise<ProductivePlantData | undefined> {
        const prompt = `
            I need to create a structured data object for a gardening app.
            Plant: ${speciesName}
            External Data: ${JSON.stringify(externalData)}

            Please provide a JSON object matching this interface:
            interface ProductivePlantData {
                species: string;
                category: 'fruit' | 'vegetable' | 'herb';
                isPerennial: boolean;
                difficulty: 'Easy' | 'Medium' | 'Hard';
                companions: string[]; // Species names that help this plant
                foes: string[]; // Species names that hinder this plant
                harvestDays: number;
                successionDays?: number; // How often to sow again (in days)
                commonPests?: { name: string, symptoms: string, treatment: string }[];
                funFact: string;
                whyGrow: string;
                careTips: string[];
            }

            Return ONLY the raw JSON object.
        `;

        try {
            // We'll use the AIService to call the LLM
            // Note: We need to expose a raw LLM call in AIService or use a specific method
            const response = await AIService.getRawLLMResponse(prompt);
            if (!response) return undefined;

            // Clean the response (sometimes LLMs add markdown blocks)
            const jsonStr = response.replace(/```json/g, '').replace(/```/g, '').trim();
            const data = JSON.parse(jsonStr) as ProductivePlantData;

            // Cache it in the local database (in-memory for now)
            PRODUCTIVE_DATABASE[speciesName] = data;

            return data;
        } catch (error) {
            console.error("AI Enrichment failed:", error);
            return undefined;
        }
    }
}
