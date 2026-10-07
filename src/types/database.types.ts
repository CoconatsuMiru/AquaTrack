export type Database = {
  public: {
    Tables: {
      container_types: {
        Row: {
          id: string
          name: string
          description: string | null
          identifier_key: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          identifier_key: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          identifier_key?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          id: string
          full_name: string
          phone: string | null
          address: string | null
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          phone?: string | null
          address?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          phone?: string | null
          address?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      containers: {
        Row: {
          id: string
          container_number: string
          container_type_id: string
          status: 'available' | 'with_customer' | 'retired'
          current_customer_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          container_number: string
          container_type_id: string
          status?: 'available' | 'with_customer' | 'retired'
          current_customer_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          container_number?: string
          container_type_id?: string
          status?: 'available' | 'with_customer' | 'retired'
          current_customer_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'containers_container_type_id_fkey'
            columns: ['container_type_id']
            isOneToOne: false
            referencedRelation: 'container_types'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'containers_current_customer_id_fkey'
            columns: ['current_customer_id']
            isOneToOne: false
            referencedRelation: 'customers'
            referencedColumns: ['id']
          },
        ]
      }
      transactions: {
        Row: {
          id: string
          transaction_number: number
          transaction_type: 'assign' | 'return'
          container_id: string
          customer_id: string
          notes: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          transaction_number?: never
          transaction_type: 'assign' | 'return'
          container_id: string
          customer_id: string
          notes?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          transaction_number?: never
          transaction_type?: 'assign' | 'return'
          container_id?: string
          customer_id?: string
          notes?: string | null
          created_by?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'transactions_container_id_fkey'
            columns: ['container_id']
            isOneToOne: false
            referencedRelation: 'containers'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'transactions_customer_id_fkey'
            columns: ['customer_id']
            isOneToOne: false
            referencedRelation: 'customers'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      transaction_history: {
        Row: {
          id: string
          transaction_number: number
          transaction_type: 'assign' | 'return'
          created_at: string
          notes: string | null
          container_id: string
          container_number: string
          container_type_name: string
          customer_id: string
          customer_name: string
          customer_phone: string | null
        }
        Relationships: []
      }
      container_type_summary: {
        Row: {
          container_type_id: string
          name: string
          identifier_key: string
          is_active: boolean
          total_count: number
          available_count: number
          with_customer_count: number
          retired_count: number
        }
        Relationships: []
      }
      customer_holdings: {
        Row: {
          customer_id: string
          full_name: string
          phone: string | null
          containers_held: number
        }
        Relationships: []
      }
    }
    Functions: {
      assign_containers: {
        Args: {
          p_container_ids: string[]
          p_customer_id: string
          p_notes?: string
        }
        Returns: number
      }
      return_containers: {
        Args: {
          p_container_ids: string[]
          p_notes?: string
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}