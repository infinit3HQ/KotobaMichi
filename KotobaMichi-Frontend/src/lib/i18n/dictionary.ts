export const locales = ["en", "si"] as const;
export type Locale = (typeof locales)[number];

export type Dictionary = {
  nav: {
    home: string;
    homeShort: string;
    practice: string;
    practiceShort: string;
    words: string;
    kanji: string;
    kanjiShort: string;
    quizzes: string;
    mock: string;
    mockShort: string;
    profile: string;
    admin: string;
    signIn: string;
    logout: string;
    signOut: string;
    createAccount: string;
    menuHint: string;
    tagline: string;
  };
  home: {
    pill: string;
    headline: string;
    headlineAccent: string;
    body: string;
    enterDojo: string;
    exploreWords: string;
    preview: string;
    coreConcept: string;
    pronounce: string;
    tapReveal: string;
    meaning: string;
    pathTitle: string;
    pathDesc: string;
    flipBack: string;
    methodBadge: string;
    methodTitle: string;
    fastTrack: string;
    sprintTitle: string;
    sprintDesc: string;
    enterDojoShort: string;
    audioNative: string;
    listenTitle: string;
    listenDesc: string;
    trainEars: string;
    lexicon: string;
    vaultTitle: string;
    vaultDesc: string;
    explore: string;
    retention: string;
    quizTitle: string;
    quizDesc: string;
    takeQuiz: string;
    n5Words: string;
    audio: string;
    sprints: string;
    offline: string;
    startToday: string;
    ready: string;
    readyBody: string;
    createAccount: string;
    signIn: string;
  };
  practice: {
    title: string;
    badge: string;
    subtitle: string;
    speed: string;
    target: string;
    active: string;
    pillarsLabel: string;
    activeDojo: string;
    levels: Record<"N5" | "N4" | "N3" | "N2" | "N1", string>;
    pillars: Record<
      "sprint" | "walk" | "grammar" | "kanji" | "listening" | "reading" | "flashcard" | "kana",
      { title: string; subtitle: string }
    >;
  };
  words: {
    vaultAll: string;
    vaultLevel: (level: string) => string;
    title: string;
    allDesc: string;
    levelDesc: (count: string, level: string) => string;
    practice: string;
    voice: (rate: string) => string;
    level: string;
    search: string;
  };
  kanji: {
    vaultAll: string;
    vaultLevel: (level: string) => string;
    title: string;
    allDesc: string;
    levelDesc: (count: string, level: string) => string;
    practice: string;
    voice: (rate: string) => string;
    level: string;
    search: string;
  };
  quizzes: {
    kicker: string;
    title: string;
    desc: string;
    create: string;
    loginToCreate: string;
    community: string;
    available: (count: number) => string;
    mine: string;
    signInBody: string;
    signIn: string;
  };
  auth: {
    login: string;
    signInAccount: string;
    email: string;
    password: string;
    signingIn: string;
    signIn: string;
    noAccount: string;
    register: string;
    forgot: string;
    reset: string;
    resendPrompt: string;
    resend: string;
    continueGoogle: string;
    orEmail: string;
    googleFailed: string;
  };
  path: {
    title: string;
    streak: (days: number) => string;
    due: (count: number) => string;
    studied: (count: number) => string;
    learned: (learned: number, total: number) => string;
    continue: string;
    signIn: string;
    newWords: string;
  };
  footer: {
    quote: string;
    crafted: string;
  };
};

