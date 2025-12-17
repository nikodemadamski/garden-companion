import { PlantTemplate } from '@/data/popularPlants';

// Mock database for simulation
const MOCK_RESULTS: PlantTemplate[] = [
    {
        common_name: "Monstera Deliciosa",
        scientific_name: ["Monstera deliciosa"],
        water_frequency_days: 7,
        sunlight: ["indirect sun"],
        default_image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=400&q=80",
        cycle: "Perennial",
        watering: "Average"
    },
    {
        common_name: "Snake Plant",
        scientific_name: ["Sansevieria trifasciata"],
        water_frequency_days: 14,
        sunlight: ["shade", "part shade"],
        default_image: "https://images.unsplash.com/photo-1590610994353-840995037d45?auto=format&fit=crop&w=400&q=80",
        cycle: "Perennial",
        watering: "Minimum"
    },
    {
        common_name: "Fiddle Leaf Fig",
        scientific_name: ["Ficus lyrata"],
        water_frequency_days: 7,
        sunlight: ["full sun", "part shade"],
        default_image: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&w=400&q=80",
        cycle: "Perennial",
        watering: "Average"
    }
];

export async function identifyPlant(file: File): Promise<PlantTemplate> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2500));

    // In a real app, we would upload 'file' to an API like Plant.id
    // For now, we return a random result from our mock DB
    const randomIndex = Math.floor(Math.random() * MOCK_RESULTS.length);
    return MOCK_RESULTS[randomIndex];
}
