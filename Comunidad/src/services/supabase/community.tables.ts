export const CommunityTables = {
  USER_PROFILES: 'user_profiles',
  ARTIST_FORUMS: 'artist_forums',
  FORUM_POSTS: 'forum_posts',
  FORUM_COMMENTS: 'forum_comments',
  FAN_CLUBS: 'fan_clubs',
  CLUB_MEMBERS: 'club_members',
  RADIO_HISTORY: 'radio_history',
  RADIO_PREFERENCES: 'radio_preferences',
  SOCIAL_PLAYLISTS: 'social_playlists',
  PLAYLIST_TRACKS: 'playlist_tracks',
  PLAYLIST_COLLABORATORS: 'playlist_collaborators',
  COMMUNITY_EVENTS: 'community_events',
  EVENT_PARTICIPANTS: 'event_participants',
  POLLS: 'polls',
  POLL_OPTIONS: 'poll_options',
  POLL_VOTES: 'poll_votes',
  NOTIFICATIONS: 'notifications',
  USER_STATS: 'user_stats'
} as const;

// Tipos derivados
export type CommunityTable = keyof typeof CommunityTables;
export type CommunityTableName = typeof CommunityTables[CommunityTable];