-- Migration 003: Insert initial seasonal tasks for Irish climate
-- Populate seasonal_tasks table with month-specific gardening activities

INSERT INTO seasonal_tasks (title, description, month, priority, category, climate_zone, plant_types) VALUES
-- January
('Plan Garden Layout', 'Review last year''s garden and plan improvements for the coming season', 1, 'medium', 'preparation', 'ireland', ARRAY['all']),
('Order Seeds', 'Order seeds for spring planting, especially early varieties', 1, 'high', 'preparation', 'ireland', ARRAY['vegetable', 'herb', 'flower']),
('Check Stored Bulbs', 'Inspect stored dahlia tubers and begonia bulbs for rot', 1, 'medium', 'maintenance', 'ireland', ARRAY['flower']),
('Prune Fruit Trees', 'Prune apple and pear trees while dormant', 1, 'high', 'maintenance', 'ireland', ARRAY['fruit']),

-- February
('Start Seeds Indoors', 'Begin sowing tomatoes, peppers, and herbs indoors', 2, 'high', 'planting', 'ireland', ARRAY['vegetable', 'herb']),
('Prepare Seed Beds', 'Prepare outdoor beds when soil is workable', 2, 'medium', 'preparation', 'ireland', ARRAY['all']),
('Prune Roses', 'Prune roses and apply mulch', 2, 'medium', 'maintenance', 'ireland', ARRAY['flower']),
('Check Garden Tools', 'Clean and sharpen garden tools for spring', 2, 'low', 'preparation', 'ireland', ARRAY['all']),

-- March
('Plant Early Vegetables', 'Sow peas, broad beans, and onions outdoors', 3, 'high', 'planting', 'ireland', ARRAY['vegetable']),
('Divide Perennials', 'Divide overcrowded perennial clumps', 3, 'medium', 'maintenance', 'ireland', ARRAY['flower']),
('Apply Compost', 'Add compost to beds and containers', 3, 'medium', 'maintenance', 'ireland', ARRAY['all']),
('Start Potato Chitting', 'Begin chitting seed potatoes indoors', 3, 'high', 'preparation', 'ireland', ARRAY['vegetable']),

-- April
('Plant Potatoes', 'Plant first early potatoes in containers or beds', 4, 'high', 'planting', 'ireland', ARRAY['vegetable']),
('Sow Lettuce and Spinach', 'Direct sow cool-season greens', 4, 'high', 'planting', 'ireland', ARRAY['vegetable']),
('Harden Off Seedlings', 'Gradually acclimatize indoor-started seedlings', 4, 'medium', 'maintenance', 'ireland', ARRAY['all']),
('Plant Summer Bulbs', 'Plant gladioli and other summer flowering bulbs', 4, 'medium', 'planting', 'ireland', ARRAY['flower']),

-- May
('Plant Tender Vegetables', 'Plant out tomatoes, peppers after last frost', 5, 'high', 'planting', 'ireland', ARRAY['vegetable']),
('Sow Herbs', 'Direct sow basil, parsley, and other herbs', 5, 'medium', 'planting', 'ireland', ARRAY['herb']),
('Mulch Beds', 'Apply mulch to retain moisture and suppress weeds', 5, 'medium', 'maintenance', 'ireland', ARRAY['all']),
('Plant Hanging Baskets', 'Create summer hanging basket displays', 5, 'low', 'planting', 'ireland', ARRAY['flower']),

-- June
('Regular Watering', 'Establish consistent watering routine for containers', 6, 'high', 'maintenance', 'ireland', ARRAY['all']),
('Harvest Early Crops', 'Begin harvesting lettuce, spinach, and herbs', 6, 'medium', 'harvesting', 'ireland', ARRAY['vegetable', 'herb']),
('Deadhead Flowers', 'Remove spent blooms to encourage more flowers', 6, 'medium', 'maintenance', 'ireland', ARRAY['flower']),
('Support Climbing Plants', 'Install supports for peas, beans, and tomatoes', 6, 'high', 'maintenance', 'ireland', ARRAY['vegetable']),

