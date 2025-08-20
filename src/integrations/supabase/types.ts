export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      clothing_items: {
        Row: {
          ai_attributes: Json | null
          ai_description: string | null
          back_image_url: string | null
          brand: string | null
          category: string
          color_primary: string | null
          color_secondary: string | null
          created_at: string | null
          favorite: boolean | null
          front_image_url: string | null
          id: string
          last_worn: string | null
          material: string | null
          name: string
          notes: string | null
          occasions: string[] | null
          pattern: string | null
          purchase_date: string | null
          purchase_price: number | null
          season: string[] | null
          size: string | null
          style_tags: string[] | null
          subcategory: string | null
          updated_at: string | null
          user_id: string
          wear_count: number | null
        }
        Insert: {
          ai_attributes?: Json | null
          ai_description?: string | null
          back_image_url?: string | null
          brand?: string | null
          category: string
          color_primary?: string | null
          color_secondary?: string | null
          created_at?: string | null
          favorite?: boolean | null
          front_image_url?: string | null
          id?: string
          last_worn?: string | null
          material?: string | null
          name: string
          notes?: string | null
          occasions?: string[] | null
          pattern?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          season?: string[] | null
          size?: string | null
          style_tags?: string[] | null
          subcategory?: string | null
          updated_at?: string | null
          user_id: string
          wear_count?: number | null
        }
        Update: {
          ai_attributes?: Json | null
          ai_description?: string | null
          back_image_url?: string | null
          brand?: string | null
          category?: string
          color_primary?: string | null
          color_secondary?: string | null
          created_at?: string | null
          favorite?: boolean | null
          front_image_url?: string | null
          id?: string
          last_worn?: string | null
          material?: string | null
          name?: string
          notes?: string | null
          occasions?: string[] | null
          pattern?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          season?: string[] | null
          size?: string | null
          style_tags?: string[] | null
          subcategory?: string | null
          updated_at?: string | null
          user_id?: string
          wear_count?: number | null
        }
        Relationships: []
      }
      outfit_items: {
        Row: {
          item_id: string
          outfit_id: string
        }
        Insert: {
          item_id: string
          outfit_id: string
        }
        Update: {
          item_id?: string
          outfit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "outfit_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "clothing_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outfit_items_outfit_id_fkey"
            columns: ["outfit_id"]
            isOneToOne: false
            referencedRelation: "outfits"
            referencedColumns: ["id"]
          },
        ]
      }
      outfits: {
        Row: {
          created_at: string | null
          id: string
          name: string
          notes: string | null
          occasion: string | null
          rating: number | null
          season: string[] | null
          times_worn: number | null
          user_id: string
          weather_temp_range: number[] | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          notes?: string | null
          occasion?: string | null
          rating?: number | null
          season?: string[] | null
          times_worn?: number | null
          user_id: string
          weather_temp_range?: number[] | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          notes?: string | null
          occasion?: string | null
          rating?: number | null
          season?: string[] | null
          times_worn?: number | null
          user_id?: string
          weather_temp_range?: number[] | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          avoided_colors: string[] | null
          body_type: string | null
          budget_range: string | null
          favorite_colors: string[] | null
          lifestyle: string[] | null
          notification_preferences: Json | null
          style_profile: string[] | null
          user_id: string
          weather_location: string | null
        }
        Insert: {
          avoided_colors?: string[] | null
          body_type?: string | null
          budget_range?: string | null
          favorite_colors?: string[] | null
          lifestyle?: string[] | null
          notification_preferences?: Json | null
          style_profile?: string[] | null
          user_id: string
          weather_location?: string | null
        }
        Update: {
          avoided_colors?: string[] | null
          body_type?: string | null
          budget_range?: string | null
          favorite_colors?: string[] | null
          lifestyle?: string[] | null
          notification_preferences?: Json | null
          style_profile?: string[] | null
          user_id?: string
          weather_location?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
