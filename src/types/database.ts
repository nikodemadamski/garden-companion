// Database types for Supabase integration
// These types match the database schema for type-safe queries

export interface Database {
  public: {
    Tables: {
      plants: {
        Row: {
          id: string;
          user_id: string;
          created_at: string;
          name: string;
          species: string | null;
          type: 'indoor' | 'outdoor' | null;
          location: string | null;
          water_frequency_days: number | null;
          last_watered_date: string | null;
          image_url: string | null;
          notes: string | null;
          date_added: string | null;
          perenual_id: number | null;
          room: string | null;
          snooze_until: string | null;
          status: string | null;
          nickname: string | null;
          gotcha_date: string | null;
          pot_type: string | null;
          journal: any[] | null;
          // Enhanced fields
          category: 'fruit' | 'vegetable' | 'herb' | 'flower' | null;
          companion_plants: string[] | null;
          seasonal_care: any | null;
          pollinator_friendly: boolean | null;
          harvest_info: any | null;
          common_issues: any | null;
          soil_requirements: any | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          created_at?: string;
          name: string;
          species?: string | null;
          type?: 'indoor' | 'outdoor' | null;
          location?: string | null;
          water_frequency_days?: number | null;
          last_watered_date?: string | null;
          image_url?: string | null;
          notes?: string | null;
          date_added?: string | null;
          perenual_id?: number | null;
          room?: string | null;
          snooze_until?: string | null;
          status?: string | null;
          nickname?: string | null;
          gotcha_date?: string | null;
          pot_type?: string | null;
          journal?: any[] | null;
          // Enhanced fields
          category?: 'fruit' | 'vegetable' | 'herb' | 'flower' | null;
          companion_plants?: string[] | null;
          seasonal_care?: any | null;
          pollinator_friendly?: boolean | null;
          harvest_info?: any | null;
          common_issues?: any | null;
          soil_requirements?: any | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          created_at?: string;
          name?: string;
          species?: string | null;
          type?: 'indoor' | 'outdoor' | null;
          location?: string | null;
          water_frequency_days?: number | null;
          last_watered_date?: string | null;
          image_url?: string | null;
          notes?: string | null;
          date_added?: string | null;
          perenual_id?: number | null;
          room?: string | null;
          snooze_until?: string | null;
          status?: string | null;
          nickname?: string | null;
          gotcha_date?: string | null;
          pot_type?: string | null;
          journal?: any[] | null;
          // Enhanced fields
          category?: 'fruit' | 'vegetable' | 'herb' | 'flower' | null;
          companion_plants?: string[] | null;
          seasonal_care?: any | null;
          pollinator_friendly?: boolean | null;
          harvest_info?: any | null;
          common_issues?: any | null;
          soil_requirements?: any | null;
        };
      };
      seasonal_tasks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          month: number;
          priority: 'high' | 'medium' | 'low';
          category: 'planting' | 'maintenance' | 'harvesting' | 'preparation';
          climate_zone: string | null;
          plant_types: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          month: number;
          priority: 'high' | 'medium' | 'low';
          category: 'planting' | 'maintenance' | 'harvesting' | 'preparation';
          climate_zone?: string | null;
          plant_types?: string[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          month?: number;
          priority?: 'high' | 'medium' | 'low';
          category?: 'planting' | 'maintenance' | 'harvesting' | 'preparation';
          climate_zone?: string | null;
          plant_types?: string[] | null;
          created_at?: string;
        };
      };
      weather_alerts: {
        Row: {
          id: string;
          user_id: string;
          alert_type: 'wind' | 'rain' | 'storm' | 'temperature';
          severity: 'yellow' | 'orange' | 'red';
          start_time: string;
          end_time: string | null;
          description: string | null;
          actions_taken: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          alert_type: 'wind' | 'rain' | 'storm' | 'temperature';
          severity: 'yellow' | 'orange' | 'red';
          start_time: string;
          end_time?: string | null;
          description?: string | null;
          actions_taken?: string[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          alert_type?: 'wind' | 'rain' | 'storm' | 'temperature';
          severity?: 'yellow' | 'orange' | 'red';
          start_time?: string;
          end_time?: string | null;
          description?: string | null;
          actions_taken?: string[] | null;
          created_at?: string;
        };
      };
      plant_diagnostics: {
        Row: {
          id: string;
          plant_id: string;
          symptoms: string[];
          diagnosis: string | null;
          treatment_plan: any | null;
          resolved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          plant_id: string;
          symptoms: string[];
          diagnosis?: string | null;
          treatment_plan?: any | null;
          resolved?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          plant_id?: string;
          symptoms?: string[];
          diagnosis?: string | null;
          treatment_plan?: any | null;
          resolved?: boolean;
          created_at?: string;
        };
      };
      plant_database_enhanced: {
        Row: {
          id: string;
          perenual_id: number | null;
          category: 'fruit' | 'vegetable' | 'herb' | 'flower';
          native_region: string | null;
          companion_plants: string[] | null;
          pollinator_friendly: boolean;
          harvest_info: any | null;
          seasonal_care: any | null;
          common_issues: any | null;
          soil_requirements: any | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          perenual_id?: number | null;
          category: 'fruit' | 'vegetable' | 'herb' | 'flower';
          native_region?: string | null;
          companion_plants?: string[] | null;
          pollinator_friendly?: boolean;
          harvest_info?: any | null;
          seasonal_care?: any | null;
          common_issues?: any | null;
          soil_requirements?: any | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          perenual_id?: number | null;
          category?: 'fruit' | 'vegetable' | 'herb' | 'flower';
          native_region?: string | null;
          companion_plants?: string[] | null;
          pollinator_friendly?: boolean;
          harvest_info?: any | null;
          seasonal_care?: any | null;
          common_issues?: any | null;
          soil_requirements?: any | null;
          updated_at?: string;
        };
      };
      plant_photos: {
        Row: {
          id: string;
          plant_id: string;
          user_id: string;
          url: string;
          thumbnail_url: string | null;
          is_primary: boolean;
          metadata: any | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          plant_id: string;
          user_id: string;
          url: string;
          thumbnail_url?: string | null;
          is_primary?: boolean;
          metadata?: any | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          plant_id?: string;
          user_id?: string;
          url?: string;
          thumbnail_url?: string | null;
          is_primary?: boolean;
          metadata?: any | null;
          created_at?: string;
        };
      };
      user_settings: {
        Row: {
          user_id: string;
          rooms: string[] | null;
          current_garden: string | null;
          last_login_date: string | null;
          login_streak: number | null;
          last_watered_date: string | null;
          watering_streak: number | null;
        };
        Insert: {
          user_id: string;
          rooms?: string[] | null;
          current_garden?: string | null;
          last_login_date?: string | null;
          login_streak?: number | null;
          last_watered_date?: string | null;
          watering_streak?: number | null;
        };
        Update: {
          user_id?: string;
          rooms?: string[] | null;
          current_garden?: string | null;
          last_login_date?: string | null;
          login_streak?: number | null;
          last_watered_date?: string | null;
          watering_streak?: number | null;
        };
      };
    };
  };
}