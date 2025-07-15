export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          sender: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          sender: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sender?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_reactions: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          reaction_type: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_reactions_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      community_events: {
        Row: {
          created_at: string
          created_by: string
          current_participants: number
          description: string | null
          end_time: string
          event_type: string
          group_id: string | null
          id: string
          is_online: boolean
          location: string | null
          max_participants: number | null
          start_time: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          current_participants?: number
          description?: string | null
          end_time: string
          event_type: string
          group_id?: string | null
          id?: string
          is_online?: boolean
          location?: string | null
          max_participants?: number | null
          start_time: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          current_participants?: number
          description?: string | null
          end_time?: string
          event_type?: string
          group_id?: string | null
          id?: string
          is_online?: boolean
          location?: string | null
          max_participants?: number | null
          start_time?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_events_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "community_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      community_groups: {
        Row: {
          created_at: string
          created_by: string
          crop_type: string | null
          description: string | null
          id: string
          is_private: boolean
          member_count: number
          name: string
          region: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          crop_type?: string | null
          description?: string | null
          id?: string
          is_private?: boolean
          member_count?: number
          name: string
          region?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          crop_type?: string | null
          description?: string | null
          id?: string
          is_private?: boolean
          member_count?: number
          name?: string
          region?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          category: string
          comments_count: number | null
          content: string
          created_at: string
          id: string
          images: string[] | null
          is_resolved: boolean | null
          likes_count: number | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          comments_count?: number | null
          content: string
          created_at?: string
          id?: string
          images?: string[] | null
          is_resolved?: boolean | null
          likes_count?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          comments_count?: number | null
          content?: string
          created_at?: string
          id?: string
          images?: string[] | null
          is_resolved?: boolean | null
          likes_count?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      consultation_reviews: {
        Row: {
          consultation_id: string
          created_at: string
          id: string
          is_public: boolean
          rating: number
          review_text: string | null
          reviewer_id: string
        }
        Insert: {
          consultation_id: string
          created_at?: string
          id?: string
          is_public?: boolean
          rating: number
          review_text?: string | null
          reviewer_id: string
        }
        Update: {
          consultation_id?: string
          created_at?: string
          id?: string
          is_public?: boolean
          rating?: number
          review_text?: string | null
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultation_reviews_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "expert_consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      crop_calendar: {
        Row: {
          activity_type: string
          completed: boolean | null
          created_at: string
          crop_type: string
          id: string
          notes: string | null
          scheduled_date: string
          user_id: string
        }
        Insert: {
          activity_type: string
          completed?: boolean | null
          created_at?: string
          crop_type: string
          id?: string
          notes?: string | null
          scheduled_date: string
          user_id: string
        }
        Update: {
          activity_type?: string
          completed?: boolean | null
          created_at?: string
          crop_type?: string
          id?: string
          notes?: string | null
          scheduled_date?: string
          user_id?: string
        }
        Relationships: []
      }
      direct_messages: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          message_type: string
          recipient_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          message_type?: string
          recipient_id: string
          sender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          message_type?: string
          recipient_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      disease_history: {
        Row: {
          application_date: string | null
          created_at: string
          disease_id: string
          follow_up_image_url: string | null
          id: string
          progress_notes: string | null
          recovery_status: string | null
          treatment_applied: string | null
          user_id: string
        }
        Insert: {
          application_date?: string | null
          created_at?: string
          disease_id: string
          follow_up_image_url?: string | null
          id?: string
          progress_notes?: string | null
          recovery_status?: string | null
          treatment_applied?: string | null
          user_id: string
        }
        Update: {
          application_date?: string | null
          created_at?: string
          disease_id?: string
          follow_up_image_url?: string | null
          id?: string
          progress_notes?: string | null
          recovery_status?: string | null
          treatment_applied?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "disease_history_disease_id_fkey"
            columns: ["disease_id"]
            isOneToOne: false
            referencedRelation: "plant_diseases"
            referencedColumns: ["id"]
          },
        ]
      }
      disease_treatments: {
        Row: {
          active_ingredient: string | null
          application_method: string | null
          cost_per_treatment: number | null
          created_at: string
          disease_name: string
          dosage: string | null
          effectiveness_rating: number | null
          frequency: string | null
          id: string
          organic: boolean | null
          timing: string | null
          treatment_name: string
          treatment_type: string
        }
        Insert: {
          active_ingredient?: string | null
          application_method?: string | null
          cost_per_treatment?: number | null
          created_at?: string
          disease_name: string
          dosage?: string | null
          effectiveness_rating?: number | null
          frequency?: string | null
          id?: string
          organic?: boolean | null
          timing?: string | null
          treatment_name: string
          treatment_type: string
        }
        Update: {
          active_ingredient?: string | null
          application_method?: string | null
          cost_per_treatment?: number | null
          created_at?: string
          disease_name?: string
          dosage?: string | null
          effectiveness_rating?: number | null
          frequency?: string | null
          id?: string
          organic?: boolean | null
          timing?: string | null
          treatment_name?: string
          treatment_type?: string
        }
        Relationships: []
      }
      event_participants: {
        Row: {
          event_id: string
          id: string
          registered_at: string
          status: string
          user_id: string
        }
        Insert: {
          event_id: string
          id?: string
          registered_at?: string
          status?: string
          user_id: string
        }
        Update: {
          event_id?: string
          id?: string
          registered_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "community_events"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_consultations: {
        Row: {
          client_id: string
          consultation_type: string
          created_at: string
          description: string | null
          duration_minutes: number
          expert_id: string
          id: string
          meeting_url: string | null
          notes: string | null
          payment_status: string | null
          price: number | null
          scheduled_time: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          client_id: string
          consultation_type: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          expert_id: string
          id?: string
          meeting_url?: string | null
          notes?: string | null
          payment_status?: string | null
          price?: number | null
          scheduled_time?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          consultation_type?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          expert_id?: string
          id?: string
          meeting_url?: string | null
          notes?: string | null
          payment_status?: string | null
          price?: number | null
          scheduled_time?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expert_consultations_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "expert_network"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_network: {
        Row: {
          bio: string | null
          created_at: string
          experience_years: number | null
          id: string
          is_verified: boolean | null
          location: string | null
          rating: number | null
          specialization: string
          total_consultations: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          experience_years?: number | null
          id?: string
          is_verified?: boolean | null
          location?: string | null
          rating?: number | null
          specialization: string
          total_consultations?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          experience_years?: number | null
          id?: string
          is_verified?: boolean | null
          location?: string | null
          rating?: number | null
          specialization?: string
          total_consultations?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      farm_activities: {
        Row: {
          activity_date: string
          activity_type: string
          cost: number | null
          created_at: string
          description: string | null
          farm_record_id: string | null
          id: string
          user_id: string
        }
        Insert: {
          activity_date: string
          activity_type: string
          cost?: number | null
          created_at?: string
          description?: string | null
          farm_record_id?: string | null
          id?: string
          user_id: string
        }
        Update: {
          activity_date?: string
          activity_type?: string
          cost?: number | null
          created_at?: string
          description?: string | null
          farm_record_id?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "farm_activities_farm_record_id_fkey"
            columns: ["farm_record_id"]
            isOneToOne: false
            referencedRelation: "farm_records"
            referencedColumns: ["id"]
          },
        ]
      }
      farm_records: {
        Row: {
          actual_yield: number | null
          created_at: string
          crop_type: string
          expected_yield: number | null
          field_size: number | null
          harvest_date: string | null
          id: string
          investment_cost: number | null
          notes: string | null
          planting_date: string | null
          profit: number | null
          revenue: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_yield?: number | null
          created_at?: string
          crop_type: string
          expected_yield?: number | null
          field_size?: number | null
          harvest_date?: string | null
          id?: string
          investment_cost?: number | null
          notes?: string | null
          planting_date?: string | null
          profit?: number | null
          revenue?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_yield?: number | null
          created_at?: string
          crop_type?: string
          expected_yield?: number | null
          field_size?: number | null
          harvest_date?: string | null
          id?: string
          investment_cost?: number | null
          notes?: string | null
          planting_date?: string | null
          profit?: number | null
          revenue?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "community_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          expires_at: string | null
          id: string
          is_read: boolean | null
          message: string
          priority: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          priority?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          priority?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      plant_diseases: {
        Row: {
          affected_parts: string[] | null
          confidence_score: number | null
          created_at: string
          disease_name: string
          disease_type: string
          id: string
          image_url: string | null
          plant_name: string | null
          severity_level: string | null
          symptoms_detected: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          affected_parts?: string[] | null
          confidence_score?: number | null
          created_at?: string
          disease_name: string
          disease_type: string
          id?: string
          image_url?: string | null
          plant_name?: string | null
          severity_level?: string | null
          symptoms_detected?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          affected_parts?: string[] | null
          confidence_score?: number | null
          created_at?: string
          disease_name?: string
          disease_type?: string
          id?: string
          image_url?: string | null
          plant_name?: string | null
          severity_level?: string | null
          symptoms_detected?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      plant_identifications: {
        Row: {
          care_instructions: string | null
          confidence_score: number | null
          created_at: string
          health_status: string | null
          id: string
          image_url: string | null
          plant_name: string | null
          user_id: string
        }
        Insert: {
          care_instructions?: string | null
          confidence_score?: number | null
          created_at?: string
          health_status?: string | null
          id?: string
          image_url?: string | null
          plant_name?: string | null
          user_id: string
        }
        Update: {
          care_instructions?: string | null
          confidence_score?: number | null
          created_at?: string
          health_status?: string | null
          id?: string
          image_url?: string | null
          plant_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          is_expert_response: boolean | null
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_expert_response?: boolean | null
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_expert_response?: boolean | null
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_media: {
        Row: {
          created_at: string
          file_size: number | null
          id: string
          media_type: string
          media_url: string
          post_id: string
          thumbnail_url: string | null
        }
        Insert: {
          created_at?: string
          file_size?: number | null
          id?: string
          media_type: string
          media_url: string
          post_id: string
          thumbnail_url?: string | null
        }
        Update: {
          created_at?: string
          file_size?: number | null
          id?: string
          media_type?: string
          media_url?: string
          post_id?: string
          thumbnail_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_media_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_reactions: {
        Row: {
          created_at: string
          id: string
          post_id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          reaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          app_notifications: boolean | null
          avatar_url: string | null
          created_at: string
          crop_types: Database["public"]["Enums"]["crop_type"][] | null
          district: string | null
          email_notifications: boolean | null
          farm_type: string | null
          full_name: string | null
          gemini_api_key: string | null
          huggingface_api_key: string | null
          id: string
          kaggle_api_key: string | null
          last_active: string | null
          location: string | null
          phone_number: string | null
          preferred_language:
            | Database["public"]["Enums"]["preferred_language"]
            | null
          profile_completed: boolean | null
          profile_completion_date: string | null
          region_type: Database["public"]["Enums"]["region_type"] | null
          role: Database["public"]["Enums"]["user_role"] | null
          sms_notifications: boolean | null
          soil_type: Database["public"]["Enums"]["soil_type"] | null
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          app_notifications?: boolean | null
          avatar_url?: string | null
          created_at?: string
          crop_types?: Database["public"]["Enums"]["crop_type"][] | null
          district?: string | null
          email_notifications?: boolean | null
          farm_type?: string | null
          full_name?: string | null
          gemini_api_key?: string | null
          huggingface_api_key?: string | null
          id?: string
          kaggle_api_key?: string | null
          last_active?: string | null
          location?: string | null
          phone_number?: string | null
          preferred_language?:
            | Database["public"]["Enums"]["preferred_language"]
            | null
          profile_completed?: boolean | null
          profile_completion_date?: string | null
          region_type?: Database["public"]["Enums"]["region_type"] | null
          role?: Database["public"]["Enums"]["user_role"] | null
          sms_notifications?: boolean | null
          soil_type?: Database["public"]["Enums"]["soil_type"] | null
          state?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          app_notifications?: boolean | null
          avatar_url?: string | null
          created_at?: string
          crop_types?: Database["public"]["Enums"]["crop_type"][] | null
          district?: string | null
          email_notifications?: boolean | null
          farm_type?: string | null
          full_name?: string | null
          gemini_api_key?: string | null
          huggingface_api_key?: string | null
          id?: string
          kaggle_api_key?: string | null
          last_active?: string | null
          location?: string | null
          phone_number?: string | null
          preferred_language?:
            | Database["public"]["Enums"]["preferred_language"]
            | null
          profile_completed?: boolean | null
          profile_completion_date?: string | null
          region_type?: Database["public"]["Enums"]["region_type"] | null
          role?: Database["public"]["Enums"]["user_role"] | null
          sms_notifications?: boolean | null
          soil_type?: Database["public"]["Enums"]["soil_type"] | null
          state?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      regional_disease_alerts: {
        Row: {
          affected_crops: string[] | null
          alert_date: string
          alert_level: string | null
          created_at: string
          created_by: string | null
          disease_name: string
          expires_at: string | null
          id: string
          outbreak_description: string | null
          prevention_measures: string | null
          region: string
        }
        Insert: {
          affected_crops?: string[] | null
          alert_date: string
          alert_level?: string | null
          created_at?: string
          created_by?: string | null
          disease_name: string
          expires_at?: string | null
          id?: string
          outbreak_description?: string | null
          prevention_measures?: string | null
          region: string
        }
        Update: {
          affected_crops?: string[] | null
          alert_date?: string
          alert_level?: string | null
          created_at?: string
          created_by?: string | null
          disease_name?: string
          expires_at?: string | null
          id?: string
          outbreak_description?: string | null
          prevention_measures?: string | null
          region?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_name: string
          badge_type: string
          description: string | null
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_name: string
          badge_type: string
          description?: string | null
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_name?: string
          badge_type?: string
          description?: string | null
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_reputation: {
        Row: {
          best_answers: number
          created_at: string
          helpful_answers: number
          id: string
          level: number
          posts_count: number
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          best_answers?: number
          created_at?: string
          helpful_answers?: number
          id?: string
          level?: number
          posts_count?: number
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          best_answers?: number
          created_at?: string
          helpful_answers?: number
          id?: string
          level?: number
          posts_count?: number
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      user_stats: {
        Row: {
          all_roles: Database["public"]["Enums"]["user_role"][] | null
          created_at: string | null
          full_name: string | null
          last_active: string | null
          preferred_language:
            | Database["public"]["Enums"]["preferred_language"]
            | null
          profile_completed: boolean | null
          profile_completion_date: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          total_chats: number | null
          total_plant_identifications: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_user_profile: {
        Args: { p_user_id: string }
        Returns: {
          id: string
          user_id: string
          full_name: string
          role: Database["public"]["Enums"]["user_role"]
          preferred_language: Database["public"]["Enums"]["preferred_language"]
          profile_completed: boolean
          district: string
          state: string
          crop_types: Database["public"]["Enums"]["crop_type"][]
          soil_type: Database["public"]["Enums"]["soil_type"]
          region_type: Database["public"]["Enums"]["region_type"]
          sms_notifications: boolean
          email_notifications: boolean
          app_notifications: boolean
          created_at: string
          updated_at: string
        }[]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      crop_type:
        | "rice"
        | "wheat"
        | "sugarcane"
        | "cotton"
        | "maize"
        | "soybean"
        | "pulses"
        | "vegetables"
        | "fruits"
        | "spices"
        | "other"
      preferred_language:
        | "english"
        | "hindi"
        | "tamil"
        | "telugu"
        | "kannada"
        | "marathi"
        | "gujarati"
        | "bengali"
      region_type: "rainfed" | "irrigated"
      soil_type:
        | "clay"
        | "loam"
        | "sandy"
        | "red"
        | "black"
        | "alluvial"
        | "laterite"
      user_role: "farmer" | "expert" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      crop_type: [
        "rice",
        "wheat",
        "sugarcane",
        "cotton",
        "maize",
        "soybean",
        "pulses",
        "vegetables",
        "fruits",
        "spices",
        "other",
      ],
      preferred_language: [
        "english",
        "hindi",
        "tamil",
        "telugu",
        "kannada",
        "marathi",
        "gujarati",
        "bengali",
      ],
      region_type: ["rainfed", "irrigated"],
      soil_type: [
        "clay",
        "loam",
        "sandy",
        "red",
        "black",
        "alluvial",
        "laterite",
      ],
      user_role: ["farmer", "expert", "admin"],
    },
  },
} as const