const en: Dictionary = {
  nav: {
    home: "Home",
    homeShort: "Home",
    practice: "Practice Dojo",
    practiceShort: "Dojo",
    words: "Words",
    kanji: "Kanji",
    kanjiShort: "Kanji",
    quizzes: "Quizzes",
    mock: "Mock exam",
    mockShort: "Mock",
    profile: "Profile",
    admin: "Admin",
    signIn: "Sign in",
    logout: "Logout",
    signOut: "Sign out",
    createAccount: "Create free account",
    menuHint: "Practice Japanese from your phone.",
    tagline: "Japanese Lexicon Dojo",
  },
  home: {
    pill: "The Kyoto Modernist Way to Fluent Recall",
    headline: "Master Japanese Intuition with",
    headlineAccent: "High-Speed Drills",
    body: "KotobaMichi fuses spaced repetition flashcards, rapid-fire Speed Sprints, and native speech synthesis to lock JLPT vocabulary into natural reflexive instinct.",
    enterDojo: "Enter Practice Dojo",
    exploreWords: "Explore 560+ Words",
    preview: "Interactive preview — click card to flip:",
    coreConcept: "CORE CONCEPT",
    pronounce: "Pronounce",
    tapReveal: "Tap to reveal meaning",
    meaning: "MEANING",
    pathTitle: "The Path of Words",
    pathDesc: "Language mastery through consistent intuition",
    flipBack: "Flip back",
    methodBadge: "Comprehensive Method",
    methodTitle: "Engineered for Reflexive Comprehension",
    fastTrack: "Fast Track",
    sprintTitle: "Speed Sprint Dojo",
    sprintDesc: "60-second adrenaline drills with streak multipliers and instant keyboard feedback.",
    enterDojoShort: "Enter dojo",
    audioNative: "Audio Native",
    listenTitle: "Listening Ear-Trainer",
    listenDesc: "Authentic Japanese speech synthesis tuned for pitch and natural phrase cadence.",
    trainEars: "Train ears",
    lexicon: "Full Lexicon",
    vaultTitle: "Vocabulary Vault",
    vaultDesc: "Browse 560+ JLPT words with audio pronunciation, kanji furigana, and topics.",
    explore: "Explore words",
    retention: "Retention",
    quizTitle: "Spaced Quizzes",
    quizDesc: "Targeted active-recall evaluations that commit words into long-term mental memory.",
    takeQuiz: "Take a quiz",
    n5Words: "JLPT N5 Words",
    audio: "Audio Pronunciation",
    sprints: "Speed Sprints",
    offline: "Zero-Lag Offline",
    startToday: "Start Today",
    ready: "Ready to begin your KotobaMichi?",
    readyBody:
      "Create an account to track your mastery streaks, build custom quizzes, and sync your vocabulary journey across devices.",
    createAccount: "Create Free Account",
    signIn: "Sign In",
  },
  practice: {
    title: "KotobaMichi Dojo",
    badge: "Multi-Pillar",
    subtitle:
      "Master the complete JLPT spectrum: Grammar (文法), Kanji (漢字), Listening (聴解), Reading (読解), Vocabulary, and Kana.",
    speed: "Speed",
    target: "Target JLPT Level",
    active: "Active",
    pillarsLabel: "Interactive Practice Pillars (8 道場)",
    activeDojo: "Active Dojo",
    levels: {
      N5: "N5: Beginner foundations (Hiragana, Katakana, basic vocabulary & essential particles)",
      N4: "N4: Elementary Japanese (Compound sentences, daily expressions & polite/casual forms)",
      N3: "N3: Intermediate Japanese (Everyday conversational fluency & bridging to advanced)",
      N2: "N2: Pre-Advanced Japanese (Business, media, complex kanji & nuances)",
      N1: "N1: Advanced Mastery (Abstract discourse, complex idiomatic structures & native-level nuances)",
    },
    pillars: {
      sprint: { title: "Speed Sprint", subtitle: "Vocab Blitz" },
      walk: { title: "Word Walk", subtitle: "Meaning choices" },
      grammar: { title: "Grammar Lab", subtitle: "Star & Cloze" },
      kanji: { title: "Kanji Dojo", subtitle: "Radicals & Forge" },
      listening: { title: "Listening Ear", subtitle: "Task Dialogues" },
      reading: { title: "Reading Room", subtitle: "Paragraphs & Audio" },
      flashcard: { title: "3D Flashcards", subtitle: "SRS Repetition" },
      kana: { title: "Kana Board", subtitle: "Soundboard & Drills" },
    },
  },
  words: {
    vaultAll: "JLPT N5 – N1 Master Vault",
    vaultLevel: (level) => `JLPT ${level} Track`,
    title: "Vocabulary Explorer",
    allDesc:
      "Explore the full catalog of 8,447+ authentic Japanese words across all JLPT levels (N5 to N1) with tactile 3D cards, native speech synthesis, and topic immersion.",
    levelDesc: (count, level) =>
      `Master ${count}+ verified JLPT ${level} Japanese words through tactile 3D flashcards, native audio pronunciation, and topic-based immersion.`,
    practice: "Practice Dojo",
    voice: (rate) => `Voice: ${rate}`,
    level: "Level",
    search: "Search by English, Hiragana, Kanji, or Romaji... (Press '/' to focus)",
  },
  kanji: {
    vaultAll: "JLPT N5 – N2 Kanji Vault",
    vaultLevel: (level) => `JLPT ${level} Kanji`,
    title: "Kanji Explorer",
    allDesc:
      "Flip through every JLPT kanji in the vault. The front shows the character. The back shows the meaning, readings, radicals, and example words.",
    levelDesc: (count, level) =>
      `Study ${count} JLPT ${level} kanji with flip cards, native audio, radicals, and example words.`,
    practice: "Kanji Dojo",
    voice: (rate) => `Voice: ${rate}`,
    level: "Level",
    search: "Search by kanji, meaning, reading, or radical...",
  },
  quizzes: {
    kicker: "問題集 · Quizzes",
    title: "Spaced Repetition Quizzes",
    desc: "Test your vocabulary mastery with active recall evaluations and score breakdown.",
    create: "Create Quiz",
    loginToCreate: "Login to create quiz",
    community: "Curated Community Quizzes",
    available: (count) => `${count} available`,
    mine: "My Custom Quizzes",
    signInBody: "Sign in to author personal quizzes, save custom word lists, and track scores.",
    signIn: "Sign in",
  },
  auth: {
    login: "Login",
    signInAccount: "Sign in to your account",
    email: "Email",
    password: "Password",
    signingIn: "Signing in…",
    signIn: "Sign in",
    noAccount: "No account?",
    register: "Register",
    forgot: "Forgot your password?",
    reset: "Reset it",
    resendPrompt: "Need a new verification email?",
    resend: "Resend",
    continueGoogle: "Continue with Google",
    orEmail: "or use email",
    googleFailed: "Google sign-in did not finish. Try again.",
  },
  path: {
    title: "Your path",
    streak: (days) => (days === 1 ? "1-day streak" : `${days}-day streak`),
    due: (count) => (count === 1 ? "1 word due" : `${count} words due`),
    studied: (count) => (count === 1 ? "1 word today" : `${count} words today`),
    learned: (learned, total) => `${learned} / ${total} learned`,
    continue: "Continue",
    signIn: "Sign in and the dojo remembers where you stopped.",
    newWords: "New words come after today's reviews.",
  },
  footer: {
    quote: "「千里の道も一歩から」— A journey of a thousand miles begins with a single step.",
    crafted: "Crafted with precision.",
  },
};

