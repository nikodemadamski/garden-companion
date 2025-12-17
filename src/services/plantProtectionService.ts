import { PlantProtectionAction } from '@/types/weather';
import { Plant } from '@/types/plant';

export interface ProtectionStrategy {
  id: string;
  name: string;
  weatherType: 'wind' | 'rain' | 'storm' | 'temperature';
  severity: 'yellow' | 'orange' | 'red';
  plantCategories: string[];
  actions: PlantProtectionAction[];
}

export interface EmergencyChecklist {
  id: string;
  title: string;
  weatherType: 'wind' | 'rain' | 'storm' | 'temperature';
  severity: 'yellow' | 'orange' | 'red';
  timeframe: 'immediate' | 'within_hours' | 'prepare';
  items: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  task: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
  plantTypes?: string[];
  tools?: string[];
}

export class PlantProtectionService {
  private static protectionStrategies: ProtectionStrategy[] = [
    // Wind Protection Strategies
    {
      id: 'wind-yellow-general',
      name: 'Light Wind Protection',
      weatherType: 'wind',
      severity: 'yellow',
      plantCategories: ['all'],
      actions: [
        {
          action: 'Secure lightweight containers',
          urgency: 'prepare',
          plantTypes: ['herbs', 'flowers'],
          instructions: [
            'Move small pots to more sheltered locations',
            'Group containers together for mutual protection',
            'Check that plant supports are secure'
          ]
        },
        {
          action: 'Inspect tall plants',
          urgency: 'prepare',
          plantTypes: ['vegetables', 'fruits'],
          instructions: [
            'Check stakes and ties on tomatoes and beans',
            'Ensure climbing plants are well-secured to supports',
            'Prune any loose or damaged branches'
          ]
        }
      ]
    },
    {
      id: 'wind-orange-intensive',
      name: 'Moderate Wind Protection',
      weatherType: 'wind',
      severity: 'orange',
      plantCategories: ['all'],
      actions: [
        {
          action: 'Relocate vulnerable plants',
          urgency: 'within_hours',
          plantTypes: ['herbs', 'flowers'],
          instructions: [
            'Move all lightweight containers indoors or to very sheltered areas',
            'Bring hanging baskets inside',
            'Relocate newly planted seedlings to protected areas'
          ]
        },
        {
          action: 'Reinforce plant supports',
          urgency: 'within_hours',
          plantTypes: ['vegetables', 'fruits'],
          instructions: [
            'Add extra stakes to tall plants like tomatoes',
            'Use soft ties to secure plants without damaging stems',
            'Create windbreaks using garden screens or fabric'
          ]
        },
        {
          action: 'Harvest ready produce',
          urgency: 'within_hours',
          plantTypes: ['vegetables', 'fruits'],
          instructions: [
            'Pick ripe tomatoes, peppers, and soft fruits',
            'Harvest leafy greens that might be damaged',
            'Cut herbs for drying before they get battered'
          ]
        }
      ]
    },
    {
      id: 'wind-red-emergency',
      name: 'Severe Wind Emergency Protection',
      weatherType: 'wind',
      severity: 'red',
      plantCategories: ['all'],
      actions: [
        {
          action: 'Emergency plant evacuation',
          urgency: 'immediate',
          plantTypes: ['all'],
          instructions: [
            'Move ALL moveable containers indoors immediately',
            'Lay down or secure any garden furniture',
            'Remove or secure all loose garden tools and equipment'
          ]
        },
        {
          action: 'Protect fixed plants',
          urgency: 'immediate',
          plantTypes: ['vegetables', 'fruits'],
          instructions: [
            'Cut back tall plants to reduce wind resistance',
            'Wrap vulnerable plants in horticultural fleece',
            'Create emergency windbreaks using whatever materials available'
          ]
        }
      ]
    },

    // Rain Protection Strategies
    {
      id: 'rain-yellow-drainage',
      name: 'Light Rain Preparation',
      weatherType: 'rain',
      severity: 'yellow',
      plantCategories: ['all'],
      actions: [
        {
          action: 'Improve drainage',
          urgency: 'prepare',
          plantTypes: ['all'],
          instructions: [
            'Check all container drainage holes are clear',
            'Elevate containers on pot feet or bricks',
            'Clear gutters and ensure water flows away from plants'
          ]
        },
        {
          action: 'Prepare for reduced watering',
          urgency: 'prepare',
          plantTypes: ['all'],
          instructions: [
            'Skip planned watering sessions',
            'Monitor soil moisture levels more carefully',
            'Prepare covers for plants that prefer dry conditions'
          ]
        }
      ]
    },
    {
      id: 'rain-orange-protection',
      name: 'Heavy Rain Protection',
      weatherType: 'rain',
      severity: 'orange',
      plantCategories: ['all'],
      actions: [
        {
          action: 'Protect sensitive plants',
          urgency: 'within_hours',
          plantTypes: ['herbs', 'vegetables'],
          instructions: [
            'Cover Mediterranean herbs with clear plastic sheeting',
            'Move containers under overhangs or into greenhouse',
            'Harvest ripe tomatoes and soft fruits before they split'
          ]
        },
        {
          action: 'Prevent waterlogging',
          urgency: 'within_hours',
          plantTypes: ['all'],
          instructions: [
            'Tilt containers slightly to improve drainage',
            'Add extra drainage material to vulnerable plants',
            'Create temporary shelters for ground-level plants'
          ]
        }
      ]
    },

    // Temperature Protection Strategies
    {
      id: 'temp-yellow-frost',
      name: 'Frost Warning Protection',
      weatherType: 'temperature',
      severity: 'yellow',
      plantCategories: ['tender'],
      actions: [
        {
          action: 'Frost preparation',
          urgency: 'prepare',
          plantTypes: ['herbs', 'vegetables', 'flowers'],
          instructions: [
            'Water plants well before nightfall (moist soil retains heat)',
            'Move tender plants to sheltered locations',
            'Prepare horticultural fleece or old sheets for covering'
          ]
        },
        {
          action: 'Harvest tender crops',
          urgency: 'prepare',
          plantTypes: ['vegetables', 'herbs'],
          instructions: [
            'Pick green tomatoes for indoor ripening',
            'Harvest basil and other tender herbs',
            'Cut back tender perennials to protect crowns'
          ]
        }
      ]
    },
    {
      id: 'temp-orange-freeze',
      name: 'Hard Frost Protection',
      weatherType: 'temperature',
      severity: 'orange',
      plantCategories: ['all'],
      actions: [
        {
          action: 'Emergency frost protection',
          urgency: 'immediate',
          plantTypes: ['all'],
          instructions: [
            'Cover all tender plants with fleece or fabric',
            'Move all possible containers indoors or to heated greenhouse',
            'Wrap outdoor taps and protect irrigation systems'
          ]
        },
        {
          action: 'Protect plant structures',
          urgency: 'immediate',
          plantTypes: ['all'],
          instructions: [
            'Insulate containers with bubble wrap or sacking',
            'Mulch heavily around plant bases',
            'Protect tree trunks with tree guards or fabric'
          ]
        }
      ]
    }
  ];

