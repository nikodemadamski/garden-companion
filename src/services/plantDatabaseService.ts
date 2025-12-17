import { 
  EnhancedPlantData, 
  IrishPlantData, 
  PlantDatabaseQuery, 
  PlantSearchFilters, 
  PlantSortOptions,
  PlantCategory,
  validatePlantData,
  validateHarvestInfo,
  validateSoilRequirements,
  isValidPlantCategory
} from '../types/plant';
import irishPlantDatabase from '../data/irishPlantDatabase.json';

/**
 * Plant Database Management Service
 * Provides utilities for plant data validation, search, filtering, and management
 */
export class PlantDatabaseService {
  private static instance: PlantDatabaseService;
  private plantDatabase: IrishPlantData[] = [];

  private constructor() {
    this.loadPlantDatabase();
  }

  public static getInstance(): PlantDatabaseService {
    if (!PlantDatabaseService.instance) {
      PlantDatabaseService.instance = new PlantDatabaseService();
    }
    return PlantDatabaseService.instance;
  }

  /**
   * Load plant database from JSON file
   */
  private loadPlantDatabase(): void {
    try {
      this.plantDatabase = irishPlantDatabase as unknown as IrishPlantData[];
    } catch (error) {
      console.error('Failed to load plant database:', error);
      this.plantDatabase = [];
    }
  }

  /**
   * Get all plants from the database
   */
  public getAllPlants(): IrishPlantData[] {
    return [...this.plantDatabase];
  }

  /**
   * Get plant by ID
   */
  public getPlantById(id: string): IrishPlantData | null {
    return this.plantDatabase.find(plant => plant.id === id) || null;
  }

  /**
   * Search and filter plants based on query parameters
   */
  public searchPlants(query: PlantDatabaseQuery): IrishPlantData[] {
    let results = [...this.plantDatabase];

    // Apply text search
    if (query.searchTerm) {
      const searchTerm = query.searchTerm.toLowerCase();
      results = results.filter(plant => 
        plant.common_name.toLowerCase().includes(searchTerm) ||
        plant.scientific_name.some(name => name.toLowerCase().includes(searchTerm)) ||
        plant.description.toLowerCase().includes(searchTerm)
      );
    }

    // Apply filters
    if (query.filters) {
      results = this.applyFilters(results, query.filters);
    }

    // Apply sorting
    if (query.sort) {
      results = this.sortPlants(results, query.sort);
    }

    // Apply pagination
    if (query.offset !== undefined) {
      results = results.slice(query.offset);
    }
    if (query.limit !== undefined) {
      results = results.slice(0, query.limit);
    }

    return results;
  }

  /**
   * Apply filters to plant results
   */
  private applyFilters(plants: IrishPlantData[], filters: PlantSearchFilters): IrishPlantData[] {
    let filtered = plants;

    if (filters.category) {
      filtered = filtered.filter(plant => plant.category === filters.category);
    }

    if (filters.pollinatorFriendly !== undefined) {
      filtered = filtered.filter(plant => plant.pollinator_friendly === filters.pollinatorFriendly);
    }

    if (filters.nativeRegion) {
      filtered = filtered.filter(plant => 
        plant.native_region?.toLowerCase().includes(filters.nativeRegion!.toLowerCase())
      );
    }

    if (filters.harvestSeason) {
      filtered = filtered.filter(plant => 
        plant.harvest_info?.season.some(season => 
          season.toLowerCase().includes(filters.harvestSeason!.toLowerCase())
        )
      );
    }

    if (filters.companionWith) {
      filtered = filtered.filter(plant => 
        plant.companion_plants?.some(companion => 
          companion.toLowerCase().includes(filters.companionWith!.toLowerCase())
        )
      );
    }

    return filtered;
  }

