const fs = require('fs');
const path = require('path');

const API_KEY = 'sk-zHbO6942da5b77a2214001';
const API_BASE_URL = 'https://perenual.com/api';

const POPULAR_PLANTS = [
    // --- Indoor / Tropical ---
    {
        common_name: "Monstera Deliciosa",
        scientific_name: ["Monstera deliciosa"],
        default_image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=600&q=80"
    },
    {
        common_name: "Snake Plant",
        scientific_name: ["Sansevieria trifasciata"],
        default_image: "https://images.unsplash.com/photo-1599598425947-d351053c4431?auto=format&fit=crop&w=600&q=80"
    },
    {
        common_name: "Fiddle Leaf Fig",
        scientific_name: ["Ficus lyrata"],
        default_image: "https://images.unsplash.com/photo-1613143569773-456075677d68?auto=format&fit=crop&w=600&q=80"
    },
    {
        common_name: "Peace Lily",
        scientific_name: ["Spathiphyllum wallisii"],
        default_image: "https://images.unsplash.com/photo-1593691509543-c55ce32e015c?auto=format&fit=crop&w=600&q=80"
    },
    {
        common_name: "Spider Plant",
        scientific_name: ["Chlorophytum comosum"],
        default_image: "https://images.unsplash.com/photo-1572688484279-a9e8f75eb052?auto=format&fit=crop&w=600&q=80"
    },
    {
        common_name: "Aloe Vera",
        scientific_name: ["Aloe vera"],
        default_image: "https://images.unsplash.com/photo-1567331140982-17c320d38142?auto=format&fit=crop&w=600&q=80"
    },
    {
        common_name: "Pothos",
        scientific_name: ["Epipremnum aureum"],
        default_image: "https://images.unsplash.com/photo-1598880940371-c756e026fe13?auto=format&fit=crop&w=600&q=80"
    },
    {
        common_name: "Rubber Plant",
        scientific_name: ["Ficus elastica"],
        default_image: "https://images.unsplash.com/photo-1611211232932-da3113c5b960?auto=format&fit=crop&w=600&q=80"
    },
    {
        common_name: "ZZ Plant",
        scientific_name: ["Zamioculcas zamiifolia"],
        default_image: "https://images.unsplash.com/photo-1632207691143-643e2a9a9361?auto=format&fit=crop&w=600&q=80"
    },
    {
        common_name: "Chinese Money Plant",
        scientific_name: ["Pilea peperomioides"],
        default_image: "https://images.unsplash.com/photo-1612363326164-28266211284d?auto=format&fit=crop&w=600&q=80"
    },
    {
        common_name: "Jade Plant",
        scientific_name: ["Crassula ovata"],
        default_image: "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=600&q=80"
    },
    {
        common_name: "Boston Fern",
        scientific_name: ["Nephrolepis exaltata"],
        default_image: "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=600&q=80"
    },

    // --- Fruits ---
    {
        common_name: "Strawberry",
        scientific_name: ["Fragaria x ananassa"],
        default_image: "https://images.unsplash.com/photo-1589123053646-4e7197004540?auto=format&fit=crop&w=600&q=80"
    },
    {
        common_name: "Raspberry",
        scientific_name: ["Rubus idaeus"],
        default_image: "https://images.unsplash.com/photo-1577069861033-55d04cec4ef5?auto=format&fit=crop&w=600&q=80"
    },
    {
        common_name: "Blueberry",
        scientific_name: ["Vaccinium corymbosum"],
        default_image: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=600&q=80"
    },
    {
        common_name: "Lemon Tree",
        scientific_name: ["Citrus limon"],
        default_image: "https://images.unsplash.com/photo-1595855709915-bd98996a26b0?auto=format&fit=crop&w=600&q=80"
    },
    {
        common_name: "Fig Tree",
        scientific_name: ["Ficus carica"],
        default_image: "https://images.unsplash.com/photo-1621961048738-b8562f036b5c?auto=format&fit=crop&w=600&q=80"
    },
    {
        common_name: "Apple Tree",
        scientific_name: ["Malus domestica"],
        default_image: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=600&q=80"
    },

    // --- Vegetables ---
    {
        common_name: "Tomato",
        scientific_name: ["Solanum lycopersicum"],
        default_image: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=600&q=80"
    },
    {
        common_name: "Cucumber",
        scientific_name: ["Cucumis sativus"],
        default_image: "https://images.unsplash.com/photo-1604977042946-1eecc60f202f?auto=format&fit=crop&w=600&q=80"
    },
    {
        common_name: "Bell Pepper",
        scientific_name: ["Capsicum annuum"],
        default_image: "https://images.unsplash.com/photo-1563565375-f3fdf5ec2e97?auto=format&fit=crop&w=600&q=80"
    },
    {
        common_name: "Carrot",
        scientific_name: ["Daucus carota"],
        default_image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80"
    },
    {
        common_name: "Lettuce",
        scientific_name: ["Lactuca sativa"],
        default_image: "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&w=600&q=80"
    },
    {
        common_name: "Chili Pepper",
        scientific_name: ["Capsicum frutescens"],
        default_image: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=600&q=80"
    },
    {
        common_name: "Spinach",
        scientific_name: ["Spinacia oleracea"],
        default_image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80"
    },
    {
        common_name: "Potato",
        scientific_name: ["Solanum tuberosum"],
        default_image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80"
    },

    // --- Herbs ---
    {
        common_name: "Basil",
        scientific_name: ["Ocimum basilicum"],
        default_image: "https://images.unsplash.com/photo-1618375569909-3c8616cf7733?auto=format&fit=crop&w=600&q=80"
    },
    {
        common_name: "Lavender",
        scientific_name: ["Lavandula"],
        default_image: "https://images.unsplash.com/photo-1565011523534-747a8601f10a?auto=format&fit=crop&w=600&q=80"
    },
    {
        common_name: "Rose",
        scientific_name: ["Rosa"],
        default_image: "https://images.unsplash.com/photo-1543341574-17e25f856a8e?auto=format&fit=crop&w=600&q=80"
    },
    {
        common_name: "Chamomile",
        scientific_name: ["Matricaria chamomilla"],
        default_image: "https://images.unsplash.com/photo-1605218427368-35b820257915?auto=format&fit=crop&w=600&q=80"
    },
    {
        common_name: "Mint",
        scientific_name: ["Mentha"],
        default_image: "https://images.unsplash.com/photo-1626469726969-19b7fa95d721?auto=format&fit=crop&w=600&q=80"
    },
    {
        common_name: "Rosemary",
        scientific_name: ["Salvia rosmarinus"],
        default_image: "https://images.unsplash.com/photo-1594313012869-1c890336f420?auto=format&fit=crop&w=600&q=80"
    },
    {
        common_name: "Thyme",
        scientific_name: ["Thymus vulgaris"],
        default_image: "https://images.unsplash.com/photo-1627462968401-6272b96e960f?auto=format&fit=crop&w=600&q=80"
    },
    {
        common_name: "Parsley",
        scientific_name: ["Petroselinum crispum"],
        default_image: "https://images.unsplash.com/photo-1622205313162-be1d5712a43f?auto=format&fit=crop&w=600&q=80"
    },
    {
        common_name: "Cilantro",
        scientific_name: ["Coriandrum sativum"],
        default_image: "https://images.unsplash.com/photo-1588879468573-4f5a36c87a4d?auto=format&fit=crop&w=600&q=80"
    }
];

