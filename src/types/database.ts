export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          cnpj: string | null
          mei_status: boolean
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          cnpj?: string | null
          mei_status?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          cnpj?: string | null
          mei_status?: boolean
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          type: 'income' | 'expense'
          amount: number
          transaction_date: string
          category: string | null
          description: string | null
          file_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'income' | 'expense'
          amount: number
          transaction_date: string
          category?: string | null
          description?: string | null
          file_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'income' | 'expense'
          amount?: number
          transaction_date?: string
          category?: string | null
          description?: string | null
          file_url?: string | null
          created_at?: string
        }
      }
      recurring_debts: {
        Row: {
          id: string
          user_id: string
          name: string
          amount: number
          due_day: number
          category: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          amount: number
          due_day: number
          category?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          amount?: number
          due_day?: number
          category?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      das_payments: {
        Row: {
          id: string
          user_id: string
          reference_month: string
          amount: number | null
          status: 'pending' | 'paid' | 'overdue'
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          reference_month: string
          amount?: number | null
          status?: 'pending' | 'paid' | 'overdue'
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          reference_month?: string
          amount?: number | null
          status?: 'pending' | 'paid' | 'overdue'
          paid_at?: string | null
          created_at?: string
        }
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
  }
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Transaction = Database['public']['Tables']['transactions']['Row']
export type RecurringDebt = Database['public']['Tables']['recurring_debts']['Row']
export type DasPayment = Database['public']['Tables']['das_payments']['Row']

export type NewTransaction = Database['public']['Tables']['transactions']['Insert']
export type NewRecurringDebt = Database['public']['Tables']['recurring_debts']['Insert']
export type NewDasPayment = Database['public']['Tables']['das_payments']['Insert']

export type UpdateTransaction = Database['public']['Tables']['transactions']['Update']
export type UpdateRecurringDebt = Database['public']['Tables']['recurring_debts']['Update']
export type UpdateDasPayment = Database['public']['Tables']['das_payments']['Update']
