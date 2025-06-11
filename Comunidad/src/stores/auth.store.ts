import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'

interface User {
  id: string
  email?: string
  user_metadata?: {
    name?: string
    avatar_url?: string
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    session: null as Session | null
  }),

  actions: {
    async init() {
      supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
        this.session = session
        this.user = session?.user ?? null
      })
    },

    async signInWithEmail(email: string, password: string) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
      return data
    },

    async signOut() {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      this.user = null
    },

    async register(email: string, password: string) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })
      if (error) throw error
      return data
    }
  },

  getters: {
    isAuthenticated: (state) => !!state.user
  }
})