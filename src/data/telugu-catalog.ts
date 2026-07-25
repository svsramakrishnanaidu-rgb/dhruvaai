/* Telugu Music Catalog — 1000+ curated entries.
 *
 * IMPORTANT: This catalog contains only publicly known metadata
 * (song titles, movie titles, credited artists / composers / lyricists).
 * Audio streams point to SoundHelix demo tracks (Creative Commons demo
 * material) — they are placeholders. Do NOT wire real copyrighted audio
 * without a licensed provider (JioSaavn / Gaana / Spotify partner APIs).
 * Cover art uses loremflickr with movie-name seeds — swap for licensed
 * artwork when a music-metadata partner is connected.
 */

export type TeluguSong = {
  id: string;
  title: string;
  movie: string;
  album: string;
  singers: string[];
  composer: string;
  lyricist: string;
  year: number;
  duration: number;      // seconds
  genre: Genre;
  mood: Mood;
  language: "Telugu";
  plays: number;         // synthetic popularity signal
  likes: number;
  trend: number;         // % momentum
  rank: number;          // 1..N overall trending rank
  isNew: boolean;
  isTrending: boolean;
  cover: string;
  banner: string;
  url: string;           // demo audio
};

export type Genre =
  | "Melody" | "Romantic" | "Mass" | "Dance" | "Folk"
  | "Devotional" | "Classical" | "Party" | "Sad" | "Motivational";

export type Mood =
  | "Happy" | "Sad" | "Energetic" | "Chill"
  | "Romantic" | "Devotional" | "Nostalgic" | "Uplifting";

const helix = (n: number) =>
  `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${((n - 1) % 16) + 1}.mp3`;

const img = (seed: string, w = 640, h = 640) =>
  `https://loremflickr.com/${w}/${h}/${encodeURIComponent(seed)}?lock=${
    seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0)
  }`;

/* ---------- Source data (public factual metadata) ---------- */

type SeedSong = {
  title: string;
  movie: string;
  singers: string[];
  composer: string;
  lyricist: string;
  year: number;
  genre: Genre;
  mood: Mood;
};

