export interface PlantTemplate {
    common_name: string;
    scientific_name: string[];
    cycle: string;
    watering: string; // 'Frequent', 'Average', 'Minimum'
    sunlight: string[];
    default_image?: string;
    water_frequency_days: number; // Mapped from 'watering'
    id?: string;
}

export const POPULAR_PLANTS: PlantTemplate[] = [
    {
        common_name: "Monstera Deliciosa",
        scientific_name: ["Monstera deliciosa"],
        cycle: "Perennial",
        watering: "Average",
        sunlight: ["Part shade"],
        water_frequency_days: 7,
        default_image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=600&q=80"
    },
    {
        common_name: "Snake Plant",
        scientific_name: ["Sansevieria trifasciata"],
        cycle: "Perennial",
        watering: "Minimum",
        sunlight: ["Part shade", "Full shade"],
        water_frequency_days: 14,
        default_image: "https://images.unsplash.com/photo-1599598425947-d351053c4431?auto=format&fit=crop&w=600&q=80"
    },
    {
        common_name: "Fiddle Leaf Fig",
        scientific_name: ["Ficus lyrata"],
        cycle: "Perennial",
        watering: "Average",
        sunlight: ["Full sun", "Part shade"],
        water_frequency_days: 7,
        default_image: "https://images.unsplash.com/photo-1613143569773-456075677d68?auto=format&fit=crop&w=600&q=80"
    },
    {
        common_name: "Peace Lily",
        scientific_name: ["Spathiphyllum wallisii"],
        cycle: "Perennial",
        watering: "Frequent",
        sunlight: ["Part shade"],
        water_frequency_days: 4,
        default_image: "https://images.unsplash.com/photo-1593691509543-c55ce32e015c?auto=format&fit=crop&w=600&q=80"
    },
    {
        common_name: "Spider Plant",
        scientific_name: ["Chlorophytum comosum"],
        cycle: "Perennial",
        watering: "Average",
        sunlight: ["Part shade"],
        water_frequency_days: 7,
        default_image: "https://images.unsplash.com/photo-1572688484279-a9e8f75eb052?auto=format&fit=crop&w=600&q=80"
    },
    {
        common_name: "Aloe Vera",
        scientific_name: ["Aloe vera"],
        cycle: "Perennial",
        watering: "Minimum",
        sunlight: ["Full sun"],
        water_frequency_days: 14,
        default_image: "https://images.unsplash.com/photo-1567331140982-17c320d38142?auto=format&fit=crop&w=600&q=80"
    },
    {
        common_name: "Pothos",
        scientific_name: ["Epipremnum aureum"],
        cycle: "Perennial",
        watering: "Average",
        sunlight: ["Part shade", "Full shade"],
        water_frequency_days: 7,
        default_image: "https://images.unsplash.com/photo-1598880940371-c756e026fe13?auto=format&fit=crop&w=600&q=80"
    },
    {
        common_name: "Rubber Plant",
        scientific_name: ["Ficus elastica"],
        cycle: "Perennial",
        watering: "Average",
        sunlight: ["Part shade"],
        water_frequency_days: 7,
        default_image: "https://images.unsplash.com/photo-1611211232932-da3113c5b960?auto=format&fit=crop&w=600&q=80"
    },
    {
        common_name: "ZZ Plant",
        scientific_name: ["Zamioculcas zamiifolia"],
        cycle: "Perennial",
        watering: "Minimum",
        sunlight: ["Part shade", "Full shade"],
        water_frequency_days: 14,
        default_image: "https://images.unsplash.com/photo-1632207691143-643e2a9a9361?auto=format&fit=crop&w=600&q=80"
    },
    {
        common_name: "Basil",
        scientific_name: ["Ocimum basilicum"],
        cycle: "Annual",
        watering: "Frequent",
        sunlight: ["Full sun"],
        water_frequency_days: 3,
        default_image: "https://images.unsplash.com/photo-1618375569909-3c8616cf7733?auto=format&fit=crop&w=600&q=80"
    },
    {
        common_name: "Lavender",
        scientific_name: ["Lavandula"],
        cycle: "Perennial",
        watering: "Minimum",
        sunlight: ["Full sun"],
        water_frequency_days: 10,
        default_image: "https://images.unsplash.com/photo-1565011523534-747a8601f10a?auto=format&fit=crop&w=600&q=80"
    },
    {
        common_name: "Rose",
        scientific_name: ["Rosa"],
        cycle: "Perennial",
        watering: "Average",
        sunlight: ["Full sun"],
        water_frequency_days: 5,
        default_image: "https://images.unsplash.com/photo-1543341574-17e25f856a8e?auto=format&fit=crop&w=600&q=80"
    }
];
