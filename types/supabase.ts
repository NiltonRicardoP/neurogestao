export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      appointments: {
        Row: {
          id: string
          patient_id: string
          date: string
          status: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          date: string
          status: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          date?: string
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      assessment_fields: {
        Row: {
          id: string
          section_id: string
          label: string
          type: string
          required: boolean
          options: Json | null
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          section_id: string
          label: string
          type: string
          required?: boolean
          options?: Json | null
          order_index: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          section_id?: string
          label?: string
          type?: string
          required?: boolean
          options?: Json | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      assessment_models: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      assessment_results: {
        Row: {
          id: string
          assessment_id: string
          field_id: string
          value: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          assessment_id: string
          field_id: string
          value?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          assessment_id?: string
          field_id?: string
          value?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      assessment_sections: {
        Row: {
          id: string
          model_id: string
          title: string
          description: string | null
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          model_id: string
          title: string
          description?: string | null
          order_index: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          model_id?: string
          title?: string
          description?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      assessments: {
        Row: {
          id: string
          patient_id: string
          title: string
          date: string
          status: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          title: string
          date: string
          status: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          title?: string
          date?: string
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string | null
          related_entity_type: string | null
          related_entity_id: string | null
          scheduled_for: string | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message?: string | null
          related_entity_type?: string | null
          related_entity_id?: string | null
          scheduled_for?: string | null
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string | null
          related_entity_type?: string | null
          related_entity_id?: string | null
          scheduled_for?: string | null
          read?: boolean
          created_at?: string
        }
      }
      patients: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          birth_date: string | null
          gender: string | null
          address: string | null
          medical_history: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          birth_date?: string | null
          gender?: string | null
          address?: string | null
          medical_history?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          birth_date?: string | null
          gender?: string | null
          address?: string | null
          medical_history?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          patient_id: string
          title: string
          content: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          title: string
          content?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          title?: string
          content?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          key: string
          value: Json | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value?: Json | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: Json | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          theme: string | null
          language: string | null
          notifications_enabled: boolean | null
          email_notifications_enabled: boolean | null
          preferences: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          theme?: string | null
          language?: string | null
          notifications_enabled?: boolean | null
          email_notifications_enabled?: boolean | null
          preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          theme?: string | null
          language?: string | null
          notifications_enabled?: boolean | null
          email_notifications_enabled?: boolean | null
          preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          role: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          role?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          role?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
