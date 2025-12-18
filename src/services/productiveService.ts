export interface ProductivePlantData {
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
        commonPests: [
            { name: 'Aphids', symptoms: 'Curled leaves, sticky residue', treatment: 'Spray with soapy water or release ladybugs' },
            { name: 'Blight', symptoms: 'Brown spots on leaves and stems', treatment: 'Remove infected leaves, improve air circulation' }
        ],
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
        commonPests: [
            { name: 'Slugs', symptoms: 'Large holes in leaves', treatment: 'Copper tape or beer traps' },
            { name: 'Downy Mildew', symptoms: 'Yellowing leaves with grey fuzz', treatment: 'Reduce humidity, water only at base' }
        ],
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
        commonPests: [
            { name: 'Birds', symptoms: 'Missing or half-eaten fruit', treatment: 'Use bird netting' },
            { name: 'Spider Mites', symptoms: 'Fine webbing, yellow stippling', treatment: 'Increase humidity, spray with water' }
        ],
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
        commonPests: [
            { name: 'Carrot Rust Fly', symptoms: 'Rusty brown tunnels in roots', treatment: 'Use fine mesh covers, plant with onions' }
        ],
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
        commonPests: [
            { name: 'Rosemary Beetle', symptoms: 'Metallic beetles, nibbled leaves', treatment: 'Hand-pick and remove' }
        ],
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
        commonPests: [
            { name: 'Potato Blight', symptoms: 'Dark blotches on leaves, rotting tubers', treatment: 'Plant resistant varieties, remove infected foliage' },
            { name: 'Colorado Beetle', symptoms: 'Striped beetles, skeletonized leaves', treatment: 'Hand-pick, use neem oil' }
        ],
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
        commonPests: [
            { name: 'Mint Rust', symptoms: 'Orange/brown spots on undersides', treatment: 'Destroy infected plants, avoid overhead watering' }
        ],
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
        commonPests: [
            { name: 'Slugs & Snails', symptoms: 'Irregular holes, slime trails', treatment: 'Beer traps, eggshell barriers' },
            { name: 'Aphids', symptoms: 'Stunted growth, sticky leaves', treatment: 'Blast with water, encourage hoverflies' }
        ],
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
        commonPests: [
            { name: 'Flea Beetles', symptoms: 'Tiny "shotholes" in leaves', treatment: 'Use row covers, keep soil moist' }
        ],
        funFact: 'Radishes can be ready to eat in just 3 weeks!',
        whyGrow: 'Fastest crop in the garden; great for beginners.',
        careTips: ['Sow small amounts frequently', 'Harvest as soon as they reach size']
    },
    'Cucumber': {
        species: 'Cucumis sativus',
        category: 'vegetable',
        isPerennial: false,
        difficulty: 'Medium',
        companions: ['Corn', 'Bean', 'Pea', 'Radish', 'Marigold'],
        foes: ['Potato', 'Sage', 'Melon'],
        harvestDays: 60,
        successionDays: 30,
        commonPests: [
            { name: 'Cucumber Beetle', symptoms: 'Yellow striped beetles, wilted leaves', treatment: 'Hand-pick, use neem oil' },
            { name: 'Powdery Mildew', symptoms: 'White powdery spots on leaves', treatment: 'Improve airflow, spray with milk/water mix' }
        ],
        funFact: 'Cucumbers are 95% water!',
        whyGrow: 'Incredibly refreshing and high-yielding in summer.',
        careTips: ['Needs a trellis to climb', 'Keep soil consistently moist', 'Harvest frequently to encourage more growth']
    },
    'Pepper': {
        species: 'Capsicum annuum',
        category: 'vegetable',
        isPerennial: false,
        difficulty: 'Medium',
        companions: ['Basil', 'Onion', 'Tomato', 'Okra'],
        foes: ['Fennel', 'Kohlrabi'],
        harvestDays: 75,
        commonPests: [
            { name: 'Aphids', symptoms: 'Curled leaves, sticky residue', treatment: 'Blast with water or use insecticidal soap' }
        ],
        funFact: 'Bell peppers are the only member of the capsicum family that don\'t produce capsaicin (the heat).',
        whyGrow: 'Colorful, versatile, and much sweeter when vine-ripened.',
        careTips: ['Loves heat and sun', 'Don\'t overwater', 'Stake if fruit gets heavy']
    },
    'Garlic': {
        species: 'Allium sativum',
        category: 'vegetable',
        isPerennial: false,
        difficulty: 'Easy',
        companions: ['Tomato', 'Rose', 'Fruit Trees', 'Strawberry'],
        foes: ['Bean', 'Pea', 'Sage'],
        harvestDays: 240,
        commonPests: [
            { name: 'Onion Fly', symptoms: 'Yellowing leaves, maggots in bulb', treatment: 'Use mesh covers, rotate crops' }
        ],
        funFact: 'Garlic is a natural pest repellent for many other plants!',
        whyGrow: 'Plant in autumn, harvest in summer; zero maintenance in winter.',
        careTips: ['Plant individual cloves in autumn', 'Harvest when bottom leaves turn brown']
    },
    'Onion': {
        species: 'Allium cepa',
        category: 'vegetable',
        isPerennial: false,
        difficulty: 'Easy',
        companions: ['Carrot', 'Lettuce', 'Beet', 'Strawberry'],
        foes: ['Bean', 'Pea', 'Sage'],
        harvestDays: 100,
        successionDays: 21,
        commonPests: [
            { name: 'Thrips', symptoms: 'Silvery streaks on leaves', treatment: 'Blast with water, use blue sticky traps' }
        ],
        funFact: 'Onions have been part of the human diet for over 7,000 years.',
        whyGrow: 'Essential kitchen staple; homegrown ones store better.',
        careTips: ['Needs well-drained soil', 'Keep weed-free', 'Stop watering when tops fall over']
    },
    'Spinach': {
        species: 'Spinacia oleracea',
        category: 'vegetable',
        isPerennial: false,
        difficulty: 'Easy',
        companions: ['Strawberry', 'Pea', 'Bean', 'Cabbage'],
        foes: ['None'],
        harvestDays: 45,
        successionDays: 14,
        commonPests: [
            { name: 'Leaf Miners', symptoms: 'Winding tunnels inside leaves', treatment: 'Remove infected leaves, use row covers' }
        ],
        funFact: 'Spinach is high in iron and vitamins A and C.',
        whyGrow: 'Fast-growing cool-season crop; perfect for early spring or autumn.',
        careTips: ['Bolts (goes to seed) in hot weather', 'Harvest outer leaves first']
    },
    'Kale': {
        species: 'Brassica oleracea var. sabellica',
        category: 'vegetable',
        isPerennial: false,
        difficulty: 'Easy',
        companions: ['Onion', 'Potato', 'Beet', 'Herb'],
        foes: ['Strawberry', 'Tomato', 'Pole Bean'],
        harvestDays: 60,
        commonPests: [
            { name: 'Cabbage White Butterfly', symptoms: 'Green caterpillars eating leaves', treatment: 'Use netting, hand-pick' }
        ],
        funFact: 'Kale becomes sweeter after a frost!',
        whyGrow: 'Superfood that grows through the winter in many climates.',
        careTips: ['Very hardy', 'Harvest leaves from the bottom up']
    },
    'Blueberry': {
        species: 'Vaccinium corymbosum',
        category: 'fruit',
        isPerennial: true,
        difficulty: 'Hard',
        companions: ['Azalea', 'Basil', 'Thyme'],
        foes: ['None'],
        harvestDays: 120,
        commonPests: [
            { name: 'Birds', symptoms: 'Missing berries', treatment: 'Use bird netting' }
        ],
        funFact: 'Blueberries need very acidic soil (pH 4.5-5.5) to survive.',
        whyGrow: 'Beautiful shrub with delicious, antioxidant-rich fruit.',
        careTips: ['Must use ericaceous (acidic) compost', 'Water with rainwater, not tap water']
    },
    'Raspberry': {
        species: 'Rubus idaeus',
        category: 'fruit',
        isPerennial: true,
        difficulty: 'Medium',
        companions: ['Garlic', 'Tansy', 'Nasturtium'],
        foes: ['Potato', 'Tomato', 'Blackberry'],
        harvestDays: 90,
        commonPests: [
            { name: 'Raspberry Beetle', symptoms: 'Small white larvae in fruit', treatment: 'Hand-pick, encourage birds' }
        ],
        funFact: 'A raspberry is not a single berry, but a cluster of tiny fruits called drupelets.',
        whyGrow: 'High-value crop that produces for years.',
        careTips: ['Needs support/wires', 'Prune old canes after fruiting']
    },
    'Chives': {
        species: 'Allium schoenoprasum',
        category: 'herb',
        isPerennial: true,
        difficulty: 'Easy',
        companions: ['Tomato', 'Carrot', 'Apple', 'Rose'],
        foes: ['Bean', 'Pea'],
        harvestDays: 60,
        funFact: 'Chive flowers are edible and taste like mild onion!',
        whyGrow: 'Perennial herb that comes back every year; great for bees.',
        careTips: ['Cut back to the ground to refresh growth', 'Grows well in pots']
    },
    'Parsley': {
        species: 'Petroselinum crispum',
        category: 'herb',
        isPerennial: false,
        difficulty: 'Medium',
        companions: ['Tomato', 'Asparagus', 'Rose'],
        foes: ['Lettuce', 'Mint'],
        harvestDays: 70,
        funFact: 'Parsley seeds take a long time to germinate—legend says they go to the devil and back 7 times!',
        whyGrow: 'Versatile herb; high in vitamin K.',
        careTips: ['Soak seeds before planting', 'Loves partial shade in summer']
    },
    'Thyme': {
        species: 'Thymus vulgaris',
        category: 'herb',
        isPerennial: true,
        difficulty: 'Easy',
        companions: ['Cabbage', 'Strawberry', 'Eggplant'],
        foes: ['None'],
        harvestDays: 90,
        funFact: 'Ancient Greeks used thyme in their baths and burnt it as incense in their temples.',
        whyGrow: 'Drought-tolerant, evergreen, and essential for cooking.',
        careTips: ['Needs excellent drainage', 'Don\'t overwater']
    },
    'Lavender': {
        species: 'Lavandula',
        category: 'herb',
        isPerennial: true,
        difficulty: 'Medium',
        companions: ['Rose', 'Fruit Trees', 'Cabbage'],
        foes: ['None'],
        harvestDays: 120,
        funFact: 'Lavender is part of the mint family.',
        whyGrow: 'Amazing scent, beautiful flowers, and attracts pollinators.',
        careTips: ['Needs full sun and sandy soil', 'Prune after flowering to keep it compact']
    },
    'Beetroot': {
        species: 'Beta vulgaris',
        category: 'vegetable',
        isPerennial: false,
        difficulty: 'Easy',
        companions: ['Onion', 'Lettuce', 'Cabbage', 'Garlic'],
        foes: ['Pole Bean'],
        harvestDays: 60,
        successionDays: 21,
        funFact: 'You can eat the leaves (greens) as well as the root!',
        whyGrow: 'Sweet, earthy roots and nutritious greens.',
        careTips: ['Thin seedlings so roots have space', 'Keep soil moist']
    },
    'Pea': {
        species: 'Pisum sativum',
        category: 'vegetable',
        isPerennial: false,
        difficulty: 'Easy',
        companions: ['Carrot', 'Cucumber', 'Radish', 'Corn', 'Bean'],
        foes: ['Onion', 'Garlic', 'Chives'],
        harvestDays: 65,
        successionDays: 14,
        funFact: 'Peas are nitrogen-fixers—they actually improve the soil they grow in!',
        whyGrow: 'Fresh peas are incredibly sweet; kids love harvesting them.',
        careTips: ['Needs a trellis or netting', 'Loves cool weather']
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
