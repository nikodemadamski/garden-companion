export interface PlantCategory {
    id: string;
    label: string;
    icon: string;
    defaultWaterFrequency: number;
    defaultLocation: string;
    defaultImage: string;
}

export const PLANT_CATEGORIES: PlantCategory[] = [
    {
        id: 'cactus',
        label: 'Cactus / Succulent',
        icon: '🌵',
        defaultWaterFrequency: 14,
        defaultLocation: 'Sunny Window',
        defaultImage: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&w=400&q=80'
    },
    {
        id: 'tropical',
        label: 'Tropical / Leafy',
        icon: '🌿',
        defaultWaterFrequency: 7,
        defaultLocation: 'Indirect Light',
        defaultImage: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=400&q=80'
    },
    {
        id: 'fern',
        label: 'Fern',
        icon: '🍃',
        defaultWaterFrequency: 4,
        defaultLocation: 'Shade / Bathroom',
        defaultImage: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=400&q=80'
    },
    {
        id: 'flower',
        label: 'Flowering',
        icon: '🌸',
        defaultWaterFrequency: 5,
        defaultLocation: 'Bright Spot',
        defaultImage: 'https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?auto=format&fit=crop&w=400&q=80'
    },
    {
        id: 'herb',
        label: 'Herb / Edible',
        icon: '🌱',
        defaultWaterFrequency: 3,
        defaultLocation: 'Kitchen Window',
        defaultImage: 'https://images.unsplash.com/photo-1590610994353-840995037d45?auto=format&fit=crop&w=400&q=80'
    }
];
