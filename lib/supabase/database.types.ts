// Generado desde Supabase (generate_typescript_types) — esquema public.
// Regenerar tras cambios de esquema.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.18'
  }
  public: {
    Tables: {
      events: {
        Row: {
          address: string | null
          capacity: number | null
          city: string
          contact_email: string | null
          created_at: string
          description: string
          ends_at: string
          event_type: string
          id: number
          image_url: string | null
          is_demo: boolean
          is_free: boolean
          latitude: number | null
          longitude: number | null
          modality: string
          online_url: string | null
          organizer_id: string | null
          organizer_name: string
          price_info: string | null
          registered_count: number
          requirements: string | null
          slug: string
          source_url: string | null
          starts_at: string
          status: string
          summary: string
          sustainability: Json | null
          title: string
          updated_at: string
          venue_name: string | null
        }
        Insert: {
          address?: string | null
          capacity?: number | null
          city?: string
          contact_email?: string | null
          description: string
          ends_at: string
          event_type: string
          image_url?: string | null
          is_free?: boolean
          latitude?: number | null
          longitude?: number | null
          modality?: string
          online_url?: string | null
          organizer_id?: string | null
          organizer_name: string
          price_info?: string | null
          requirements?: string | null
          slug: string
          source_url?: string | null
          starts_at: string
          status?: string
          summary: string
          sustainability?: Json | null
          title: string
          venue_name?: string | null
        }
        Update: {
          address?: string | null
          capacity?: number | null
          city?: string
          contact_email?: string | null
          description?: string
          ends_at?: string
          event_type?: string
          image_url?: string | null
          is_free?: boolean
          latitude?: number | null
          longitude?: number | null
          modality?: string
          online_url?: string | null
          organizer_name?: string
          price_info?: string | null
          requirements?: string | null
          source_url?: string | null
          starts_at?: string
          status?: string
          summary?: string
          sustainability?: Json | null
          title?: string
          venue_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'events_organizer_id_fkey'
            columns: ['organizer_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          created_at: string
          full_name: string
          id: string
          organization_name: string | null
          organization_type: string | null
          phone: string | null
          role: string
          updated_at: string
          website: string | null
        }
        Insert: {
          id: string
          bio?: string | null
          full_name?: string
          organization_name?: string | null
          organization_type?: string | null
          phone?: string | null
          role?: string
          website?: string | null
        }
        Update: {
          bio?: string | null
          full_name?: string
          organization_name?: string | null
          organization_type?: string | null
          phone?: string | null
          role?: string
          website?: string | null
        }
        Relationships: []
      }
      registrations: {
        Row: {
          created_at: string
          email: string
          event_id: number
          full_name: string
          id: number
          phone: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          email: string
          event_id: number
          full_name: string
          phone?: string | null
          user_id: string
        }
        Update: {
          full_name?: string
          phone?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: 'registrations_event_id_fkey'
            columns: ['event_id']
            isOneToOne: false
            referencedRelation: 'events'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'registrations_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
