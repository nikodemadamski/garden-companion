import { supabase } from '@/lib/supabaseClient';
import { PlantDiagnostic, PlantSymptom, TreatmentPlan, PotRecommendation, SymptomCategory } from '@/types/plant';

export interface DiagnosticResult {
  possibleCauses: PlantIssue[];
  recommendedActions: CareAction[];
  potRecommendations?: PotRecommendation[];
  followUpSchedule: string[];
}

export interface PlantIssue {
  name: string;
  symptoms: string[];
  causes: string[];
  treatments: string[];
  prevention: string[];
  severity: 'low' | 'medium' | 'high';
  commonness: number; // 0-1 scale
}

export interface CareAction {
  action: string;
  urgency: 'immediate' | 'within_days' | 'ongoing';
  instructions: string[];
  expectedResults: string;
  timeframe: string;
}

// Comprehensive symptom database for Irish climate gardening
const SYMPTOM_DATABASE: PlantSymptom[] = [
  // Leaf symptoms
  {
    id: 'yellowing-leaves',
    name: 'Yellowing Leaves',
    category: 'leaves',
    description: 'Leaves turning yellow, starting from older leaves or throughout the plant'
  },
  {
    id: 'brown-leaf-tips',
    name: 'Brown Leaf Tips',
    category: 'leaves',
    description: 'Leaf tips turning brown and crispy'
  },
  {
    id: 'brown-spots',
    name: 'Brown Spots on Leaves',
    category: 'leaves',
    description: 'Dark brown or black spots appearing on leaf surfaces'
  },
  {
    id: 'wilting-leaves',
    name: 'Wilting Leaves',
    category: 'leaves',
    description: 'Leaves drooping or becoming limp despite adequate soil moisture'
  },
  {
    id: 'leaf-drop',
    name: 'Excessive Leaf Drop',
    category: 'leaves',
    description: 'Plant dropping more leaves than normal'
  },
  {
    id: 'pale-leaves',
    name: 'Pale or Light Green Leaves',
    category: 'leaves',
    description: 'Leaves losing their vibrant green color'
  },
  {
    id: 'curling-leaves',
    name: 'Curling Leaves',
    category: 'leaves',
    description: 'Leaves curling inward or outward abnormally'
  },
  {
    id: 'holes-in-leaves',
    name: 'Holes in Leaves',
    category: 'leaves',
    description: 'Small or large holes appearing in leaf tissue'
  },
  
  // Stem symptoms
  {
    id: 'soft-mushy-stem',
    name: 'Soft or Mushy Stem',
    category: 'stems',
    description: 'Stem feels soft, mushy, or squishy to touch'
  },
  {
    id: 'black-stem-base',
    name: 'Black Stem Base',
    category: 'stems',
    description: 'Base of stem turning black or very dark'
  },
  {
    id: 'leggy-growth',
    name: 'Leggy or Stretched Growth',
    category: 'stems',
    description: 'Stems growing long and thin with sparse leaves'
  },
  {
    id: 'stem-spots',
    name: 'Spots on Stem',
    category: 'stems',
    description: 'Dark spots or lesions on stem surface'
  },
  
  // Root symptoms
  {
    id: 'root-rot',
    name: 'Dark or Mushy Roots',
    category: 'roots',
    description: 'Roots appear dark brown/black and feel mushy'
  },
  {
    id: 'root-bound',
    name: 'Roots Growing Out of Pot',
    category: 'roots',
    description: 'Roots visible through drainage holes or circling pot surface'
  },
  {
    id: 'dry-brittle-roots',
    name: 'Dry, Brittle Roots',
    category: 'roots',
    description: 'Roots appear dry and break easily when touched'
  },
  
  // Growth symptoms
  {
    id: 'stunted-growth',
    name: 'Stunted Growth',
    category: 'growth',
    description: 'Plant not growing or growing very slowly'
  },
  {
    id: 'no-flowering',
    name: 'No Flowering/Fruiting',
    category: 'growth',
    description: 'Plant not producing expected flowers or fruits'
  },
  {
    id: 'pest-presence',
    name: 'Visible Pests',
    category: 'growth',
    description: 'Small insects, webs, or other pests visible on plant'
  },
  {
    id: 'fungal-growth',
    name: 'White Powdery Coating',
    category: 'growth',
    description: 'White, powdery substance on leaves or stems'
  }
];

