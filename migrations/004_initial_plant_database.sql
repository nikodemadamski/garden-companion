-- Migration 004: Insert initial enhanced plant database for Irish climate
-- Populate plant_database_enhanced with common plants suitable for Irish gardening

INSERT INTO plant_database_enhanced (
  category, native_region, companion_plants, pollinator_friendly, 
  harvest_info, seasonal_care, common_issues, soil_requirements
) VALUES

-- FRUITS
('fruit', 'Europe', ARRAY['chives', 'nasturtiums'], true, 
 '{"season": ["June", "July", "August"], "timeToHarvest": "60-90 days from flowering", "harvestSigns": ["Red color", "Easy removal from plant"], "storageInstructions": "Eat fresh or freeze immediately"}',
 '{"spring": {"watering": "Regular, keep soil moist", "fertilizing": "Balanced fertilizer monthly", "specialCare": ["Remove runners for larger berries"]}, "summer": {"watering": "Daily in hot weather", "protection": "Net against birds"}, "autumn": {"watering": "Reduce watering", "specialCare": ["Remove old leaves"]}, "winter": {"protection": "Mulch crowns", "specialCare": ["Minimal watering"]}}',
 '[{"name": "Grey mould", "symptoms": ["Fuzzy grey growth on fruit"], "causes": ["High humidity", "Poor air circulation"], "treatments": ["Remove affected fruit", "Improve ventilation"], "prevention": ["Avoid overhead watering", "Space plants well"]}]',
 '{"type": "Well-draining, fertile", "ph": {"min": 6.0, "max": 7.0}, "drainage": "good", "nutrients": ["Nitrogen", "Phosphorus", "Potassium"], "amendments": ["Compost", "Well-rotted manure"]}'),

('fruit', 'Europe', ARRAY['garlic', 'chives'], true,
 '{"season": ["July", "August", "September"], "timeToHarvest": "2-3 years from planting", "harvestSigns": ["Deep red color", "Easy picking"], "storageInstructions": "Freeze or make jam"}',
 '{"spring": {"watering": "Regular watering", "fertilizing": "Balanced fertilizer", "pruning": "Remove old canes"}, "summer": {"watering": "Deep watering weekly", "specialCare": ["Support heavy fruiting canes"]}, "autumn": {"pruning": "Cut back fruited canes", "specialCare": ["Mulch around base"]}, "winter": {"protection": "Minimal care needed"}}',
 '[{"name": "Raspberry beetle", "symptoms": ["Grubs in fruit"], "causes": ["Beetle infestation"], "treatments": ["Pick off beetles", "Use pheromone traps"], "prevention": ["Good garden hygiene", "Encourage beneficial insects"]}]',
 '{"type": "Rich, well-draining", "ph": {"min": 6.0, "max": 6.8}, "drainage": "good", "nutrients": ["Organic matter", "Potassium"], "amendments": ["Compost", "Leaf mould"]}'),

-- VEGETABLES
('vegetable', 'South America', ARRAY['basil', 'marigolds', 'carrots'], true,
 '{"season": ["July", "August", "September", "October"], "timeToHarvest": "75-85 days from transplant", "harvestSigns": ["Full color", "Slight give when pressed"], "storageInstructions": "Store at room temperature until ripe, then refrigerate"}',
 '{"spring": {"watering": "Regular but not excessive", "fertilizing": "High potassium fertilizer", "specialCare": ["Harden off before planting out"]}, "summer": {"watering": "Deep watering 2-3 times per week", "specialCare": ["Support with canes", "Remove side shoots"]}, "autumn": {"watering": "Reduce watering", "specialCare": ["Harvest green tomatoes before frost"]}}',
 '[{"name": "Blight", "symptoms": ["Brown patches on leaves", "Black spots on fruit"], "causes": ["Wet conditions", "Poor air circulation"], "treatments": ["Remove affected parts", "Apply copper fungicide"], "prevention": ["Good ventilation", "Avoid overhead watering"]}]',
 '{"type": "Rich, well-draining", "ph": {"min": 6.0, "max": 6.8}, "drainage": "good", "nutrients": ["Nitrogen", "Phosphorus", "Potassium"], "amendments": ["Compost", "Well-rotted manure"]}'),

