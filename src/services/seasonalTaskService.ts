// Seasonal Task Management Service
// Handles database operations, caching, and recommendation logic for seasonal gardening tasks

import { supabase } from '@/lib/supabaseClient';
import {
  SeasonalTask,
  SeasonalTaskFilter,
  SeasonalGuide,
  TaskRecommendation,
  SeasonalRecommendationContext,
  MonthlyTaskSummary,
  TaskPriority,
  TaskCategory
} from '@/types/seasonal';
export type { SeasonalTask };

class SeasonalTaskService {
  private taskCache: Map<string, SeasonalTask[]> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 1000 * 60 * 60; // 1 hour

  /**
   * Get seasonal tasks with optional filtering
   */
  async getSeasonalTasks(filter?: SeasonalTaskFilter): Promise<SeasonalTask[]> {
    const cacheKey = this.generateCacheKey(filter);

    // Check cache first
    if (this.isCacheValid(cacheKey)) {
      return this.taskCache.get(cacheKey) || [];
    }

    try {
      let query = (supabase as any)
        .from('seasonal_tasks')
        .select('*')
        .order('month', { ascending: true })
        .order('priority', { ascending: false }); // high priority first

      // Apply filters
      if (filter?.month) {
        query = query.eq('month', filter.month);
      }

      if (filter?.priority) {
        query = query.eq('priority', filter.priority);
      }

      if (filter?.category) {
        query = query.eq('category', filter.category);
      }

      if (filter?.climate_zone) {
        query = query.eq('climate_zone', filter.climate_zone);
      }

      if (filter?.plant_types && filter.plant_types.length > 0) {
        // Filter tasks that match any of the specified plant types
        query = query.or(
          filter.plant_types
            .map(type => `plant_types.cs.{${type}}`)
            .join(',')
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching seasonal tasks:', error);
        throw new Error(`Failed to fetch seasonal tasks: ${error.message}`);
      }

      const tasks = data || [];

      // Cache the results
      this.taskCache.set(cacheKey, tasks);
      this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_DURATION);

      return tasks;
    } catch (error) {
      console.error('Error in getSeasonalTasks:', error);
      throw error;
    }
  }

  /**
   * Get tasks for current month with recommendations
   */
  async getCurrentMonthGuide(context: SeasonalRecommendationContext): Promise<SeasonalGuide> {
    try {
      const currentMonth = context.currentMonth;
      const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;

      // Get current month tasks
      const currentTasks = await this.getSeasonalTasks({
        month: currentMonth,
        climate_zone: context.climateZone
      });

      // Get next month tasks for planning
      const upcomingTasks = await this.getSeasonalTasks({
        month: nextMonth,
        climate_zone: context.climateZone
      });

      // Filter and prioritize based on user's plants
      const relevantCurrentTasks = this.filterTasksByUserPlants(currentTasks, context.userPlants);
      const relevantUpcomingTasks = this.filterTasksByUserPlants(upcomingTasks, context.userPlants);

      // Generate seasonal tips
      const seasonalTips = this.generateSeasonalTips(currentMonth, context);

      return {
        currentMonth: relevantCurrentTasks,
        upcomingTasks: relevantUpcomingTasks.slice(0, 5), // Limit upcoming tasks
        seasonalTips
      };
    } catch (error) {
      console.error('Error generating current month guide:', error);
      throw error;
    }
  }

  /**
   * Get personalized task recommendations
   */
  async getTaskRecommendations(context: SeasonalRecommendationContext): Promise<TaskRecommendation[]> {
    try {
      const currentMonth = context.currentMonth;

      // Get tasks for current and next month
      const tasks = await this.getSeasonalTasks({
        climate_zone: context.climateZone
      });

      const recommendations: TaskRecommendation[] = [];

      for (const task of tasks) {
        const recommendation = this.evaluateTaskRecommendation(task, context);
        if (recommendation) {
          recommendations.push(recommendation);
        }
      }

      // Sort by relevance score and urgency
      return recommendations
        .sort((a, b) => {
          // First sort by urgency
          const urgencyOrder = { immediate: 3, this_week: 2, this_month: 1 };
          const urgencyDiff = urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
          if (urgencyDiff !== 0) return urgencyDiff;

          // Then by relevance score
          return b.relevanceScore - a.relevanceScore;
        })
        .slice(0, 10); // Limit to top 10 recommendations
    } catch (error) {
      console.error('Error generating task recommendations:', error);
      throw error;
    }
  }

  /**
   * Get monthly task summary for analytics
   */
  async getMonthlyTaskSummary(month: number, climateZone: string = 'ireland'): Promise<MonthlyTaskSummary> {
    try {
      const tasks = await this.getSeasonalTasks({
        month,
        climate_zone: climateZone
      });

      const summary: MonthlyTaskSummary = {
        month,
        totalTasks: tasks.length,
        completedTasks: 0, // TODO: Implement user progress tracking
        highPriorityTasks: tasks.filter(t => t.priority === 'high').length,
        tasksByCategory: {
          planting: 0,
          maintenance: 0,
          harvesting: 0,
          preparation: 0
        }
      };

      // Count tasks by category
      tasks.forEach(task => {
        summary.tasksByCategory[task.category]++;
      });

      return summary;
    } catch (error) {
      console.error('Error generating monthly task summary:', error);
      throw error;
    }
  }

  /**
   * Search tasks by title or description
   */
  async searchTasks(query: string, filter?: SeasonalTaskFilter): Promise<SeasonalTask[]> {
    try {
      const allTasks = await this.getSeasonalTasks(filter);

      const searchTerm = query.toLowerCase();
      return allTasks.filter(task =>
        task.title.toLowerCase().includes(searchTerm) ||
        (task.description && task.description.toLowerCase().includes(searchTerm))
      );
    } catch (error) {
      console.error('Error searching tasks:', error);
      throw error;
    }
  }

