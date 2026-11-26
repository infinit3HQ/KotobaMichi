import type { Locale } from "@/lib/i18n/dictionary";

/** Text for the daily plan, exam goal, milestones and mistake review. */
export type LoopText = {
  home: {
    greeting: string;
    greetingNew: string;
    subtitle: string;
    explore: string;
  };
  today: {
    title: string;
    cards: (done: number, goal: number) => string;
    start: string;
    allDone: string;
    allDoneBody: string;
    reviews: (n: number) => string;
    reviewsDone: string;
    mistakes: (n: number) => string;
    mistakesDone: string;
    newWords: (n: number) => string;
    newWordsDone: string;
    drill: (name: string) => string;
    streak: (days: number) => string;
    freezes: (n: number) => string;
    freezeCovers: (n: number) => string;
    freezeHint: string;
    setGoal: string;
  };
  goal: {
    title: string;
    description: string;
    level: string;
    noLevel: string;
    examDate: string;
    noDate: string;
    otherDate: string;
    dailyGoal: string;
    dailyGoalHint: string;
    reminders: string;
    remindersHint: string;
    reminderHour: string;
    recap: string;
    recapHint: string;
    save: string;
    saved: string;
    error: string;
  };
  countdown: {
    title: string;
    daysLeft: (n: number) => string;
    examToday: string;
    examPassed: string;
    pace: (perDay: number, level: string) => string;
    allLearned: (level: string) => string;
    noDate: string;
    estimate: string;
    passLikely: (total: number, pass: number) => string;
    passNotYet: (total: number, pass: number) => string;
    fromSittings: (n: number) => string;
    noMocks: string;
    noMocksForLevel: (level: string) => string;
    mockNow: string;
    mockIn: (days: number) => string;
    sitMock: string;
    trend: string;
  };
  milestones: {
    title: string;
    next: string;
    earned: (n: number, total: number) => string;
    toast: (name: string) => string;
    streak: (days: number) => string;
    words: (n: number) => string;
    level: (level: string) => string;
    firstMock: string;
    mockPass: string;
  };
  review: {
    title: string;
    description: string;
    empty: string;
    emptyBody: string;
    toMocks: string;
    correct: string;
    wrong: (answer: number) => string;
    next: string;
    finished: string;
    finishedBody: (n: number) => string;
    from: (exam: string) => string;
    loadError: string;
  };
};

const en: LoopText = {
  home: {
    greeting: "おかえりなさい",
    greetingNew: "ようこそ",
    subtitle: "Here is today's plan. A few minutes keeps the words fresh.",
    explore: "Jump in",
  },
  today: {
    title: "Today",
    cards: (done, goal) => `${done} of ${goal} cards`,
    start: "Start",
    allDone: "Today is done",
    allDoneBody: "Your goal is met. Anything more is a bonus.",
    reviews: (n) => (n === 1 ? "1 review due" : `${n} reviews due`),
    reviewsDone: "No reviews due",
    mistakes: (n) => (n === 1 ? "1 missed mock question" : `${n} missed mock questions`),
    mistakesDone: "Mock mistakes reviewed",
    newWords: (n) => (n === 1 ? "1 more card for your goal" : `${n} more cards for your goal`),
    newWordsDone: "Daily goal met",
    drill: (name) => `One round of ${name}`,
    streak: (days) => (days === 1 ? "1-day streak" : `${days}-day streak`),
    freezes: (n) => (n === 1 ? "1 freeze" : `${n} freezes`),
    freezeCovers: (n) =>
      n === 1 ? "Study today and a freeze covers the day you missed." : `Study today and freezes cover the ${n} days you missed.`,
    freezeHint: "You earn a streak freeze every 7 days in a row. It saves your streak if you miss a day.",
    setGoal: "Set your exam goal",
  },
  goal: {
    title: "Exam goal",
    description: "Pick the JLPT you are working towards. The daily plan and pace follow it.",
    level: "Level",
    noLevel: "Not set",
    examDate: "Exam day",
    noDate: "No date",
    otherDate: "Other date",
    dailyGoal: "Cards a day",
    dailyGoalHint: "Reviews and new words both count.",
    reminders: "Daily email reminder",
    remindersHint: "One email on days you have not studied yet, at the hour you pick.",
    reminderHour: "Remind me after",
    recap: "Weekly recap email",
    recapHint: "Sunday evening: what you studied, your mock scores and what to work on.",
    save: "Save goal",
    saved: "Goal saved",
    error: "Could not save your goal. Try again.",
  },
  countdown: {
    title: "Road to exam day",
    daysLeft: (n) => (n === 1 ? "1 day to go" : `${n} days to go`),
    examToday: "Exam day is today. 頑張って!",
    examPassed: "That exam date has passed. Set your next one.",
    pace: (perDay, level) => `${perDay} new ${perDay === 1 ? "word" : "words"} a day covers the ${level} list by exam day.`,
    allLearned: (level) => `You have learned the whole ${level} list. Keep reviewing.`,
    noDate: "Add an exam date to see your daily pace.",
    estimate: "Pass estimate",
    passLikely: (total, pass) => `${total}/180. On track to pass (${pass} needed).`,
    passNotYet: (total, pass) => `${total}/180. Not there yet (${pass} and 19 per section needed).`,
    fromSittings: (n) => (n === 1 ? "From your last mock." : `Average of your last ${n} mocks.`),
    noMocks: "Sit a mock to get a pass estimate.",
    noMocksForLevel: (level) => `Mock exams cover N3 to N1. For ${level}, the word pace is your guide.`,
    mockNow: "A mock is due. Sitting one every two weeks shows your progress.",
    mockIn: (days) => (days === 1 ? "Next mock in 1 day." : `Next mock in ${days} days.`),
    sitMock: "Sit a mock",
    trend: "Mock scores",
  },
  milestones: {
    title: "Milestones",
    next: "Next",
    earned: (n, total) => `${n} of ${total} earned`,
    toast: (name) => `Milestone: ${name}`,
    streak: (days) => `${days}-day streak`,
    words: (n) => `${n.toLocaleString()} words learned`,
    level: (level) => `${level} words mastered`,
    firstMock: "First mock exam",
    mockPass: "Passed a mock",
  },
  review: {
    title: "Mock mistakes",
    description: "Questions you missed on mock exams come back on a schedule until they stick.",
    empty: "Nothing to review",
    emptyBody: "After a mock, add the questions you missed. They show up here when they are due.",
    toMocks: "Go to mock exams",
    correct: "Correct",
    wrong: (answer) => `Not quite. The answer is ${answer}.`,
    next: "Next",
    finished: "All caught up",
    finishedBody: (n) => (n === 1 ? "You reviewed 1 question." : `You reviewed ${n} questions.`),
    from: (exam) => `From ${exam}`,
    loadError: "Could not load your review. Check your connection and try again.",
  },
};