  private static emergencyChecklists: EmergencyChecklist[] = [
    {
      id: 'wind-emergency-checklist',
      title: 'Wind Storm Emergency Checklist',
      weatherType: 'wind',
      severity: 'red',
      timeframe: 'immediate',
      items: [
        {
          id: 'secure-containers',
          task: 'Move all lightweight containers indoors',
          priority: 'high',
          estimatedTime: '15-30 minutes',
          plantTypes: ['herbs', 'flowers'],
          tools: ['trolley', 'protective gloves']
        },
        {
          id: 'harvest-crops',
          task: 'Emergency harvest of ripe produce',
          priority: 'high',
          estimatedTime: '10-20 minutes',
          plantTypes: ['vegetables', 'fruits'],
          tools: ['harvest basket', 'secateurs']
        },
        {
          id: 'secure-supports',
          task: 'Check and reinforce all plant supports',
          priority: 'medium',
          estimatedTime: '20-30 minutes',
          plantTypes: ['vegetables'],
          tools: ['stakes', 'ties', 'hammer']
        },
        {
          id: 'remove-hazards',
          task: 'Secure or remove potential flying objects',
          priority: 'high',
          estimatedTime: '10-15 minutes',
          tools: ['storage space']
        },
        {
          id: 'document-garden',
          task: 'Take photos for insurance purposes',
          priority: 'low',
          estimatedTime: '5 minutes',
          tools: ['camera/phone']
        }
      ]
    },
    {
      id: 'frost-emergency-checklist',
      title: 'Severe Frost Emergency Checklist',
      weatherType: 'temperature',
      severity: 'orange',
      timeframe: 'immediate',
      items: [
        {
          id: 'cover-plants',
          task: 'Cover all tender plants with protection',
          priority: 'high',
          estimatedTime: '20-40 minutes',
          plantTypes: ['herbs', 'vegetables', 'flowers'],
          tools: ['horticultural fleece', 'old sheets', 'clips']
        },
        {
          id: 'move-containers',
          task: 'Move containers to protected areas',
          priority: 'high',
          estimatedTime: '15-30 minutes',
          plantTypes: ['all'],
          tools: ['trolley']
        },
        {
          id: 'water-plants',
          task: 'Water plants thoroughly before sunset',
          priority: 'medium',
          estimatedTime: '10-15 minutes',
          plantTypes: ['all'],
          tools: ['watering can', 'hose']
        },
        {
          id: 'insulate-containers',
          task: 'Wrap containers with insulating material',
          priority: 'medium',
          estimatedTime: '15-25 minutes',
          plantTypes: ['all'],
          tools: ['bubble wrap', 'sacking', 'tape']
        },
        {
          id: 'protect-taps',
          task: 'Protect outdoor water sources',
          priority: 'low',
          estimatedTime: '5-10 minutes',
          tools: ['tap covers', 'insulation']
        }
      ]
    },
    {
      id: 'storm-emergency-checklist',
      title: 'Severe Storm Emergency Checklist',
      weatherType: 'storm',
      severity: 'red',
      timeframe: 'immediate',
      items: [
        {
          id: 'emergency-harvest',
          task: 'Emergency harvest of all ready produce',
          priority: 'high',
          estimatedTime: '20-30 minutes',
          plantTypes: ['vegetables', 'fruits'],
          tools: ['harvest baskets', 'secateurs', 'storage containers']
        },
        {
          id: 'secure-everything',
          task: 'Secure or move all moveable garden items',
          priority: 'high',
          estimatedTime: '30-45 minutes',
          plantTypes: ['all'],
          tools: ['storage space', 'rope', 'weights']
        },
        {
          id: 'emergency-covers',
          task: 'Install emergency plant protection',
          priority: 'high',
          estimatedTime: '20-30 minutes',
          plantTypes: ['all'],
          tools: ['tarpaulins', 'fleece', 'weights', 'clips']
        },
        {
          id: 'clear-drains',
          task: 'Clear all drainage systems',
          priority: 'medium',
          estimatedTime: '10-15 minutes',
          tools: ['gloves', 'small shovel']
        },
        {
          id: 'prepare-recovery',
          task: 'Prepare post-storm recovery supplies',
          priority: 'low',
          estimatedTime: '10 minutes',
          tools: ['first aid supplies', 'replacement stakes', 'ties']
        }
      ]
    }
  ];