-- July
('Harvest Summer Crops', 'Regular harvesting of beans, courgettes, and herbs', 7, 'high', 'harvesting', 'ireland', ARRAY['vegetable', 'herb']),
('Water Management', 'Deep watering in early morning or evening', 7, 'high', 'maintenance', 'ireland', ARRAY['all']),
('Succession Planting', 'Sow more lettuce and radishes for continuous harvest', 7, 'medium', 'planting', 'ireland', ARRAY['vegetable']),
('Pest Monitoring', 'Check for aphids, slugs, and other summer pests', 7, 'medium', 'maintenance', 'ireland', ARRAY['all']),

-- August
('Harvest Tomatoes', 'Begin harvesting ripe tomatoes and peppers', 8, 'high', 'harvesting', 'ireland', ARRAY['vegetable']),
('Collect Seeds', 'Save seeds from best performing plants', 8, 'low', 'harvesting', 'ireland', ARRAY['all']),
('Plant Winter Vegetables', 'Sow winter cabbage, kale, and Brussels sprouts', 8, 'medium', 'planting', 'ireland', ARRAY['vegetable']),
('Divide Iris', 'Divide and replant iris rhizomes', 8, 'low', 'maintenance', 'ireland', ARRAY['flower']),

-- September
('Harvest Root Vegetables', 'Lift carrots, beetroot, and potatoes', 9, 'high', 'harvesting', 'ireland', ARRAY['vegetable']),
('Plant Spring Bulbs', 'Plant daffodils, tulips, and crocuses', 9, 'medium', 'planting', 'ireland', ARRAY['flower']),
('Reduce Watering', 'Gradually reduce watering as temperatures drop', 9, 'medium', 'maintenance', 'ireland', ARRAY['all']),
('Collect Apples', 'Harvest apples and pears when ripe', 9, 'high', 'harvesting', 'ireland', ARRAY['fruit']),

-- October
('Plant Garlic', 'Plant garlic cloves for next year''s harvest', 10, 'medium', 'planting', 'ireland', ARRAY['vegetable']),
('Lift Tender Bulbs', 'Lift dahlia tubers and begonia bulbs before frost', 10, 'medium', 'maintenance', 'ireland', ARRAY['flower']),
('Compost Preparation', 'Add fallen leaves to compost bins', 10, 'low', 'maintenance', 'ireland', ARRAY['all']),
('Protect Tender Plants', 'Move tender plants to sheltered locations', 10, 'high', 'maintenance', 'ireland', ARRAY['all']),

-- November
('Insulate Containers', 'Wrap pots with bubble wrap or fleece', 11, 'high', 'maintenance', 'ireland', ARRAY['all']),
('Harvest Late Crops', 'Harvest remaining root vegetables and brassicas', 11, 'medium', 'harvesting', 'ireland', ARRAY['vegetable']),
('Clean Greenhouse', 'Clean greenhouse glass and check heating', 11, 'medium', 'maintenance', 'ireland', ARRAY['all']),
('Plan Next Year', 'Order seed catalogs and plan next year''s garden', 11, 'low', 'preparation', 'ireland', ARRAY['all']),

-- December
('Protect from Frost', 'Cover tender plants during cold snaps', 12, 'high', 'maintenance', 'ireland', ARRAY['all']),
('Harvest Winter Vegetables', 'Harvest Brussels sprouts, leeks, and winter cabbage', 12, 'medium', 'harvesting', 'ireland', ARRAY['vegetable']),
('Check Stored Produce', 'Inspect stored potatoes, apples, and onions', 12, 'medium', 'maintenance', 'ireland', ARRAY['vegetable', 'fruit']),
('Maintain Tools', 'Clean and oil garden tools for winter storage', 12, 'low', 'maintenance', 'ireland', ARRAY['all'])

ON CONFLICT DO NOTHING;