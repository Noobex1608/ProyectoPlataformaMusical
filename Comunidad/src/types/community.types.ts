export interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at?: string;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  likes_count: number;
  comments_count: number;
}

export interface ForumComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at?: string;
}

export interface FanClub {
  id: string;
  name: string;
  description: string;
  banner_url?: string;
  artist_id: string;
  artist_name: string;
  rules: string;
  created_at: string;
}

export interface ClubMember {
  user_id: string;
  club_id: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
}

export interface RadioHistoryItem {
  id: string;
  user_id: string;
  track_id: string;
  action: 'play' | 'skip' | 'like';
  timestamp: string;
}

export interface RadioPreference {
  id: string;
  user_id: string;
  genres: string[];
  artists: string[];
  moods: string[];
  updated_at: string;
}

export interface SocialPlaylist {
  id: string;
  name: string;
  description: string;
  creator_id: string;
  cover_url?: string;
  is_collaborative: boolean;
  created_at: string;
  tracks_count: number;
}

export interface PlaylistTrack {
  playlist_id: string;
  track_id: string;
  added_by: string;
  added_at: string;
  position: number;
}

export interface PlaylistCollaborator {
  playlist_id: string;
  user_id: string;
  role: 'editor' | 'viewer';
  added_at: string;
}

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  capacity: number | null;
  attendees_count: number;
  creator_id: string;
  cover_url?: string;
  tags: string[];
  additional_info?: string;
}

export interface EventParticipant {
  event_id: string;
  user_id: string;
  status: 'going' | 'maybe' | 'not_going';
  registered_at: string;
}

export interface Poll {
  id: string;
  title: string;
  description: string;
  creator_id: string;
  end_date: string;
  created_at: string;
  options: PollOption[];
}

export interface PollOption {
  id: string;
  poll_id: string;
  text: string;
  votes_count: number;
}

export interface PollVote {
  id: string;
  poll_id: string;
  option_id: string;
  user_id: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  content: string;
  type: 'mention' | 'like' | 'comment' | 'follow' | 'event' | 'poll';
  is_read: boolean;
  created_at: string;
  reference_type?: string;
  reference_id?: string;
}

export interface Artist {
  id: string;
  name: string;
  image_url?: string;
  bio?: string;
  genres?: string[];
  created_at: string;
}

export interface Club {
  id: string;
  name: string;
  member_count: number;
  image: string;
  description?: string;
}

export interface ClubPost {
  id: string;
  club_id: string;
  author_id: string;
  content: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  isLiked?: boolean;
  author?: UserProfile;
}

export interface User {
  id: string;
  name: string;
  avatar_url?: string;
}

export interface Comment {
  id: string;
  user: User;
  content: string;
  created_at: string;
}