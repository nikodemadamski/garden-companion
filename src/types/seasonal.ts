// Types for seasonal guidance system
// Defines interfaces for seasonal tasks, recommendations, and user progress

export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskCategory = 'planting' | 'maintenance' | 'harvesting' | 'preparation';
export type PlantType = 'fruit' | 'vegetable' | 'herb' | 'flower' | 'all';

export interface SeasonalTask {
  id: string;
  title: string;
  description: string | null;
  month: number;
  priority: TaskPriority;
  category: TaskCategory;
  climate_zone: string | null;
  plant_types: string[] | null;
  created_at: string;
}

export interface SeasonalTaskFilter {
  month?: number;
  priority?: TaskPriority;
  category?: TaskCategory;
  plant_types?: string[];
  climate_zone?: string;
}

export interface SeasonalGuide {
  currentMonth: SeasonalTask[];
  upcomingTasks: SeasonalTask[];
  seasonalTips: string[];
}

export interface TaskRecommendation {
  task: SeasonalTask;
  relevanceScore: number;
  userPlantMatch: boolean;
  urgency: 'immediate' | 'this_week' | 'this_month';
}

export interface UserTaskProgress {
  id: string;
  user_id: string;
  task_id: string;
  completed: boolean;
  completed_date: string | null;
  notes: string | null;
  created_at: string;
}

export interface MonthlyTaskSummary {
  month: number;
  totalTasks: number;
  completedTasks: number;
  highPriorityTasks: number;
  tasksByCategory: Record<TaskCategory, number>;
}

export interface SeasonalRecommendationContext {
  userPlants: string[]; // Plant types the user has
  currentMonth: number;
  climateZone: string;
  userPreferences?: {
    focusCategories?: TaskCategory[];
    skipLowPriority?: boolean;
  };
}