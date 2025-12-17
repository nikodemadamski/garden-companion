// Utility functions for seasonal task management
// Helper functions for date calculations, task prioritization, and seasonal logic

import { SeasonalTask, TaskPriority, TaskCategory } from '@/types/seasonal';

/**
 * Get the current month (1-12)
 */
export function getCurrentMonth(): number {
  return new Date().getMonth() + 1;
}

/**
 * Get month name from number
 */
export function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1] || 'Unknown';
}

/**
 * Get season from month
 */
export function getSeason(month: number): 'Spring' | 'Summer' | 'Autumn' | 'Winter' {
  if (month >= 3 && month <= 5) return 'Spring';
  if (month >= 6 && month <= 8) return 'Summer';
  if (month >= 9 && month <= 11) return 'Autumn';
  return 'Winter';
}

/**
 * Get season emoji
 */
export function getSeasonEmoji(month: number): string {
  const season = getSeason(month);
  const emojis = {
    Spring: '🌱',
    Summer: '☀️',
    Autumn: '🍂',
    Winter: '❄️'
  };
  return emojis[season];
}

/**
 * Calculate days until a specific month
 */
export function getDaysUntilMonth(targetMonth: number): number {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  let targetYear = currentYear;
  if (targetMonth < currentMonth) {
    targetYear = currentYear + 1;
  }
  
  const targetDate = new Date(targetYear, targetMonth - 1, 1);
  const diffTime = targetDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if a task is urgent based on current date and task timing
 */
export function isTaskUrgent(task: SeasonalTask): boolean {
  const currentMonth = getCurrentMonth();
  const daysUntilTask = getDaysUntilMonth(task.month);
  
  // Task is urgent if it's current month and high priority
  if (task.month === currentMonth && task.priority === 'high') {
    return true;
  }
  
  // Task is urgent if it's next month and high priority
  if (daysUntilTask <= 30 && task.priority === 'high') {
    return true;
  }
  
  return false;
}

/**
 * Get priority color for UI display
 */
export function getPriorityColor(priority: TaskPriority): string {
  const colors = {
    high: '#ef4444', // red-500
    medium: '#f59e0b', // amber-500
    low: '#10b981' // emerald-500
  };
  return colors[priority];
}

/**
 * Get category icon for UI display
 */
export function getCategoryIcon(category: TaskCategory): string {
  const icons = {
    planting: '🌱',
    maintenance: '🔧',
    harvesting: '🌾',
    preparation: '📋'
  };
  return icons[category];
}

/**
 * Get category color for UI display
 */
export function getCategoryColor(category: TaskCategory): string {
  const colors = {
    planting: '#22c55e', // green-500
    maintenance: '#3b82f6', // blue-500
    harvesting: '#f59e0b', // amber-500
    preparation: '#8b5cf6' // violet-500
  };
  return colors[category];
}

/**
 * Sort tasks by priority and timing
 */
export function sortTasksByImportance(tasks: SeasonalTask[]): SeasonalTask[] {
  const currentMonth = getCurrentMonth();
  
  return [...tasks].sort((a, b) => {
    // First, sort by urgency
    const aUrgent = isTaskUrgent(a);
    const bUrgent = isTaskUrgent(b);
    if (aUrgent && !bUrgent) return -1;
    if (!aUrgent && bUrgent) return 1;
    
    // Then by current month relevance
    const aCurrentMonth = a.month === currentMonth;
    const bCurrentMonth = b.month === currentMonth;
    if (aCurrentMonth && !bCurrentMonth) return -1;
    if (!aCurrentMonth && bCurrentMonth) return 1;
    
    // Then by priority
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    // Finally by month order
    return a.month - b.month;
  });
}

/**
 * Filter tasks by plant types that user has
 */
export function filterTasksByPlantTypes(tasks: SeasonalTask[], userPlantTypes: string[]): SeasonalTask[] {
  if (userPlantTypes.length === 0) return tasks;
  
  return tasks.filter(task => {
    if (!task.plant_types || task.plant_types.includes('all')) {
      return true;
    }
    
    return task.plant_types.some(plantType => 
      userPlantTypes.includes(plantType) || plantType === 'all'
    );
  });
}

/**
 * Group tasks by category
 */
export function groupTasksByCategory(tasks: SeasonalTask[]): Record<TaskCategory, SeasonalTask[]> {
  const grouped: Record<TaskCategory, SeasonalTask[]> = {
    planting: [],
    maintenance: [],
    harvesting: [],
    preparation: []
  };
  
  tasks.forEach(task => {
    grouped[task.category].push(task);
  });
  
  return grouped;
}

/**
 * Group tasks by month
 */
export function groupTasksByMonth(tasks: SeasonalTask[]): Record<number, SeasonalTask[]> {
  const grouped: Record<number, SeasonalTask[]> = {};
  
  tasks.forEach(task => {
    if (!grouped[task.month]) {
      grouped[task.month] = [];
    }
    grouped[task.month].push(task);
  });
  
  return grouped;
}

/**
 * Get next month number
 */
export function getNextMonth(currentMonth: number): number {
  return currentMonth === 12 ? 1 : currentMonth + 1;
}

/**
 * Get previous month number
 */
export function getPreviousMonth(currentMonth: number): number {
  return currentMonth === 1 ? 12 : currentMonth - 1;
}

/**
 * Check if it's the right time for a task (within reasonable window)
 */
export function isTaskTimely(task: SeasonalTask, currentMonth: number): boolean {
  // Task is timely if it's current month, previous month (late), or next month (early prep)
  const monthDiff = getMonthDifference(currentMonth, task.month);
  return monthDiff >= -1 && monthDiff <= 1;
}

/**
 * Calculate month difference handling year boundaries
 */
export function getMonthDifference(currentMonth: number, taskMonth: number): number {
  let diff = taskMonth - currentMonth;
  
  // Handle year boundary
  if (diff > 6) {
    diff -= 12;
  } else if (diff < -6) {
    diff += 12;
  }
  
  return diff;
}

/**
 * Generate task summary text
 */
export function generateTaskSummary(tasks: SeasonalTask[]): string {
  const totalTasks = tasks.length;
  const highPriorityTasks = tasks.filter(t => t.priority === 'high').length;
  const categories = groupTasksByCategory(tasks);
  
  const categoryNames = Object.keys(categories).filter(
    category => categories[category as TaskCategory].length > 0
  );
  
  if (totalTasks === 0) {
    return 'No tasks scheduled for this period.';
  }
  
  let summary = `${totalTasks} task${totalTasks > 1 ? 's' : ''}`;
  
  if (highPriorityTasks > 0) {
    summary += `, ${highPriorityTasks} high priority`;
  }
  
  if (categoryNames.length > 0) {
    summary += ` covering ${categoryNames.join(', ')}`;
  }
  
  return summary + '.';
}

/**
 * Format task description for display
 */
export function formatTaskDescription(task: SeasonalTask): string {
  if (!task.description) return '';
  
  // Capitalize first letter and ensure proper punctuation
  let description = task.description.trim();
  if (description.length > 0) {
    description = description.charAt(0).toUpperCase() + description.slice(1);
    if (!description.endsWith('.') && !description.endsWith('!') && !description.endsWith('?')) {
      description += '.';
    }
  }
  
  return description;
}