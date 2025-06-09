import { defineStore } from 'pinia';
import { supabase } from '../lib/supabase';
import type { FanClub, ClubPost, ClubMember, UserProfile } from '@/types/community.types';

export const useFanClubStore = defineStore('fanClub', {
  state: () => ({
    currentClub: null as FanClub | null,
    posts: [] as ClubPost[],
    members: [] as ClubMember[]
  }),

  actions: {
    async getClubById(id: string): Promise<FanClub> {
      const { data, error } = await supabase
        .from('fan_clubs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },

    async getClubPosts(clubId: string): Promise<ClubPost[]> {
      const { data: posts, error } = await supabase
        .from('club_posts')
        .select(`
          *,
          author:profiles(*)
        `)
        .eq('club_id', clubId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our types
      interface PostWithAuthor extends ClubPost {
        author: UserProfile;
      }

      return (posts as (ClubPost & { author: UserProfile })[]).map((post: ClubPost & { author: unknown }) => ({
        ...post,
        author: post.author as UserProfile
      })) as PostWithAuthor[];
    },

    async getClubMembers(clubId: string): Promise<(ClubMember & UserProfile)[]> {
      const { data, error } = await supabase
        .from('club_members')
        .select(`
          *,
          profiles(*)
        `)
        .eq('club_id', clubId);

      if (error) throw error;

      return data.map(member => ({
        ...member,
        ...member.profiles
      }));
    },

    async checkMembership(clubId: string): Promise<boolean> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('club_members')
        .select('user_id')
        .eq('club_id', clubId)
        .eq('user_id', user.id)
        .single();

      if (error) return false;
      return !!data;
    },

    async joinClub(clubId: string): Promise<void> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('club_members')
        .insert({
          club_id: clubId,
          user_id: user.id,
          role: 'member'
        });

      if (error) throw error;
    },

    async togglePostLike(postId: string): Promise<void> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: existingLike } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        await supabase
          .from('post_likes')
          .delete()
          .eq('id', existingLike.id);
      } else {
        await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });
      }
    }
  }
}); 