  /**
   * Get protection strategies for specific weather conditions
   */
  static getProtectionStrategies(
    weatherType: 'wind' | 'rain' | 'storm' | 'temperature',
    severity: 'yellow' | 'orange' | 'red',
    userPlants?: Plant[]
  ): ProtectionStrategy[] {
    let strategies = this.protectionStrategies.filter(
      strategy => strategy.weatherType === weatherType && strategy.severity === severity
    );

    // If user plants are provided, customize recommendations
    if (userPlants && userPlants.length > 0) {
      strategies = this.customizeStrategiesForPlants(strategies, userPlants);
    }

    return strategies;
  }

  /**
   * Get emergency checklist for severe weather
   */
  static getEmergencyChecklist(
    weatherType: 'wind' | 'rain' | 'storm' | 'temperature',
    severity: 'yellow' | 'orange' | 'red'
  ): EmergencyChecklist | null {
    return this.emergencyChecklists.find(
      checklist => checklist.weatherType === weatherType && checklist.severity === severity
    ) || null;
  }

  /**
   * Get plant-specific protection recommendations
   */
  static getPlantSpecificRecommendations(
    plant: Plant,
    weatherType: 'wind' | 'rain' | 'storm' | 'temperature',
    severity: 'yellow' | 'orange' | 'red'
  ): PlantProtectionAction[] {
    const actions: PlantProtectionAction[] = [];
    const plantCategory = this.getPlantCategory(plant);

    // Get base recommendations for plant category
    const strategies = this.getProtectionStrategies(weatherType, severity);
    
    strategies.forEach(strategy => {
      if (strategy.plantCategories.includes('all') || 
          strategy.plantCategories.includes(plantCategory)) {
        actions.push(...strategy.actions.filter(action => 
          action.plantTypes.includes('all') || 
          action.plantTypes.includes(plantCategory)
        ));
      }
    });

    // Add plant-specific customizations
    return this.addPlantSpecificCustomizations(actions, plant, weatherType, severity);
  }

