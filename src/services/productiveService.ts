export interface ProductivePlantData {
    species: string;
    category: 'fruit' | 'vegetable' | 'herb';
    isPerennial: boolean;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    companions: string[]; // Species names that help this plant
    foes: string[]; // Species names that hinder this plant
    harvestDays: number;
    successionDays?: number; // How often to sow again (in days)
    funFact: string;
    whyGrow: string;
    careTips: string[];
}

export const PRODUCTIVE_DATABASE: Record<string, ProductivePlantData> = {
    'Tomato': {
        species: 'Solanum lycopersicum',
        category: 'fruit',
        isPerennial: false,
        difficulty: 'Medium',
        companions: ['Basil', 'Marigold', 'Garlic', 'Chives'],
        foes: ['Potato', 'Fennel', 'Cabbage'],
        harvestDays: 80,
        successionDays: 60,
        funFact: 'Tomatoes are technically berries!',
        whyGrow: 'Homegrown tomatoes have 10x the flavor of store-bought ones.',
        careTips: ['Requires 6-8 hours of sun', 'Water at the base to avoid blight', 'Needs support/staking']
    },
    'Basil': {
        species: 'Ocimum basilicum',
        category: 'herb',
        isPerennial: false,
        difficulty: 'Easy',
        companions: ['Tomato', 'Pepper', 'Oregano'],
        foes: ['Rue', 'Sage'],
        harvestDays: 30,
        successionDays: 14,
        funFact: 'Basil is a member of the mint family.',
        whyGrow: 'Essential for pesto and improves tomato flavor when planted nearby.',
        careTips: ['Pinch off flowers to keep it producing leaves', 'Loves warmth and sun']
    },
    'Strawberry': {
        species: 'Fragaria × ananassa',
        category: 'fruit',
        isPerennial: true,
        difficulty: 'Easy',
        companions: ['Borage', 'Onion', 'Spinach'],
        foes: ['Cabbage', 'Broccoli'],
        harvestDays: 90,
        funFact: 'Strawberries are the only fruit with seeds on the outside.',
        whyGrow: 'Perennial yield that gets better every year.',
        careTips: ['Mulch with straw to keep fruit off the dirt', 'Remove runners to boost fruit size']
    },
    'Carrot': {
        species: 'Daucus carota',
        category: 'vegetable',
        isPerennial: false,
        difficulty: 'Medium',
        companions: ['Onion', 'Leek', 'Rosemary', 'Sage'],
        foes: ['Dill', 'Parsnip'],
        harvestDays: 75,
        successionDays: 21,
        funFact: 'Carrots were originally purple or white, not orange!',
        whyGrow: 'Fresh carrots are incredibly crunchy and sweet.',
        careTips: ['Needs loose, stone-free soil', 'Thin seedlings to 3 inches apart']
    },
    'Rosemary': {
        species: 'Salvia rosmarinus',
        category: 'herb',
        isPerennial: true,
        difficulty: 'Easy',
        companions: ['Cabbage', 'Bean', 'Carrot'],
        foes: ['Basil'],
        harvestDays: 365,
        funFact: 'Rosemary can live for over 30 years!',
        whyGrow: 'Extremely hardy, evergreen, and smells amazing.',
        careTips: ['Drought tolerant once established', 'Needs excellent drainage']
    },
    'Potato': {
        species: 'Solanum tuberosum',
        category: 'vegetable',
        isPerennial: false,
        difficulty: 'Easy',
        companions: ['Corn', 'Bean', 'Cabbage', 'Marigold'],
        foes: ['Tomato', 'Sunflower', 'Cucumber'],
        harvestDays: 100,
        funFact: 'The first vegetable grown in space (1995)!',
        whyGrow: 'High yield and very satisfying to "dig for gold".',
        careTips: ['Hill up soil around stems as they grow', 'Keep tubers covered to avoid greening']
    },
    'Mint': {
        species: 'Mentha',
        category: 'herb',
        isPerennial: true,
        difficulty: 'Easy',
        companions: ['Cabbage', 'Tomato'],
        foes: ['Parsley'],
        harvestDays: 60,
        funFact: 'Mint can spread so fast it becomes invasive!',
        whyGrow: 'Great for teas and cocktails; virtually unkillable.',
        careTips: ['Grow in a pot to contain its roots', 'Loves moisture']
    },
    'Lettuce': {
        species: 'Lactuca sativa',
        category: 'vegetable',
        isPerennial: false,
        difficulty: 'Easy',
        companions: ['Carrot', 'Radish', 'Strawberry', 'Cucumber'],
        foes: ['Parsley', 'Celery'],
        harvestDays: 45,
        successionDays: 14,
        funFact: 'Lettuce is the second most popular vegetable in the US (after potatoes).',
        whyGrow: 'Crisp, fresh leaves that regrow after cutting.',
        careTips: ['Loves cooler weather', 'Keep soil consistently moist']
    },
    'Radish': {
        species: 'Raphanus sativus',
        category: 'vegetable',
        isPerennial: false,
        difficulty: 'Easy',
        companions: ['Lettuce', 'Carrot', 'Spinach', 'Pea'],
        foes: ['Hyssop'],
        harvestDays: 25,
        successionDays: 10,
        funFact: 'Radishes can be ready to eat in just 3 weeks!',
        whyGrow: 'Fastest crop in the garden; great for beginners.',
        careTips: ['Sow small amounts frequently', 'Harvest as soon as they reach size']
    }
};

export const ProductiveService = {
    getPlantData: (species: string): ProductivePlantData | undefined => {
        // Try exact match or partial match
        const key = Object.keys(PRODUCTIVE_DATABASE).find(k =>
            species.toLowerCase().includes(k.toLowerCase())
        );
        return key ? PRODUCTIVE_DATABASE[key] : undefined;
    },

    getCompanions: (species: string): string[] => {
        return ProductiveService.getPlantData(species)?.companions || [];
    },

    checkCompatibility: (speciesA: string, speciesB: string): 'friend' | 'foe' | 'neutral' => {
        const dataA = ProductiveService.getPlantData(speciesA);
        if (!dataA) return 'neutral';

        if (dataA.companions.some(c => speciesB.toLowerCase().includes(c.toLowerCase()))) return 'friend';
        if (dataA.foes.some(f => speciesB.toLowerCase().includes(f.toLowerCase()))) return 'foe';

        return 'neutral';
    }
};
