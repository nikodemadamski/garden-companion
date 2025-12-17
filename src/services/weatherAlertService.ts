import { supabase } from '../lib/supabaseClient';
import { WeatherAlert, MetOfficeAlert, ProcessedAlert, PlantProtectionAction } from '../types/weather';
import { PlantProtectionService } from './plantProtectionService';
import { Plant } from '../types/plant';
import { Database } from '../types/database';

export class WeatherAlertService {
  private static readonly MET_OFFICE_API_BASE = 'https://api.met.ie/v1';
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private static alertCache: { data: WeatherAlert[]; timestamp: number } | null = null;

  /**
   * Fetch current weather alerts from Irish Met Office
   */
  static async fetchCurrentAlerts(): Promise<WeatherAlert[]> {
    try {
      // Check cache first
      if (this.alertCache && Date.now() - this.alertCache.timestamp < this.CACHE_DURATION) {
        return this.alertCache.data;
      }

      // For now, we'll simulate Met Office API calls since the actual API requires authentication
      // In production, this would call the real Met Office API
      const mockAlerts = await this.getMockMetOfficeAlerts();
      const processedAlerts = mockAlerts.map(alert => this.processMetOfficeAlert(alert));

      // Cache the results
      this.alertCache = {
        data: processedAlerts,
        timestamp: Date.now()
      };

      return processedAlerts;
    } catch (error) {
      console.error('Failed to fetch weather alerts:', error);
      return [];
    }
  }

  /**
   * Process Met Office alert data into our format
   */
  private static processMetOfficeAlert(metAlert: MetOfficeAlert): WeatherAlert {
    const alertType = this.mapAlertType(metAlert.type);
    const severity = this.mapSeverity(metAlert.severity);

    return {
      id: metAlert.id,
      alertType,
      severity,
      startTime: metAlert.onset || metAlert.issued,
      endTime: metAlert.expires,
      description: metAlert.description,
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Map Met Office alert types to our system
   */
  private static mapAlertType(metType: string): 'wind' | 'rain' | 'storm' | 'temperature' {
    const type = metType.toLowerCase();
    if (type.includes('wind') || type.includes('gale')) return 'wind';
    if (type.includes('rain') || type.includes('flood')) return 'rain';
    if (type.includes('storm') || type.includes('thunder')) return 'storm';
    if (type.includes('temperature') || type.includes('frost') || type.includes('ice')) return 'temperature';
    return 'storm'; // default
  }

  /**
   * Map Met Office severity levels to our color system
   */
  private static mapSeverity(severity: number): 'yellow' | 'orange' | 'red' {
    if (severity >= 3) return 'red';
    if (severity >= 2) return 'orange';
    return 'yellow';
  }

  /**
   * Get plant protection recommendations for an alert
   */
  static getProtectionRecommendations(alert: WeatherAlert, userPlants?: Plant[]): PlantProtectionAction[] {
    // Use the comprehensive PlantProtectionService for recommendations
    const strategies = PlantProtectionService.getProtectionStrategies(
      alert.alertType,
      alert.severity,
      userPlants
    );

    const actions: PlantProtectionAction[] = [];
    strategies.forEach(strategy => {
      actions.push(...strategy.actions);
    });

    // Return prioritized actions
    return PlantProtectionService.getPriorityOrder(actions);
  }

  /**
   * Get emergency checklist for severe weather
   */
  static getEmergencyChecklist(alert: WeatherAlert) {
    return PlantProtectionService.getEmergencyChecklist(alert.alertType, alert.severity);
  }

  /**
   * Get estimated time to complete protection actions
   */
  static getEstimatedProtectionTime(alert: WeatherAlert, plantCount: number): string {
    return PlantProtectionService.getEstimatedProtectionTime(
      alert.alertType,
      alert.severity,
      plantCount
    );
  }



  /**
   * Save alert to database for user
   */
  static async saveUserAlert(userId: string, alert: WeatherAlert): Promise<void> {
    try {
      const insertData: Database['public']['Tables']['weather_alerts']['Insert'] = {
        user_id: userId,
        alert_type: alert.alertType,
        severity: alert.severity,
        start_time: alert.startTime,
        end_time: alert.endTime || null,
        description: alert.description || null,
        actions_taken: alert.actionsTaken || null
      };

      const { error } = await (supabase as any)
        .from('weather_alerts')
        .insert(insertData);

      if (error) {
        console.error('Failed to save weather alert:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error saving weather alert:', error);
      throw error;
    }
  }

  /**
   * Get user's alert history
   */
  static async getUserAlertHistory(userId: string, limit: number = 10): Promise<WeatherAlert[]> {
    try {
      const { data, error } = await supabase
        .from('weather_alerts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Failed to fetch alert history:', error);
        return [];
      }

      const alerts: Database['public']['Tables']['weather_alerts']['Row'][] = data || [];
      
      return alerts.map(row => ({
        id: row.id,
        userId: row.user_id,
        alertType: row.alert_type,
        severity: row.severity,
        startTime: row.start_time,
        endTime: row.end_time || undefined,
        description: row.description || '',
        actionsTaken: row.actions_taken || undefined,
        createdAt: row.created_at
      }));
    } catch (error) {
      console.error('Error fetching alert history:', error);
      return [];
    }
  }

  /**
   * Update actions taken for an alert
   */
  static async updateAlertActions(alertId: string, actions: string[]): Promise<void> {
    try {
      const updateData: Database['public']['Tables']['weather_alerts']['Update'] = {
        actions_taken: actions.length > 0 ? actions : null
      };

      const { error } = await (supabase as any)
        .from('weather_alerts')
        .update(updateData)
        .eq('id', alertId);

      if (error) {
        console.error('Failed to update alert actions:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error updating alert actions:', error);
      throw error;
    }
  }

  /**
   * Mock Met Office alerts for development/testing
   * In production, this would be replaced with actual API calls
   */
  private static async getMockMetOfficeAlerts(): Promise<MetOfficeAlert[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    return [
      {
        id: 'mock-wind-alert-1',
        type: 'Wind',
        severity: 2,
        title: 'Yellow Wind Warning',
        description: 'Strong winds expected across Ireland. Gusts of 60-70 km/h possible.',
        issued: now.toISOString(),
        onset: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        expires: tomorrow.toISOString(),
        areas: ['Ireland']
      }
    ];
  }

  /**
   * Check if there are any active alerts
   */
  static async hasActiveAlerts(): Promise<boolean> {
    const alerts = await this.fetchCurrentAlerts();
    const now = new Date();
    
    return alerts.some(alert => {
      const startTime = new Date(alert.startTime);
      const endTime = alert.endTime ? new Date(alert.endTime) : null;
      
      return startTime <= now && (!endTime || endTime > now);
    });
  }

  /**
   * Get currently active alerts
   */
  static async getActiveAlerts(userPlants?: Plant[], plantCount: number = 0): Promise<ProcessedAlert[]> {
    const alerts = await this.fetchCurrentAlerts();
    const now = new Date();
    
    const activeAlerts = alerts.filter(alert => {
      const startTime = new Date(alert.startTime);
      const endTime = alert.endTime ? new Date(alert.endTime) : null;
      
      return startTime <= now && (!endTime || endTime > now);
    });

    return activeAlerts.map(alert => ({
      alert,
      protectionActions: this.getProtectionRecommendations(alert, userPlants),
      emergencyChecklist: this.getEmergencyChecklist(alert) || undefined,
      estimatedTime: this.getEstimatedProtectionTime(alert, plantCount || userPlants?.length || 5)
    }));
  }
}