  /**
   * Customize strategies based on user's actual plants
   */
  private static customizeStrategiesForPlants(
    strategies: ProtectionStrategy[],
    userPlants: Plant[]
  ): ProtectionStrategy[] {
    const plantCategories = new Set(userPlants.map(plant => this.getPlantCategory(plant)));
    
    return strategies.map(strategy => ({
      ...strategy,
      actions: strategy.actions.filter(action => {
        // Include actions that apply to all plants or to plants the user actually has
        return action.plantTypes.includes('all') || 
               action.plantTypes.some(type => plantCategories.has(type));
      })
    })).filter(strategy => strategy.actions.length > 0);
  }

  /**
   * Determine plant category from plant data
   */
  private static getPlantCategory(plant: Plant): string {
    // This would ideally use the enhanced plant database categories
    // For now, use simple heuristics based on plant name
    const name = plant.name.toLowerCase();
    
    if (name.includes('tomato') || name.includes('pepper') || name.includes('lettuce') || 
        name.includes('carrot') || name.includes('potato') || name.includes('bean')) {
      return 'vegetables';
    }
    
    if (name.includes('strawberry') || name.includes('raspberry') || name.includes('apple') || 
        name.includes('blueberry')) {
      return 'fruits';
    }
    
    if (name.includes('basil') || name.includes('rosemary') || name.includes('thyme') || 
        name.includes('parsley') || name.includes('mint') || name.includes('sage')) {
      return 'herbs';
    }
    
    if (name.includes('rose') || name.includes('pansy') || name.includes('chrysanthemum') || 
        name.includes('daffodil') || name.includes('tulip')) {
      return 'flowers';
    }
    
    return 'vegetables'; // default category
  }

  /**
   * Add plant-specific customizations to protection actions
   */
  private static addPlantSpecificCustomizations(
    actions: PlantProtectionAction[],
    plant: Plant,
    weatherType: 'wind' | 'rain' | 'storm' | 'temperature',
    severity: 'yellow' | 'orange' | 'red'
  ): PlantProtectionAction[] {
    const customizedActions = [...actions];
    const plantName = plant.name.toLowerCase();

    // Add specific recommendations based on plant type and weather
    if (weatherType === 'temperature' && severity !== 'yellow') {
      if (plantName.includes('basil') || plantName.includes('tomato')) {
        customizedActions.push({
          action: `Protect ${plant.name} from cold damage`,
          urgency: 'immediate',
          plantTypes: [this.getPlantCategory(plant)],
          instructions: [
            `${plant.name} is very sensitive to cold - move indoors if possible`,
            'If moving indoors is not possible, wrap with multiple layers of fleece',
            'Place near a heat source but ensure good ventilation'
          ]
        });
      }
    }

    if (weatherType === 'wind' && severity === 'red') {
      if (plantName.includes('bean') || plantName.includes('pea') || plantName.includes('tomato')) {
        customizedActions.push({
          action: `Emergency support for ${plant.name}`,
          urgency: 'immediate',
          plantTypes: [this.getPlantCategory(plant)],
          instructions: [
            `${plant.name} has weak stems - provide extra support immediately`,
            'Use soft ties to avoid cutting into stems',
            'Consider cutting back to reduce wind resistance'
          ]
        });
      }
    }

    return customizedActions;
  }

  /**
   * Get estimated time to complete all protection actions
   */
  static getEstimatedProtectionTime(
    weatherType: 'wind' | 'rain' | 'storm' | 'temperature',
    severity: 'yellow' | 'orange' | 'red',
    plantCount: number
  ): string {
    const baseMinutes = {
      yellow: 15,
      orange: 30,
      red: 60
    };

    const weatherMultiplier = {
      wind: 1.2,
      rain: 0.8,
      storm: 1.5,
      temperature: 1.0
    };

    const totalMinutes = Math.ceil(
      baseMinutes[severity] * weatherMultiplier[weatherType] * Math.sqrt(plantCount)
    );

    if (totalMinutes < 60) {
      return `${totalMinutes} minutes`;
    } else {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
  }

  /**
   * Get priority order for protection actions
   */
  static getPriorityOrder(actions: PlantProtectionAction[]): PlantProtectionAction[] {
    const urgencyOrder = { immediate: 3, within_hours: 2, prepare: 1 };
    
    return [...actions].sort((a, b) => {
      const urgencyDiff = urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
      if (urgencyDiff !== 0) return urgencyDiff;
      
      // If same urgency, prioritize actions affecting more plant types
      return b.plantTypes.length - a.plantTypes.length;
    });
  }
}