('vegetable', 'Europe', ARRAY['rosemary', 'sage', 'onions'], false,
 '{"season": ["June", "July", "August", "September"], "timeToHarvest": "70-120 days depending on variety", "harvestSigns": ["Firm tubers", "Dying foliage"], "storageInstructions": "Store in cool, dark, dry place"}',
 '{"spring": {"watering": "Minimal until shoots emerge", "specialCare": ["Chit seed potatoes", "Plant after last frost"]}, "summer": {"watering": "Regular watering", "specialCare": ["Earth up stems", "Watch for blight"]}, "autumn": {"watering": "Stop watering 2 weeks before harvest", "specialCare": ["Harvest before first frost"]}}',
 '[{"name": "Potato blight", "symptoms": ["Brown patches on leaves", "Black rot on tubers"], "causes": ["Wet, humid conditions"], "treatments": ["Remove affected foliage", "Harvest early"], "prevention": ["Choose resistant varieties", "Ensure good air circulation"]}]',
 '{"type": "Well-draining, fertile", "ph": {"min": 5.5, "max": 6.5}, "drainage": "excellent", "nutrients": ["Potassium", "Phosphorus"], "amendments": ["Compost", "Avoid fresh manure"]}'),

('vegetable', 'Europe', ARRAY['lettuce', 'peas', 'chives'], false,
 '{"season": ["June", "July", "August", "September"], "timeToHarvest": "70-80 days from sowing", "harvestSigns": ["Orange color", "Easy pulling"], "storageInstructions": "Remove tops and store in cool, humid conditions"}',
 '{"spring": {"watering": "Keep soil moist", "specialCare": ["Sow successionally every 2-3 weeks"]}, "summer": {"watering": "Regular watering", "specialCare": ["Thin seedlings to prevent crowding"]}, "autumn": {"watering": "Reduce watering", "specialCare": ["Harvest before hard frost"]}}',
 '[{"name": "Carrot fly", "symptoms": ["Tunnels in roots", "Stunted growth"], "causes": ["Carrot fly larvae"], "treatments": ["Use fine mesh covers", "Companion planting"], "prevention": ["Avoid thinning on warm days", "Use resistant varieties"]}]',
 '{"type": "Deep, sandy loam", "ph": {"min": 6.0, "max": 7.0}, "drainage": "excellent", "nutrients": ["Potassium", "Phosphorus"], "amendments": ["Avoid fresh manure", "Add sand for heavy soils"]}'),

-- HERBS
('herb', 'Mediterranean', ARRAY['carrots', 'tomatoes', 'peppers'], true,
 '{"season": ["All year"], "timeToHarvest": "60-90 days from sowing", "harvestSigns": ["Aromatic leaves", "Before flowering for best flavor"], "storageInstructions": "Dry or freeze leaves"}',
 '{"spring": {"watering": "Moderate watering", "specialCare": ["Pinch flowers to encourage leaf growth"]}, "summer": {"watering": "Water regularly but avoid waterlogging", "specialCare": ["Harvest regularly", "Provide afternoon shade in hot weather"]}, "autumn": {"watering": "Reduce watering", "specialCare": ["Bring pots indoors"]}, "winter": {"watering": "Minimal watering", "protection": "Protect from frost"}}',
 '[{"name": "Fusarium wilt", "symptoms": ["Yellowing leaves", "Wilting"], "causes": ["Overwatering", "Poor drainage"], "treatments": ["Improve drainage", "Remove affected plants"], "prevention": ["Well-draining soil", "Avoid overwatering"]}]',
 '{"type": "Well-draining", "ph": {"min": 6.0, "max": 7.5}, "drainage": "excellent", "nutrients": ["Low nitrogen"], "amendments": ["Sand", "Gravel for drainage"]}'),

('herb', 'Mediterranean', ARRAY['cabbage', 'carrots', 'beans'], true,
 '{"season": ["All year"], "timeToHarvest": "75-90 days from sowing", "harvestSigns": ["Woody stems", "Strong aroma"], "storageInstructions": "Dry sprigs or use fresh"}',
 '{"spring": {"watering": "Light watering", "pruning": "Light pruning to shape"}, "summer": {"watering": "Drought tolerant once established", "specialCare": ["Harvest before flowering"]}, "autumn": {"watering": "Reduce watering", "pruning": "Harvest for drying"}, "winter": {"protection": "Hardy but protect in severe frost", "watering": "Minimal watering"}}',
 '[{"name": "Root rot", "symptoms": ["Yellowing leaves", "Soft roots"], "causes": ["Overwatering", "Poor drainage"], "treatments": ["Improve drainage", "Reduce watering"], "prevention": ["Well-draining soil", "Avoid overwatering"]}]',
 '{"type": "Well-draining, sandy", "ph": {"min": 6.0, "max": 8.0}, "drainage": "excellent", "nutrients": ["Low fertility preferred"], "amendments": ["Sand", "Gravel"]}'),

