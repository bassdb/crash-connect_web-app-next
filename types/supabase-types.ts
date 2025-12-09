export type SupabaseUser = {
  id: string // Unique identifier for the user
  aud: string
  role: string | null | undefined // User's role
  email: string | null // Email address
  email_confirmed_at: string | null // When the email was confirmed
  phone: string | null // Phone number
  confirmation_sent_at: string | null // When the confirmation email was sent
  confirmed_at: string | null // When the email was confirmed
  recovery_sent_at: string | null // When the recovery email was sent
  last_sign_in_at: string | null // Last sign-in timestamp
  app_metadata: {
    provider: string
    providers: string[]
  }
  user_metadata: {
    email: string
    email_verified: boolean
    phone_verified: boolean
    sub: string
  }
  identities:
    | {
        id: string
        provider: string
        created_at: string
        last_sign_in_at: string
        identity_data: Record<string, any>
      }[]
    | null // Third-party identities (e.g., Google, GitHub)
  created_at: string // Account creation timestamp
  updated_at: string // Last update timestamp
  is_anonymous: boolean // Whether the user is anonymous
}

export type SupabaseUserWithProfile = {
  id: string
  email: string
  last_sign_in_at: string
  username: string | null
  user_role: string
}

export type UserProfileWithRole = {
  profile_id: string
  email: string
  username: string | null
  full_name: string | null
  avatar_url?: string | null
  updated_at?: string | null
  website?: string | null
  is_admin?: boolean | null
  user_role: string
}

//create a enum of user roles
export enum UserRoles {
  SUPERADMIN = 'superadmin',
  PRODUCT_OWNER = 'product_owner',
  ADMIN = 'admin',
  CREATOR = 'creator',
  CONSUMER = 'consumer',
}

//create a new enum of available user roles on the basis of the UserRoles enum that are available for the owner leaving out the superadmin role
export enum OwnerRoles {
  ADMIN = 'admin',
  CREATOR = 'creator',
  CONSUMER = 'consumer',
}

export enum AdminRoles {
  CREATOR = 'creator',
  CONSUMER = 'consumer',
}

