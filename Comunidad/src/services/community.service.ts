import { supabase } from '@/lib/supabase';
import type {
  FanClub,
  ForumPost,
  Poll,
  PollOption,
  PollVote,
  CommunityEvent,
  SocialPlaylist,
  RadioPreference,
  ClubMember
} from '@/types/community.types';

class CommunityService {
  // Radio Algorítmica
  async saveRadioPreferences(userId: string, preferences: Omit<RadioPreference, 'id' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('radio_preferences')
      .upsert({
        ...preferences,
        user_id: userId,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
    return data;
  }

  async getRadioPreferences(userId: string) {
    const { data, error } = await supabase
      .from('radio_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  // Playlists Sociales
  async createPlaylist(playlist: Omit<SocialPlaylist, 'id' | 'created_at' | 'tracks_count'>) {
    const { data, error } = await supabase
      .from('social_playlists')
      .insert({
        ...playlist,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getPlaylist(playlistId: string) {
    const { data, error } = await supabase
      .from('social_playlists')
      .select('*, tracks(*)')
      .eq('id', playlistId)
      .single();

    if (error) throw error;
    return data;
  }

  // Clubes de Fans
  async createFanClub(club: Omit<FanClub, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('fan_clubs')
      .insert({
        ...club,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async joinClub(clubId: string, userId: string, role: ClubMember['role'] = 'member') {
    const { data, error } = await supabase
      .from('club_members')
      .insert({
        club_id: clubId,
        user_id: userId,
        role,
        joined_at: new Date().toISOString()
      });

    if (error) throw error;
    return data;
  }

  // Foros
  async createForumPost(post: Omit<ForumPost, 'id' | 'created_at' | 'updated_at' | 'likes_count' | 'comments_count'>) {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('forum_posts')
      .insert({
        ...post,
        created_at: now,
        updated_at: now,
        likes_count: 0,
        comments_count: 0
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Encuestas
  async createPoll(poll: Omit<Poll, 'id' | 'created_at'>, options: Omit<PollOption, 'id' | 'poll_id' | 'votes_count'>[]) {
    console.log('Datos recibidos en createPoll:', poll);
    console.log('Opciones recibidas en createPoll:', options);

    console.log('Datos enviados a la tabla polls:', {
      ...poll,
      created_at: new Date().toISOString()
    });

    const { data: pollData, error: pollError } = await supabase
      .from('polls')
      .insert({
        ...poll,
        created_at: new Date().toISOString() // Asegura que siempre se envía created_at
      })
      .select()
      .single();

    console.log('Resultado de la inserción en polls:', pollData);

    if (pollError) {
      console.error('Error al insertar en polls:', pollError);
      throw pollError;
    }

    const formattedOptions = options.map(option => ({
      ...option,
      poll_id: pollData.id, // Relacionar opciones con la encuesta creada
      votes_count: 0 // Inicializar el conteo de votos
    }));

    console.log('Opciones formateadas para insertar:', formattedOptions);

    const { data: optionsData, error: optionsError } = await supabase
      .from('poll_options')
      .insert(formattedOptions);

    console.log('Resultado de la inserción en poll_options:', optionsData);

    if (optionsError) {
      console.error('Error al insertar en poll_options:', optionsError);
      throw optionsError;
    }

    return { ...pollData, options: optionsData };
  }

  async votePoll(vote: Omit<PollVote, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('poll_votes')
      .insert({
        ...vote,
        created_at: new Date().toISOString()
      });

    if (error) throw error;
    return data;
  }

  // Eventos
  async createEvent(event: Omit<CommunityEvent, 'id'>) {
    const { data, error } = await supabase
      .from('community_events')
      .insert(event)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Notificaciones
  async getNotifications(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async markNotificationAsRead(notificationId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async markAllNotificationsAsRead(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)
      .select();

    if (error) throw error;
    return data;
  }

  async saveRadioInteraction(trackId: string, action: string, userId: string): Promise<void> {
      // Aquí iría la lógica para guardar la interacción de radio en Supabase
      console.log(`Saving radio interaction: trackId=${trackId}, action=${action}, userId=${userId}`);
      // Simulamos una llamada a la API
      // En un caso real, aquí haria una llamada a tu API o base de datos
      return Promise.resolve();
    }
}

export default new CommunityService();

export async function fetchArtists() {
  const { data, error } = await supabase
    .from('artists')
    .select('id, name');

  if (error) {
    throw new Error('Error al obtener los artistas: ' + error.message);
  }

  return data || [];
}