// Plant issue database with Irish climate considerations
const PLANT_ISSUES: PlantIssue[] = [
  {
    name: 'Overwatering',
    symptoms: ['yellowing-leaves', 'soft-mushy-stem', 'root-rot', 'leaf-drop'],
    causes: [
      'Watering too frequently',
      'Poor drainage in pot',
      'Heavy Irish rainfall without protection',
      'Soil that retains too much moisture'
    ],
    treatments: [
      'Stop watering immediately',
      'Remove plant from pot and inspect roots',
      'Trim away black, mushy roots with sterile scissors',
      'Repot in well-draining soil mix',
      'Place in bright, indirect light to recover'
    ],
    prevention: [
      'Check soil moisture before watering',
      'Ensure pots have drainage holes',
      'Use well-draining potting mix',
      'Protect outdoor plants from excessive rain'
    ],
    severity: 'high',
    commonness: 0.8
  },
  {
    name: 'Underwatering',
    symptoms: ['wilting-leaves', 'brown-leaf-tips', 'dry-brittle-roots', 'leaf-drop'],
    causes: [
      'Infrequent watering',
      'Soil drying out too quickly',
      'Hot, dry conditions',
      'Pot too small for plant size'
    ],
    treatments: [
      'Water thoroughly until water drains from bottom',
      'Increase watering frequency gradually',
      'Check if plant needs repotting',
      'Consider moving to more humid location'
    ],
    prevention: [
      'Establish regular watering schedule',
      'Use moisture meter or finger test',
      'Mulch outdoor plants to retain moisture',
      'Group plants together to increase humidity'
    ],
    severity: 'medium',
    commonness: 0.7
  },
  {
    name: 'Nutrient Deficiency',
    symptoms: ['pale-leaves', 'yellowing-leaves', 'stunted-growth', 'no-flowering'],
    causes: [
      'Poor quality or depleted soil',
      'Lack of fertilization',
      'pH imbalance preventing nutrient uptake',
      'Overwatering washing away nutrients'
    ],
    treatments: [
      'Apply balanced liquid fertilizer',
      'Test and adjust soil pH if needed',
      'Repot with fresh, nutrient-rich soil',
      'Consider slow-release fertilizer pellets'
    ],
    prevention: [
      'Fertilize regularly during growing season',
      'Use quality potting mix',
      'Test soil pH annually',
      'Refresh top layer of soil periodically'
    ],
    severity: 'medium',
    commonness: 0.6
  },
  {
    name: 'Pest Infestation',
    symptoms: ['holes-in-leaves', 'pest-presence', 'yellowing-leaves', 'stunted-growth'],
    causes: [
      'Aphids, spider mites, or other insects',
      'Poor air circulation',
      'Stressed plants more susceptible',
      'Bringing infected plants indoors'
    ],
    treatments: [
      'Identify specific pest type',
      'Spray with insecticidal soap or neem oil',
      'Remove heavily infested leaves',
      'Isolate plant to prevent spread',
      'Increase air circulation'
    ],
    prevention: [
      'Inspect plants regularly',
      'Quarantine new plants',
      'Maintain good air circulation',
      'Keep plants healthy to resist pests'
    ],
    severity: 'medium',
    commonness: 0.5
  },
  {
    name: 'Fungal Disease',
    symptoms: ['brown-spots', 'fungal-growth', 'black-stem-base', 'leaf-drop'],
    causes: [
      'High humidity with poor air circulation',
      'Wet leaves from overhead watering',
      'Irish damp climate conditions',
      'Overcrowded plants'
    ],
    treatments: [
      'Remove affected leaves immediately',
      'Improve air circulation around plant',
      'Apply fungicidal spray if severe',
      'Avoid watering leaves directly',
      'Reduce humidity around plant'
    ],
    prevention: [
      'Water at soil level, not on leaves',
      'Ensure good air circulation',
      'Avoid overcrowding plants',
      'Remove dead plant material promptly'
    ],
    severity: 'high',
    commonness: 0.4
  },
  {
    name: 'Light Issues',
    symptoms: ['leggy-growth', 'pale-leaves', 'no-flowering', 'leaf-drop'],
    causes: [
      'Insufficient light for plant type',
      'Too much direct sunlight causing stress',
      'Irish winter low light conditions',
      'Plant placed too far from windows'
    ],
    treatments: [
      'Move plant to appropriate light location',
      'Consider grow lights for winter',
      'Gradually acclimate to new light conditions',
      'Prune leggy growth to encourage bushiness'
    ],
    prevention: [
      'Research plant light requirements',
      'Rotate plants regularly for even growth',
      'Use grow lights during dark months',
      'Monitor seasonal light changes'
    ],
    severity: 'low',
    commonness: 0.6
  },
  {
    name: 'Temperature Stress',
    symptoms: ['curling-leaves', 'wilting-leaves', 'leaf-drop', 'stunted-growth'],
    causes: [
      'Cold drafts from windows or doors',
      'Sudden temperature changes',
      'Irish weather fluctuations',
      'Placement near heating sources'
    ],
    treatments: [
      'Move plant away from temperature extremes',
      'Protect from cold drafts',
      'Gradually acclimate to temperature changes',
      'Provide consistent temperature environment'
    ],
    prevention: [
      'Keep plants away from drafts',
      'Monitor temperature fluctuations',
      'Protect outdoor plants from frost',
      'Use plant covers during cold snaps'
    ],
    severity: 'medium',
    commonness: 0.4
  }
];

