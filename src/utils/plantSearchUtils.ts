import { 
  IrishPlantData, 
  PlantCategory, 
  PlantSearchFilters,
  PlantSortOptions 
} from '../types/plant';

/**
 * Utility functions for plant search and filtering
 */

/**
 * Create search filters for common plant queries
 */
export const createPlantFilters = {
  /**
   * Filter for plants suitable for beginners
   */
  forBeginners: (): PlantSearchFilters => ({
    // No specific filters, but can be combined with care_level in future
  }),

  /**
   * Filter for pollinator-friendly plants
   */
  forPollinators: (): PlantSearchFilters => ({
    pollinatorFriendly: true
  }),

  /**
   * Filter for plants by category
   */
  byCategory: (category: PlantCategory): PlantSearchFilters => ({
    category
  }),

  /**
   * Filter for plants that can be harvested in a specific season
   */
  byHarvestSeason: (season: string): PlantSearchFilters => ({
    harvestSeason: season
  }),

  /**
   * Filter for companion plants
   */
  companionsWith: (plantName: string): PlantSearchFilters => ({
    companionWith: plantName
  }),

  /**
   * Filter for plants native to Ireland
   */
  irishNative: (): PlantSearchFilters => ({
    nativeRegion: 'Ireland'
  })
};

/**
 * Create sort options for common sorting needs
 */
export const createSortOptions = {
  /**
   * Sort alphabetically by name
   */
  alphabetical: (direction: 'asc' | 'desc' = 'asc'): PlantSortOptions => ({
    field: 'name',
    direction
  }),

  /**
   * Sort by category
   */
  byCategory: (direction: 'asc' | 'desc' = 'asc'): PlantSortOptions => ({
    field: 'category',
    direction
  }),

  /**
   * Sort by pollinator friendliness
   */
  byPollinatorFriendly: (direction: 'asc' | 'desc' = 'desc'): PlantSortOptions => ({
    field: 'pollinatorFriendly',
    direction
  })
};

/**
 * Advanced search function with fuzzy matching
 */
export const fuzzySearchPlants = (
  plants: IrishPlantData[], 
  searchTerm: string, 
  threshold: number = 0.6
): IrishPlantData[] => {
  if (!searchTerm.trim()) {
    return plants;
  }

  const term = searchTerm.toLowerCase();
  
  return plants.filter(plant => {
    // Exact matches get highest priority
    if (plant.common_name.toLowerCase().includes(term) ||
        plant.scientific_name.some(name => name.toLowerCase().includes(term))) {
      return true;
    }

    // Check description for partial matches
    if (plant.description.toLowerCase().includes(term)) {
      return true;
    }

    // Check companion plants
    if (plant.companion_plants?.some(companion => 
        companion.toLowerCase().includes(term))) {
      return true;
    }

    // Check seasonal care information
    const seasonalCareText = JSON.stringify(plant.seasonal_care || {}).toLowerCase();
    if (seasonalCareText.includes(term)) {
      return true;
    }

    return false;
  });
};

/**
 * Get plant recommendations based on user's existing plants
 */
export const getPlantRecommendations = (
  allPlants: IrishPlantData[],
  userPlants: IrishPlantData[],
  maxRecommendations: number = 5
): IrishPlantData[] => {
  if (userPlants.length === 0) {
    // If no user plants, recommend popular beginner plants
    return allPlants
      .filter(plant => ['herb', 'flower'].includes(plant.category))
      .slice(0, maxRecommendations);
  }

  const recommendations = new Set<IrishPlantData>();
  const userPlantIds = new Set(userPlants.map(p => p.id));

  // Find companion plants for user's existing plants
  userPlants.forEach(userPlant => {
    if (userPlant.companion_plants) {
      userPlant.companion_plants.forEach(companionName => {
        const companionPlants = allPlants.filter(plant => 
          !userPlantIds.has(plant.id) &&
          (plant.common_name.toLowerCase().includes(companionName.toLowerCase()) ||
           plant.scientific_name.some(name => 
             name.toLowerCase().includes(companionName.toLowerCase())))
        );
        companionPlants.forEach(plant => recommendations.add(plant));
      });
    }
  });

  // If we don't have enough recommendations, add plants from same categories
  if (recommendations.size < maxRecommendations) {
    const userCategories = [...new Set(userPlants.map(p => p.category))];
    
    userCategories.forEach(category => {
      const categoryPlants = allPlants.filter(plant => 
        plant.category === category && !userPlantIds.has(plant.id)
      );
      categoryPlants.forEach(plant => recommendations.add(plant));
    });
  }

  // If still not enough, add pollinator-friendly plants
  if (recommendations.size < maxRecommendations) {
    const pollinatorPlants = allPlants.filter(plant => 
      plant.pollinator_friendly && !userPlantIds.has(plant.id)
    );
    pollinatorPlants.forEach(plant => recommendations.add(plant));
  }

  return Array.from(recommendations).slice(0, maxRecommendations);
};