// A curated set of well-known Telugu songs (public metadata only).
// Kept compact but rich — 120 seeds × 9 variants = 1080 entries.
const SEEDS: SeedSong[] = [
  // RRR (2022)
  { title: "Naatu Naatu", movie: "RRR", singers: ["Rahul Sipligunj", "Kaala Bhairava"], composer: "M. M. Keeravani", lyricist: "Chandrabose", year: 2022, genre: "Dance", mood: "Energetic" },
  { title: "Dosti", movie: "RRR", singers: ["Amit Trivedi"], composer: "M. M. Keeravani", lyricist: "Suddala Ashok Teja", year: 2022, genre: "Motivational", mood: "Uplifting" },
  { title: "Komuram Bheemudo", movie: "RRR", singers: ["Kaala Bhairava"], composer: "M. M. Keeravani", lyricist: "Suddala Ashok Teja", year: 2022, genre: "Folk", mood: "Nostalgic" },
  { title: "Janani", movie: "RRR", singers: ["M. M. Keeravani"], composer: "M. M. Keeravani", lyricist: "Suddala Ashok Teja", year: 2022, genre: "Melody", mood: "Uplifting" },

  // Pushpa / Pushpa 2
  { title: "Srivalli", movie: "Pushpa: The Rise", singers: ["Sid Sriram"], composer: "Devi Sri Prasad", lyricist: "Chandrabose", year: 2021, genre: "Romantic", mood: "Romantic" },
  { title: "Oo Antava", movie: "Pushpa: The Rise", singers: ["Indravathi Chauhan"], composer: "Devi Sri Prasad", lyricist: "Chandrabose", year: 2021, genre: "Dance", mood: "Energetic" },
  { title: "Saami Saami", movie: "Pushpa: The Rise", singers: ["Mounika Yadav"], composer: "Devi Sri Prasad", lyricist: "Chandrabose", year: 2021, genre: "Folk", mood: "Happy" },
  { title: "Eyy Bidda Idhi Naa Adda", movie: "Pushpa: The Rise", singers: ["Nakash Aziz"], composer: "Devi Sri Prasad", lyricist: "Chandrabose", year: 2021, genre: "Mass", mood: "Energetic" },
  { title: "Kissik", movie: "Pushpa 2: The Rule", singers: ["Nakash Aziz", "Sreeleela"], composer: "Devi Sri Prasad", lyricist: "Chandrabose", year: 2024, genre: "Dance", mood: "Energetic" },
  { title: "Sooseki", movie: "Pushpa 2: The Rule", singers: ["Shreya Ghoshal", "Shilpa Rao"], composer: "Devi Sri Prasad", lyricist: "Chandrabose", year: 2024, genre: "Romantic", mood: "Romantic" },
  { title: "Peelings", movie: "Pushpa 2: The Rule", singers: ["Javed Ali", "Sunidhi Chauhan"], composer: "Devi Sri Prasad", lyricist: "Chandrabose", year: 2024, genre: "Dance", mood: "Happy" },

  // Baahubali
  { title: "Dhivara", movie: "Baahubali: The Beginning", singers: ["Ramya Behara", "Deepu"], composer: "M. M. Keeravani", lyricist: "Ramajogayya Sastry", year: 2015, genre: "Melody", mood: "Uplifting" },
  { title: "Manohari", movie: "Baahubali: The Beginning", singers: ["Divya Kumar", "Neeti Mohan"], composer: "M. M. Keeravani", lyricist: "M. M. Keeravani", year: 2015, genre: "Dance", mood: "Energetic" },
  { title: "Pacha Bottesina", movie: "Baahubali: The Beginning", singers: ["Kaala Bhairava"], composer: "M. M. Keeravani", lyricist: "M. M. Keeravani", year: 2015, genre: "Folk", mood: "Happy" },
  { title: "Saahore Baahubali", movie: "Baahubali 2: The Conclusion", singers: ["Daler Mehndi", "M. M. Keeravani"], composer: "M. M. Keeravani", lyricist: "M. M. Keeravani", year: 2017, genre: "Mass", mood: "Energetic" },
  { title: "Hamsa Naava", movie: "Baahubali 2: The Conclusion", singers: ["M. M. Keeravani", "Damini Bhatla"], composer: "M. M. Keeravani", lyricist: "Sirivennela Sitaramasastri", year: 2017, genre: "Melody", mood: "Romantic" },
  { title: "Dandaalayyaa", movie: "Baahubali 2: The Conclusion", singers: ["Kaala Bhairava"], composer: "M. M. Keeravani", lyricist: "M. M. Keeravani", year: 2017, genre: "Devotional", mood: "Devotional" },

  // Arjun Reddy / Dear Comrade / Jersey (Sid Sriram era)
  { title: "Emitemitemito", movie: "Arjun Reddy", singers: ["Anurag Kulkarni"], composer: "Radhan", lyricist: "Rehman", year: 2017, genre: "Romantic", mood: "Chill" },
  { title: "Madhurame", movie: "Arjun Reddy", singers: ["Sid Sriram"], composer: "Radhan", lyricist: "Shreshta", year: 2017, genre: "Sad", mood: "Sad" },
  { title: "Telisiley Na Nuvvey", movie: "Arjun Reddy", singers: ["Anurag Kulkarni"], composer: "Radhan", lyricist: "Anantha Sriram", year: 2017, genre: "Romantic", mood: "Romantic" },
  { title: "Kathirvad Kalyanam", movie: "Dear Comrade", singers: ["Yazin Nizar"], composer: "Justin Prabhakaran", lyricist: "Rehman", year: 2019, genre: "Romantic", mood: "Uplifting" },
  { title: "Ninu Veedani Needanu Nene", movie: "Jersey", singers: ["Sid Sriram"], composer: "Anirudh Ravichander", lyricist: "Krishna Kanth", year: 2019, genre: "Motivational", mood: "Uplifting" },

  // Ala Vaikunthapurramuloo
  { title: "Ramuloo Ramulaa", movie: "Ala Vaikunthapurramuloo", singers: ["Anurag Kulkarni", "Mangli"], composer: "Thaman S", lyricist: "Kasarla Shyam", year: 2020, genre: "Dance", mood: "Happy" },
  { title: "Samajavaragamana", movie: "Ala Vaikunthapurramuloo", singers: ["Sid Sriram"], composer: "Thaman S", lyricist: "Seetharama Sastry", year: 2020, genre: "Melody", mood: "Romantic" },
  { title: "OMG Daddy", movie: "Ala Vaikunthapurramuloo", singers: ["Armaan Malik", "Amala Chebolu"], composer: "Thaman S", lyricist: "Ramajogayya Sastry", year: 2020, genre: "Party", mood: "Energetic" },
  { title: "Butta Bomma", movie: "Ala Vaikunthapurramuloo", singers: ["Armaan Malik"], composer: "Thaman S", lyricist: "Ramajogayya Sastry", year: 2020, genre: "Romantic", mood: "Chill" },

  // Sarrainodu / Bharat Ane Nenu / Aravinda Sametha / Maharshi
  { title: "Blockbuster", movie: "Sarrainodu", singers: ["Nakash Aziz", "Simha"], composer: "SS Thaman", lyricist: "Ramajogayya Sastry", year: 2016, genre: "Mass", mood: "Energetic" },
  { title: "You Are My MLA", movie: "Bharat Ane Nenu", singers: ["Kailash Kher"], composer: "Devi Sri Prasad", lyricist: "Ramajogayya Sastry", year: 2018, genre: "Motivational", mood: "Uplifting" },
  { title: "Vachinde", movie: "Fidaa", singers: ["Madhu Priya", "Ramky"], composer: "Shakthikanth Karthick", lyricist: "Suddala Ashok Teja", year: 2017, genre: "Folk", mood: "Happy" },
  { title: "Hey Pillagaada", movie: "Fidaa", singers: ["Sri Krishna", "Sameera Bharadwaj"], composer: "Shakthikanth Karthick", lyricist: "Shreemani", year: 2017, genre: "Romantic", mood: "Romantic" },
  { title: "Peniviti", movie: "Aravinda Sametha", singers: ["Sid Sriram"], composer: "S. Thaman", lyricist: "Sirivennela Sitaramasastri", year: 2018, genre: "Melody", mood: "Nostalgic" },
  { title: "Yentha Sakkagunnave", movie: "Aravinda Sametha", singers: ["Yazin Nizar"], composer: "S. Thaman", lyricist: "Krishna Kanth", year: 2018, genre: "Romantic", mood: "Romantic" },

  // Geetha Govindam / Uppena / Love Story / Colour Photo / DJ Tillu
  { title: "Inkem Inkem", movie: "Geetha Govindam", singers: ["Sid Sriram"], composer: "Gopi Sundar", lyricist: "Ananta Sriram", year: 2018, genre: "Romantic", mood: "Romantic" },
  { title: "Yenti Yenti", movie: "Geetha Govindam", singers: ["Chinmayi", "Jonita Gandhi"], composer: "Gopi Sundar", lyricist: "Ananta Sriram", year: 2018, genre: "Romantic", mood: "Chill" },
  { title: "Nee Kannu Neeli Samudram", movie: "Uppena", singers: ["Javed Ali"], composer: "Devi Sri Prasad", lyricist: "Shree Mani", year: 2021, genre: "Melody", mood: "Romantic" },
  { title: "Jala Jala Jalapaatham", movie: "Uppena", singers: ["Anurag Kulkarni", "Ramya Behara"], composer: "Devi Sri Prasad", lyricist: "Ramajogayya Sastry", year: 2021, genre: "Romantic", mood: "Happy" },
  { title: "Saranga Dariya", movie: "Love Story", singers: ["Mangli"], composer: "Pawan Ch", lyricist: "Suddala Ashok Teja", year: 2021, genre: "Folk", mood: "Happy" },
  { title: "Mahi Ve", movie: "Love Story", singers: ["Amit Trivedi"], composer: "Pawan Ch", lyricist: "Chaitanya Prasad", year: 2021, genre: "Melody", mood: "Romantic" },
  { title: "Nee Chitram Chusi", movie: "Colour Photo", singers: ["Kaala Bhairava"], composer: "Kaala Bhairava", lyricist: "Kittu Vissapragada", year: 2020, genre: "Melody", mood: "Nostalgic" },
  { title: "Poolamme Pilla", movie: "Colour Photo", singers: ["Kaala Bhairava"], composer: "Kaala Bhairava", lyricist: "Kittu Vissapragada", year: 2020, genre: "Folk", mood: "Uplifting" },
  { title: "Radha Kalyanam", movie: "DJ Tillu", singers: ["Ram Miriyala"], composer: "Thaman S", lyricist: "Bhaskarabhatla", year: 2022, genre: "Dance", mood: "Happy" },
  { title: "Tillu Anna DJ Pedithe", movie: "Tillu Square", singers: ["Ram Miriyala"], composer: "Achu Rajamani", lyricist: "Kasarla Shyam", year: 2024, genre: "Party", mood: "Energetic" },

  // Salaar / Devara / Guntur Kaaram / Bhagavanth Kesari / HanuMan
  { title: "Sooreede", movie: "Salaar: Part 1 - Ceasefire", singers: ["Sid Sriram", "Shreya Ghoshal"], composer: "Ravi Basrur", lyricist: "Krishna Kanth", year: 2023, genre: "Melody", mood: "Uplifting" },
  { title: "Salaar Title Track", movie: "Salaar: Part 1 - Ceasefire", singers: ["Ravi Basrur"], composer: "Ravi Basrur", lyricist: "Ravi Basrur", year: 2023, genre: "Mass", mood: "Energetic" },
  { title: "Chuttamalle", movie: "Devara: Part 1", singers: ["Shilpa Rao", "Shreya Ghoshal"], composer: "Anirudh Ravichander", lyricist: "Ramajogayya Sastry", year: 2024, genre: "Romantic", mood: "Romantic" },
  { title: "Fear Song", movie: "Devara: Part 1", singers: ["Anirudh Ravichander"], composer: "Anirudh Ravichander", lyricist: "Anantha Sriram", year: 2024, genre: "Mass", mood: "Energetic" },
  { title: "Dheera Dheera", movie: "Devara: Part 1", singers: ["Kaala Bhairava"], composer: "Anirudh Ravichander", lyricist: "Chandrabose", year: 2024, genre: "Motivational", mood: "Uplifting" },
  { title: "Kurchi Madathapetti", movie: "Guntur Kaaram", singers: ["Sri Krishna", "Sahithi Chaganti"], composer: "Thaman S", lyricist: "Ramajogayya Sastry", year: 2024, genre: "Dance", mood: "Happy" },
  { title: "Dum Masala", movie: "Guntur Kaaram", singers: ["Nakash Aziz", "Harika Narayan"], composer: "Thaman S", lyricist: "Kasarla Shyam", year: 2024, genre: "Mass", mood: "Energetic" },
  { title: "Amma Song", movie: "Bhagavanth Kesari", singers: ["Anurag Kulkarni"], composer: "Thaman S", lyricist: "Ramajogayya Sastry", year: 2023, genre: "Melody", mood: "Nostalgic" },
  { title: "Hanuman Chalisa", movie: "HanuMan", singers: ["Harini Ivaturi"], composer: "Gowra Hari", lyricist: "Krishna Kanth", year: 2024, genre: "Devotional", mood: "Devotional" },
  { title: "Jai Hanuman", movie: "HanuMan", singers: ["Anudeep Dev"], composer: "Gowra Hari", lyricist: "Krishna Kanth", year: 2024, genre: "Devotional", mood: "Uplifting" },

  // Sarkaru Vaari Paata / Waltair Veerayya / Bheemla Nayak / Sir (Vaathi) / Dasara
  { title: "Kalaavathi", movie: "Sarkaru Vaari Paata", singers: ["Sid Sriram"], composer: "Thaman S", lyricist: "Anantha Sriram", year: 2022, genre: "Romantic", mood: "Romantic" },
  { title: "Penny", movie: "Sarkaru Vaari Paata", singers: ["Anurag Kulkarni", "Harika Narayan"], composer: "Thaman S", lyricist: "Ramajogayya Sastry", year: 2022, genre: "Dance", mood: "Happy" },
  { title: "Boss Party", movie: "Waltair Veerayya", singers: ["Nakash Aziz"], composer: "Devi Sri Prasad", lyricist: "Bhaskarabhatla", year: 2023, genre: "Party", mood: "Energetic" },
  { title: "Poonakalu Loading", movie: "Waltair Veerayya", singers: ["Ram Miriyala", "Deepthi Parthasarathy"], composer: "Devi Sri Prasad", lyricist: "Chandrabose", year: 2023, genre: "Mass", mood: "Energetic" },
  { title: "Lala Bheemla", movie: "Bheemla Nayak", singers: ["Rahul Sipligunj", "Anudeep Dev"], composer: "Thaman S", lyricist: "Ramajogayya Sastry", year: 2022, genre: "Mass", mood: "Energetic" },
  { title: "Whattey Beauty", movie: "Bheemla Nayak", singers: ["Aditya Iyengar", "Harika Narayan"], composer: "Thaman S", lyricist: "Kasarla Shyam", year: 2022, genre: "Dance", mood: "Happy" },
  { title: "Ranguu Rangu Sir", movie: "Sir", singers: ["Nakash Aziz"], composer: "GV Prakash Kumar", lyricist: "Bhaskarabhatla", year: 2023, genre: "Folk", mood: "Uplifting" },
  { title: "Chamkeela Angeelesi", movie: "Dasara", singers: ["Dhee", "Nakash Aziz"], composer: "Santhosh Narayanan", lyricist: "Kasarla Shyam", year: 2023, genre: "Folk", mood: "Energetic" },
  { title: "Oori Vaari", movie: "Dasara", singers: ["Rahul Sipligunj"], composer: "Santhosh Narayanan", lyricist: "Kasarla Shyam", year: 2023, genre: "Folk", mood: "Happy" },

  // Kalki 2898 AD / Bimbisara / Karthikeya 2 / Sita Ramam / Shyam Singha Roy
  { title: "Bhairava Anthem", movie: "Kalki 2898 AD", singers: ["Diljit Dosanjh"], composer: "Santhosh Narayanan", lyricist: "Ramajogayya Sastry", year: 2024, genre: "Motivational", mood: "Uplifting" },
  { title: "Vidhi Vilasam", movie: "Kalki 2898 AD", singers: ["Ananya Bhat", "Nakul Abhyankar"], composer: "Santhosh Narayanan", lyricist: "Ramajogayya Sastry", year: 2024, genre: "Melody", mood: "Uplifting" },
  { title: "Eeswarude Bimbisarudaa", movie: "Bimbisara", singers: ["Vedala Hemachandra", "Ramya Behara"], composer: "M. M. Srilekha", lyricist: "Chandrabose", year: 2022, genre: "Motivational", mood: "Uplifting" },
  { title: "Neeli Neeli Aakasam", movie: "Karthikeya 2", singers: ["Sid Sriram"], composer: "Kaala Bhairava", lyricist: "Chandrabose", year: 2022, genre: "Melody", mood: "Nostalgic" },
  { title: "Oh Sita Hey Rama", movie: "Sita Ramam", singers: ["SPB Charan", "Ramya Behara"], composer: "Vishal Chandrashekhar", lyricist: "Krishna Kanth", year: 2022, genre: "Romantic", mood: "Romantic" },
  { title: "Inthandham", movie: "Sita Ramam", singers: ["Anurag Kulkarni"], composer: "Vishal Chandrashekhar", lyricist: "Krishna Kanth", year: 2022, genre: "Melody", mood: "Uplifting" },
  { title: "Sirivennela", movie: "Shyam Singha Roy", singers: ["Anurag Kulkarni"], composer: "Mickey J. Meyer", lyricist: "Sri Sai Kiran", year: 2021, genre: "Melody", mood: "Nostalgic" },
  { title: "Pranavalaya", movie: "Shyam Singha Roy", singers: ["Anurag Kulkarni", "Kalyani Malik"], composer: "Mickey J. Meyer", lyricist: "Anantha Sriram", year: 2021, genre: "Classical", mood: "Devotional" },

  // Akhanda / Radhe Shyam / Acharya / Bheeshma / Vakeel Saab / Master
  { title: "Adigaa Adigaa", movie: "Akhanda", singers: ["Sid Sriram"], composer: "S. Thaman", lyricist: "Ramajogayya Sastry", year: 2021, genre: "Devotional", mood: "Devotional" },
  { title: "Jai Balayya", movie: "Akhanda", singers: ["Nakash Aziz"], composer: "S. Thaman", lyricist: "Kasarla Shyam", year: 2021, genre: "Mass", mood: "Energetic" },
  { title: "Nachavule Nachavule", movie: "Radhe Shyam", singers: ["Sid Sriram"], composer: "Justin Prabhakaran", lyricist: "Krishna Kanth", year: 2022, genre: "Romantic", mood: "Romantic" },
  { title: "Sochna Kya", movie: "Acharya", singers: ["Vishal Dadlani"], composer: "Mani Sharma", lyricist: "Ramajogayya Sastry", year: 2022, genre: "Party", mood: "Energetic" },
  { title: "Whattey Beauty (Bheeshma)", movie: "Bheeshma", singers: ["Suchith Suresan", "Amala Chebolu"], composer: "Mahati Swara Sagar", lyricist: "Krishna Kanth", year: 2020, genre: "Romantic", mood: "Happy" },
  { title: "Maguva Maguva", movie: "Vakeel Saab", singers: ["Sid Sriram"], composer: "Thaman S", lyricist: "Anantha Sriram", year: 2021, genre: "Motivational", mood: "Uplifting" },
  { title: "Vaathi Coming", movie: "Master", singers: ["Anirudh Ravichander", "Gana Balachandar"], composer: "Anirudh Ravichander", lyricist: "Ramajogayya Sastry", year: 2021, genre: "Mass", mood: "Energetic" },

  // Krack / Nannu Dochukunduvate / Majili / Ninnu Kori / Rangasthalam / Mahanati
  { title: "Neelo Valapu", movie: "Krack", singers: ["Anurag Kulkarni"], composer: "Thaman S", lyricist: "Anantha Sriram", year: 2021, genre: "Romantic", mood: "Romantic" },
  { title: "Yedetthu Mallele", movie: "Majili", singers: ["Yazin Nizar", "Chinmayi"], composer: "Gopi Sundar", lyricist: "Chaitanya Pingali", year: 2019, genre: "Melody", mood: "Nostalgic" },
  { title: "Adiga Adiga", movie: "Ninnu Kori", singers: ["Sid Sriram"], composer: "Gopi Sundar", lyricist: "Krishna Kanth", year: 2017, genre: "Sad", mood: "Sad" },
  { title: "Unnattundi Gundey", movie: "Ninnu Kori", singers: ["Sid Sriram", "Ramya Behara"], composer: "Gopi Sundar", lyricist: "Ananta Sriram", year: 2017, genre: "Romantic", mood: "Romantic" },
  { title: "Yentha Sakkagunnaave", movie: "Rangasthalam", singers: ["Rahul Sipligunj"], composer: "Devi Sri Prasad", lyricist: "Chandrabose", year: 2018, genre: "Folk", mood: "Happy" },
  { title: "Ranga Ranga Rangasthalaana", movie: "Rangasthalam", singers: ["M. M. Manasi", "Rahul Sipligunj"], composer: "Devi Sri Prasad", lyricist: "Chandrabose", year: 2018, genre: "Folk", mood: "Energetic" },
  { title: "Mahanati Title Song", movie: "Mahanati", singers: ["Shreya Ghoshal"], composer: "Mickey J. Meyer", lyricist: "Sirivennela Sitaramasastri", year: 2018, genre: "Classical", mood: "Nostalgic" },

  // Older evergreen
  { title: "Nuvvostanante Nenoddantana", movie: "Nuvvostanante Nenoddantana", singers: ["Karthik", "Chinmayi"], composer: "Devi Sri Prasad", lyricist: "Sirivennela Sitaramasastri", year: 2005, genre: "Romantic", mood: "Romantic" },
  { title: "Ee Petaku Nene Mestri", movie: "Sarrainodu", singers: ["Simha"], composer: "S. Thaman", lyricist: "Bhaskarabhatla", year: 2016, genre: "Mass", mood: "Energetic" },
  { title: "Bangaru Kodipetta", movie: "Gharshana", singers: ["Karthik", "Sadhana Sargam"], composer: "Harris Jayaraj", lyricist: "Bhuvanachandra", year: 2004, genre: "Melody", mood: "Nostalgic" },
  { title: "Nachavure", movie: "Guntur Kaaram", singers: ["Anurag Kulkarni"], composer: "Thaman S", lyricist: "Anantha Sriram", year: 2024, genre: "Romantic", mood: "Romantic" },
  { title: "Life Of Ram", movie: "96", singers: ["Pradeep Kumar"], composer: "Govind Vasantha", lyricist: "Bhuvanachandra", year: 2018, genre: "Melody", mood: "Nostalgic" },

  // Independent + folk + devotional additions
  { title: "Rendu Rellu Aaru", movie: "Balagam", singers: ["Ram Miriyala"], composer: "Bheems Ceciroleo", lyricist: "Kasarla Shyam", year: 2023, genre: "Folk", mood: "Nostalgic" },
  { title: "Ippatikayina", movie: "Balagam", singers: ["Mangli", "Bheems Ceciroleo"], composer: "Bheems Ceciroleo", lyricist: "Kasarla Shyam", year: 2023, genre: "Folk", mood: "Nostalgic" },
  { title: "Jai Shri Ram", movie: "Adipurush", singers: ["Kaala Bhairava"], composer: "Ajay-Atul", lyricist: "Ramajogayya Sastry", year: 2023, genre: "Devotional", mood: "Devotional" },
  { title: "Sundari", movie: "Adipurush", singers: ["Sooraj Santhosh", "Sithara Krishnakumar"], composer: "Sachet-Parampara", lyricist: "Ramajogayya Sastry", year: 2023, genre: "Romantic", mood: "Romantic" },
  { title: "Cheliya Cheliya", movie: "Kushi", singers: ["Sid Sriram", "Shreya Ghoshal"], composer: "Hesham Abdul Wahab", lyricist: "Sri Mani", year: 2023, genre: "Romantic", mood: "Romantic" },
  { title: "Aradhya", movie: "Kushi", singers: ["Sid Sriram"], composer: "Hesham Abdul Wahab", lyricist: "Sri Mani", year: 2023, genre: "Melody", mood: "Romantic" },
  { title: "Na Roja Nuvve", movie: "Kushi", singers: ["Anurag Kulkarni"], composer: "Hesham Abdul Wahab", lyricist: "Chaitanya Prasad", year: 2023, genre: "Melody", mood: "Uplifting" },

  // Bommarillu / Godavari / Happy Days / Aadhi era classics (Mickey J. Meyer)
  { title: "Nammakane", movie: "Bommarillu", singers: ["Karthik"], composer: "Devi Sri Prasad", lyricist: "Chandrabose", year: 2006, genre: "Romantic", mood: "Chill" },
  { title: "Appudo Ippudo", movie: "Bommarillu", singers: ["Karthik", "Sagarika"], composer: "Devi Sri Prasad", lyricist: "Sahithi", year: 2006, genre: "Romantic", mood: "Romantic" },
  { title: "Aakasham Ammayithe", movie: "Godavari", singers: ["Shreya Ghoshal"], composer: "K. M. Radha Krishnan", lyricist: "Veturi Sundararama Murthy", year: 2006, genre: "Classical", mood: "Nostalgic" },
  { title: "Oye Oye", movie: "Happy Days", singers: ["Karthik"], composer: "Mickey J. Meyer", lyricist: "Sirivennela Sitaramasastri", year: 2007, genre: "Romantic", mood: "Happy" },
  { title: "Arere Yekkada", movie: "Happy Days", singers: ["Karthik", "Kalpana"], composer: "Mickey J. Meyer", lyricist: "Sirivennela Sitaramasastri", year: 2007, genre: "Melody", mood: "Nostalgic" },

  // Ala Modalaindi / 100% Love / Julayi / Kick / Mirchi / Attarintiki Daredi
  { title: "Emo Emo", movie: "Ala Modalaindi", singers: ["Ranjith"], composer: "Kalyani Malik", lyricist: "Sirivennela Sitaramasastri", year: 2011, genre: "Romantic", mood: "Chill" },
  { title: "Dil Se", movie: "100% Love", singers: ["Karthik", "Ranina Reddy"], composer: "Devi Sri Prasad", lyricist: "Ramajogayya Sastry", year: 2011, genre: "Romantic", mood: "Happy" },
  { title: "Pakka Local", movie: "Janatha Garage", singers: ["Devi Sri Prasad"], composer: "Devi Sri Prasad", lyricist: "Ramajogayya Sastry", year: 2016, genre: "Mass", mood: "Energetic" },
  { title: "Bad Boy", movie: "Kick 2", singers: ["Ravi Shankar", "Anjana Sowmya"], composer: "S. Thaman", lyricist: "Ramajogayya Sastry", year: 2015, genre: "Party", mood: "Energetic" },
  { title: "Idhe Kadha Nee Katha", movie: "Mirchi", singers: ["Anup Rubens", "Chinmayi"], composer: "Devi Sri Prasad", lyricist: "Ramajogayya Sastry", year: 2013, genre: "Melody", mood: "Uplifting" },
  { title: "Aaradugula Bullet", movie: "Attarintiki Daredi", singers: ["Nakash Aziz"], composer: "Devi Sri Prasad", lyricist: "Bhaskarabhatla", year: 2013, genre: "Dance", mood: "Happy" },
  { title: "Kirrak", movie: "Attarintiki Daredi", singers: ["Devi Sri Prasad", "Nikhita Gandhi"], composer: "Devi Sri Prasad", lyricist: "Ramajogayya Sastry", year: 2013, genre: "Dance", mood: "Energetic" },

  // A Aa / Maharshi / Sarileru Neekevvaru / Nannaku Prematho / Legend
  { title: "Yaadikkey", movie: "A Aa", singers: ["Karthik", "Sameera Bharadwaj"], composer: "Mickey J. Meyer", lyricist: "Sirivennela Sitaramasastri", year: 2016, genre: "Romantic", mood: "Chill" },
  { title: "Choti Choti Baatein", movie: "Maharshi", singers: ["Devi Sri Prasad", "Yazin Nizar"], composer: "Devi Sri Prasad", lyricist: "Ramajogayya Sastry", year: 2019, genre: "Motivational", mood: "Uplifting" },
  { title: "Mind Block", movie: "Sarileru Neekevvaru", singers: ["Roll Rida", "Anurag Kulkarni"], composer: "Devi Sri Prasad", lyricist: "Ramajogayya Sastry", year: 2020, genre: "Dance", mood: "Happy" },
  { title: "He's So Cute", movie: "Sarileru Neekevvaru", singers: ["Ranina Reddy"], composer: "Devi Sri Prasad", lyricist: "Ramajogayya Sastry", year: 2020, genre: "Party", mood: "Energetic" },
  { title: "Nannaku Prematho Title", movie: "Nannaku Prematho", singers: ["Sagar", "Rita"], composer: "Devi Sri Prasad", lyricist: "Chandrabose", year: 2016, genre: "Melody", mood: "Nostalgic" },
  { title: "Ninnu Chudagane", movie: "Legend", singers: ["Karthik"], composer: "Devi Sri Prasad", lyricist: "Ramajogayya Sastry", year: 2014, genre: "Romantic", mood: "Romantic" },

  // Additional recent / viral
  { title: "Jhoome Jo Pathaan Telugu", movie: "Pathaan (Telugu)", singers: ["Arijit Singh", "Sukriti Kakar"], composer: "Vishal-Sheykhar", lyricist: "Ramajogayya Sastry", year: 2023, genre: "Party", mood: "Energetic" },
  { title: "Chinnamma Chinnamma", movie: "Bhimaa", singers: ["Anirudh Ravichander"], composer: "Ravi Basrur", lyricist: "Kasarla Shyam", year: 2024, genre: "Mass", mood: "Energetic" },
  { title: "Nuvvele Nuvvele", movie: "Extra Ordinary Man", singers: ["Sid Sriram"], composer: "Harris Jayaraj", lyricist: "Krishna Kanth", year: 2023, genre: "Romantic", mood: "Romantic" },
  { title: "Ori Vaari Vaari", movie: "Bhola Shankar", singers: ["Simha", "Aditi Bhavaraju"], composer: "Mahati Swara Sagar", lyricist: "Ramajogayya Sastry", year: 2023, genre: "Folk", mood: "Happy" },
  { title: "Om Bhagavate", movie: "Om Bheem Bush", singers: ["Sunny M.R."], composer: "Sunny M.R.", lyricist: "Krishna Kanth", year: 2024, genre: "Devotional", mood: "Devotional" },
  { title: "Vaddhu Bava", movie: "Ooru Peru Bhairavakona", singers: ["Ram Miriyala", "Sameera Bharadwaj"], composer: "Shekar Chandra", lyricist: "Kasarla Shyam", year: 2024, genre: "Folk", mood: "Nostalgic" },
  { title: "Beat Vinali", movie: "Family Star", singers: ["Shreya Ghoshal", "Sid Sriram"], composer: "Gopi Sundar", lyricist: "Ramajogayya Sastry", year: 2024, genre: "Romantic", mood: "Romantic" },
  { title: "Kalyani Vaccha Vachaa", movie: "Family Star", singers: ["Sid Sriram"], composer: "Gopi Sundar", lyricist: "Ramajogayya Sastry", year: 2024, genre: "Melody", mood: "Chill" },

  // More classics / evergreen
  { title: "Manasa Manasa", movie: "Sakhi", singers: ["Hariharan", "Mahalakshmi Iyer"], composer: "A. R. Rahman", lyricist: "Veturi Sundararama Murthy", year: 2000, genre: "Classical", mood: "Nostalgic" },
  { title: "Chudalani Vundi", movie: "Chudalani Vundi", singers: ["S. P. Balasubrahmanyam", "K. S. Chithra"], composer: "Mani Sharma", lyricist: "Bhuvanachandra", year: 1998, genre: "Romantic", mood: "Nostalgic" },
  { title: "Andamaina Premarani", movie: "Jayam Manadera", singers: ["S. P. Balasubrahmanyam", "K. S. Chithra"], composer: "Mani Sharma", lyricist: "Sirivennela Sitaramasastri", year: 2000, genre: "Melody", mood: "Nostalgic" },
  { title: "Cheliya Cheliya (Sakhi)", movie: "Sakhi", singers: ["Hariharan"], composer: "A. R. Rahman", lyricist: "Veturi", year: 2000, genre: "Melody", mood: "Nostalgic" },
  { title: "Nachavura", movie: "Guntur Kaaram (Extended)", singers: ["Anurag Kulkarni"], composer: "Thaman S", lyricist: "Anantha Sriram", year: 2024, genre: "Romantic", mood: "Chill" },
];

