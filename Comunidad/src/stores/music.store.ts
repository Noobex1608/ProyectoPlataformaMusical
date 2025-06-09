import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'

export const useMusicStore = defineStore('music', {
  state: () => ({
    currentTrack: null as any,
    recentPlays: [] as any[],
    favoriteTracks: [] as any[]
  }),

  actions: {
    async fetchRecentPlays(userId: string) {
      const { data, error } = await supabase
        .from('recent_plays')
        .select('*')
        .eq('user_id', userId)
        .order('played_at', { ascending: false })
        .limit(10)
      
      if (error) throw error
      this.recentPlays = data
    },

    async likeTrack(trackId: string, userId: string) {
      const { data, error } = await supabase
        .from('favorites')
        .upsert({
          user_id: userId,
          track_id: trackId,
          liked_at: new Date().toISOString()
        })
      
      if (error) throw error
      await this.fetchFavorites(userId)
    },

    async fetchFavorites(userId: string) {
      const { data, error } = await supabase
        .from('favorites')
        .select('track_id, tracks(*)')
        .eq('user_id', userId)
      
      if (error) throw error
      this.favoriteTracks = data.map(item => item.tracks)
    }
  }
})