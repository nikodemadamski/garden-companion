"use client";

import React, { useState } from 'react';
import { SeasonalTask, TaskCategory, TaskPriority } from '@/types/seasonal';
import { 
  getPriorityColor, 
  getCategoryIcon, 
  getCategoryColor,
  formatTaskDescription,
  groupTasksByCategory,
  sortTasksByImportance
} from '@/utils/seasonalUtils';

interface MonthlyTaskListProps {
  title: string;
  tasks: SeasonalTask[];
  priority: 'current' | 'upcoming';
}

export default function MonthlyTaskList({ title, tasks, priority }: MonthlyTaskListProps) {
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority | 'all'>('all');
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  // Filter and sort tasks
  const filteredTasks = tasks.filter(task => {
    const categoryMatch = selectedCategory === 'all' || task.category === selectedCategory;
    const priorityMatch = selectedPriority === 'all' || task.priority === selectedPriority;
    return categoryMatch && priorityMatch;
  });

  const sortedTasks = sortTasksByImportance(filteredTasks);
  const groupedTasks = groupTasksByCategory(sortedTasks);

  const toggleTaskExpansion = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const getTaskCardStyle = (task: SeasonalTask) => ({
    padding: '1rem',
    marginBottom: '0.75rem',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 'var(--radius-sm)',
    borderLeft: `4px solid ${getPriorityColor(task.priority)}`,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      transform: 'translateY(-1px)'
    }
  });

  const categories: (TaskCategory | 'all')[] = ['all', 'planting', 'maintenance', 'harvesting', 'preparation'];
  const priorities: (TaskPriority | 'all')[] = ['all', 'high', 'medium', 'low'];

  if (tasks.length === 0) {
    return null;
  }

  return (
    <div className="glass-panel animate-fade-in" style={{
      padding: '1.5rem',
      background: priority === 'current' 
        ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.05), rgba(255, 255, 255, 0.95))'
        : 'linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(255, 255, 255, 0.95))'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ 
          fontSize: '1.3rem', 
          fontWeight: 600, 
          marginBottom: '0.5rem',
          color: 'var(--color-primary-dark)'
        }}>
          {title}
        </h3>
        <p style={{ 
          color: 'var(--color-text-light)', 
          fontSize: '0.9rem' 
        }}>
          {tasks.length} task{tasks.length !== 1 ? 's' : ''} • 
          {tasks.filter(t => t.priority === 'high').length} high priority
        </p>
      </div>

      {/* Filters */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '1.5rem',
        flexWrap: 'wrap'
      }}>
        {/* Category Filter */}
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '0.8rem', 
            fontWeight: 600, 
            marginBottom: '0.25rem',
            color: 'var(--color-text-light)'
          }}>
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as TaskCategory | 'all')}
            style={{
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(0,0,0,0.1)',
              backgroundColor: 'white',
              fontSize: '0.9rem'
            }}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : 
                 `${getCategoryIcon(category as TaskCategory)} ${category.charAt(0).toUpperCase() + category.slice(1)}`}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '0.8rem', 
            fontWeight: 600, 
            marginBottom: '0.25rem',
            color: 'var(--color-text-light)'
          }}>
            Priority
          </label>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value as TaskPriority | 'all')}
            style={{
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(0,0,0,0.1)',
              backgroundColor: 'white',
              fontSize: '0.9rem'
            }}
          >
            {priorities.map(priority => (
              <option key={priority} value={priority}>
                {priority === 'all' ? 'All Priorities' : 
                 priority.charAt(0).toUpperCase() + priority.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Task List */}
      {selectedCategory === 'all' ? (
        // Show grouped by category
        <div>
          {Object.entries(groupedTasks).map(([category, categoryTasks]) => {
            if (categoryTasks.length === 0) return null;
            
            return (
              <div key={category} style={{ marginBottom: '1.5rem' }}>
                <h4 style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  marginBottom: '0.75rem',
                  color: getCategoryColor(category as TaskCategory)
                }}>
                  {getCategoryIcon(category as TaskCategory)}
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                  <span style={{ 
                    fontSize: '0.8rem', 
                    fontWeight: 400, 
                    color: 'var(--color-text-light)' 
                  }}>
                    ({categoryTasks.length})
                  </span>
                </h4>
                
                {categoryTasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    isExpanded={expandedTasks.has(task.id)}
                    onToggle={() => toggleTaskExpansion(task.id)}
                  />
                ))}
              </div>
            );
          })}
        </div>
      ) : (
        // Show flat list
        <div>
          {sortedTasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              isExpanded={expandedTasks.has(task.id)}
              onToggle={() => toggleTaskExpansion(task.id)}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredTasks.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          color: 'var(--color-text-light)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
          <p>No tasks match your current filters.</p>
        </div>
      )}
    </div>
  );
}

interface TaskCardProps {
  task: SeasonalTask;
  isExpanded: boolean;
  onToggle: () => void;
}

function TaskCard({ task, isExpanded, onToggle }: TaskCardProps) {
  return (
    <div
      onClick={onToggle}
      style={{
        padding: '1rem',
        marginBottom: '0.75rem',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 'var(--radius-sm)',
        borderLeft: `4px solid ${getPriorityColor(task.priority)}`,
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Task Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: isExpanded ? '0.75rem' : '0'
      }}>
        <div style={{ flex: 1 }}>
          <h5 style={{ 
            fontSize: '1rem', 
            fontWeight: 600, 
            marginBottom: '0.25rem',
            color: 'var(--color-primary-dark)'
          }}>
            {task.title}
          </h5>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            fontSize: '0.8rem',
            color: 'var(--color-text-light)'
          }}>
            <span style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.25rem' 
            }}>
              {getCategoryIcon(task.category)}
              {task.category}
            </span>
            
            <span style={{ 
              padding: '0.2rem 0.5rem',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: getPriorityColor(task.priority),
              color: 'white',
              fontSize: '0.7rem',
              fontWeight: 600,
              textTransform: 'uppercase'
            }}>
              {task.priority}
            </span>
            
            {task.plant_types && task.plant_types.length > 0 && !task.plant_types.includes('all') && (
              <span>
                🌱 {task.plant_types.join(', ')}
              </span>
            )}
          </div>
        </div>
        
        <div style={{ 
          fontSize: '0.8rem', 
          color: 'var(--color-text-light)',
          marginLeft: '1rem'
        }}>
          {isExpanded ? '▼' : '▶'}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && task.description && (
        <div style={{
          padding: '0.75rem',
          backgroundColor: 'rgba(0, 0, 0, 0.02)',
          borderRadius: 'var(--radius-xs)',
          fontSize: '0.9rem',
          lineHeight: 1.5
        }}>
          {formatTaskDescription(task)}
        </div>
      )}
    </div>
  );
}