export class PlantDiagnosticService {
  // Get all available symptoms for selection
  static getSymptoms(): PlantSymptom[] {
    return SYMPTOM_DATABASE;
  }

  // Get symptoms by category
  static getSymptomsByCategory(category: SymptomCategory): PlantSymptom[] {
    return SYMPTOM_DATABASE.filter(symptom => symptom.category === category);
  }

  // Diagnose plant issues based on selected symptoms
  static diagnose(selectedSymptoms: string[]): DiagnosticResult {
    if (selectedSymptoms.length === 0) {
      return {
        possibleCauses: [],
        recommendedActions: [],
        followUpSchedule: []
      };
    }

    // Score each issue based on symptom matches
    const scoredIssues = PLANT_ISSUES.map(issue => {
      const matchingSymptoms = issue.symptoms.filter(symptom => 
        selectedSymptoms.includes(symptom)
      );
      const score = (matchingSymptoms.length / issue.symptoms.length) * issue.commonness;
      
      return {
        issue,
        score,
        matchingSymptoms: matchingSymptoms.length
      };
    }).filter(scored => scored.matchingSymptoms > 0)
      .sort((a, b) => b.score - a.score);

    // Get top 3 most likely issues
    const topIssues = scoredIssues.slice(0, 3).map(scored => scored.issue);

    // Generate care actions based on top issues
    const recommendedActions: CareAction[] = [];
    const followUpSchedule: string[] = [];

    topIssues.forEach(issue => {
      // Add immediate actions for high severity issues
      if (issue.severity === 'high') {
        recommendedActions.push({
          action: `Address ${issue.name}`,
          urgency: 'immediate',
          instructions: issue.treatments.slice(0, 3),
          expectedResults: `Symptoms should begin to improve within 3-7 days`,
          timeframe: '1-2 weeks'
        });
        followUpSchedule.push(`Check for ${issue.name} improvement in 3 days`);
      } else {
        recommendedActions.push({
          action: `Monitor and treat ${issue.name}`,
          urgency: issue.severity === 'medium' ? 'within_days' : 'ongoing',
          instructions: issue.treatments.slice(0, 2),
          expectedResults: `Gradual improvement over 1-2 weeks`,
          timeframe: '2-4 weeks'
        });
        followUpSchedule.push(`Monitor ${issue.name} progress weekly`);
      }
    });

    // Add general care recommendations
    recommendedActions.push({
      action: 'General Plant Health Check',
      urgency: 'ongoing',
      instructions: [
        'Check soil moisture regularly',
        'Inspect for new symptoms weekly',
        'Ensure proper light and air circulation',
        'Remove any dead or dying plant material'
      ],
      expectedResults: 'Maintained plant health and early problem detection',
      timeframe: 'Ongoing'
    });

    // Generate pot recommendations if root issues detected
    let potRecommendations: PotRecommendation[] | undefined;
    const hasRootIssues = selectedSymptoms.some(symptom => 
      ['root-rot', 'root-bound', 'dry-brittle-roots'].includes(symptom)
    );

    if (hasRootIssues) {
      potRecommendations = this.generatePotRecommendations(selectedSymptoms);
    }

    return {
      possibleCauses: topIssues,
      recommendedActions,
      potRecommendations,
      followUpSchedule
    };
  }

