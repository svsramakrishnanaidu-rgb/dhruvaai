/* Trending Songs — now backed by the Telugu catalog (1000+ entries).
 *
 * The existing MusicProvider / MiniPlayer consume `TRENDING_SONGS` and the
 * `TrendingSong` shape below. We adapt the richer TeluguSong catalog to that
 * shape so global playback keeps working while the Music page uses the full
 * catalog for discovery.
 */

import { TELUGU_CATALOG, formatPlays, type TeluguSong } from "./telugu-catalog";

export type TrendingSong = {
  id: string;
  title: string;
  artist: string;
  album: string;
  cover: string;
  url: string;
  duration: number;
  plays: string;
  genre: string;
  trend: number;
};

function toTrending(s: TeluguSong): TrendingSong {
  return {
    id: s.id,
    title: s.title,
    artist: s.singers.join(", "),
    album: s.movie,
    cover: s.cover,
    url: s.url,
    duration: s.duration,
    plays: formatPlays(s.plays),
    genre: s.genre,
    trend: s.trend,
  };
}

// Full catalog is available to the player — auto-advance walks the whole list.
export const TRENDING_SONGS: TrendingSong[] = TELUGU_CATALOG.map(toTrending);
