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
      profiles: {
        Row: {
          app_notifications: boolean | null
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
          location: string | null
          phone_number: string | null
          preferred_language:
            | Database["public"]["Enums"]["preferred_language"]
            | null
          profile_completed: boolean | null
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
          location?: string | null
          phone_number?: string | null
          preferred_language?:
            | Database["public"]["Enums"]["preferred_language"]
            | null
          profile_completed?: boolean | null
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
          location?: string | null
          phone_number?: string | null
          preferred_language?:
            | Database["public"]["Enums"]["preferred_language"]
            | null
          profile_completed?: boolean | null
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
    }
    Views: {
      [_ in never]: never
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
