export interface WeatherAlert {
  id: string;
  userId?: string;
  alertType: 'wind' | 'rain' | 'storm' | 'temperature';
  severity: 'yellow' | 'orange' | 'red';
  startTime: string;
  endTime?: string;
  description: string;
  actionsTaken?: string[];
  createdAt: string;
}

export interface PlantProtectionAction {
  action: string;
  urgency: 'immediate' | 'within_hours' | 'prepare';
  plantTypes: string[];
  instructions: string[];
}

export interface WeatherAlertResponse {
  alerts: WeatherAlert[];
  lastUpdated: string;
}

export interface MetOfficeAlert {
  id: string;
  type: string;
  severity: number;
  title: string;
  description: string;
  issued: string;
  onset?: string;
  expires?: string;
  areas: string[];
}

export interface ProcessedAlert {
  alert: WeatherAlert;
  protectionActions: PlantProtectionAction[];
  emergencyChecklist?: EmergencyChecklist;
  estimatedTime?: string;
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