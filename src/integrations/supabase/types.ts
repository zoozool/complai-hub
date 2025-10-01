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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      complaints: {
        Row: {
          assigned_technician_id: string | null
          completion_date: string | null
          created_at: string
          damage_description: string
          device_serial_number: string
          device_type: string
          diagnosis: string | null
          express_repair: boolean
          id: string
          incoming_tracking_number: string | null
          internal_complaint_number: string | null
          invoice_data: string | null
          outgoing_tracking_number: string | null
          package_adapter: boolean
          package_device: boolean
          package_mount: boolean
          package_original_packaging: boolean
          package_receipt_copy: boolean
          package_usb_cable: boolean
          repair_cost: number | null
          reported_problem: string | null
          return_city: string
          return_email: string
          return_first_name: string
          return_last_name: string
          return_phone: string
          return_postal_code: string
          return_street: string
          screen_protection_foil: boolean
          service_notes: string | null
          status: Database["public"]["Enums"]["complaint_status"] | null
          submission_date: string
          updated_at: string
          user_id: string
          warranty_repair: boolean
        }
        Insert: {
          assigned_technician_id?: string | null
          completion_date?: string | null
          created_at?: string
          damage_description: string
          device_serial_number: string
          device_type: string
          diagnosis?: string | null
          express_repair?: boolean
          id?: string
          incoming_tracking_number?: string | null
          internal_complaint_number?: string | null
          invoice_data?: string | null
          outgoing_tracking_number?: string | null
          package_adapter?: boolean
          package_device?: boolean
          package_mount?: boolean
          package_original_packaging?: boolean
          package_receipt_copy?: boolean
          package_usb_cable?: boolean
          repair_cost?: number | null
          reported_problem?: string | null
          return_city: string
          return_email: string
          return_first_name: string
          return_last_name: string
          return_phone: string
          return_postal_code: string
          return_street: string
          screen_protection_foil?: boolean
          service_notes?: string | null
          status?: Database["public"]["Enums"]["complaint_status"] | null
          submission_date?: string
          updated_at?: string
          user_id: string
          warranty_repair?: boolean
        }
        Update: {
          assigned_technician_id?: string | null
          completion_date?: string | null
          created_at?: string
          damage_description?: string
          device_serial_number?: string
          device_type?: string
          diagnosis?: string | null
          express_repair?: boolean
          id?: string
          incoming_tracking_number?: string | null
          internal_complaint_number?: string | null
          invoice_data?: string | null
          outgoing_tracking_number?: string | null
          package_adapter?: boolean
          package_device?: boolean
          package_mount?: boolean
          package_original_packaging?: boolean
          package_receipt_copy?: boolean
          package_usb_cable?: boolean
          repair_cost?: number | null
          reported_problem?: string | null
          return_city?: string
          return_email?: string
          return_first_name?: string
          return_last_name?: string
          return_phone?: string
          return_postal_code?: string
          return_street?: string
          screen_protection_foil?: boolean
          service_notes?: string | null
          status?: Database["public"]["Enums"]["complaint_status"] | null
          submission_date?: string
          updated_at?: string
          user_id?: string
          warranty_repair?: boolean
        }
        Relationships: []
      }
      pickup_requests: {
        Row: {
          address: string
          company_name: string
          created_at: string
          id: string
          requested_date: string
          scheduled_date: string | null
          service_contact_email: string
          service_contact_phone: string
          status: string
          updated_at: string
          user_id: string
          vat_id: string
        }
        Insert: {
          address: string
          company_name: string
          created_at?: string
          id?: string
          requested_date?: string
          scheduled_date?: string | null
          service_contact_email: string
          service_contact_phone: string
          status?: string
          updated_at?: string
          user_id: string
          vat_id: string
        }
        Update: {
          address?: string
          company_name?: string
          created_at?: string
          id?: string
          requested_date?: string
          scheduled_date?: string | null
          service_contact_email?: string
          service_contact_phone?: string
          status?: string
          updated_at?: string
          user_id?: string
          vat_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company_address: string | null
          company_name: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          is_active: boolean
          last_name: string | null
          phone_number: string | null
          service_contact_email: string | null
          service_contact_phone: string | null
          updated_at: string
          user_id: string
          user_type: string
          vat_id: string | null
        }
        Insert: {
          company_address?: string | null
          company_name?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          is_active?: boolean
          last_name?: string | null
          phone_number?: string | null
          service_contact_email?: string | null
          service_contact_phone?: string | null
          updated_at?: string
          user_id: string
          user_type: string
          vat_id?: string | null
        }
        Update: {
          company_address?: string | null
          company_name?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          is_active?: boolean
          last_name?: string | null
          phone_number?: string | null
          service_contact_email?: string | null
          service_contact_phone?: string | null
          updated_at?: string
          user_id?: string
          user_type?: string
          vat_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
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
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "main_administrator" | "employee" | "service_technician"
      complaint_status:
        | "submitted"
        | "in_progress"
        | "completed"
        | "awaiting_shipment"
        | "cancelled"
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
      app_role: ["main_administrator", "employee", "service_technician"],
      complaint_status: [
        "submitted",
        "in_progress",
        "completed",
        "awaiting_shipment",
        "cancelled",
      ],
    },
  },
} as const