('herb', 'Europe', ARRAY['tomatoes', 'roses', 'carrots'], true,
 '{"season": ["All year"], "timeToHarvest": "70-85 days from sowing", "harvestSigns": ["Fresh green leaves", "Before flowering"], "storageInstructions": "Use fresh, freeze, or dry"}',
 '{"spring": {"watering": "Regular watering", "specialCare": ["Sow successionally every few weeks"]}, "summer": {"watering": "Keep soil moist", "specialCare": ["Provide partial shade in hot weather", "Harvest regularly"]}, "autumn": {"watering": "Continue regular watering", "specialCare": ["Bring pots indoors"]}, "winter": {"watering": "Reduce watering", "specialCare": ["Grow on windowsill"]}}',
 '[{"name": "Aphids", "symptoms": ["Curled leaves", "Sticky honeydew"], "causes": ["Aphid infestation"], "treatments": ["Spray with water", "Use insecticidal soap"], "prevention": ["Encourage beneficial insects", "Avoid over-fertilizing"]}]',
 '{"type": "Rich, moist", "ph": {"min": 6.0, "max": 7.0}, "drainage": "good", "nutrients": ["Nitrogen", "Organic matter"], "amendments": ["Compost", "Well-rotted manure"]}'),

-- FLOWERS
('flower', 'Asia', ARRAY['vegetables', 'herbs'], true,
 '{"season": ["September", "October", "November"], "timeToHarvest": "90-120 days from sowing", "harvestSigns": ["Full bloom", "Firm petals"], "storageInstructions": "Cut flowers last 7-10 days in water"}',
 '{"spring": {"watering": "Regular watering", "specialCare": ["Plant out after last frost"]}, "summer": {"watering": "Deep watering weekly", "specialCare": ["Deadhead spent blooms", "Support tall varieties"]}, "autumn": {"watering": "Continue watering until frost", "specialCare": ["Enjoy peak blooming period"]}, "winter": {"specialCare": ["Compost plants after frost"]}}',
 '[{"name": "Aphids", "symptoms": ["Distorted growth", "Sticky leaves"], "causes": ["Aphid infestation"], "treatments": ["Spray with water", "Use beneficial insects"], "prevention": ["Good air circulation", "Avoid over-fertilizing"]}]',
 '{"type": "Well-draining, fertile", "ph": {"min": 6.0, "max": 7.0}, "drainage": "good", "nutrients": ["Balanced nutrition"], "amendments": ["Compost", "Balanced fertilizer"]}'),

('flower', 'Europe', ARRAY['vegetables', 'bulbs'], true,
 '{"season": ["October", "November", "December", "January", "February", "March"], "timeToHarvest": "60-70 days from planting", "harvestSigns": ["Full bloom", "Bright colors"], "storageInstructions": "Deadhead for continuous blooming"}',
 '{"spring": {"watering": "Regular watering", "specialCare": ["Peak blooming season"]}, "summer": {"watering": "Keep soil moist in hot weather", "specialCare": ["Provide afternoon shade"]}, "autumn": {"watering": "Regular watering", "specialCare": ["Plant new pansies", "Remove spent blooms"]}, "winter": {"watering": "Water when soil dry", "protection": "Hardy but protect from severe frost"}}',
 '[{"name": "Slugs and snails", "symptoms": ["Holes in leaves", "Slime trails"], "causes": ["Wet conditions", "Slug/snail activity"], "treatments": ["Hand picking", "Slug pellets", "Beer traps"], "prevention": ["Good drainage", "Remove hiding places"]}]',
 '{"type": "Rich, well-draining", "ph": {"min": 6.0, "max": 7.0}, "drainage": "good", "nutrients": ["Organic matter", "Balanced nutrition"], "amendments": ["Compost", "Well-rotted manure"]}')

ON CONFLICT DO NOTHING;