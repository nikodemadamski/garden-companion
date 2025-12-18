// Task Progress Tracking Service
// Handles user task completion tracking, progress analytics, and persistence

import { supabase } from '@/lib/supabaseClient';
import { SeasonalTask } from '@/types/seasonal';
import { User } from '@supabase/supabase-js';

export interface TaskProgress {
  id: string;
  user_id: string;
  task_id: string;
  completed: boolean;
  completed_date: string | null;
  notes: string | null;
  created_at: string;
}

export interface TaskProgressStats {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
  tasksThisMonth: number;
  completedThisMonth: number;
}

export interface TaskProgressSummary {
  daily: { date: string; completed: number; total: number }[];
  weekly: { week: string; completed: number; total: number }[];
  monthly: { month: string; completed: number; total: number }[];
  byCategory: Record<string, { completed: number; total: number }>;
  byPriority: Record<string, { completed: number; total: number }>;
}

class TaskProgressService {
  private progressCache: Map<string, TaskProgress[]> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

  /**
   * Mark a task as completed
   */
  async completeTask(taskId: string, notes?: string): Promise<TaskProgress | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser() as { data: { user: User | null } };
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if task is already completed
      const existing = await this.getTaskProgress(taskId);
      if (existing && existing.completed) {
        return existing;
      }

      const progressData = {
        user_id: user.id,
        task_id: taskId,
        completed: true,
        completed_date: new Date().toISOString(),
        notes: notes || null
      };