//create an array of available roles for the superadmin
export const superAdminRoles = Object.values(UserRoles)

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      credit_packages: {
        Row: {
          created_at: string
          credits: number
          description: string | null
          features: string[] | null
          id: string
          isActive: boolean
          name: string
          price: number | null
        }
        Insert: {
          created_at?: string
          credits: number
          description?: string | null
          features?: string[] | null
          id?: string
          isActive?: boolean
          name: string
          price?: number | null
        }
        Update: {
          created_at?: string
          credits?: number
          description?: string | null
          features?: string[] | null
          id?: string
          isActive?: boolean
          name?: string
          price?: number | null
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          created_at: string | null
          credit_amount: number | null
          description: string | null
          id: number
          order_id: number | null
          transaction_type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          credit_amount?: number | null
          description?: string | null
          id?: number
          order_id?: number | null
          transaction_type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          credit_amount?: number | null
          description?: string | null
          id?: number
          order_id?: number | null
          transaction_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'credit_transactions_order_id_fkey'
            columns: ['order_id']
            isOneToOne: false
            referencedRelation: 'orders_credits'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'credit_transactions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'credit_transactions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles_with_roles'
            referencedColumns: ['profile_id']
          },
          {
            foreignKeyName: 'credit_transactions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'user_credit_balances'
            referencedColumns: ['user_id']
          },
        ]
      }
      hype_card_tags: {
        Row: {
          hype_card_id: number | null
          id: number
          tag_id: number | null
        }
        Insert: {
          hype_card_id?: number | null
          id?: never
          tag_id?: number | null
        }
        Update: {
          hype_card_id?: number | null
          id?: never
          tag_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'hype_card_tags_hype_card_id_fkey'
            columns: ['hype_card_id']
            isOneToOne: false
            referencedRelation: 'hype_card_templates'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'hype_card_tags_tag_id_fkey'
            columns: ['tag_id']
            isOneToOne: false
            referencedRelation: 'tags'
            referencedColumns: ['id']
          },
        ]
      }
      hype_card_templates: {
        Row: {
          canvas_data: string | null
          category: string
          created_at: string | null
          creator: string | null
          description: string | null
          id: number
          name: string | null
          preview_image_url: string | null
          status: Database['public']['Enums']['hype_status']
          tags: string | null
          updated_at: string | null
          usage_counter: number | null
          user_likes: number | null
          user_rating: number | null
        }
        Insert: {
          canvas_data?: string | null
          category: string
          created_at?: string | null
          creator?: string | null
          description?: string | null
          id?: number
          name?: string | null
          preview_image_url?: string | null
          status?: Database['public']['Enums']['hype_status']
          tags?: string | null
          updated_at?: string | null
          usage_counter?: number | null
          user_likes?: number | null
          user_rating?: number | null
        }
        Update: {
          canvas_data?: string | null
          category?: string
          created_at?: string | null
          creator?: string | null
          description?: string | null
          id?: number
          name?: string | null
          preview_image_url?: string | null
          status?: Database['public']['Enums']['hype_status']
          tags?: string | null
          updated_at?: string | null
          usage_counter?: number | null
          user_likes?: number | null
          user_rating?: number | null
        }
        Relationships: []
      }
      notes: {
        Row: {
          id: number
          title: string
        }
        Insert: {
          id?: never
          title: string
        }
        Update: {
          id?: never
          title?: string
        }
        Relationships: []
      }
      orders_credits: {
        Row: {
          amount: number | null
          created_at: string
          credit_amount: number | null
          currency: string | null
          id: number
          receiptURL: string | null
          status: Database['public']['Enums']['stripe_status'] | null
          stripe_payment_intent_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          credit_amount?: number | null
          currency?: string | null
          id?: number
          receiptURL?: string | null
          status?: Database['public']['Enums']['stripe_status'] | null
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          credit_amount?: number | null
          currency?: string | null
          id?: number
          receiptURL?: string | null
          status?: Database['public']['Enums']['stripe_status'] | null
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          email: string | null
          full_name: string | null
          id: string
          is_admin: boolean | null
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_admin?: boolean | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          id: number
          permission: Database['public']['Enums']['app_permission']
          role: Database['public']['Enums']['app_role']
        }
        Insert: {
          id?: number
          permission: Database['public']['Enums']['app_permission']
          role: Database['public']['Enums']['app_role']
        }
        Update: {
          id?: number
          permission?: Database['public']['Enums']['app_permission']
          role?: Database['public']['Enums']['app_role']
        }
        Relationships: []
      }
      tags: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: never
          name: string
        }
        Update: {
          id?: never
          name?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: number
          role: Database['public']['Enums']['app_role']
          user_id: string
        }
        Insert: {
          id?: number
          role: Database['public']['Enums']['app_role']
          user_id: string
        }
        Update: {
          id?: number
          role?: Database['public']['Enums']['app_role']
          user_id?: string
        }
        Relationships: []
      }
      teams: {
        Row: {
          id: string
          name: string
          description: string | null
          slug: string
          avatar_url: string | null
          is_default: boolean
          status: Database['public']['Enums']['team_status']
          other_creators_can_use_example_team: boolean
          colors: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          slug: string
          avatar_url?: string | null
          is_default?: boolean
          status?: Database['public']['Enums']['team_status']
          other_creators_can_use_example_team?: boolean
          colors?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          slug?: string
          avatar_url?: string | null
          is_default?: boolean
          status?: Database['public']['Enums']['team_status']
          other_creators_can_use_example_team?: boolean
          colors?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          user_id: string
          role: Database['public']['Enums']['team_member_role']
          joined_at: string
        }
        Insert: {
          id?: string
          team_id: string
          user_id: string
          role?: Database['public']['Enums']['team_member_role']
          joined_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string
          role?: Database['public']['Enums']['team_member_role']
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'team_members_team_id_fkey'
            columns: ['team_id']
            isOneToOne: false
            referencedRelation: 'teams'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'team_members_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      team_invitations: {
        Row: {
          id: string
          team_id: string
          email: string
          role: Database['public']['Enums']['team_member_role']
          invited_by: string
          token: string
          expires_at: string
          accepted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          email: string
          role?: Database['public']['Enums']['team_member_role']
          invited_by: string
          token: string
          expires_at: string
          accepted_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          email?: string
          role?: Database['public']['Enums']['team_member_role']
          invited_by?: string
          token?: string
          expires_at?: string
          accepted_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'team_invitations_team_id_fkey'
            columns: ['team_id']
            isOneToOne: false
            referencedRelation: 'teams'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'team_invitations_invited_by_fkey'
            columns: ['invited_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      profiles_with_roles: {
        Row: {
          avatar_url: string | null
          email: string | null
          full_name: string | null
          profile_id: string | null
          role: Database['public']['Enums']['app_role'] | null
          username: string | null
          website: string | null
        }
        Relationships: []
      }
      user_credit_balances: {
        Row: {
          current_balance: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_delete_user: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      custom_access_token_hook: {
        Args: { event: Json }
        Returns: Json
      }
      has_permission: {
        Args: {
          requested_permission: Database['public']['Enums']['app_permission']
        }
        Returns: boolean
      }
    }
    Enums: {
      app_permission:
        | 'hypes.delete'
        | 'hypes.inject'
        | 'consumers.manage'
        | 'creators.manage'
        | 'product_owner.manage'
        | 'user_profiles.read'
        | 'users.delete'
        | 'users.update'
        | 'users.create'
        | 'user_roles.update'
        | 'user_roles.view'
        | 'credits.manage'
      app_role: 'superadmin' | 'product_owner' | 'consumer' | 'creator' | 'admin' | 'team_admin'
      hype_status: 'draft' | 'approved' | 'published'
      stripe_status: 'pending' | 'succeeded' | 'failed'
      team_member_role: 'owner' | 'admin' | 'member'
      team_status: 'active' | 'inactive' | 'archived'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums'] | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

// Konstanten für Aufzählungstypen (neu hinzugefügt)
export const Constants = {
  public: {
    Enums: {
      app_permission: [
        'hypes.delete',
        'hypes.inject',
        'consumers.manage',
        'creators.manage',
        'product_owner.manage',
        'user_profiles.read',
        'users.delete',
        'users.update',
        'users.create',
        'user_roles.update',
        'user_roles.view',
        'credits.manage',
      ],
      app_role: ['superadmin', 'product_owner', 'consumer', 'creator', 'admin', 'team_admin'],
      hype_status: ['draft', 'approved', 'published'],
      stripe_status: ['pending', 'succeeded', 'failed'],
    },
  },
} as const