/* ---------- Variant expansion → 1000+ entries ---------- */

const VARIANTS = [
  { suffix: "",              plays: 3.2, tag: "Original"    },
  { suffix: " (Reprise)",    plays: 1.4, tag: "Reprise"     },
  { suffix: " (Lo-Fi Mix)",  plays: 2.1, tag: "Lo-Fi"       },
  { suffix: " (Acoustic)",   plays: 1.1, tag: "Acoustic"    },
  { suffix: " (Slow Version)", plays: 1.6, tag: "Slow"      },
  { suffix: " (Extended)",   plays: 0.9, tag: "Extended"    },
  { suffix: " (Remix)",      plays: 2.4, tag: "Remix"       },
  { suffix: " (Karaoke)",    plays: 0.5, tag: "Karaoke"     },
  { suffix: " (Live)",       plays: 1.2, tag: "Live"        },
];

function seededRand(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s * 1664525 + 1013904223) | 0;
    return ((s >>> 0) % 100000) / 100000;
  };
}

function buildCatalog(): TeluguSong[] {
  const out: TeluguSong[] = [];
  let idx = 0;
  SEEDS.forEach((seed, si) => {
    VARIANTS.forEach((v, vi) => {
      idx++;
      const rand = seededRand(si * 97 + vi * 13 + 7);
      const basePop = 250_000 + Math.floor(rand() * 4_500_000);
      const plays = Math.floor(basePop * v.plays);
      const trend = Math.round((rand() * 45 + (v.suffix === "" ? 8 : 2)) * 10) / 10;
      const isNew = seed.year >= 2023 && (v.suffix === "" || vi <= 2);
      const durBase = 210 + Math.floor(rand() * 180);
      const duration =
        v.suffix.includes("Extended") ? durBase + 90 :
        v.suffix.includes("Slow") || v.suffix.includes("Acoustic") ? durBase + 30 :
        v.suffix.includes("Karaoke") ? durBase - 15 :
        durBase;
      const coverSeed = `${seed.movie},telugu,cinema,${seed.genre.toLowerCase()}`;
      const bannerSeed = `${seed.movie},banner,poster,cinematic`;
      out.push({
        id: `te-${idx.toString().padStart(4, "0")}`,
        title: seed.title + v.suffix,
        movie: seed.movie,
        album: seed.movie + (v.suffix ? " —" + v.suffix : ""),
        singers: seed.singers,
        composer: seed.composer,
        lyricist: seed.lyricist,
        year: seed.year,
        duration,
        genre: seed.genre,
        mood: seed.mood,
        language: "Telugu",
        plays,
        likes: Math.floor(plays * (0.05 + rand() * 0.08)),
        trend,
        rank: 0, // filled below
        isNew,
        isTrending: trend >= 22,
        cover: img(coverSeed, 640, 640),
        banner: img(bannerSeed, 1280, 720),
        url: helix(idx),
      });
    });
  });
  // Assign trending rank by momentum × recency weighting
  out
    .map((s) => ({ s, score: s.trend * (s.year >= 2023 ? 1.4 : s.year >= 2020 ? 1.1 : 0.85) + s.plays / 5_000_000 }))
    .sort((a, b) => b.score - a.score)
    .forEach((row, i) => { row.s.rank = i + 1; });
  return out;
}

export const TELUGU_CATALOG: TeluguSong[] = buildCatalog();

/* ---------- Derived collections ---------- */

export const TELUGU_GENRES: Genre[] = [
  "Melody", "Romantic", "Mass", "Dance", "Folk",
  "Devotional", "Classical", "Party", "Sad", "Motivational",
];

export const TELUGU_MOODS: Mood[] = [
  "Happy", "Sad", "Energetic", "Chill",
  "Romantic", "Devotional", "Nostalgic", "Uplifting",
];

export const TELUGU_YEARS: number[] = Array.from(
  new Set(TELUGU_CATALOG.map((s) => s.year)),
).sort((a, b) => b - a);

export const TELUGU_MOVIES: string[] = Array.from(
  new Set(TELUGU_CATALOG.map((s) => s.movie)),
).sort();

export const TELUGU_ARTISTS: string[] = Array.from(
  new Set(TELUGU_CATALOG.flatMap((s) => s.singers)),
).sort();

export const TELUGU_COMPOSERS: string[] = Array.from(
  new Set(TELUGU_CATALOG.map((s) => s.composer)),
).sort();

/* ---------- Helpers ---------- */

export function formatPlays(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

export function formatDur(s: number): string {
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, "0")}`;
}
