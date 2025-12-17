import { IrishPlantData, PlantCategory } from '../types/plant';

/**
 * Utility functions for plant data import/export and transformation
 */

/**
 * Export plant data to CSV format
 */
export const exportPlantsToCSV = (plants: IrishPlantData[]): string => {
  const headers = [
    'ID',
    'Common Name',
    'Scientific Name',
    'Category',
    'Description',
    'Watering',
    'Sunlight',
    'Care Level',
    'Native Region',
    'Companion Plants',
    'Pollinator Friendly',
    'Harvest Season',
    'Time to Harvest',
    'Soil Type',
    'Soil pH Min',
    'Soil pH Max',
    'Drainage',
    'Hardiness Zone',
    'Growing Season Length',
    'Rainfall Pattern',
    'Wind Exposure'
  ];

  const csvRows = [headers.join(',')];

  plants.forEach(plant => {
    const row = [
      plant.id,
      `"${plant.common_name}"`,
      `"${plant.scientific_name.join('; ')}"`,
      plant.category,
      `"${plant.description.replace(/"/g, '""')}"`,
      plant.watering,
      `"${plant.sunlight.join('; ')}"`,
      plant.care_level,
      plant.native_region || '',
      `"${plant.companion_plants?.join('; ') || ''}"`,
      plant.pollinator_friendly ? 'Yes' : 'No',
      `"${plant.harvest_info?.season.join('; ') || ''}"`,
      plant.harvest_info?.timeToHarvest || '',
      plant.soil_requirements?.type || '',
      plant.soil_requirements?.ph?.min || '',
      plant.soil_requirements?.ph?.max || '',
      plant.soil_requirements?.drainage || '',
      plant.climate_data?.hardiness_zone || '',
      plant.climate_data?.growing_season_length || '',
      plant.climate_data?.rainfall_pattern || '',
      plant.climate_data?.wind_exposure || ''
    ];
    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
};

/**
 * Import plants from CSV format
 */
export const importPlantsFromCSV = (csvData: string): { plants: Partial<IrishPlantData>[]; errors: string[] } => {
  const lines = csvData.split('\n');
  const errors: string[] = [];
  const plants: Partial<IrishPlantData>[] = [];

  if (lines.length < 2) {
    errors.push('CSV file must contain at least a header row and one data row');
    return { plants, errors };
  }

  const headers = lines[0].split(',').map(h => h.trim());
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      const values = parseCSVLine(line);
      const plant = parseCSVRowToPlant(headers, values);
      plants.push(plant);
    } catch (error) {
      errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return { plants, errors };
};

/**
 * Parse CSV line handling quoted values
 */
const parseCSVLine = (line: string): string[] => {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current.trim());
  return values;
};

/**
 * Convert CSV row to plant object
 */
const parseCSVRowToPlant = (headers: string[], values: string[]): Partial<IrishPlantData> => {
  const plant: any = {};

  headers.forEach((header, index) => {
    const value = values[index]?.trim() || '';
    
    switch (header.toLowerCase()) {
      case 'id':
        plant.id = value;
        break;
      case 'common name':
        plant.common_name = value;
        break;
      case 'scientific name':
        plant.scientific_name = value ? value.split(';').map(n => n.trim()) : [];
        break;
      case 'category':
        plant.category = value as PlantCategory;
        break;
      case 'description':
        plant.description = value;
        break;
      case 'watering':
        plant.watering = value;
        break;
      case 'sunlight':
        plant.sunlight = value ? value.split(';').map(s => s.trim()) : [];
        break;
      case 'care level':
        plant.care_level = value;
        break;
      case 'native region':
        plant.native_region = value;
        break;
      case 'companion plants':
        plant.companion_plants = value ? value.split(';').map(c => c.trim()) : [];
        break;
      case 'pollinator friendly':
        plant.pollinator_friendly = value.toLowerCase() === 'yes';
        break;
      case 'harvest season':
        if (value) {
          plant.harvest_info = plant.harvest_info || {};
          plant.harvest_info.season = value.split(';').map(s => s.trim());
        }
        break;
      case 'time to harvest':
        if (value) {
          plant.harvest_info = plant.harvest_info || {};
          plant.harvest_info.time_to_harvest = value;
        }
        break;
      case 'soil type':
        if (value) {
          plant.soil_requirements = plant.soil_requirements || {};
          plant.soil_requirements.type = value;
        }
        break;
      case 'soil ph min':
        if (value && !isNaN(Number(value))) {
          plant.soil_requirements = plant.soil_requirements || {};
          plant.soil_requirements.ph = plant.soil_requirements.ph || {};
          plant.soil_requirements.ph.min = Number(value);
        }
        break;
      case 'soil ph max':
        if (value && !isNaN(Number(value))) {
          plant.soil_requirements = plant.soil_requirements || {};
          plant.soil_requirements.ph = plant.soil_requirements.ph || {};
          plant.soil_requirements.ph.max = Number(value);
        }
        break;
      case 'drainage':
        if (value) {
          plant.soil_requirements = plant.soil_requirements || {};
          plant.soil_requirements.drainage = value;
        }
        break;
      case 'hardiness zone':
        if (value) {
          plant.climate_data = plant.climate_data || {};
          plant.climate_data.hardiness_zone = value;
        }
        break;
      case 'growing season length':
        if (value && !isNaN(Number(value))) {
          plant.climate_data = plant.climate_data || {};
          plant.climate_data.growing_season_length = Number(value);
        }
        break;
      case 'rainfall pattern':
        if (value) {
          plant.climate_data = plant.climate_data || {};
          plant.climate_data.rainfall_pattern = value;
        }
        break;
      case 'wind exposure':
        if (value) {
          plant.climate_data = plant.climate_data || {};
          plant.climate_data.wind_exposure = value;
        }
        break;
    }
  });

  return plant;
};

/**
 * Transform plant data for different formats
 */
export const transformPlantData = {
  /**
   * Convert to simplified format for display
   */
  toSimpleFormat: (plant: IrishPlantData) => ({
    id: plant.id,
    name: plant.common_name,
    category: plant.category,
    description: plant.description,
    careLevel: plant.care_level,
    pollinatorFriendly: plant.pollinator_friendly,
    harvestSeason: plant.harvest_info?.season || [],
    companionPlants: plant.companion_plants || []
  }),

  /**
   * Convert to detailed format for editing
   */
  toDetailedFormat: (plant: IrishPlantData) => ({
    ...plant,
    formattedScientificName: plant.scientific_name.join(', '),
    formattedSunlight: plant.sunlight.join(', '),
    formattedCompanionPlants: plant.companion_plants?.join(', ') || '',
    soilPhRange: plant.soil_requirements?.ph ? 
      `${plant.soil_requirements.ph.min} - ${plant.soil_requirements.ph.max}` : '',
    protectionNeeded: Object.entries(plant.protection_requirements || {})
      .filter(([_, needed]) => needed)
      .map(([type, _]) => type)
      .join(', ')
  }),

  /**
   * Convert to API format
   */
  toApiFormat: (plant: IrishPlantData) => ({
    id: plant.id,
    commonName: plant.common_name,
    scientificName: plant.scientific_name,
    category: plant.category,
    description: plant.description,
    watering: plant.watering,
    sunlight: plant.sunlight,
    careLevel: plant.care_level,
    nativeRegion: plant.native_region,
    companionPlants: plant.companion_plants,
    pollinatorFriendly: plant.pollinator_friendly,
    harvestInfo: plant.harvest_info,
    seasonalCare: plant.seasonal_care,
    commonIssues: plant.common_issues,
    soilRequirements: plant.soil_requirements,
    climateData: plant.climate_data,
    irishGrowingTips: plant.irish_growing_tips,
    protectionRequirements: plant.protection_requirements
  })
};

/**
 * Validate imported plant data
 */
export const validateImportedPlant = (plant: Partial<IrishPlantData>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Required fields
  if (!plant.id) errors.push('ID is required');
  if (!plant.common_name) errors.push('Common name is required');
  if (!plant.scientific_name || plant.scientific_name.length === 0) {
    errors.push('At least one scientific name is required');
  }
  if (!plant.category) errors.push('Category is required');
  if (!plant.description) errors.push('Description is required');

  // Validate category
  const validCategories: PlantCategory[] = ['fruit', 'vegetable', 'herb', 'flower'];
  if (plant.category && !validCategories.includes(plant.category)) {
    errors.push(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
  }

  // Validate care level
  const validCareLevels = ['Low', 'Medium', 'High'];
  if (plant.care_level && !validCareLevels.includes(plant.care_level)) {
    errors.push(`Invalid care level. Must be one of: ${validCareLevels.join(', ')}`);
  }

  // Validate watering
  const validWatering = ['Minimum', 'Average', 'Frequent'];
  if (plant.watering && !validWatering.includes(plant.watering)) {
    errors.push(`Invalid watering requirement. Must be one of: ${validWatering.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Merge plant databases
 */
export const mergePlantDatabases = (
  primary: IrishPlantData[], 
  secondary: IrishPlantData[]
): { merged: IrishPlantData[]; conflicts: string[] } => {
  const merged = [...primary];
  const conflicts: string[] = [];
  const primaryIds = new Set(primary.map(p => p.id));

  secondary.forEach(plant => {
    if (primaryIds.has(plant.id)) {
      conflicts.push(`Duplicate ID found: ${plant.id} (${plant.common_name})`);
    } else {
      merged.push(plant);
    }
  });

  return { merged, conflicts };
};

/**
 * Generate plant database backup
 */
export const createDatabaseBackup = (plants: IrishPlantData[]): string => {
  const backup = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    plantCount: plants.length,
    plants: plants
  };

  return JSON.stringify(backup, null, 2);
};

/**
 * Restore from database backup
 */
export const restoreFromBackup = (backupData: string): { 
  plants: IrishPlantData[]; 
  metadata: any; 
  errors: string[] 
} => {
  const errors: string[] = [];
  
  try {
    const backup = JSON.parse(backupData);
    
    if (!backup.plants || !Array.isArray(backup.plants)) {
      errors.push('Invalid backup format: plants array not found');
      return { plants: [], metadata: {}, errors };
    }

    const metadata = {
      version: backup.version,
      timestamp: backup.timestamp,
      plantCount: backup.plantCount
    };

    return { plants: backup.plants, metadata, errors };
  } catch (error) {
    errors.push(`Failed to parse backup: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { plants: [], metadata: {}, errors };
  }
};