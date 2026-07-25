/* Trending Songs — curated demo playlist.
   Audio: SoundHelix (free demo mp3s). Covers: loremflickr seeds. */

export type TrendingSong = {
  id: string;
  title: string;
  artist: string;
  album: string;
  cover: string;
  url: string;
  duration: number; // seconds (approx)
  plays: string;
  genre: string;
  trend: number; // % momentum
};

const helix = (n: number) =>
  `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${n}.mp3`;

const cover = (seed: string) =>
  `https://loremflickr.com/640/640/${encodeURIComponent(seed)}?lock=${
    seed.length * 7
  }`;

export const TRENDING_SONGS: TrendingSong[] = [
  { id: "t01", title: "Golden Fields",     artist: "Aurora Bloom",   album: "Harvest Moon",     genre: "Cinematic",  plays: "2.4M", trend: 18, duration: 372, cover: cover("gold,fields,cinematic"),   url: helix(1)  },
  { id: "t02", title: "Monsoon Pulse",     artist: "The Verdant",    album: "Green Signals",    genre: "Electronic", plays: "1.9M", trend: 24, duration: 425, cover: cover("monsoon,rain,neon"),        url: helix(2)  },
  { id: "t03", title: "Silver Sickle",     artist: "K.G. Blackwood", album: "Ore & Ash",        genre: "Score",      plays: "3.1M", trend: 31, duration: 410, cover: cover("silver,cinematic,dark"),   url: helix(3)  },
  { id: "t04", title: "Delta Winds",       artist: "Ravi Prakash",   album: "Godavari",         genre: "Classical",  plays: "912K", trend:  9, duration: 388, cover: cover("river,delta,sunset"),      url: helix(4)  },
  { id: "t05", title: "Ember Bazaar",      artist: "Nirvaan",        album: "Night Mandi",      genre: "World",      plays: "1.3M", trend: 12, duration: 400, cover: cover("bazaar,ember,market"),     url: helix(5)  },
  { id: "t06", title: "Combine Harvest",   artist: "Iron Furrow",    album: "Diesel Bloom",     genre: "Rock",       plays: "780K", trend:  6, duration: 358, cover: cover("tractor,industrial"),      url: helix(6)  },
  { id: "t07", title: "Cotton Highway",    artist: "Meera Kaur",     album: "Guntur Nights",    genre: "Indie",      plays: "2.0M", trend: 21, duration: 402, cover: cover("cotton,highway,neon"),     url: helix(7)  },
  { id: "t08", title: "Paddy Rain",        artist: "Lo-Fi Kisan",    album: "Field Study",      genre: "Lo-Fi",      plays: "4.2M", trend: 42, duration: 380, cover: cover("paddy,rain,lofi"),         url: helix(8)  },
  { id: "t09", title: "Chilli Ember",      artist: "Sarayu",         album: "Red Season",       genre: "Fusion",     plays: "1.1M", trend: 14, duration: 366, cover: cover("chilli,red,ember"),        url: helix(9)  },
  { id: "t10", title: "Turmeric Sun",      artist: "Ochre Sky",      album: "Kadapa Gold",      genre: "Ambient",    plays: "690K", trend:  4, duration: 421, cover: cover("turmeric,sun,ochre"),      url: helix(10) },
  { id: "t11", title: "Mango Grove",       artist: "Anaya",          album: "Krishna Basin",    genre: "Pop",        plays: "1.7M", trend: 17, duration: 396, cover: cover("mango,grove,summer"),      url: helix(11) },
  { id: "t12", title: "Iron Plough",       artist: "SRK Collective", album: "Rolled Gold",      genre: "Trap",       plays: "2.8M", trend: 27, duration: 356, cover: cover("iron,plough,dark"),        url: helix(12) },
];