  // Generate pot recommendations based on symptoms
  private static generatePotRecommendations(symptoms: string[]): PotRecommendation[] {
    const recommendations: PotRecommendation[] = [];

    if (symptoms.includes('root-rot')) {
      recommendations.push({
        size: 'Same size or slightly smaller',
        material: 'terracotta',
        drainage: true,
        reasoning: 'Terracotta allows better air circulation and moisture evaporation to prevent future root rot'
      });
    }

    if (symptoms.includes('root-bound')) {
      recommendations.push({
        size: '2-4 inches larger in diameter',
        material: 'ceramic',
        drainage: true,
        reasoning: 'Larger pot provides room for root growth, ceramic retains some moisture while allowing drainage'
      });
    }

    if (symptoms.includes('dry-brittle-roots')) {
      recommendations.push({
        size: 'Current size or slightly larger',
        material: 'plastic',
        drainage: true,
        reasoning: 'Plastic retains moisture better while still providing drainage for recovery'
      });
    }

    // Default recommendation if no specific root issues
    if (recommendations.length === 0) {
      recommendations.push({
        size: 'Current size',
        material: 'terracotta',
        drainage: true,
        reasoning: 'Terracotta provides good balance of drainage and air circulation for most plants'
      });
    }

    return recommendations;
  }

  // Save diagnostic to database
  static async saveDiagnostic(plantId: string, symptoms: string[], diagnosis?: string, treatmentPlan?: TreatmentPlan): Promise<PlantDiagnostic | null> {
    try {
      const { data, error } = await supabase
        .from('plant_diagnostics')
        .insert({
          plant_id: plantId,
          symptoms,
          diagnosis,
          treatment_plan: treatmentPlan,
          resolved: false
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving diagnostic:', error);
      return null;
    }
  }

  // Get diagnostic history for a plant
  static async getDiagnosticHistory(plantId: string): Promise<PlantDiagnostic[]> {
    try {
      const { data, error } = await supabase
        .from('plant_diagnostics')
        .select('*')
        .eq('plant_id', plantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching diagnostic history:', error);
      return [];
    }
  }

  // Update diagnostic resolution status
  static async updateDiagnosticStatus(diagnosticId: string, resolved: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('plant_diagnostics')
        .update({ resolved })
        .eq('id', diagnosticId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating diagnostic status:', error);
      return false;
    }
  }

  // Get all diagnostics for user (via plants)
  static async getUserDiagnostics(userId: string): Promise<PlantDiagnostic[]> {
    try {
      const { data, error } = await supabase
        .from('plant_diagnostics')
        .select(`
          *,
          plants!inner(
            id,
            name,
            user_id
          )
        `)
        .eq('plants.user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user diagnostics:', error);
      return [];
    }
  }
}