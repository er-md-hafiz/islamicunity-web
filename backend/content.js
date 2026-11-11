export const verse = {
  arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا",
  transliteration: "Fa-inna ma‘al-‘usri yusrā.",
  translations: {
    en: "So, surely with hardship comes ease.",
    hi: "बेशक, मुश्किल के साथ आसानी है।",
    ur: "پس بے شک مشکل کے ساتھ آسانی ہے۔",
    ar: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا",
  },
  reference: "Surah Ash-Sharh · 94:5",
  reflection:
    "A gentle reminder to hold on to hope. Every difficult moment carries the promise of ease.",
};
export const content = {
  audio: {
    title: "A moment to listen",
    description:
      "Listen to a spoken reading of today’s verse. Speech synthesis is a reading aid, not a Quran recitation.",
    items: [
      {
        title: "Today’s inspiration",
        body: "Surah Ash-Sharh · 94:5",
        speech: verse.transliteration,
      },
      {
        title: "Morning remembrance",
        body: "SubhanAllah · Alhamdulillah · Allahu Akbar",
        speech: "Subhan Allah. Alhamdu lillah. Allahu Akbar.",
      },
    ],
  },
  books: {
    title: "Your reading corner",
    description: "Explore trusted, freely accessible reading resources.",
    items: [
      {
        title: "The Noble Quran",
        body: "Read the Arabic text and translations.",
        url: "https://quran.com",
      },
      {
        title: "Hadith collections",
        body: "Browse collections with references.",
        url: "https://sunnah.com",
      },
    ],
  },
  allah_names: {
    title: "Beautiful names, deeper meaning",
    description: "A small selection for reflection from the 99 names of Allah.",
    items: [
      { title: "الرَّحْمَٰنُ · Ar-Rahman", body: "The Most Merciful" },
      { title: "الرَّحِيمُ · Ar-Raheem", body: "The Especially Merciful" },
      { title: "الْمَلِكُ · Al-Malik", body: "The Sovereign" },
      { title: "السَّلَامُ · As-Salam", body: "The Source of Peace" },
      { title: "الْعَلِيمُ · Al-Aleem", body: "The All-Knowing" },
      { title: "الْغَفُورُ · Al-Ghafoor", body: "The All-Forgiving" },
    ],
  },
  halal: {
    title: "Mindful everyday choices",
    description:
      "General learning resources; check certification and consult a qualified scholar for individual questions.",
    items: [
      {
        title: "Read the label",
        body: "Check ingredients and the certification body. Certification standards can differ by region.",
      },
      {
        title: "Ask with confidence",
        body: "Ask food providers about ingredients, preparation, and cross-contact.",
      },
    ],
  },
  news: {
    title: "Community noticeboard",
    description:
      "Sample community notices — these are not live news or scheduled events.",
    items: [
      {
        title: "Make room for connection",
        body: "Ask your local mosque about study circles, volunteering, and community meals.",
      },
      {
        title: "Small acts, lasting impact",
        body: "Check in on a neighbour or support a local food bank this week.",
      },
    ],
  },
  photo: {
    title: "Places of reflection",
    description: "Explore the architecture and heritage of the Muslim world.",
    items: [
      {
        title: "Al-Masjid al-Haram",
        body: "Makkah · Saudi Arabia",
        url: "https://commons.wikimedia.org/wiki/Category:Masjid_al-Haram",
      },
      {
        title: "Al-Masjid an-Nabawi",
        body: "Madinah · Saudi Arabia",
        url: "https://commons.wikimedia.org/wiki/Category:Al-Masjid_an-Nabawi",
      },
    ],
  },
  video: {
    title: "Watch & reflect",
    description:
      "Browse Islamic Unity’s original media and learning resources.",
    items: [
      {
        title: "Islamic Unity media",
        body: "Open the original Islamic Unity website to explore available media.",
        url: "https://er-md-hafiz.github.io/islamicunity-web/",
      },
    ],
  },
  mosque: {
    title: "Find your community",
    description:
      "Search for mosques near your current location using your map provider.",
    items: [
      {
        title: "Mosques nearby",
        body: "Opens a map search. Your map provider may request your location.",
        url: "https://www.google.com/maps/search/mosque+near+me/",
      },
    ],
  },
  currency: {
    title: "Currency converter",
    description:
      "Illustrative rates only. Not live exchange rates or a transaction quote.",
    rates: { INR: 83, USD: 1, SAR: 3.75, AED: 3.67, GBP: 0.79 },
    items: [],
  },
};