  /**
   * Sort plants based on sort options
   */
  private sortPlants(plants: IrishPlantData[], sort: PlantSortOptions): IrishPlantData[] {
    return plants.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sort.field) {
        case 'name':
          aValue = a.common_name;
          bValue = b.common_name;
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        case 'nativeRegion':
          aValue = a.native_region || '';
          bValue = b.native_region || '';
          break;
        case 'pollinatorFriendly':
          aValue = a.pollinator_friendly ? 1 : 0;
          bValue = b.pollinator_friendly ? 1 : 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sort.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sort.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  /**
   * Get plants by category
   */
  public getPlantsByCategory(category: PlantCategory): IrishPlantData[] {
    return this.plantDatabase.filter(plant => plant.category === category);
  }

  /**
   * Get companion plants for a given plant
   */
  public getCompanionPlants(plantId: string): IrishPlantData[] {
    const plant = this.getPlantById(plantId);
    if (!plant || !plant.companion_plants) {
      return [];
    }

    return this.plantDatabase.filter(p => 
      plant.companion_plants!.some(companion => 
        p.common_name.toLowerCase().includes(companion.toLowerCase()) ||
        p.scientific_name.some(name => name.toLowerCase().includes(companion.toLowerCase()))
      )
    );
  }

  /**
   * Get pollinator-friendly plants
   */
  public getPollinatorFriendlyPlants(): IrishPlantData[] {
    return this.plantDatabase.filter(plant => plant.pollinator_friendly);
  }

  /**
   * Get plants suitable for current season
   */
  public getPlantsForSeason(season: string): IrishPlantData[] {
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    
    return this.plantDatabase.filter(plant => {
      // Check if plant can be harvested in current season
      if (plant.harvest_info?.season.includes(currentMonth)) {
        return true;
      }
      
      // Check seasonal care information
      const seasonalCare = plant.seasonal_care?.[season.toLowerCase() as keyof typeof plant.seasonal_care];
      return seasonalCare !== undefined;
    });
  }

  /**
   * Validate plant data
   */
  public validatePlant(plantData: Partial<IrishPlantData>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Basic plant validation
    const basicValidation = validatePlantData(plantData);
    errors.push(...basicValidation.errors);

    // Enhanced plant validation
    if (plantData.category && !isValidPlantCategory(plantData.category)) {
      errors.push('Invalid plant category');
    }

    if (plantData.companion_plants && plantData.companion_plants.length > 20) {
      errors.push('Too many companion plants (maximum 20)');
    }

    // Harvest info validation
    if (plantData.harvest_info) {
      const harvestValidation = validateHarvestInfo(plantData.harvest_info);
      errors.push(...harvestValidation.errors);
    }

    // Soil requirements validation
    if (plantData.soil_requirements) {
      const soilValidation = validateSoilRequirements(plantData.soil_requirements);
      errors.push(...soilValidation.errors);
    }

    // Climate data validation
    if (plantData.climate_data) {
      if (!plantData.climate_data.hardiness_zone) {
        errors.push('Hardiness zone is required');
      }
      if (plantData.climate_data.growing_season_length < 0 || plantData.climate_data.growing_season_length > 365) {
        errors.push('Growing season length must be between 0 and 365 days');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Export plant database to JSON
   */
  public exportDatabase(): string {
    return JSON.stringify(this.plantDatabase, null, 2);
  }

  /**
   * Import plant database from JSON
   */
  public importDatabase(jsonData: string): { success: boolean; errors: string[] } {
    try {
      const importedData = JSON.parse(jsonData) as IrishPlantData[];
      const errors: string[] = [];

      // Validate each plant in the imported data
      for (let i = 0; i < importedData.length; i++) {
        const validation = this.validatePlant(importedData[i]);
        if (!validation.isValid) {
          errors.push(`Plant ${i + 1}: ${validation.errors.join(', ')}`);
        }
      }

      if (errors.length === 0) {
        this.plantDatabase = importedData;
        return { success: true, errors: [] };
      } else {
        return { success: false, errors };
      }
    } catch (error) {
      return { 
        success: false, 
        errors: [`Invalid JSON format: ${error instanceof Error ? error.message : 'Unknown error'}`] 
      };
    }
  }

  /**
   * Add new plant to database
   */
  public addPlant(plantData: IrishPlantData): { success: boolean; errors: string[] } {
    const validation = this.validatePlant(plantData);
    
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    // Check for duplicate ID
    if (this.getPlantById(plantData.id)) {
      return { success: false, errors: ['Plant with this ID already exists'] };
    }

    this.plantDatabase.push(plantData);
    return { success: true, errors: [] };
  }

  /**
   * Update existing plant in database
   */
  public updatePlant(id: string, plantData: Partial<IrishPlantData>): { success: boolean; errors: string[] } {
    const existingPlantIndex = this.plantDatabase.findIndex(plant => plant.id === id);
    
    if (existingPlantIndex === -1) {
      return { success: false, errors: ['Plant not found'] };
    }

    const updatedPlant = { ...this.plantDatabase[existingPlantIndex], ...plantData };
    const validation = this.validatePlant(updatedPlant);
    
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    this.plantDatabase[existingPlantIndex] = updatedPlant as IrishPlantData;
    return { success: true, errors: [] };
  }

  /**
   * Remove plant from database
   */
  public removePlant(id: string): { success: boolean; errors: string[] } {
    const plantIndex = this.plantDatabase.findIndex(plant => plant.id === id);
    
    if (plantIndex === -1) {
      return { success: false, errors: ['Plant not found'] };
    }

    this.plantDatabase.splice(plantIndex, 1);
    return { success: true, errors: [] };
  }

  /**
   * Get plant care recommendations based on current conditions
   */
  public getPlantCareRecommendations(plantId: string, currentSeason?: string): string[] {
    const plant = this.getPlantById(plantId);
    if (!plant) {
      return ['Plant not found'];
    }

    const season = currentSeason || this.getCurrentSeason();
    const seasonalCare = plant.seasonal_care?.[season.toLowerCase() as keyof typeof plant.seasonal_care];
    
    if (!seasonalCare) {
      return ['No seasonal care information available'];
    }

    const recommendations: string[] = [];
    
    if (seasonalCare.watering) {
      recommendations.push(`Watering: ${seasonalCare.watering}`);
    }
    if (seasonalCare.fertilizing) {
      recommendations.push(`Fertilizing: ${seasonalCare.fertilizing}`);
    }
    if (seasonalCare.pruning) {
      recommendations.push(`Pruning: ${seasonalCare.pruning}`);
    }
    if (seasonalCare.protection) {
      recommendations.push(`Protection: ${seasonalCare.protection}`);
    }
    if (seasonalCare.special_care) {
      recommendations.push(...seasonalCare.special_care.map((care: string) => `Special care: ${care}`));
    }

    return recommendations;
  }

  /**
   * Get current season based on date
   */
  private getCurrentSeason(): string {
    const month = new Date().getMonth() + 1; // 1-12
    
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  }

  /**
   * Get database statistics
   */
  public getDatabaseStats(): {
    totalPlants: number;
    plantsByCategory: Record<PlantCategory, number>;
    pollinatorFriendlyCount: number;
    plantsWithHarvestInfo: number;
  } {
    const stats = {
      totalPlants: this.plantDatabase.length,
      plantsByCategory: {
        fruit: 0,
        vegetable: 0,
        herb: 0,
        flower: 0
      } as Record<PlantCategory, number>,
      pollinatorFriendlyCount: 0,
      plantsWithHarvestInfo: 0
    };

    this.plantDatabase.forEach(plant => {
      stats.plantsByCategory[plant.category]++;
      if (plant.pollinator_friendly) {
        stats.pollinatorFriendlyCount++;
      }
      if (plant.harvest_info) {
        stats.plantsWithHarvestInfo++;
      }
    });

    return stats;
  }
}

// Export singleton instance
export const plantDatabaseService = PlantDatabaseService.getInstance();