/**
 * Filter plants by growing requirements compatibility
 */
export const filterByGrowingRequirements = (
  plants: IrishPlantData[],
  requirements: {
    sunlight?: string[];
    watering?: string;
    careLevel?: string;
    space?: 'small' | 'medium' | 'large';
  }
): IrishPlantData[] => {
  return plants.filter(plant => {
    // Check sunlight requirements
    if (requirements.sunlight && requirements.sunlight.length > 0) {
      const hasMatchingSunlight = requirements.sunlight.some(reqSun => 
        plant.sunlight.some(plantSun => 
          plantSun.toLowerCase().includes(reqSun.toLowerCase())
        )
      );
      if (!hasMatchingSunlight) return false;
    }

    // Check watering requirements
    if (requirements.watering) {
      if (plant.watering.toLowerCase() !== requirements.watering.toLowerCase()) {
        return false;
      }
    }

    // Check care level
    if (requirements.careLevel) {
      if (plant.care_level.toLowerCase() !== requirements.careLevel.toLowerCase()) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Get seasonal planting calendar for plants
 */
export const getSeasonalPlantingCalendar = (
  plants: IrishPlantData[]
): Record<string, IrishPlantData[]> => {
  const calendar: Record<string, IrishPlantData[]> = {
    spring: [],
    summer: [],
    autumn: [],
    winter: []
  };

  plants.forEach(plant => {
    // Check seasonal care for planting information
    Object.entries(plant.seasonal_care || {}).forEach(([season, care]) => {
      if (care?.special_care?.some((careItem: string) => 
          careItem.toLowerCase().includes('plant') || 
          careItem.toLowerCase().includes('sow'))) {
        calendar[season].push(plant);
      }
    });
  });

  return calendar;
};

/**
 * Calculate plant compatibility score
 */
export const calculateCompatibilityScore = (
  plant1: IrishPlantData,
  plant2: IrishPlantData
): number => {
  let score = 0;

  // Check if they are companion plants
  if (plant1.companion_plants?.some(companion => 
      plant2.common_name.toLowerCase().includes(companion.toLowerCase()) ||
      plant2.scientific_name.some(name => 
        name.toLowerCase().includes(companion.toLowerCase())))) {
    score += 50;
  }

  // Check similar growing requirements
  const sharedSunlight = plant1.sunlight.filter(sun => 
    plant2.sunlight.includes(sun)
  ).length;
  score += sharedSunlight * 10;

  // Check watering compatibility
  if (plant1.watering === plant2.watering) {
    score += 20;
  }

  // Check soil pH compatibility
  if (plant1.soil_requirements && plant2.soil_requirements) {
    const ph1 = plant1.soil_requirements.ph;
    const ph2 = plant2.soil_requirements.ph;
    
    if (ph1 && ph2) {
      const overlap = Math.max(0, Math.min(ph1.max, ph2.max) - Math.max(ph1.min, ph2.min));
      const maxRange = Math.max(ph1.max - ph1.min, ph2.max - ph2.min);
      score += (overlap / maxRange) * 15;
    }
  }

  // Both pollinator friendly
  if (plant1.pollinator_friendly && plant2.pollinator_friendly) {
    score += 10;
  }

  return Math.min(100, Math.round(score));
};

/**
 * Group plants by care requirements
 */
export const groupPlantsByCareRequirements = (
  plants: IrishPlantData[]
): Record<string, IrishPlantData[]> => {
  const groups: Record<string, IrishPlantData[]> = {};

  plants.forEach(plant => {
    const key = `${plant.watering}-${plant.sunlight.join(',')}-${plant.care_level}`;
    
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(plant);
  });

  return groups;
};

/**
 * Find plants suitable for specific conditions
 */
export const findPlantsForConditions = (
  plants: IrishPlantData[],
  conditions: {
    location: 'indoor' | 'outdoor' | 'balcony';
    sunlight: 'full' | 'partial' | 'shade';
    experience: 'beginner' | 'intermediate' | 'expert';
    space: 'small' | 'medium' | 'large';
  }
): IrishPlantData[] => {
  return plants.filter(plant => {
    // Filter by sunlight requirements
    const sunlightMatch = plant.sunlight.some(requirement => {
      switch (conditions.sunlight) {
        case 'full':
          return requirement.toLowerCase().includes('full sun');
        case 'partial':
          return requirement.toLowerCase().includes('part shade');
        case 'shade':
          return requirement.toLowerCase().includes('shade');
        default:
          return true;
      }
    });

    if (!sunlightMatch) return false;

    // Filter by experience level
    switch (conditions.experience) {
      case 'beginner':
        return plant.care_level.toLowerCase() === 'low';
      case 'intermediate':
        return ['low', 'medium'].includes(plant.care_level.toLowerCase());
      case 'expert':
        return true; // Experts can handle any care level
      default:
        return true;
    }
  });
};