async function fetchPlants() {
    const database = [];

    for (const plant of POPULAR_PLANTS) {
        console.log(`Fetching ${plant.common_name}...`);
        try {
            // 1. Search to get ID
            const searchRes = await fetch(`${API_BASE_URL}/species-list?key=${API_KEY}&q=${encodeURIComponent(plant.common_name)}`);
            const searchData = await searchRes.json();
            const match = searchData.data?.[0];

            if (match) {
                console.log(`Found ID: ${match.id}`);

                // 2. Get Details
                const detailRes = await fetch(`${API_BASE_URL}/species/details/${match.id}?key=${API_KEY}`);
                const detailData = await detailRes.json();

                // 3. Merge Data
                const merged = {
                    id: match.id,
                    common_name: detailData.common_name || plant.common_name,
                    scientific_name: detailData.scientific_name || plant.scientific_name,
                    // Prefer Unsplash image if Perenual's is missing or "Upgrade"
                    default_image: (detailData.default_image?.regular_url && !detailData.default_image.regular_url.includes("upgrade"))
                        ? detailData.default_image.regular_url
                        : plant.default_image,
                    cycle: detailData.cycle || "Perennial",
                    watering: detailData.watering || "Average",
                    sunlight: detailData.sunlight || ["Part shade"],
                    care_level: detailData.care_level || "Medium",
                    description: detailData.description || `A beautiful ${plant.common_name}.`,
                    hardiness: detailData.hardiness || { min: "10a", max: "12b" }
                };

                database.push(merged);
            } else {
                console.log(`No match for ${plant.common_name}, using template.`);
                database.push({
                    id: Math.floor(Math.random() * 10000) + 10000, // Fake ID
                    ...plant,
                    watering: "Average",
                    sunlight: ["Part shade"],
                    care_level: "Medium",
                    description: `A beautiful ${plant.common_name}.`,
                    hardiness: { min: "10a", max: "12b" }
                });
            }
        } catch (error) {
            console.error(`Error fetching ${plant.common_name}:`, error);
            // Fallback to template
            database.push({
                id: Math.floor(Math.random() * 10000) + 10000,
                ...plant,
                watering: "Average",
                sunlight: ["Part shade"],
                care_level: "Medium",
                description: `A beautiful ${plant.common_name}.`,
                hardiness: { min: "10a", max: "12b" }
            });
        }

        // Wait 1s to be nice to API
        await new Promise(r => setTimeout(r, 1000));
    }

    // Save to file
    const outputPath = path.join(__dirname, '../src/data/plantDatabase.json');
    fs.writeFileSync(outputPath, JSON.stringify(database, null, 2));
    console.log(`Database saved to ${outputPath}`);
}

fetchPlants();
