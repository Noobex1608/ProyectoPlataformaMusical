import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'
import CommunityService from '@/services/community.service'
import type {
  FanClub,
  ForumPost,
  Poll,
  CommunityEvent,
  Notification,
  SocialPlaylist,
  RadioPreference,
  User
} from '@/types/community.types'

export const useCommunityStore = defineStore('community', {
  state: () => ({
    // Radio Algorítmica
    radioPreferences: null as RadioPreference | null,
    
    // Playlists Sociales
    playlists: [] as SocialPlaylist[],
    currentPlaylist: null as SocialPlaylist | null,
    
    // Clubes de Fans
    fanClubs: [] as FanClub[],
    activeClub: null as FanClub | null,
    
    // Foros
    artistForums: [] as ForumPost[],
    currentForumPost: null as ForumPost | null,
    
    // Encuestas
    activePolls: [] as Poll[],
    currentPoll: null as Poll | null,
    
    // Eventos
    upcomingEvents: [] as CommunityEvent[],
    currentEvent: null as CommunityEvent | null,
    
    // Notificaciones
    notifications: [] as Notification[],
    unreadCount: 0
  }),

  getters: {
    hasUnreadNotifications: (state) => state.unreadCount > 0,
    getPlaylistById: (state) => (id: string) => 
      state.playlists.find(playlist => playlist.id === id),
    getFanClubById: (state) => (id: string) =>
      state.fanClubs.find(club => club.id === id)
  },

  actions: {
    // Radio Algorítmica
    async updateRadioPreferences(preferences: Partial<RadioPreference>) {
      try {
        const { user_id, ...rest } = preferences;
        if (!user_id) {
          throw new Error('El campo user_id es obligatorio.');
        }
        await CommunityService.saveRadioPreferences(
          user_id,
          {
            user_id, // Incluye explícitamente user_id
            ...rest,
            genres: preferences.genres || [], 
            artists: preferences.artists || [], 
            moods: preferences.moods || [],
          }
        )
        this.radioPreferences = { ...this.radioPreferences, ...preferences } as RadioPreference
      } catch (error) {
        console.error('Error updating radio preferences:', error)
        throw error
      }
    },

    async saveRadioInteraction(trackId: string, action: string, userId: string) {
      const { error } = await supabase
        .from('radio_interactions')
        .insert({
          track_id: trackId,
          action,
          user_id: userId,
          created_at: new Date().toISOString(),
        });

      if (error) throw error;
    },

    // Playlists Sociales
    async createPlaylist(data: Partial<SocialPlaylist>) {
      try {
        await CommunityService.createPlaylist({
          name: data.name || '',
          description: data.description || '',
          creator_id: data.creator_id || '',
          cover_url: data.cover_url || '',
          is_collaborative: data.is_collaborative || false,
        })
        await this.fetchPlaylists()
      } catch (error) {
        console.error('Error creating playlist:', error)
        throw error
      }
    },

    async fetchPlaylists() {
      const { data, error } = await supabase
        .from('social_playlists')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      this.playlists = data
    },

    // Clubes de Fans
    async createFanClub(data: Partial<FanClub>) {
      try {
        await CommunityService.createFanClub({
          name: data.name || '',
          description: data.description || '',
          banner_url: data.banner_url || '',
          artist_id: data.artist_id || '',
          artist_name: data.artist_name || '',
          rules: data.rules || '',
        })
        await this.fetchFanClubs()
      } catch (error) {
        console.error('Error creating fan club:', error)
        throw error
      }
    },

    async fetchFanClubs() {
      const { data, error } = await supabase
        .from('fan_clubs')
        .select('*')
        .order('member_count', { ascending: false })
      
      if (error) throw error
      this.fanClubs = data
    },

    // Foros
    async createForumPost(data: Partial<ForumPost>) {
      try {
        await CommunityService.createForumPost({
          title: data.title || '',
          content: data.content || '',
          author_id: data.author_id || '',
        })
        // Eliminada la llamada a `fetchArtistForums` ya que `artist_id` no existe en el tipo `Partial<ForumPost>`
      } catch (error) {
        console.error('Error creating forum post:', error)
        throw error
      }
    },

    async fetchArtistForums(artistId: string) {
      try {
        const { data, error } = await supabase
          .from('forum_posts')
          .select(`
            *,
            user:profiles(id, name, avatar_url)
          `)
          .eq('artist_id', artistId)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        this.artistForums = data;
      } catch (error) {
        console.error('Error fetching artist forums:', error)
        throw error
      }
    },

    // Encuestas
    async createPoll(data: Partial<Poll>) {
      try {
        console.log('Ejecutando communityStore.createPoll con datos:', data);

        // Validación de datos antes de enviar
        if (!data.title || !data.description || !data.creator_id || !data.end_date || !data.options || data.options.length === 0) {
          console.error('Datos inválidos para crear encuesta:', data);
          throw new Error('Datos inválidos para crear encuesta');
        }

        // Log detallado de las opciones
        console.log('Opciones de encuesta:', data.options);

        const result = await CommunityService.createPoll(
          {
            title: data.title,
            description: data.description,
            creator_id: data.creator_id,
            end_date: data.end_date,
            options: data.options 
          },
          data.options.map(option => ({
            text: option.text || '',
          }))
        );

        return result;
      } catch (error) {
        console.error('Error creando encuesta:', error)
        throw error
      }
    },

    async fetchActivePolls() {
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .gte('end_date', new Date().toISOString())
        .order('created_at', { ascending: false })
      
      if (error) throw error
      this.activePolls = data
    },

    // Eventos
    async createEvent(data: Partial<CommunityEvent>) {
      try {
        await CommunityService.createEvent({
          title: data.title || '',
          description: data.description || '',
          date: data.date || '',
          location: data.location || '',
          capacity: data.capacity ?? null,
          attendees_count: data.attendees_count ?? 0,
          creator_id: data.creator_id || '',
          cover_url: data.cover_url || '',
          tags: data.tags || [],
          additional_info: data.additional_info || ''
        })
        await this.fetchUpcomingEvents()
      } catch (error) {
        console.error('Error creating event:', error)
        throw error
      }
    },

    async fetchUpcomingEvents() {
      const { data, error } = await supabase
        .from('community_events')
        .select('*')
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true });
      
      if (error) throw error;
      this.upcomingEvents = data;
      return data; // Devuelve los datos directamente
    },

    async fetchEventById(id: string) {
      const { data, error } = await supabase
        .from('community_events')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },

    async fetchEventAttendees(eventId: string): Promise<User[]> {
      type ProfileResponse = { user: { id: string; name: string; avatar_url?: string } };
      const { data, error } = await supabase
        .from('event_attendees')
        .select(`
          user:profiles(id, name, avatar_url)
        `)
        .eq('event_id', eventId);
      
      if (error) throw error;
      return (data as unknown as ProfileResponse[]).map(item => ({
        id: item.user.id,
        name: item.user.name,
        avatar_url: item.user.avatar_url,
      }));
    },

    async fetchEventComments(eventId: string) {
      const { data, error } = await supabase
        .from('event_comments')
        .select(`
          *,
          user:profiles(*)
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },

    async attendEvent(eventId: string) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('event_attendees')
        .insert({ event_id: eventId, user_id: user.id });
      
      if (error) throw error;
    },

    async cancelEventAttendance(eventId: string) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('event_attendees')
        .delete()
        .match({ event_id: eventId, user_id: user.id });
      
      if (error) throw error;
    },

    async updateEvent(eventId: string, data: Partial<CommunityEvent>) {
      const { error } = await supabase
        .from('community_events')
        .update(data)
        .eq('id', eventId);
      
      if (error) throw error;
    },

    async addEventComment(eventId: string, content: string) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('event_comments')
        .insert({
          event_id: eventId,
          user_id: user.id,
          content
        })
        .select(`
          *,
          user:profiles(*)
        `)
        .single();
      
      if (error) throw error;
      return data;
    },

    // Notificaciones
    async fetchNotifications() {
      // Implementación futura o eliminación del método si no es necesario.
    },

    async markNotificationAsRead(notificationId: string) {
      try {
        await CommunityService.markNotificationAsRead(notificationId)
        const notification = this.notifications.find(n => n.id === notificationId)
        if (notification && !notification.is_read) {
          notification.is_read = true
          this.unreadCount--
        }
      } catch (error) {
        console.error('Error marking notification as read:', error)
        throw error
      }
    },

    // Votaciones
    async votePoll(vote: { poll_id: string; option_id: string; user_id: string }) {
      const { error } = await supabase
        .from('poll_votes')
        .insert({
          ...vote,
          created_at: new Date().toISOString(),
        });

      if (error) throw error;
    },

    async hasUserVoted(pollId: string, userId: string): Promise<boolean> {
      const { data, error } = await supabase
        .from('poll_votes')
        .select('id')
        .eq('poll_id', pollId)
        .eq('user_id', userId)
        .single();

      if (error) return false;
      return !!data;
    },

    async getOptionVotes(optionId: string): Promise<number> {
      const { data, error } = await supabase
        .from('poll_votes')
        .select('*', { count: 'exact' })
        .eq('option_id', optionId);

      if (error) return 0;
      return data.length;
    },

    async getTotalPollVotes(pollId: string): Promise<number> {
      const { data, error } = await supabase
        .from('poll_votes')
        .select('*', { count: 'exact' })
        .eq('poll_id', pollId);

      if (error) return 0;
      return data.length;
    }
  }
})