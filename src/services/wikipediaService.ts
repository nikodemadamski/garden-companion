import { PlantTemplate } from '@/data/popularPlants';

// Wikipedia REST API endpoint (No key required)
const BASE_URL = 'https://en.wikipedia.org/api/rest_v1/page/summary';

export interface WikiSummary {
    title: string;
    extract: string; // The summary text
    thumbnail?: {
        source: string;
        width: number;
        height: number;
    };
    originalimage?: {
        source: string;
        width: number;
        height: number;
    };
    description?: string;
}

export async function searchWikipedia(query: string): Promise<PlantTemplate[]> {
    if (!query) return [];

    try {
        // 1. Search for the page title first using MediaWiki Action API for better search results
        const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=5&namespace=0&format=json&origin=*`);
        const searchData = await searchRes.json();

        // searchData format: [query, [titles], [descriptions], [urls]]
        const titles: string[] = searchData[1];

        if (titles.length === 0) return [];

        // 2. Fetch summaries for the top results
        const results: PlantTemplate[] = [];

        // We'll just fetch the first few to avoid too many requests, but in parallel
        const promises = titles.slice(0, 3).map(async (title) => {
            try {
                const res = await fetch(`${BASE_URL}/${encodeURIComponent(title)}`);
                if (!res.ok) return null;
                const data: WikiSummary = await res.json();
                return mapWikiToTemplate(data);
            } catch (e) {
                return null;
            }
        });

        const wikiPlants = (await Promise.all(promises)).filter((p): p is PlantTemplate => p !== null);
        return wikiPlants;

    } catch (error) {
        console.error("Wikipedia Search Error:", error);
        return [];
    }
}

function mapWikiToTemplate(wiki: WikiSummary): PlantTemplate {
    // Heuristic to guess watering/sunlight from text would be complex.
    // We will provide the rich description and image, but use defaults for care.
    // In a real app, you might use a local dictionary to map common species to care guides.

    return {
        common_name: wiki.title,
        scientific_name: [wiki.description || wiki.title], // Wiki often puts scientific name in description
        cycle: "Unknown",
        watering: "Average", // Default
        sunlight: ["Part shade"], // Default
        water_frequency_days: 7, // Default
        default_image: wiki.originalimage?.source || wiki.thumbnail?.source,
        // We can store the summary as a note or description if we extended the type
    };
}