const si: LoopText = {
  home: {
    greeting: "おかえりなさい",
    greetingNew: "ようこそ",
    subtitle: "මෙන්න අදට සැලැස්ම. මිනිත්තු කිහිපයක් වචන මතකයේ රඳවයි.",
    explore: "කෙලින්ම අරඹන්න",
  },
  today: {
    title: "අද",
    cards: (done, goal) => `කාඩ්පත් ${goal}න් ${done}`,
    start: "අරඹන්න",
    allDone: "අදට අවසන්",
    allDoneBody: "ඔබේ ඉලක්කය සපුරා ඇත. තවත් කරන දේ ප්‍රසාද ලකුණු.",
    reviews: (n) => `සමාලෝචන ${n}ක් ඇත`,
    reviewsDone: "සමාලෝචන නැත",
    mistakes: (n) => `වැරදුණු ප්‍රශ්න ${n}ක්`,
    mistakesDone: "වැරදුණු ප්‍රශ්න බලා අවසන්",
    newWords: (n) => `ඉලක්කයට තව කාඩ්පත් ${n}ක්`,
    newWordsDone: "දෛනික ඉලක්කය සපුරා ඇත",
    drill: (name) => `${name} එක් වටයක්`,
    streak: (days) => `දින ${days}ක පෙළ`,
    freezes: (n) => `ශීත කිරීම් ${n}`,
    freezeCovers: (n) => `අද පාඩම් කළොත්, මඟහැරුණු දින ${n} ශීත කිරීමකින් ආවරණය වේ.`,
    freezeHint: "දින 7ක් අඛණ්ඩව පාඩම් කළ විට ශීත කිරීමක් ලැබේ. දිනයක් මඟහැරුණොත් එය ඔබේ පෙළ රකියි.",
    setGoal: "විභාග ඉලක්කය සකසන්න",
  },
  goal: {
    title: "විභාග ඉලක්කය",
    description: "ඔබ සූදානම් වන JLPT මට්ටම තෝරන්න. දෛනික සැලැස්ම එයට අනුව සැකසේ.",
    level: "මට්ටම",
    noLevel: "සකසා නැත",
    examDate: "විභාග දිනය",
    noDate: "දිනයක් නැත",
    otherDate: "වෙනත් දිනයක්",
    dailyGoal: "දිනකට කාඩ්පත්",
    dailyGoalHint: "සමාලෝචන සහ නව වචන දෙකම ගණන් වේ.",
    reminders: "දෛනික ඊමේල් සිහිකැඳවීම",
    remindersHint: "තවම පාඩම් නොකළ දිනවල, ඔබ තෝරන වේලාවට එක් ඊමේල් එකක්.",
    reminderHour: "මෙම වේලාවෙන් පසු මතක් කරන්න",
    recap: "සතිපතා සාරාංශ ඊමේල්",
    recapHint: "ඉරිදා සවස: ඔබ ඉගෙනගත් දේ, මොක් ලකුණු සහ වැඩිදියුණු කළ යුතු දේ.",
    save: "ඉලක්කය සුරකින්න",
    saved: "ඉලක්කය සුරැකිණි",
    error: "ඉලක්කය සුරැකීමට නොහැකි විය. නැවත උත්සාහ කරන්න.",
  },
  countdown: {
    title: "විභාග දිනයට මඟ",
    daysLeft: (n) => `තව දින ${n}යි`,
    examToday: "අද විභාග දිනයයි. 頑張って!",
    examPassed: "එම විභාග දිනය ගෙවී ඇත. ඊළඟ දිනය සකසන්න.",
    pace: (perDay, level) => `දිනකට නව වචන ${perDay}ක් ඉගෙනගත්තොත් විභාගයට පෙර ${level} ලැයිස්තුව අවසන් වේ.`,
    allLearned: (level) => `ඔබ ${level} ලැයිස්තුව සම්පූර්ණයෙන් ඉගෙනගෙන ඇත. සමාලෝචනය දිගටම කරන්න.`,
    noDate: "දෛනික වේගය බැලීමට විභාග දිනයක් එක් කරන්න.",
    estimate: "සමත්වීමේ ඇස්තමේන්තුව",
    passLikely: (total, pass) => `${total}/180. සමත් වීමට මඟ පෙනේ (අවශ්‍ය ${pass}).`,
    passNotYet: (total, pass) => `${total}/180. තවම නැත (${pass} සහ එක් කොටසකට 19 අවශ්‍යයි).`,
    fromSittings: (n) => (n === 1 ? "ඔබේ අවසන් මොක් විභාගයෙන්." : `ඔබේ අවසන් මොක් ${n}හි සාමාන්‍යය.`),
    noMocks: "සමත්වීමේ ඇස්තමේන්තුවක් සඳහා මොක් විභාගයක් කරන්න.",
    noMocksForLevel: (level) => `මොක් විභාග N3 සිට N1 දක්වා ඇත. ${level} සඳහා වචන වේගය ඔබේ මඟපෙන්වීමයි.`,
    mockNow: "මොක් විභාගයක් කිරීමට කාලයයි. සති දෙකකට වරක් කිරීමෙන් ප්‍රගතිය පෙනේ.",
    mockIn: (days) => `ඊළඟ මොක් විභාගය දින ${days}කින්.`,
    sitMock: "මොක් විභාගයක් කරන්න",
    trend: "මොක් ලකුණු",
  },
  milestones: {
    title: "සන්ධිස්ථාන",
    next: "ඊළඟ",
    earned: (n, total) => `${total}න් ${n}ක් ලබා ඇත`,
    toast: (name) => `සන්ධිස්ථානය: ${name}`,
    streak: (days) => `දින ${days}ක පෙළ`,
    words: (n) => `වචන ${n.toLocaleString()}ක් ඉගෙනගත්තා`,
    level: (level) => `${level} වචන ප්‍රගුණ කළා`,
    firstMock: "පළමු මොක් විභාගය",
    mockPass: "මොක් විභාගයක් සමත් විය",
  },
  review: {
    title: "මොක් වැරදි",
    description: "මොක් විභාගවල වැරදුණු ප්‍රශ්න මතකයේ රැඳෙන තුරු නියමිත කාලයට නැවත පැමිණේ.",
    empty: "සමාලෝචනයට කිසිවක් නැත",
    emptyBody: "මොක් විභාගයකට පසු වැරදුණු ප්‍රශ්න එක් කරන්න. ඒවා නියමිත දිනට මෙහි පෙන්වයි.",
    toMocks: "මොක් විභාග වෙත",
    correct: "නිවැරදියි",
    wrong: (answer) => `නැත. පිළිතුර ${answer}.`,
    next: "ඊළඟ",
    finished: "සියල්ල අවසන්",
    finishedBody: (n) => `ඔබ ප්‍රශ්න ${n}ක් සමාලෝචනය කළා.`,
    from: (exam) => `${exam} වෙතින්`,
    loadError: "සමාලෝචනය පූරණය කළ නොහැක. සම්බන්ධතාව පරීක්ෂා කර නැවත උත්සාහ කරන්න.",
  },
};

export const loopText: Record<Locale, LoopText> = { en, si };