      if (existing) {
        // Update existing record
        const { data, error } = await (supabase
          .from('task_progress') as any)
          .update(progressData)
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;

        this.clearUserCache(user.id);
        return data;
      } else {
        // Create new record
        const { data, error } = await (supabase
          .from('task_progress') as any)
          .insert(progressData)
          .select()
          .single();

        if (error) throw error;

        this.clearUserCache(user.id);
        return data;
      }
    } catch (error) {
      console.error('Error completing task:', error);
      throw error;
    }
  }

  /**
   * Mark a task as incomplete
   */
  async uncompleteTask(taskId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser() as { data: { user: User | null } };
      if (!user) {
        throw new Error('User not authenticated');
      }

      const existing = await this.getTaskProgress(taskId);
      if (!existing) {
        return;
      }

      const { error } = await (supabase
        .from('task_progress') as any)
        .update({
          completed: false,
          completed_date: null
        })
        .eq('id', existing.id);

      if (error) throw error;

      this.clearUserCache(user.id);
    } catch (error) {
      console.error('Error uncompleting task:', error);
      throw error;
    }
  }

  /**
   * Get progress for a specific task
   */
  async getTaskProgress(taskId: string): Promise<TaskProgress | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser() as { data: { user: User | null } };
      if (!user) {
        return null;
      }

      const { data, error } = await (supabase
        .from('task_progress') as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('task_id', taskId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting task progress:', error);
      return null;
    }
  }

  /**
   * Get all task progress for current user
   */
  async getUserTaskProgress(): Promise<TaskProgress[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser() as { data: { user: User | null } };
      if (!user) {
        return [];
      }

      // Check cache first
      const cacheKey = `user_progress_${user.id}`;
      if (this.isCacheValid(cacheKey)) {
        return this.progressCache.get(cacheKey) || [];
      }

      const { data, error } = await (supabase
        .from('task_progress') as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const progress = data || [];

      // Cache the results
      this.progressCache.set(cacheKey, progress);
      this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_DURATION);

      return progress;
    } catch (error) {
      console.error('Error getting user task progress:', error);
      return [];
    }
  }

  /**
   * Get completed task IDs for current user
   */
  async getCompletedTaskIds(): Promise<string[]> {
    try {
      const progress = await this.getUserTaskProgress();
      return progress
        .filter(p => p.completed)
        .map(p => p.task_id);
    } catch (error) {
      console.error('Error getting completed task IDs:', error);
      return [];
    }
  }

  /**
   * Get task progress statistics
   */
  async getTaskProgressStats(): Promise<TaskProgressStats> {
    try {
      const progress = await this.getUserTaskProgress();
      const completed = progress.filter(p => p.completed);

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const thisMonth = progress.filter(p => {
        const date = new Date(p.created_at);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      });

      const completedThisMonth = thisMonth.filter(p => p.completed);

      // Calculate streaks
      const streaks = this.calculateStreaks(completed);

      return {
        totalTasks: progress.length,
        completedTasks: completed.length,
        completionRate: progress.length > 0 ? (completed.length / progress.length) * 100 : 0,
        currentStreak: streaks.current,
        longestStreak: streaks.longest,
        tasksThisMonth: thisMonth.length,
        completedThisMonth: completedThisMonth.length
      };
    } catch (error) {
      console.error('Error getting task progress stats:', error);
      return {
        totalTasks: 0,
        completedTasks: 0,
        completionRate: 0,
        currentStreak: 0,
        longestStreak: 0,
        tasksThisMonth: 0,
        completedThisMonth: 0
      };
    }
  }

  /**
   * Get detailed progress summary with breakdowns
   */
  async getTaskProgressSummary(tasks: SeasonalTask[]): Promise<TaskProgressSummary> {
    try {
      const progress = await this.getUserTaskProgress();
      const taskMap = new Map(tasks.map(t => [t.id, t]));

      // Daily breakdown (last 30 days)
      const daily = this.generateDailyBreakdown(progress, taskMap, 30);

      // Weekly breakdown (last 12 weeks)
      const weekly = this.generateWeeklyBreakdown(progress, taskMap, 12);

      // Monthly breakdown (last 12 months)
      const monthly = this.generateMonthlyBreakdown(progress, taskMap, 12);

      // Category breakdown
      const byCategory = this.generateCategoryBreakdown(progress, taskMap);

      // Priority breakdown
      const byPriority = this.generatePriorityBreakdown(progress, taskMap);

      return {
        daily,
        weekly,
        monthly,
        byCategory,
        byPriority
      };
    } catch (error) {
      console.error('Error getting task progress summary:', error);
      return {
        daily: [],
        weekly: [],
        monthly: [],
        byCategory: {},
        byPriority: {}
      };
    }
  }

  /**
   * Add notes to a task progress record
   */
  async addTaskNotes(taskId: string, notes: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser() as { data: { user: User | null } };
      if (!user) {
        throw new Error('User not authenticated');
      }

      const existing = await this.getTaskProgress(taskId);
      if (!existing) {
        throw new Error('Task progress not found');
      }

      const { error } = await (supabase
        .from('task_progress') as any)
        .update({ notes })
        .eq('id', existing.id);

      if (error) throw error;

      this.clearUserCache(user.id);
    } catch (error) {
      console.error('Error adding task notes:', error);
      throw error;
    }
  }

  /**
   * Delete task progress record
   */
  async deleteTaskProgress(taskId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser() as { data: { user: User | null } };
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await (supabase
        .from('task_progress') as any)
        .delete()
        .eq('user_id', user.id)
        .eq('task_id', taskId);

      if (error) throw error;

      this.clearUserCache(user.id);
    } catch (error) {
      console.error('Error deleting task progress:', error);
      throw error;
    }
  }

  // Private helper methods

  private isCacheValid(cacheKey: string): boolean {
    const expiry = this.cacheExpiry.get(cacheKey);
    return expiry ? Date.now() < expiry : false;
  }

  private clearUserCache(userId: string): void {
    const cacheKey = `user_progress_${userId}`;
    this.progressCache.delete(cacheKey);
    this.cacheExpiry.delete(cacheKey);
  }

  private calculateStreaks(completedTasks: TaskProgress[]): { current: number; longest: number } {
    if (completedTasks.length === 0) {
      return { current: 0, longest: 0 };
    }

    // Sort by completion date
    const sorted = completedTasks
      .filter(t => t.completed_date)
      .sort((a, b) => new Date(b.completed_date!).getTime() - new Date(a.completed_date!).getTime());

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate: Date | null = null;

    for (const task of sorted) {
      const taskDate = new Date(task.completed_date!);
      const daysDiff = lastDate ? Math.floor((lastDate.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;

      if (lastDate === null || daysDiff <= 1) {
        tempStreak++;
        if (lastDate === null) {
          currentStreak = tempStreak;
        }
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
        currentStreak = 0; // Reset current streak if gap found
      }

      lastDate = taskDate;
    }

    longestStreak = Math.max(longestStreak, tempStreak);
    return { current: currentStreak, longest: longestStreak };
  }

  private generateDailyBreakdown(
    progress: TaskProgress[],
    taskMap: Map<string, SeasonalTask>,
    days: number
  ): { date: string; completed: number; total: number }[] {
    const result = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayProgress = progress.filter(p => {
        const progressDate = new Date(p.created_at).toISOString().split('T')[0];
        return progressDate === dateStr;
      });

      result.unshift({
        date: dateStr,
        completed: dayProgress.filter(p => p.completed).length,
        total: dayProgress.length
      });
    }

    return result;
  }

  private generateWeeklyBreakdown(
    progress: TaskProgress[],
    taskMap: Map<string, SeasonalTask>,
    weeks: number
  ): { week: string; completed: number; total: number }[] {
    const result = [];
    const today = new Date();

    for (let i = 0; i < weeks; i++) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (today.getDay() + 7 * i));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const weekProgress = progress.filter(p => {
        const progressDate = new Date(p.created_at);
        return progressDate >= weekStart && progressDate <= weekEnd;
      });

      result.unshift({
        week: `${weekStart.toISOString().split('T')[0]} - ${weekEnd.toISOString().split('T')[0]}`,
        completed: weekProgress.filter(p => p.completed).length,
        total: weekProgress.length
      });
    }

    return result;
  }

  private generateMonthlyBreakdown(
    progress: TaskProgress[],
    taskMap: Map<string, SeasonalTask>,
    months: number
  ): { month: string; completed: number; total: number }[] {
    const result = [];
    const today = new Date();

    for (let i = 0; i < months; i++) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthStr = month.toISOString().slice(0, 7); // YYYY-MM

      const monthProgress = progress.filter(p => {
        const progressMonth = new Date(p.created_at).toISOString().slice(0, 7);
        return progressMonth === monthStr;
      });

      result.unshift({
        month: monthStr,
        completed: monthProgress.filter(p => p.completed).length,
        total: monthProgress.length
      });
    }

    return result;
  }

  private generateCategoryBreakdown(
    progress: TaskProgress[],
    taskMap: Map<string, SeasonalTask>
  ): Record<string, { completed: number; total: number }> {
    const breakdown: Record<string, { completed: number; total: number }> = {};

    progress.forEach(p => {
      const task = taskMap.get(p.task_id);
      if (task) {
        const category = task.category;
        if (!breakdown[category]) {
          breakdown[category] = { completed: 0, total: 0 };
        }
        breakdown[category].total++;
        if (p.completed) {
          breakdown[category].completed++;
        }
      }
    });

    return breakdown;
  }

  private generatePriorityBreakdown(
    progress: TaskProgress[],
    taskMap: Map<string, SeasonalTask>
  ): Record<string, { completed: number; total: number }> {
    const breakdown: Record<string, { completed: number; total: number }> = {};

    progress.forEach(p => {
      const task = taskMap.get(p.task_id);
      if (task) {
        const priority = task.priority;
        if (!breakdown[priority]) {
          breakdown[priority] = { completed: 0, total: 0 };
        }
        breakdown[priority].total++;
        if (p.completed) {
          breakdown[priority].completed++;
        }
      }
    });

    return breakdown;
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.progressCache.clear();
    this.cacheExpiry.clear();
  }
}

// Export singleton instance
export const taskProgressService = new TaskProgressService();
export default taskProgressService;