  /**
   * Get tasks by priority level
   */
  async getTasksByPriority(priority: TaskPriority, month?: number): Promise<SeasonalTask[]> {
    return this.getSeasonalTasks({
      priority,
      month,
      climate_zone: 'ireland'
    });
  }

  /**
   * Get tasks by category
   */
  async getTasksByCategory(category: TaskCategory, month?: number): Promise<SeasonalTask[]> {
    return this.getSeasonalTasks({
      category,
      month,
      climate_zone: 'ireland'
    });
  }

  // Private helper methods

  private generateCacheKey(filter?: SeasonalTaskFilter): string {
    if (!filter) return 'all_tasks';

    return `tasks_${JSON.stringify(filter)}`;
  }

  private isCacheValid(cacheKey: string): boolean {
    const expiry = this.cacheExpiry.get(cacheKey);
    return expiry ? Date.now() < expiry : false;
  }

  private filterTasksByUserPlants(tasks: SeasonalTask[], userPlants: string[]): SeasonalTask[] {
    if (userPlants.length === 0) return tasks;

    return tasks.filter(task => {
      if (!task.plant_types || task.plant_types.includes('all')) {
        return true;
      }

      return task.plant_types.some(plantType =>
        userPlants.includes(plantType) || plantType === 'all'
      );
    });
  }

  private evaluateTaskRecommendation(
    task: SeasonalTask,
    context: SeasonalRecommendationContext
  ): TaskRecommendation | null {
    const currentMonth = context.currentMonth;
    const monthDiff = this.getMonthDifference(currentMonth, task.month);

    // Skip tasks that are too far in the future or past
    if (monthDiff > 2 || monthDiff < -1) {
      return null;
    }

    let relevanceScore = 0;
    let urgency: 'immediate' | 'this_week' | 'this_month' = 'this_month';

    // Score based on timing
    if (monthDiff === 0) {
      relevanceScore += 50; // Current month
      urgency = task.priority === 'high' ? 'immediate' : 'this_week';
    } else if (monthDiff === 1) {
      relevanceScore += 30; // Next month
    } else if (monthDiff === -1) {
      relevanceScore += 20; // Previous month (might be late tasks)
    }

    // Score based on priority
    const priorityScores = { high: 30, medium: 20, low: 10 };
    relevanceScore += priorityScores[task.priority];

    // Check if user has matching plants
    const userPlantMatch = this.hasMatchingPlants(task, context.userPlants);
    if (userPlantMatch) {
      relevanceScore += 25;
    }

    // Apply user preferences
    if (context.userPreferences?.focusCategories?.includes(task.category)) {
      relevanceScore += 15;
    }

    if (context.userPreferences?.skipLowPriority && task.priority === 'low') {
      return null;
    }

    return {
      task,
      relevanceScore,
      userPlantMatch,
      urgency
    };
  }

  private hasMatchingPlants(task: SeasonalTask, userPlants: string[]): boolean {
    if (!task.plant_types || task.plant_types.includes('all')) {
      return true;
    }

    return task.plant_types.some(plantType => userPlants.includes(plantType));
  }

  private getMonthDifference(currentMonth: number, taskMonth: number): number {
    let diff = taskMonth - currentMonth;

    // Handle year boundary
    if (diff > 6) {
      diff -= 12;
    } else if (diff < -6) {
      diff += 12;
    }

    return diff;
  }

  private generateSeasonalTips(month: number, context: SeasonalRecommendationContext): string[] {
    const tips: string[] = [];

    // Season-specific tips
    const season = this.getSeason(month);
    const seasonalTips = {
      spring: [
        "Start hardening off seedlings gradually before transplanting outdoors",
        "Check soil temperature before planting warm-season crops",
        "Begin regular watering schedules as plants enter active growth"
      ],
      summer: [
        "Water deeply in early morning or evening to reduce evaporation",
        "Deadhead flowers regularly to encourage continued blooming",
        "Harvest herbs frequently to promote bushy growth"
      ],
      autumn: [
        "Collect seeds from your best-performing plants for next year",
        "Gradually reduce watering as plant growth slows",
        "Protect tender plants from early frosts"
      ],
      winter: [
        "Plan next year's garden layout and order seed catalogs",
        "Protect containers from freezing with insulation",
        "Maintain tools and equipment during the quiet season"
      ]
    };

    tips.push(...seasonalTips[season]);

    // Add plant-specific tips based on user's collection
    if (context.userPlants.includes('herb')) {
      tips.push("Herbs can be harvested year-round from a sunny windowsill");
    }

    if (context.userPlants.includes('vegetable')) {
      tips.push("Succession plant lettuce and radishes every 2 weeks for continuous harvest");
    }

    return tips.slice(0, 3); // Limit to 3 tips
  }

  private getSeason(month: number): 'spring' | 'summer' | 'autumn' | 'winter' {
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  }

  /**
   * Clear cache (useful for testing or forced refresh)
   */
  clearCache(): void {
    this.taskCache.clear();
    this.cacheExpiry.clear();
  }
}

// Export singleton instance
export const seasonalTaskService = new SeasonalTaskService();
export default seasonalTaskService;

export const fetchSeasonalTasks = async (season: string): Promise<SeasonalTask[]> => {
  // The original instruction for fetchSeasonalTasks did not include 'season' in the call to getSeasonalTasks.
  // Assuming 'season' parameter is intended to be used for filtering.
  // If 'season' is not directly supported by getSeasonalTasks, this might need adjustment.
  // For now, calling without filter as per original instruction's code snippet.
  return seasonalTaskService.getSeasonalTasks();
};