const si: Dictionary = {
  nav: {
    home: "මුල් පිටුව",
    homeShort: "මුල්",
    practice: "පුහුණු ශාලාව",
    practiceShort: "පුහුණුව",
    words: "වචන",
    kanji: "කන්ජි",
    kanjiShort: "කන්ජි",
    quizzes: "ප්‍රශ්නාවලි",
    mock: "ආදර්ශ විභාගය",
    mockShort: "විභාග",
    profile: "පැතිකඩ",
    admin: "පරිපාලනය",
    signIn: "පිවිසෙන්න",
    logout: "ඉවත් වන්න",
    signOut: "ඉවත් වන්න",
    createAccount: "නොමිලේ ගිණුමක් සාදන්න",
    menuHint: "ජපන් භාෂාව දුරකථනයෙන්ම පුහුණු වන්න.",
    tagline: "ජපන් වචන මාවත",
  },
  home: {
    pill: "චතුර ලෙස මතක තබා ගැනීමේ කියෝතෝ මාවත",
    headline: "ජපන් භාෂා හැඟීම පුහුණු කරන්න",
    headlineAccent: "වේගවත් අභ්‍යාස වලින්",
    body: "KotobaMichi (言葉道) පුනරාවර්තන කාඩ්, වේගවත් පුහුණු, සහ ස්වභාවික උච්චාරණය එකට එකතු කර JLPT වචන ස්වභාවිකව මතක තබා ගැනීමට උදව් කරයි.",
    enterDojo: "පුහුණු ශාලාවට යන්න",
    exploreWords: "වචන 560+ බලන්න",
    preview: "පෙරදසුන — කාඩ්පත පෙරළීමට තට්ටු කරන්න",
    coreConcept: "මූලික අදහස",
    pronounce: "උච්චාරණය",
    tapReveal: "අර්ථය බැලීමට තට්ටු කරන්න",
    meaning: "අර්ථය",
    pathTitle: "වචනවල මාවත",
    pathDesc: "නිතර පුහුණුවෙන් භාෂාව හුරු කරගන්න",
    flipBack: "ආපසු හරවන්න",
    methodBadge: "සම්පූර්ණ ක්‍රමය",
    methodTitle: "ස්වභාවිකව තේරුම් ගැනීම සඳහා සැකසූ ඉගෙනුම",
    fastTrack: "වේගවත්",
    sprintTitle: "වේග පුහුණුව",
    sprintDesc: "තත්පර 60 අභ්‍යාස, දාම ලකුණු, සහ ක්ෂණික ප්‍රතිචාර.",
    enterDojoShort: "ශාලාවට යන්න",
    audioNative: "ශබ්දය",
    listenTitle: "සවන්දීමේ පුහුණුව",
    listenDesc: "ස්වභාවික ජපන් උච්චාරණයෙන් කන හුරු කරවයි.",
    trainEars: "කන පුහුණු කරන්න",
    lexicon: "සම්පූර්ණ ශබ්දකෝෂය",
    vaultTitle: "වචන ගබඩාව",
    vaultDesc: "JLPT වචන 560+, උච්චාරණය, කන්ජි, සහ මාතෘකා.",
    explore: "වචන බලන්න",
    retention: "මතකය",
    quizTitle: "පරතර ප්‍රශ්නාවලි",
    quizDesc: "ක්‍රියාශීලී මතකයෙන් වචන දිගුකාලීනව තබා ගන්න.",
    takeQuiz: "ප්‍රශ්නාවලියක් කරන්න",
    n5Words: "JLPT N5 වචන",
    audio: "ශබ්ද උච්චාරණය",
    sprints: "වේග පුහුණු",
    offline: "ප්‍රමාදයක් නැත",
    startToday: "අදම පටන් ගන්න",
    ready: "KotobaMichi ගමන අද පටන් ගන්නවාද?",
    readyBody: "ගිණුමක් සාදා ඔබේ ප්‍රගතිය, ප්‍රශ්නාවලි, සහ වචන ඕනෑම උපාංගයකින් බලාගන්න.",
    createAccount: "නොමිලේ ගිණුමක් සාදන්න",
    signIn: "පිවිසෙන්න",
  },
  practice: {
    title: "KotobaMichi ශාලාව",
    badge: "බහු අංශ",
    subtitle: "JLPT සම්පූර්ණයෙන්: ව්‍යාකරණ (文法), කන්ජි (漢字), සවන්දීම (聴解), කියවීම (読解), වචන, සහ කානා.",
    speed: "වේගය",
    target: "ඉලක්ක JLPT මට්ටම",
    active: "සක්‍රියයි",
    pillarsLabel: "පුහුණු අංශ (道場 8)",
    activeDojo: "සක්‍රිය ශාලාව",
    levels: {
      N5: "N5: ආරම්භය (හිරගනා, කතකනා, මූලික වචන සහ අත්‍යවශ්‍ය කෘදන්ත)",
      N4: "N4: මූලික ජපන් (සංයුක්ත වාක්‍ය, දෛනික යෙදුම්, ආචාරශීලී සහ සාමාන්‍ය භාෂාව)",
      N3: "N3: මධ්‍යම ජපන් (එදිනෙදා කතාබහ සහ උසස් මට්ටමට පියවර)",
      N2: "N2: උසස් පූර්ව ජපන් (ව්‍යාපාර, මාධ්‍ය, සංකීර්ණ කන්ජි)",
      N1: "N1: උසස් ප්‍රවීණතාව (වියුක්ත කතිකාව සහ ස්වභාවික භාෂා සූක්ෂ්මතා)",
    },
    pillars: {
      sprint: { title: "වේග පුහුණුව", subtitle: "වචන වේගය" },
      walk: { title: "වචන ගමන", subtitle: "තේරුම තෝරන්න" },
      grammar: { title: "ව්‍යාකරණ", subtitle: "තරු සහ හිඩැස්" },
      kanji: { title: "කන්ජි ශාලාව", subtitle: "මූලාංග" },
      listening: { title: "සවන්දීම", subtitle: "සංවාද" },
      reading: { title: "කියවීම", subtitle: "ඡේද සහ ශබ්දය" },
      flashcard: { title: "ත්‍රිමාන කාඩ්", subtitle: "පුනරාවර්තනය" },
      kana: { title: "කානා පුවරුව", subtitle: "ශබ්ද සහ අභ්‍යාස" },
    },
  },
  words: {
    vaultAll: "JLPT N5 – N1 ප්‍රධාන ගබඩාව",
    vaultLevel: (level) => `JLPT ${level} මාර්ගය`,
    title: "වචන ගවේෂකය",
    allDesc:
      "JLPT මට්ටම් සියල්ලෙහි (N5 සිට N1 දක්වා) සැබෑ ජපන් වචන 8,447+ ත්‍රිමාන කාඩ්, ස්වභාවික උච්චාරණය, සහ මාතෘකා සමඟ ගවේෂණය කරන්න.",
    levelDesc: (count, level) =>
      `සත්‍යාපිත JLPT ${level} ජපන් වචන ${count}+ ත්‍රිමාන කාඩ්, ස්වභාවික උච්චාරණය, සහ මාතෘකා හරහා පුහුණු වන්න.`,
    practice: "පුහුණු ශාලාව",
    voice: (rate) => `හඬ: ${rate}`,
    level: "මට්ටම",
    search: "ඉංග්‍රීසි, හිරගනා, කන්ජි, හෝ රෝමජි වලින් සොයන්න...",
  },
  kanji: {
    vaultAll: "JLPT N5 – N2 කන්ජි ගබඩාව",
    vaultLevel: (level) => `JLPT ${level} කන්ජි`,
    title: "කන්ජි ගවේෂකය",
    allDesc:
      "ගබඩාවේ සියලු JLPT කන්ජි කාඩ්පත් පෙරළා ඉගෙන ගන්න. ඉදිරිපස අකුරයි. පිටුපස අර්ථය, කියවීම්, මූලාංග, සහ උදාහරණ වචනයි.",
    levelDesc: (count, level) =>
      `JLPT ${level} කන්ජි ${count}ක් කාඩ්පත්, උච්චාරණය, මූලාංග, සහ උදාහරණ වචන සමඟ ඉගෙන ගන්න.`,
    practice: "කන්ජි ශාලාව",
    voice: (rate) => `හඬ: ${rate}`,
    level: "මට්ටම",
    search: "කන්ජි, අර්ථය, කියවීම, හෝ මූලාංගයෙන් සොයන්න...",
  },
  quizzes: {
    kicker: "問題集 · ප්‍රශ්නාවලි",
    title: "පරතර ප්‍රශ්නාවලි",
    desc: "ක්‍රියාශීලී මතකයෙන් ඔබේ වචන ප්‍රවීණතාව පරීක්ෂා කර ලකුණු බලන්න.",
    create: "ප්‍රශ්නාවලියක් සාදන්න",
    loginToCreate: "සෑදීමට පිවිසෙන්න",
    community: "ප්‍රජා ප්‍රශ්නාවලි",
    available: (count) => `තිබේ ${count}`,
    mine: "මගේ ප්‍රශ්නාවලි",
    signInBody: "ඔබේම ප්‍රශ්නාවලි සාදන්න, වචන ලැයිස්තු සුරකින්න, සහ ලකුණු බලාගන්න.",
    signIn: "පිවිසෙන්න",
  },
  auth: {
    login: "පිවිසීම",
    signInAccount: "ඔබේ ගිණුමට පිවිසෙන්න",
    email: "විද්‍යුත් තැපෑල",
    password: "මුරපදය",
    signingIn: "පිවිසෙමින්…",
    signIn: "පිවිසෙන්න",
    noAccount: "ගිණුමක් නැද්ද?",
    register: "ලියාපදිංචි වන්න",
    forgot: "මුරපදය අමතකද?",
    reset: "යළි සකසන්න",
    resendPrompt: "තහවුරු ඊමේලයක් ඕනද?",
    resend: "නැවත යවන්න",
    continueGoogle: "Google සමඟ පිවිසෙන්න",
    orEmail: "නැතහොත් ඊමේල් භාවිතා කරන්න",
    googleFailed: "Google පිවිසීම සම්පූර්ණ වුණේ නැහැ. නැවත උත්සාහ කරන්න.",
  },
  path: {
    title: "ඔබේ මාවත",
    streak: (days) => `දින ${days}ක පෙළ`,
    due: (count) => `අද නැවත ${count}`,
    studied: (count) => `අද වචන ${count}`,
    learned: (learned, total) => `ඉගෙනගත් ${learned} / ${total}`,
    continue: "නැවත පටන් ගන්න",
    signIn: "පිවිසුණාම ඔබ නැවැත්තු තැන මතක තියාගන්නවා.",
    newWords: "අද නැවත කියවීමෙන් පස්සේ අලුත් වචන.",
  },
  footer: {
    quote: "「千里の道も一歩から」— සැතපුම් දහසක ගමන පටන් ගන්නේ එක පියවරකින්.",
    crafted: "සියුම්ව නිමවා ඇත.",
  },
};

export const dictionaries: Record<Locale, Dictionary> = { en, si };
