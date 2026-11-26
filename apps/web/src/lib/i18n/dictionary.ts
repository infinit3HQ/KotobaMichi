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
    eyebrow: string;
    headline: string;
    headlineAccent: string;
    body: string;
    startPractising: string;
    continueStudying: string;
    createAccount: string;
    browseWords: string;
    signIn: string;
    statWords: string;
    statKanji: string;
    statGrammar: string;
    statMock: string;
    previewLabel: string;
    pronounce: string;
    tapReveal: string;
    meaning: string;
    pathTitle: string;
    pathDesc: string;
    flipBack: string;
    insideKicker: string;
    insideTitle: string;
    features: Record<
      "practice" | "words" | "kanji" | "quizzes" | "mock" | "review",
      { title: string; desc: string; cta: string }
    >;
    stepsKicker: string;
    stepsTitle: string;
    steps: { title: string; desc: string }[];
    ctaTitle: string;
    ctaBody: string;
    welcomeBack: string;
  };
  practice: {
    title: string;
    subtitle: string;
    speed: string;
    speedHint: string;
    soundOn: string;
    soundOff: string;
    levelLabel: string;
    drillsTitle: string;
    drillCount: (count: number) => string;
    loading: string;
    levels: Record<"N5" | "N4" | "N3" | "N2" | "N1", string>;
    drills: Record<
      | "sprint"
      | "walk"
      | "grammar"
      | "kanji"
      | "listening"
      | "reading"
      | "flashcard"
      | "kana",
      { title: string; subtitle: string }
    >;
  };
  words: {
    title: string;
    description: (count: string) => string;
    levelDescription: (count: string, level: string) => string;
    practice: string;
    voiceLabel: string;
    voice: (rate: string) => string;
    levelLabel: string;
    allLevels: string;
    search: string;
    clearSearch: string;
    topicLabel: string;
    allTopics: string;
    viewLabel: string;
    viewCards: string;
    viewList: string;
    resultCount: (shown: string, total: string) => string;
    revealAll: string;
    hideAll: string;
    columnsLabel: string;
    columnsAuto: string;
    tapToReveal: string;
    tapToFlipBack: string;
    playAudio: string;
    cardLabel: (word: string) => string;
    emptyTitle: string;
    emptyDesc: string;
    clearFilters: string;
    errorTitle: string;
    errorDesc: string;
    retry: string;
    colLevel: string;
    colWord: string;
    colRomaji: string;
    colMeaning: string;
    colTopic: string;
    colType: string;
    colAudio: string;
    pageOf: (page: string, total: string) => string;
    prevPage: string;
    nextPage: string;
  };
  kanji: {
    title: string;
    description: (count: string) => string;
    levelDescription: (count: string, level: string) => string;
    practice: string;
    voiceLabel: string;
    voice: (rate: string) => string;
    levelLabel: string;
    allLevels: string;
    search: string;
    clearSearch: string;
    viewLabel: string;
    viewCards: string;
    viewList: string;
    resultCount: (shown: string, total: string) => string;
    revealAll: string;
    hideAll: string;
    columnsLabel: string;
    columnsAuto: string;
    tapToReveal: string;
    tapToFlipBack: string;
    playAudio: string;
    cardLabel: (kanji: string) => string;
    onLabel: string;
    kunLabel: string;
    emptyTitle: string;
    emptyDesc: string;
    clearSearchAction: string;
    colLevel: string;
    colKanji: string;
    colMeaning: string;
    colReading: string;
    colExample: string;
    colAudio: string;
    pageOf: (page: string, total: string) => string;
    prevPage: string;
    nextPage: string;
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
    mineCount: (count: number) => string;
    signInTitle: string;
    signInBody: string;
    signIn: string;
    emptyPublicTitle: string;
    emptyPublicBody: string;
    emptyMineTitle: string;
    emptyMineBody: string;
    buildFirst: string;
    loadError: string;
    loadErrorBody: string;
    retry: string;
    wordCount: (count: number) => string;
    attemptCount: (count: number) => string;
    start: string;
    question: (current: number, total: number) => string;
    answered: (answered: number, total: number) => string;
    choosePrompt: string;
    typePrompt: string;
    typePlaceholder: string;
    listen: string;
    previous: string;
    next: string;
    submit: string;
    submitting: string;
    submitted: string;
    submitFailed: string;
    quizLoadError: string;
    noWords: string;
    noWordsBody: string;
    backToQuizzes: string;
    createTitle: string;
    createDesc: string;
    fieldTitle: string;
    fieldTitlePlaceholder: string;
    fieldDescription: string;
    fieldDescriptionPlaceholder: string;
    makePublic: string;
    makePublicHint: string;
    selectWords: string;
    selectedCount: (count: number) => string;
    filterWords: string;
    noWordsMatch: string;
    wordsLoadError: string;
    creating: string;
    created: string;
    createFailed: string;
    titleRequired: string;
    pickAtLeastOne: string;
    resultsTitle: string;
    resultsDesc: string;
    correctCount: (correct: number, total: number) => string;
    review: string;
    yourAnswer: string;
    correctAnswer: string;
    noAnswer: string;
    correct: string;
    incorrect: string;
    resultsMissingTitle: string;
    resultsMissingBody: string;
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
    loggedIn: string;
    loginFailed: string;
    registerTitle: string;
    registerDesc: string;
    confirmPassword: string;
    createAccount: string;
    creatingAccount: string;
    haveAccount: string;
    registered: string;
    registeredNoEmail: string;
    registerFailed: string;
    passwordMin: string;
    passwordsMismatch: string;
    forgotTitle: string;
    forgotDesc: string;
    sendResetLink: string;
    resetSent: string;
    resendTitle: string;
    resendDesc: string;
    sendLink: string;
    resendSent: string;
    sending: string;
    tryAgainIn: (seconds: number) => string;
    rateLimited: (seconds: number) => string;
    tooManyRequests: string;
    requestFailed: string;
    rememberPassword: string;
    backToLogin: string;
    newPasswordTitle: string;
    newPasswordDesc: string;
    newPassword: string;
    updatePassword: string;
    updating: string;
    passwordUpdated: string;
    resetFailed: string;
    missingResetToken: string;
    requestNewLink: string;
    verifyTitle: string;
    verifyDesc: string;
    verifying: string;
    verified: string;
    verifyFailed: string;
    missingVerifyToken: string;
    goToLogin: string;
    tryAgain: string;
  };
  path: {
    title: string;
    streak: (days: number) => string;
    due: (count: number) => string;
    studied: (count: number) => string;
    learned: (learned: number, total: number) => string;
    continue: string;
    signInTitle: string;
    signIn: string;
    newWords: string;
    loadError: string;
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
    eyebrow: "JLPT N5 to N1 · free to use",
    headline: "The path of words,",
    headlineAccent: "from N5 to N1.",
    body: "Vocabulary, kanji, grammar, reading and listening for every JLPT level. Spaced review brings each word back just before you would forget it, and timed N3, N2 and N1 mock papers show where you stand.",
    startPractising: "Start practising",
    continueStudying: "Continue studying",
    createAccount: "Create free account",
    browseWords: "Browse words",
    signIn: "Sign in",
    statWords: "words",
    statKanji: "kanji",
    statGrammar: "grammar points",
    statMock: "N3, N2 and N1 mock papers",
    previewLabel: "Try a card",
    pronounce: "Play pronunciation",
    tapReveal: "Tap to flip",
    meaning: "Meaning",
    pathTitle: "The path of words",
    pathDesc: "言葉 (words) + 道 (path)",
    flipBack: "Tap to flip back",
    insideKicker: "What's inside",
    insideTitle: "Everything for the exam, in one place",
    features: {
      practice: {
        title: "Practice dojo",
        desc: "Eight drills: flashcards, speed sprint, word walk, grammar, kanji, listening, reading and kana.",
        cta: "Open the dojo",
      },
      words: {
        title: "Word list",
        desc: "Every JLPT word from N5 to N1 with reading, meaning and audio. Search, filter and flip.",
        cta: "Browse words",
      },
      kanji: {
        title: "Kanji",
        desc: "N5 to N2 kanji with on and kun readings, radicals and example words.",
        cta: "Browse kanji",
      },
      quizzes: {
        title: "Quizzes",
        desc: "Short quizzes from the community, or make your own from the words you need.",
        cta: "See quizzes",
      },
      mock: {
        title: "Mock exams",
        desc: "N3, N2 and N1 past papers from 2010 to 2026, timed like exam day. Sit the whole paper or one section, and turn what you missed into review cards.",
        cta: "Sit a paper",
      },
      review: {
        title: "Spaced review",
        desc: "Words and missed mock questions come back on a schedule, so they stay. A daily plan, streak and exam countdown keep you on track.",
        cta: "Start reviewing",
      },
    },
    stepsKicker: "How it works",
    stepsTitle: "A little every day",
    steps: [
      {
        title: "Pick your level",
        desc: "Start at N5, or go straight to the level you are studying for.",
      },
      {
        title: "Practise and review",
        desc: "Short drills and flashcards. Due reviews come first, new words after.",
      },
      {
        title: "Test yourself",
        desc: "Sit a timed mock paper, see your score for each section, and review the questions you missed.",
      },
    ],
    ctaTitle: "Keep your progress",
    ctaBody:
      "A free account saves your reviews, streak, quizzes and mock exam scores on every device.",
    welcomeBack: "Welcome back",
  },
  practice: {
    title: "Practice dojo",
    subtitle:
      "Short drills for vocabulary, kanji, grammar, listening, reading and kana. Pick a JLPT level, then a drill.",
    speed: "Voice",
    speedHint: "Switch between normal and slower Japanese audio",
    soundOn: "Mute sound effects",
    soundOff: "Turn on sound effects",
    levelLabel: "JLPT level",
    drillsTitle: "Drills",
    drillCount: (count) => `${count} drills`,
    loading: "Loading drill",
    levels: {
      N5: "Beginner: kana, basic words and the most common particles.",
      N4: "Elementary: everyday expressions, polite and plain forms, longer sentences.",
      N3: "Intermediate: everyday conversation and the step towards advanced Japanese.",
      N2: "Upper intermediate: news, work topics and more complex kanji.",
      N1: "Advanced: abstract topics, idioms and fine shades of meaning.",
    },
    drills: {
      sprint: { title: "Speed Sprint", subtitle: "60-second word quiz" },
      walk: { title: "Word Walk", subtitle: "Pick the meaning, no timer" },
      grammar: { title: "Grammar Lab", subtitle: "Patterns and fill-ins" },
      kanji: { title: "Kanji Dojo", subtitle: "Readings and parts" },
      listening: { title: "Listening", subtitle: "Short dialogues" },
      reading: { title: "Reading", subtitle: "Passages with audio" },
      flashcard: { title: "Flashcards", subtitle: "Spaced repetition review" },
      kana: { title: "Kana Chart", subtitle: "Hiragana and katakana" },
    },
  },
  words: {
    title: "Vocabulary",
    description: (count) =>
      `${count} JLPT words from N5 to N1. Tap a card to see what it means, or play it to hear it.`,
    levelDescription: (count, level) =>
      `${count} JLPT ${level} words. Tap a card to see what it means, or play it to hear it.`,
    practice: "Practise words",
    voiceLabel: "Voice speed",
    voice: (rate) => `Voice ${rate}`,
    levelLabel: "JLPT level",
    allLevels: "All",
    search: "Search English, kana, kanji or romaji",
    clearSearch: "Clear search",
    topicLabel: "Topic",
    allTopics: "All topics",
    viewLabel: "View",
    viewCards: "Cards",
    viewList: "List",
    resultCount: (shown, total) => `${shown} of ${total} words`,
    revealAll: "Show all meanings",
    hideAll: "Hide meanings",
    columnsLabel: "Card columns",
    columnsAuto: "Auto",
    tapToReveal: "Tap to see the meaning",
    tapToFlipBack: "Tap to flip back",
    playAudio: "Play pronunciation",
    cardLabel: (word) => `${word}. Tap to see the meaning.`,
    emptyTitle: "No words match",
    emptyDesc: "Try another search, topic or level.",
    clearFilters: "Clear filters",
    errorTitle: "Could not load the word list",
    errorDesc: "Check your connection and try again.",
    retry: "Try again",
    colLevel: "Level",
    colWord: "Word",
    colRomaji: "Romaji",
    colMeaning: "Meaning",
    colTopic: "Topic",
    colType: "Type",
    colAudio: "Audio",
    pageOf: (page, total) => `Page ${page} of ${total}`,
    prevPage: "Previous",
    nextPage: "Next",
  },
  kanji: {
    title: "Kanji",
    description: (count) =>
      `${count} JLPT kanji from N5 to N2. Tap a card to see the meaning, readings, radicals and example words.`,
    levelDescription: (count, level) =>
      `${count} JLPT ${level} kanji. Tap a card to see the meaning, readings, radicals and example words.`,
    practice: "Practise kanji",
    voiceLabel: "Voice speed",
    voice: (rate) => `Voice ${rate}`,
    levelLabel: "JLPT level",
    allLevels: "All",
    search: "Search kanji, meaning, reading or radical",
    clearSearch: "Clear search",
    viewLabel: "View",
    viewCards: "Cards",
    viewList: "List",
    resultCount: (shown, total) => `${shown} of ${total} kanji`,
    revealAll: "Show all meanings",
    hideAll: "Hide meanings",
    columnsLabel: "Card columns",
    columnsAuto: "Auto",
    tapToReveal: "Tap to see the meaning",
    tapToFlipBack: "Tap to flip back",
    playAudio: "Play pronunciation",
    cardLabel: (kanji) => `Kanji ${kanji}. Tap to see the meaning.`,
    onLabel: "On",
    kunLabel: "Kun",
    emptyTitle: "No kanji match",
    emptyDesc: "Nothing at this level matches that search.",
    clearSearchAction: "Clear search",
    colLevel: "Level",
    colKanji: "Kanji",
    colMeaning: "Meaning",
    colReading: "Reading",
    colExample: "Example",
    colAudio: "Audio",
    pageOf: (page, total) => `Page ${page} of ${total}`,
    prevPage: "Previous",
    nextPage: "Next",
  },
  quizzes: {
    kicker: "小テスト",
    title: "Quizzes",
    desc: "Short vocabulary quizzes shared by other learners, or ones you build from the words you need.",
    create: "Create quiz",
    loginToCreate: "Sign in to create",
    community: "Community quizzes",
    available: (count) => `${count} available`,
    mine: "Your quizzes",
    mineCount: (count) => `${count} created`,
    signInTitle: "Sign in to make your own quizzes",
    signInBody:
      "Pick the words you want to drill, save them as a quiz, and keep your scores.",
    signIn: "Sign in",
    emptyPublicTitle: "No community quizzes yet",
    emptyPublicBody:
      "Quizzes that other learners make public will show up here.",
    emptyMineTitle: "You haven't made a quiz yet",
    emptyMineBody: "Choose a few words and turn them into a quiz.",
    buildFirst: "Build your first quiz",
    loadError: "Couldn't load quizzes",
    loadErrorBody: "Check your connection and try again.",
    retry: "Try again",
    wordCount: (count) => `${count} ${count === 1 ? "word" : "words"}`,
    attemptCount: (count) => `${count} ${count === 1 ? "attempt" : "attempts"}`,
    start: "Start quiz",
    question: (current, total) => `Question ${current} of ${total}`,
    answered: (answered, total) => `${answered} of ${total} answered`,
    choosePrompt: "Choose the English meaning",
    typePrompt: "Type the English meaning",
    typePlaceholder: "Type your answer",
    listen: "Listen",
    previous: "Previous",
    next: "Next",
    submit: "Submit answers",
    submitting: "Submitting…",
    submitted: "Answers submitted",
    submitFailed: "Couldn't submit your answers. Try again.",
    quizLoadError: "Couldn't load this quiz",
    noWords: "This quiz has no words",
    noWordsBody: "Words may have been removed after the quiz was made.",
    backToQuizzes: "Back to quizzes",
    createTitle: "Create a quiz",
    createDesc:
      "Give it a title, pick the words, and choose whether other learners can take it.",
    fieldTitle: "Title",
    fieldTitlePlaceholder: "My N5 verbs",
    fieldDescription: "Description",
    fieldDescriptionPlaceholder: "Optional",
    makePublic: "Make public",
    makePublicHint: "Public quizzes appear in the community list.",
    selectWords: "Words",
    selectedCount: (count) => `${count} selected`,
    filterWords: "Filter words",
    noWordsMatch: "No words match that filter.",
    wordsLoadError: "Couldn't load words",
    creating: "Creating…",
    created: "Quiz created",
    createFailed: "Couldn't create the quiz",
    titleRequired: "Add a title first",
    pickAtLeastOne: "Pick at least one word",
    resultsTitle: "Results",
    resultsDesc: "Your score and a review of every question.",
    correctCount: (correct, total) => `${correct} of ${total} correct`,
    review: "Review",
    yourAnswer: "Your answer",
    correctAnswer: "Correct answer",
    noAnswer: "No answer",
    correct: "Correct",
    incorrect: "Incorrect",
    resultsMissingTitle: "Results aren't available",
    resultsMissingBody:
      "Detailed results are shown right after you submit. If you refreshed the page, they are no longer stored.",
  },
  auth: {
    login: "Sign in",
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
    orEmail: "or",
    googleFailed: "Google sign-in did not finish. Try again.",
    loggedIn: "Signed in",
    loginFailed: "Sign-in failed. Check your email and password.",
    registerTitle: "Create an account",
    registerDesc: "Save your progress and build your own quizzes.",
    confirmPassword: "Confirm password",
    createAccount: "Create account",
    creatingAccount: "Creating account…",
    haveAccount: "Already have an account?",
    registered: "Account created. Check your email to verify it, then sign in.",
    registeredNoEmail: "Account created, but we could not send the verification email. Request a new link below.",
    registerFailed: "Could not create the account.",
    passwordMin: "Use at least 6 characters.",
    passwordsMismatch: "Passwords do not match.",
    forgotTitle: "Reset your password",
    forgotDesc: "Enter your email and we will send you a link to reset it.",
    sendResetLink: "Send reset link",
    resetSent: "If an account uses that email, a reset link is on its way.",
    resendTitle: "Resend verification email",
    resendDesc:
      "Enter your email and we will send you a new verification link.",
    sendLink: "Send link",
    resendSent:
      "If an account uses that email, a new verification link is on its way.",
    sending: "Sending…",
    tryAgainIn: (seconds) => `Try again in ${seconds}s`,
    rateLimited: (seconds) =>
      `Too many requests. Wait ${seconds}s before trying again.`,
    tooManyRequests: "Too many requests. Wait a moment and try again.",
    requestFailed: "Something went wrong. Try again.",
    rememberPassword: "Remembered it?",
    backToLogin: "Back to sign in",
    newPasswordTitle: "Choose a new password",
    newPasswordDesc: "Enter a new password for your account.",
    newPassword: "New password",
    updatePassword: "Update password",
    updating: "Updating…",
    passwordUpdated: "Password updated. Sign in with the new one.",
    resetFailed: "Could not reset the password.",
    missingResetToken:
      "This link has no reset token. Request a new reset link.",
    requestNewLink: "Request a new link",
    verifyTitle: "Verify your email",
    verifyDesc: "We are checking the link from your email.",
    verifying: "Verifying your email…",
    verified: "Your email is verified. You can sign in now.",
    verifyFailed: "Verification failed.",
    missingVerifyToken:
      "This link has no verification token. Use the link from your email, or request a new one.",
    goToLogin: "Go to sign in",
    tryAgain: "Try again",
  },
  path: {
    title: "Your path",
    streak: (days) => (days === 1 ? "1-day streak" : `${days}-day streak`),
    due: (count) => (count === 1 ? "1 word due" : `${count} words due`),
    studied: (count) => (count === 1 ? "1 word today" : `${count} words today`),
    learned: (learned, total) => `${learned} / ${total} learned`,
    continue: "Continue",
    signInTitle: "Sign in to keep your place",
    signIn:
      "The dojo remembers where you stopped, which words are due and your daily streak.",
    newWords: "New words come after today's reviews.",
    loadError:
      "Could not load your progress. Your practice still works and will sync later.",
  },
  footer: {
    quote:
      "「千里の道も一歩から」— A journey of a thousand miles begins with a single step.",
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
    eyebrow: "JLPT N5 සිට N1 දක්වා · නොමිලේ",
    headline: "වචනවල මාවත,",
    headlineAccent: "N5 සිට N1 දක්වා.",
    body: "සෑම JLPT මට්ටමකටම වචන, කන්ජි, ව්‍යාකරණ, කියවීම සහ සවන්දීම. ඔබ අමතක කිරීමට පෙර එක් එක් වචනය නැවත පුනරීක්ෂණයට එයි, කාල සීමා සහිත N3, N2 සහ N1 ආදර්ශ ප්‍රශ්න පත්‍ර ඔබ සිටින තැන පෙන්වයි.",
    startPractising: "පුහුණුව අරඹන්න",
    continueStudying: "ඉගෙනීම දිගටම කරන්න",
    createAccount: "නොමිලේ ගිණුමක් සාදන්න",
    browseWords: "වචන බලන්න",
    signIn: "පුරනය වන්න",
    statWords: "වචන",
    statKanji: "කන්ජි",
    statGrammar: "ව්‍යාකරණ කරුණු",
    statMock: "N3, N2 සහ N1 ආදර්ශ ප්‍රශ්න පත්‍ර",
    previewLabel: "කාඩ්පතක් උත්සාහ කරන්න",
    pronounce: "උච්චාරණය අසන්න",
    tapReveal: "පෙරළීමට තට්ටු කරන්න",
    meaning: "අර්ථය",
    pathTitle: "වචනවල මාවත",
    pathDesc: "言葉 (වචන) + 道 (මාවත)",
    flipBack: "ආපසු පෙරළීමට තට්ටු කරන්න",
    insideKicker: "ඇතුළත ඇති දේ",
    insideTitle: "විභාගයට අවශ්‍ය සියල්ල එකම තැනක",
    features: {
      practice: {
        title: "පුහුණු ශාලාව",
        desc: "අභ්‍යාස අටක්: කාඩ්පත්, වේග පුහුණුව, වචන ගමන, ව්‍යාකරණ, කන්ජි, සවන්දීම, කියවීම සහ කනා.",
        cta: "පුහුණු ශාලාව විවෘත කරන්න",
      },
      words: {
        title: "වචන ලැයිස්තුව",
        desc: "N5 සිට N1 දක්වා සෑම JLPT වචනයක්ම කියවීම, අර්ථය සහ හඬ සමඟ.",
        cta: "වචන බලන්න",
      },
      kanji: {
        title: "කන්ජි",
        desc: "N5 සිට N2 දක්වා කන්ජි, කියවීම්, මූලාංග සහ උදාහරණ වචන සමඟ.",
        cta: "කන්ජි බලන්න",
      },
      quizzes: {
        title: "ප්‍රශ්නාවලි",
        desc: "ප්‍රජාවේ කෙටි ප්‍රශ්නාවලි, නැතහොත් ඔබට අවශ්‍ය වචන වලින් ඔබේම එකක් සාදන්න.",
        cta: "ප්‍රශ්නාවලි බලන්න",
      },
      mock: {
        title: "ආදර්ශ විභාග",
        desc: "2010 සිට 2026 දක්වා N3, N2 සහ N1 පසුගිය ප්‍රශ්න පත්‍ර, විභාග දිනයේ කාල සීමා සමඟ. සම්පූර්ණ පත්‍රය හෝ එක් කොටසක් කරන්න, වැරදුණු ප්‍රශ්න පුනරීක්ෂණ කාඩ්පත් බවට පත් කරන්න.",
        cta: "ප්‍රශ්න පත්‍රයක් කරන්න",
      },
      review: {
        title: "කාලානුරූප පුනරීක්ෂණය",
        desc: "වචන සහ වැරදුණු ආදර්ශ ප්‍රශ්න නියමිත කාලයට නැවත එයි. දෛනික සැලැස්ම, දින පෙළ සහ විභාග ගණන් කිරීම ඔබව නිවැරදි මඟේ තබයි.",
        cta: "පුනරීක්ෂණය අරඹන්න",
      },
    },
    stepsKicker: "එය ක්‍රියා කරන ආකාරය",
    stepsTitle: "සෑම දිනකම ටිකක්",
    steps: [
      {
        title: "ඔබේ මට්ටම තෝරන්න",
        desc: "N5 සිට අරඹන්න, නැතහොත් ඔබ ඉගෙන ගන්නා මට්ටමට කෙලින්ම යන්න.",
      },
      {
        title: "පුහුණු වී පුනරීක්ෂණය කරන්න",
        desc: "කෙටි අභ්‍යාස සහ කාඩ්පත්. නියමිත පුනරීක්ෂණ මුලින්, නව වචන පසුව.",
      },
      {
        title: "ඔබම පරීක්ෂා කරන්න",
        desc: "කාල සීමා සහිත ආදර්ශ ප්‍රශ්න පත්‍රයක් කර, එක් එක් කොටසේ ලකුණු බලා, වැරදුණු ප්‍රශ්න නැවත පුනරීක්ෂණය කරන්න.",
      },
    ],
    ctaTitle: "ඔබේ ප්‍රගතිය සුරකින්න",
    ctaBody:
      "නොමිලේ ගිණුමක් ඔබේ පුනරීක්ෂණ, දින පෙළ, ප්‍රශ්නාවලි සහ ආදර්ශ විභාග ලකුණු සෑම උපාංගයකම සුරකියි.",
    welcomeBack: "නැවත සාදරයෙන් පිළිගනිමු",
  },
  practice: {
    title: "පුහුණු ශාලාව",
    subtitle:
      "වචන, කන්ජි, ව්‍යාකරණ, සවන්දීම, කියවීම සහ කානා සඳහා කෙටි අභ්‍යාස. JLPT මට්ටමක් තෝරා, ඉන්පසු අභ්‍යාසයක් තෝරන්න.",
    speed: "හඬ",
    speedHint: "සාමාන්‍ය සහ සෙමින් ජපන් හඬ අතර මාරු කරන්න",
    soundOn: "ශබ්ද ප්‍රයෝග නිහඬ කරන්න",
    soundOff: "ශබ්ද ප්‍රයෝග සක්‍රිය කරන්න",
    levelLabel: "JLPT මට්ටම",
    drillsTitle: "අභ්‍යාස",
    drillCount: (count) => `අභ්‍යාස ${count}`,
    loading: "අභ්‍යාසය පූරණය වෙමින්",
    levels: {
      N5: "ආරම්භය: කානා, මූලික වචන සහ බහුලව යෙදෙන නිපාත.",
      N4: "මූලික: දෛනික යෙදුම්, ආචාරශීලී සහ සාමාන්‍ය රූප, දිගු වාක්‍ය.",
      N3: "මධ්‍යම: එදිනෙදා කතාබහ සහ උසස් මට්ටමට පියවර.",
      N2: "ඉහළ මධ්‍යම: පුවත්, රැකියා මාතෘකා සහ සංකීර්ණ කන්ජි.",
      N1: "උසස්: වියුක්ත මාතෘකා, යෙදුම් සහ සියුම් අර්ථ භේද.",
    },
    drills: {
      sprint: { title: "වේග පුහුණුව", subtitle: "තත්පර 60 වචන ප්‍රශ්නාවලිය" },
      walk: { title: "වචන ගමන", subtitle: "තේරුම තෝරන්න, කාල සීමාවක් නැත" },
      grammar: { title: "ව්‍යාකරණ", subtitle: "රටා සහ හිස්තැන්" },
      kanji: { title: "කන්ජි ශාලාව", subtitle: "කියවීම් සහ කොටස්" },
      listening: { title: "සවන්දීම", subtitle: "කෙටි සංවාද" },
      reading: { title: "කියවීම", subtitle: "ශබ්දය සමඟ ඡේද" },
      flashcard: { title: "මතක කාඩ්", subtitle: "කාලානුරූප පුනරාවර්තනය" },
      kana: { title: "කානා සටහන", subtitle: "හිරගනා සහ කතකනා" },
    },
  },
  words: {
    title: "වචන මාලාව",
    description: (count) =>
      `N5 සිට N1 දක්වා JLPT වචන ${count}. අර්ථය බැලීමට කාඩ්පතක් තට්ටු කරන්න, නැතහොත් උච්චාරණය අසන්න.`,
    levelDescription: (count, level) =>
      `JLPT ${level} වචන ${count}. අර්ථය බැලීමට කාඩ්පතක් තට්ටු කරන්න, නැතහොත් උච්චාරණය අසන්න.`,
    practice: "වචන පුහුණු වන්න",
    voiceLabel: "හඬේ වේගය",
    voice: (rate) => `හඬ ${rate}`,
    levelLabel: "JLPT මට්ටම",
    allLevels: "සියල්ල",
    search: "ඉංග්‍රීසි, කානා, කන්ජි හෝ රෝමජි වලින් සොයන්න",
    clearSearch: "සෙවීම මකන්න",
    topicLabel: "මාතෘකාව",
    allTopics: "සියලු මාතෘකා",
    viewLabel: "දසුන",
    viewCards: "කාඩ්",
    viewList: "ලැයිස්තුව",
    resultCount: (shown, total) => `වචන ${total}න් ${shown}ක්`,
    revealAll: "සියලු අර්ථ පෙන්වන්න",
    hideAll: "අර්ථ සඟවන්න",
    columnsLabel: "කාඩ් තීරු",
    columnsAuto: "ස්වයං",
    tapToReveal: "අර්ථය බැලීමට තට්ටු කරන්න",
    tapToFlipBack: "ආපසු හැරවීමට තට්ටු කරන්න",
    playAudio: "උච්චාරණය අසන්න",
    cardLabel: (word) => `${word}. අර්ථය බැලීමට තට්ටු කරන්න.`,
    emptyTitle: "ගැළපෙන වචන නැත",
    emptyDesc: "වෙනත් සෙවීමක්, මාතෘකාවක් හෝ මට්ටමක් උත්සාහ කරන්න.",
    clearFilters: "පෙරහන් මකන්න",
    errorTitle: "වචන ලැයිස්තුව පූරණය කළ නොහැකි විය",
    errorDesc: "ඔබේ සම්බන්ධතාව පරීක්ෂා කර නැවත උත්සාහ කරන්න.",
    retry: "නැවත උත්සාහ කරන්න",
    colLevel: "මට්ටම",
    colWord: "වචනය",
    colRomaji: "රෝමජි",
    colMeaning: "අර්ථය",
    colTopic: "මාතෘකාව",
    colType: "වර්ගය",
    colAudio: "ශබ්දය",
    pageOf: (page, total) => `පිටුව ${page} / ${total}`,
    prevPage: "පෙර",
    nextPage: "ඊළඟ",
  },
  kanji: {
    title: "කන්ජි",
    description: (count) =>
      `N5 සිට N2 දක්වා JLPT කන්ජි ${count}. අර්ථය, කියවීම්, මූලාංග සහ උදාහරණ වචන බැලීමට කාඩ්පතක් තට්ටු කරන්න.`,
    levelDescription: (count, level) =>
      `JLPT ${level} කන්ජි ${count}. අර්ථය, කියවීම්, මූලාංග සහ උදාහරණ වචන බැලීමට කාඩ්පතක් තට්ටු කරන්න.`,
    practice: "කන්ජි පුහුණු වන්න",
    voiceLabel: "හඬේ වේගය",
    voice: (rate) => `හඬ ${rate}`,
    levelLabel: "JLPT මට්ටම",
    allLevels: "සියල්ල",
    search: "කන්ජි, අර්ථය, කියවීම හෝ මූලාංගයෙන් සොයන්න",
    clearSearch: "සෙවීම මකන්න",
    viewLabel: "දසුන",
    viewCards: "කාඩ්",
    viewList: "ලැයිස්තුව",
    resultCount: (shown, total) => `කන්ජි ${total}න් ${shown}ක්`,
    revealAll: "සියලු අර්ථ පෙන්වන්න",
    hideAll: "අර්ථ සඟවන්න",
    columnsLabel: "කාඩ් තීරු",
    columnsAuto: "ස්වයං",
    tapToReveal: "අර්ථය බැලීමට තට්ටු කරන්න",
    tapToFlipBack: "ආපසු හැරවීමට තට්ටු කරන්න",
    playAudio: "උච්චාරණය අසන්න",
    cardLabel: (kanji) => `කන්ජි ${kanji}. අර්ථය බැලීමට තට්ටු කරන්න.`,
    onLabel: "On",
    kunLabel: "Kun",
    emptyTitle: "ගැළපෙන කන්ජි නැත",
    emptyDesc: "මෙම මට්ටමේ කිසිවක් එම සෙවීමට නොගැළපේ.",
    clearSearchAction: "සෙවීම මකන්න",
    colLevel: "මට්ටම",
    colKanji: "කන්ජි",
    colMeaning: "අර්ථය",
    colReading: "කියවීම",
    colExample: "උදාහරණය",
    colAudio: "ශබ්දය",
    pageOf: (page, total) => `පිටුව ${page} / ${total}`,
    prevPage: "පෙර",
    nextPage: "ඊළඟ",
  },
  quizzes: {
    kicker: "小テスト",
    title: "ප්‍රශ්නාවලි",
    desc: "අනෙක් ඉගෙනුම්කරුවන් බෙදාගත් කෙටි වචන ප්‍රශ්නාවලි, හෝ ඔබට අවශ්‍ය වචන වලින් ඔබම සාදන ඒවා.",
    create: "ප්‍රශ්නාවලියක් සාදන්න",
    loginToCreate: "සෑදීමට පිවිසෙන්න",
    community: "ප්‍රජා ප්‍රශ්නාවලි",
    available: (count) => `${count} ක් ඇත`,
    mine: "ඔබේ ප්‍රශ්නාවලි",
    mineCount: (count) => `${count} ක් සාදා ඇත`,
    signInTitle: "ඔබේම ප්‍රශ්නාවලි සෑදීමට පිවිසෙන්න",
    signInBody:
      "පුහුණු වීමට අවශ්‍ය වචන තෝරා ප්‍රශ්නාවලියක් ලෙස සුරකින්න, ලකුණු තබා ගන්න.",
    signIn: "පිවිසෙන්න",
    emptyPublicTitle: "තවම ප්‍රජා ප්‍රශ්නාවලි නැත",
    emptyPublicBody: "අනෙක් ඉගෙනුම්කරුවන් පොදු කරන ප්‍රශ්නාවලි මෙහි පෙන්වයි.",
    emptyMineTitle: "ඔබ තවම ප්‍රශ්නාවලියක් සාදා නැත",
    emptyMineBody: "වචන කිහිපයක් තෝරා ප්‍රශ්නාවලියක් කරන්න.",
    buildFirst: "පළමු ප්‍රශ්නාවලිය සාදන්න",
    loadError: "ප්‍රශ්නාවලි පූරණය කළ නොහැකි විය",
    loadErrorBody: "සම්බන්ධතාවය පරීක්ෂා කර නැවත උත්සාහ කරන්න.",
    retry: "නැවත උත්සාහ කරන්න",
    wordCount: (count) => `වචන ${count}`,
    attemptCount: (count) => `උත්සාහ ${count}`,
    start: "ආරම්භ කරන්න",
    question: (current, total) => `ප්‍රශ්නය ${current} / ${total}`,
    answered: (answered, total) => `${total} න් ${answered} ක් පිළිතුරු දී ඇත`,
    choosePrompt: "ඉංග්‍රීසි අර්ථය තෝරන්න",
    typePrompt: "ඉංග්‍රීසි අර්ථය ටයිප් කරන්න",
    typePlaceholder: "ඔබේ පිළිතුර ටයිප් කරන්න",
    listen: "අසන්න",
    previous: "පෙර",
    next: "ඊළඟ",
    submit: "පිළිතුරු යොමු කරන්න",
    submitting: "යොමු කරමින්…",
    submitted: "පිළිතුරු යොමු කළා",
    submitFailed: "පිළිතුරු යොමු කළ නොහැකි විය. නැවත උත්සාහ කරන්න.",
    quizLoadError: "මෙම ප්‍රශ්නාවලිය පූරණය කළ නොහැකි විය",
    noWords: "මෙම ප්‍රශ්නාවලියේ වචන නැත",
    noWordsBody: "ප්‍රශ්නාවලිය සෑදූ පසු වචන ඉවත් කර තිබිය හැක.",
    backToQuizzes: "ප්‍රශ්නාවලි වෙත ආපසු",
    createTitle: "ප්‍රශ්නාවලියක් සාදන්න",
    createDesc:
      "මාතෘකාවක් දී, වචන තෝරා, අනෙක් අයට එය කළ හැකිද යන්න තීරණය කරන්න.",
    fieldTitle: "මාතෘකාව",
    fieldTitlePlaceholder: "මගේ N5 ක්‍රියා පද",
    fieldDescription: "විස්තරය",
    fieldDescriptionPlaceholder: "අත්‍යවශ්‍ය නොවේ",
    makePublic: "පොදු කරන්න",
    makePublicHint: "පොදු ප්‍රශ්නාවලි ප්‍රජා ලැයිස්තුවේ පෙන්වයි.",
    selectWords: "වචන",
    selectedCount: (count) => `${count} ක් තෝරා ඇත`,
    filterWords: "වචන පෙරන්න",
    noWordsMatch: "එම පෙරහනට ගැළපෙන වචන නැත.",
    wordsLoadError: "වචන පූරණය කළ නොහැකි විය",
    creating: "සාදමින්…",
    created: "ප්‍රශ්නාවලිය සාදා ඇත",
    createFailed: "ප්‍රශ්නාවලිය සෑදිය නොහැකි විය",
    titleRequired: "පළමුව මාතෘකාවක් එක් කරන්න",
    pickAtLeastOne: "අවම වශයෙන් එක් වචනයක් තෝරන්න",
    resultsTitle: "ප්‍රතිඵල",
    resultsDesc: "ඔබේ ලකුණු සහ සෑම ප්‍රශ්නයකම සමාලෝචනය.",
    correctCount: (correct, total) => `${total} න් ${correct} ක් නිවැරදියි`,
    review: "සමාලෝචනය",
    yourAnswer: "ඔබේ පිළිතුර",
    correctAnswer: "නිවැරදි පිළිතුර",
    noAnswer: "පිළිතුරක් නැත",
    correct: "නිවැරදියි",
    incorrect: "වැරදියි",
    resultsMissingTitle: "ප්‍රතිඵල ලබා ගත නොහැක",
    resultsMissingBody:
      "විස්තරාත්මක ප්‍රතිඵල පෙන්වන්නේ යොමු කළ විගසයි. ඔබ පිටුව නැවුම් කළේ නම් ඒවා තවදුරටත් ගබඩා කර නැත.",
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
    orEmail: "හෝ",
    googleFailed: "Google පිවිසීම සම්පූර්ණ වුණේ නැහැ. නැවත උත්සාහ කරන්න.",
    loggedIn: "පිවිසුණා",
    loginFailed: "පිවිසීම අසාර්ථකයි. ඊමේල් සහ මුරපදය පරීක්ෂා කරන්න.",
    registerTitle: "ගිණුමක් සාදන්න",
    registerDesc: "ඔබේ ප්‍රගතිය සුරකින්න සහ ඔබේම ප්‍රශ්නාවලි සාදන්න.",
    confirmPassword: "මුරපදය තහවුරු කරන්න",
    createAccount: "ගිණුම සාදන්න",
    creatingAccount: "ගිණුම සාදමින්…",
    haveAccount: "දැනටමත් ගිණුමක් තිබේද?",
    registered: "ගිණුම සෑදුණා. ඊමේලය තහවුරු කර, පසුව පිවිසෙන්න.",
    registeredNoEmail: "ගිණුම සෑදුණා, නමුත් තහවුරු කිරීමේ ඊමේලය යැවිය නොහැකි වුණා. පහතින් නව සබැඳියක් ඉල්ලන්න.",
    registerFailed: "ගිණුම සෑදීමට නොහැකි වුණා.",
    passwordMin: "අවම වශයෙන් අකුරු 6ක් භාවිතා කරන්න.",
    passwordsMismatch: "මුරපද නොගැළපේ.",
    forgotTitle: "මුරපදය යළි සකසන්න",
    forgotDesc: "ඔබේ ඊමේලය ඇතුළත් කරන්න, යළි සැකසීමේ සබැඳියක් එවන්නම්.",
    sendResetLink: "සබැඳිය යවන්න",
    resetSent: "එම ඊමේලයට ගිණුමක් ඇත්නම්, යළි සැකසීමේ සබැඳියක් එවා ඇත.",
    resendTitle: "තහවුරු ඊමේලය නැවත යවන්න",
    resendDesc: "ඔබේ ඊමේලය ඇතුළත් කරන්න, නව තහවුරු සබැඳියක් එවන්නම්.",
    sendLink: "සබැඳිය යවන්න",
    resendSent: "එම ඊමේලයට ගිණුමක් ඇත්නම්, නව තහවුරු සබැඳියක් එවා ඇත.",
    sending: "යවමින්…",
    tryAgainIn: (seconds) => `තත්පර ${seconds}කින් නැවත උත්සාහ කරන්න`,
    rateLimited: (seconds) =>
      `ඉල්ලීම් වැඩියි. නැවත උත්සාහ කිරීමට තත්පර ${seconds}ක් රැඳී සිටින්න.`,
    tooManyRequests: "ඉල්ලීම් වැඩියි. මොහොතකින් නැවත උත්සාහ කරන්න.",
    requestFailed: "යමක් වැරදුණා. නැවත උත්සාහ කරන්න.",
    rememberPassword: "මතක් වුණාද?",
    backToLogin: "පිවිසීමට ආපසු",
    newPasswordTitle: "නව මුරපදයක් තෝරන්න",
    newPasswordDesc: "ඔබේ ගිණුම සඳහා නව මුරපදයක් ඇතුළත් කරන්න.",
    newPassword: "නව මුරපදය",
    updatePassword: "මුරපදය යාවත්කාලීන කරන්න",
    updating: "යාවත්කාලීන කරමින්…",
    passwordUpdated: "මුරපදය යාවත්කාලීන වුණා. නව මුරපදයෙන් පිවිසෙන්න.",
    resetFailed: "මුරපදය යළි සැකසීමට නොහැකි වුණා.",
    missingResetToken:
      "මෙම සබැඳියේ යළි සැකසීමේ ටෝකනයක් නැත. නව සබැඳියක් ඉල්ලන්න.",
    requestNewLink: "නව සබැඳියක් ඉල්ලන්න",
    verifyTitle: "ඊමේලය තහවුරු කරන්න",
    verifyDesc: "ඔබේ ඊමේලයේ සබැඳිය පරීක්ෂා කරමින් සිටිමු.",
    verifying: "ඊමේලය තහවුරු කරමින්…",
    verified: "ඔබේ ඊමේලය තහවුරුයි. දැන් පිවිසිය හැක.",
    verifyFailed: "තහවුරු කිරීම අසාර්ථකයි.",
    missingVerifyToken:
      "මෙම සබැඳියේ තහවුරු ටෝකනයක් නැත. ඊමේලයේ සබැඳිය භාවිතා කරන්න, නැතහොත් නව එකක් ඉල්ලන්න.",
    goToLogin: "පිවිසීමට යන්න",
    tryAgain: "නැවත උත්සාහ කරන්න",
  },
  path: {
    title: "ඔබේ මාවත",
    streak: (days) => `දින ${days}ක පෙළ`,
    due: (count) => `අද නැවත ${count}`,
    studied: (count) => `අද වචන ${count}`,
    learned: (learned, total) => `ඉගෙනගත් ${learned} / ${total}`,
    continue: "නැවත පටන් ගන්න",
    signInTitle: "ඔබේ ස්ථානය තබා ගැනීමට පිවිසෙන්න",
    signIn:
      "ඔබ නැවැත්තු තැන, නැවත බැලිය යුතු වචන සහ දෛනික පෙළ ශාලාව මතක තබා ගනී.",
    newWords: "අද නැවත කියවීමෙන් පස්සේ අලුත් වචන.",
    loadError:
      "ඔබේ ප්‍රගතිය පූරණය කළ නොහැකි විය. පුහුණුව තවමත් ක්‍රියා කරයි, පසුව සමමුහුර්ත වේ.",
  },
  footer: {
    quote: "「千里の道も一歩から」— සැතපුම් දහසක ගමන පටන් ගන්නේ එක පියවරකින්.",
    crafted: "සියුම්ව නිමවා ඇත.",
  },
};

export const dictionaries: Record<Locale, Dictionary> = { en, si };
