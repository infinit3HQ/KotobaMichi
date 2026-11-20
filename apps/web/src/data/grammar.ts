// src/data/grammar.ts
// Comprehensive JLPT Grammar Dataset tagged by Level (N5, N4, N3)
// Covering JLPT Star-Order Sentence Puzzles (文の組み立て) and Particle Cloze Drills (助詞マスター)

export type JLPTLevel = "N5" | "N4" | "N3" | "N2" | "N1";

export interface GrammarStarQuestion {
  id: string;
  level: JLPTLevel;
  grammarPoint: string;
  category: string;
  sentenceBefore: string;
  sentenceAfter: string;
  fragments: string[]; // Exactly 4 puzzle tiles
  correctOrder: number[]; // 0-indexed indices representing the correct sequence
  starSlotIndex: number; // 0, 1, 2, or 3 (which slot is the star ★)
  fullSentence: string;
  english: string;
  explanation: string;
}

export interface ParticleClozeQuestion {
  id: string;
  level: JLPTLevel;
  sentenceBefore: string;
  sentenceAfter: string;
  options: string[];
  correctAnswer: string;
  fullSentence: string;
  english: string;
  explanation: string;
}

/* =========================================================================
   COMPREHENSIVE JLPT STAR SENTENCE PUZZLES (文の組み立て ★)
   ========================================================================= */

export const JLPT_STAR_QUESTIONS: GrammarStarQuestion[] = [
  // -------------------------------------------------------------
  // JLPT N5 STAR QUESTIONS
  // -------------------------------------------------------------
  {
    id: "g-star-n5-1",
    level: "N5",
    grammarPoint: "〜てはいけません (Prohibition)",
    category: "Verbal Rules",
    sentenceBefore: "この部屋で",
    sentenceAfter: "。",
    fragments: ["たばこを", "吸っては", "いけません", "絶対に"],
    correctOrder: [3, 0, 1, 2], // 絶対に たばこを 吸っては いけません
    starSlotIndex: 2, // 3rd slot -> 吸っては (index 1)
    fullSentence: "この部屋で絶対にたばこを吸ってはいけません。",
    english: "You must never smoke in this room.",
    explanation: "Verb [て-form] + はいけません expresses strict prohibition ('must not do'). '絶対に' (never/absolutely) modifies the action.",
  },
  {
    id: "g-star-n5-2",
    level: "N5",
    grammarPoint: "〜たいです (Desire) / 助詞",
    category: "Desire & Movement",
    sentenceBefore: "私は",
    sentenceAfter: "行きたいです。",
    fragments: ["友達と", "日本へ", "一緒に", "旅行に"],
    correctOrder: [0, 2, 1, 3], // 友達と 一緒に 日本へ 旅行に
    starSlotIndex: 2, // 3rd slot -> 日本へ (index 1)
    fullSentence: "私は友達と一緒に日本へ旅行に行きたいです。",
    english: "I want to go on a trip to Japan together with my friend.",
    explanation: "Person + と一緒に (together with), Destination + へ, and Purpose + に 行きたいです (want to go to do).",
  },
  {
    id: "g-star-n5-3",
    level: "N5",
    grammarPoint: "〜てください (Polite Request)",
    category: "Requests",
    sentenceBefore: "すみませんが、",
    sentenceAfter: "。",
    fragments: ["名前を", "ここに", "書いて", "ボールペンで"],
    correctOrder: [1, 3, 0, 2], // ここに ボールペンで 名前を 書いて
    starSlotIndex: 2, // 3rd slot -> 名前を (index 0)
    fullSentence: "すみませんが、ここにボールペンで名前を書いてください。",
    english: "Excuse me, please write your name here with a ballpoint pen.",
    explanation: "Location + に (location of writing), Means + で (with a pen), Object + を (name), followed by Verb [て-form] + ください.",
  },
  {
    id: "g-star-n5-4",
    level: "N5",
    grammarPoint: "〜から (Reason / Because)",
    category: "Clauses",
    sentenceBefore: "今日は",
    sentenceAfter: "早く寝ます。",
    fragments: ["とても", "疲れました", "仕事で", "から、"],
    correctOrder: [2, 0, 1, 3], // 仕事で とても 疲れました から、
    starSlotIndex: 1, // 2nd slot -> とても (index 0)
    fullSentence: "今日は仕事でとても疲れましたから、早く寝ます。",
    english: "Because I am very tired from work today, I will sleep early.",
    explanation: "Clause + から states the cause or reason before the main outcome.",
  },
  {
    id: "g-star-n5-5",
    level: "N5",
    grammarPoint: "〜まえに (Before doing)",
    category: "Temporal Sequence",
    sentenceBefore: "毎晩",
    sentenceAfter: "お風呂に入ります。",
    fragments: ["寝る", "本を", "まえに", "読んでから"],
    correctOrder: [1, 3, 0, 2], // 本を 読んでから 寝る まえに
    starSlotIndex: 2, // 3rd slot -> 寝る (index 0)
    fullSentence: "毎晩本を読んでから寝る前にお風呂に入ります。",
    english: "Every night after reading a book, before sleeping, I take a bath.",
    explanation: "Verb [Dictionary form] + まえに indicates an action occurring prior to another event.",
  },
  {
    id: "g-star-n5-6",
    level: "N5",
    grammarPoint: "〜たり〜たりする (Representative Listing)",
    category: "Actions Listing",
    sentenceBefore: "休みの日は",
    sentenceAfter: "します。",
    fragments: ["映画を", "散歩を", "見たり", "したり"],
    correctOrder: [0, 2, 1, 3], // 映画を 見たり 散歩を したり
    starSlotIndex: 2, // 3rd slot -> 散歩を (index 1)
    fullSentence: "休みの日は映画を見たり散歩をしたりします。",
    english: "On my days off, I do things like watch movies and take walks.",
    explanation: "Verb [た-form] + り + Verb [た-form] + りする lists non-exhaustive activities.",
  },
  {
    id: "g-star-n5-7",
    level: "N5",
    grammarPoint: "〜より〜のほうが (Comparison)",
    category: "Comparison",
    sentenceBefore: "車",
    sentenceAfter: "便利です。",
    fragments: ["電車の", "より", "ずっと", "ほうが"],
    correctOrder: [1, 0, 3, 2], // より 電車の ほうが ずっと
    starSlotIndex: 2, // 3rd slot -> ほうが (index 3)
    fullSentence: "車より電車のほうがずっと便利です。",
    english: "Trains are much more convenient than cars.",
    explanation: "A より B のほうが... indicates 'B is more ... than A'. 'ずっと' emphasizes the degree.",
  },
  {
    id: "g-star-n5-8",
    level: "N5",
    grammarPoint: "〜つもりです (Intention)",
    category: "Future Plans",
    sentenceBefore: "来週の土曜日に",
    sentenceAfter: "つもりです。",
    fragments: ["デパートで", "新しい", "靴を", "買う"],
    correctOrder: [0, 1, 2, 3], // デパートで 新しい 靴を 買う
    starSlotIndex: 2, // 3rd slot -> 靴を (index 2)
    fullSentence: "来週の土曜日にデパートで新しい靴を買うつもりです。",
    english: "Next Saturday, I plan to buy new shoes at the department store.",
    explanation: "Verb [Dictionary form] + つもりです expresses the speaker's firm plan or intention.",
  },

  // -------------------------------------------------------------
  // JLPT N4 STAR QUESTIONS
  // -------------------------------------------------------------
  {
    id: "g-star-n4-1",
    level: "N4",
    grammarPoint: "〜ほうがいいです (Advice / Recommendation)",
    category: "Advice",
    sentenceBefore: "風邪をひいた時は、",
    sentenceAfter: "。",
    fragments: ["お風呂に入らず", "あたたかくして", "早く寝た", "ほうがいいです"],
    correctOrder: [1, 0, 2, 3], // あたたかくして お風呂に入らず 早く寝た ほうがいいです
    starSlotIndex: 2, // 3rd slot -> 早く寝た (index 2)
    fullSentence: "風邪をひいた時は、あたたかくしてお風呂に入らず早く寝たほうがいいです。",
    english: "When you catch a cold, you should keep warm, avoid a bath, and sleep early.",
    explanation: "Verb [た-form] + ほうがいい indicates positive recommendation ('it is best to do').",
  },
  {
    id: "g-star-n4-2",
    level: "N4",
    grammarPoint: "〜たことがあります (Past Experience)",
    category: "Experience",
    sentenceBefore: "私は一度も",
    sentenceAfter: "ありません。",
    fragments: ["新幹線に", "富士山を", "乗って", "見に行ったことが"],
    correctOrder: [0, 2, 1, 3], // 新幹線に 乗って 富士山を 見に行ったことが
    starSlotIndex: 2, // 3rd slot -> 富士山を (index 1)
    fullSentence: "私は一度も新幹線に乗って富士山を見に行ったことがありません。",
    english: "I have never ridden the Shinkansen to go see Mt. Fuji.",
    explanation: "Verb [た-form] + ことがあります expresses past personal experience. '一度も...ない' means 'never once'.",
  },
  {
    id: "g-star-n4-3",
    level: "N4",
    grammarPoint: "〜てはいけない (Prohibition & Etiquette)",
    category: "Syntax & Register",
    sentenceBefore: "目上の人に",
    sentenceAfter: "いけません。",
    fragments: ["そんな", "失礼なことを", "言っては", "絶対に"],
    correctOrder: [3, 0, 1, 2], // 絶対に そんな 失礼なことを 言っては
    starSlotIndex: 2, // 3rd slot -> 失礼なことを (index 1)
    fullSentence: "目上の人に絶対にそんな失礼なことを言ってはいけません。",
    english: "You must never say such rude things to someone of higher standing.",
    explanation: "Target + に, 'そんな' modifying noun phrase, and Verb [て-form] + はいけません for prohibition.",
  },
  {
    id: "g-star-n4-4",
    level: "N4",
    grammarPoint: "〜ておく (Do in preparation)",
    category: "Preparatory Action",
    sentenceBefore: "旅行に",
    sentenceAfter: "おきました。",
    fragments: ["ガイドブックを", "よく", "行く前に", "読んで"],
    correctOrder: [2, 0, 1, 3], // 行く前に ガイドブックを よく 読んで
    starSlotIndex: 2, // 3rd slot -> よく (index 1)
    fullSentence: "旅行に行く前にガイドブックをよく読んでおきました。",
    english: "Before going on the trip, I thoroughly read the guidebook in advance.",
    explanation: "Verb [て-form] + おく expresses doing an action beforehand in preparation for the future.",
  },
  {
    id: "g-star-n4-5",
    level: "N4",
    grammarPoint: "〜てしまう (Completion / Regret)",
    category: "Aspect",
    sentenceBefore: "宿題を",
    sentenceAfter: "しまいました。",
    fragments: ["学校に", "持ってくるのを", "すっかり", "忘れて"],
    correctOrder: [0, 1, 2, 3], // 学校に 持ってくるのを すっかり 忘れて
    starSlotIndex: 2, // 3rd slot -> すっかり (index 2)
    fullSentence: "宿題を学校に持ってくるのをすっかり忘れてしまいました。",
    english: "I completely forgot to bring my homework to school (with regret).",
    explanation: "Verb [て-form] + しまう conveys completing an action or an unintended action accompanied by regret.",
  },
  {
    id: "g-star-n4-6",
    level: "N4",
    grammarPoint: "〜やすい / 〜にくい (Ease / Difficulty)",
    category: "Adjectival Verbs",
    sentenceBefore: "この薬は",
    sentenceAfter: "作られています。",
    fragments: ["子供でも", "甘くて", "飲みやすく", "とても"],
    correctOrder: [3, 1, 0, 2], // とても 甘くて 子供でも 飲みやすく
    starSlotIndex: 2, // 3rd slot -> 子供でも (index 0)
    fullSentence: "この薬はとても甘くて子供でも飲みやすく作られています。",
    english: "This medicine is very sweet and made to be easy for even children to drink.",
    explanation: "Verb stem + やすい means 'easy to do'. As an adverbial modifier, it becomes やすく.",
  },
  {
    id: "g-star-n4-7",
    level: "N4",
    grammarPoint: "受身形 (Passive Voice)",
    category: "Voice",
    sentenceBefore: "満員電車で",
    sentenceAfter: "大変でした。",
    fragments: ["知らない人に", "痛くて", "足を", "踏まれて"],
    correctOrder: [0, 2, 3, 1], // 知らない人に 足を 踏まれて 痛くて
    starSlotIndex: 2, // 3rd slot -> 踏まれて (index 3)
    fullSentence: "満員電車で知らない人に足を踏まれて痛くて大変でした。",
    english: "On the crowded train, someone I didn't know stepped on my foot and it hurt badly (adversity passive).",
    explanation: "Agent + に + Direct Object + を + Passive Verb (踏まれる) marks suffering an adversity.",
  },

  // -------------------------------------------------------------
  // JLPT N3 STAR QUESTIONS
  // -------------------------------------------------------------
  {
    id: "g-star-n3-1",
    level: "N3",
    grammarPoint: "〜わけにはいかない (Cannot afford to)",
    category: "Obligation & Social Duty",
    sentenceBefore: "明日は大事な試験があるので、",
    sentenceAfter: "。",
    fragments: ["どんなに", "遊んでいる", "わけにはいかない", "眠くても"],
    correctOrder: [0, 3, 1, 2], // どんなに 眠くても 遊んでいる わけにはいかない
    starSlotIndex: 2, // 3rd slot -> 遊んでいる (index 1)
    fullSentence: "明日は大事な試験があるので、どんなに眠くても遊んでいるわけにはいかない。",
    english: "Because tomorrow is an important exam, no matter how tired I am I cannot afford to be slacking off.",
    explanation: "〜わけにはいかない means one cannot do something due to common sense, moral, or situational duty.",
  },
  {
    id: "g-star-n3-2",
    level: "N3",
    grammarPoint: "〜を中心に (Centered around)",
    category: "Advanced Formations",
    sentenceBefore: "今回のイベントは",
    sentenceAfter: "行われます。",
    fragments: ["若者を", "企画が", "中心にした", "様々な"],
    correctOrder: [0, 2, 3, 1], // 若者を 中心にした 様々な 企画が
    starSlotIndex: 2, // 3rd slot -> 様々な (index 3)
    fullSentence: "今回のイベントは若者を中心にした様々な企画が行われます。",
    english: "In this event, various projects centered on young people will be held.",
    explanation: "Noun + を中心にした + Noun means 'focused primarily upon / centered around'.",
  },
  {
    id: "g-star-n3-3",
    level: "N3",
    grammarPoint: "〜に比べて (Compared to)",
    category: "Comparison",
    sentenceBefore: "今年の夏は",
    sentenceAfter: "涼しくて過ごしやすい。",
    fragments: ["去年", "気温が", "の夏に", "比べて"],
    correctOrder: [0, 2, 3, 1], // 去年 の夏に 比べて 気温が
    starSlotIndex: 2, // 3rd slot -> 比べて (index 3)
    fullSentence: "今年の夏は去年の夏に比べて気温が涼しくて過ごしやすい。",
    english: "Compared to last summer, the temperature this summer is cooler and easier to bear.",
    explanation: "Noun + に比べて / に比べると means 'compared with / in comparison to'.",
  },
  {
    id: "g-star-n3-4",
    level: "N3",
    grammarPoint: "〜おかげで (Thanks to)",
    category: "Causality",
    sentenceBefore: "先輩が",
    sentenceAfter: "できました。",
    fragments: ["丁寧に", "無事に", "教えてくれた", "おかげで成功"],
    correctOrder: [0, 2, 3, 1], // 丁寧に 教えてくれた おかげで成功 無事に
    starSlotIndex: 2, // 3rd slot -> おかげで成功 (index 3)
    fullSentence: "先輩が丁寧に教えてくれたおかげで成功無事にできました。",
    english: "Thanks to the senior's thorough guidance, we succeeded without issue.",
    explanation: "Verb [Plain form] + おかげで attributes a fortunate result to someone's help or favorable cause.",
  },
  {
    id: "g-star-n3-5",
    level: "N3",
    grammarPoint: "〜たびに (Every time / Whenever)",
    category: "Recurrence",
    sentenceBefore: "この古い写真を",
    sentenceAfter: "思い出します。",
    fragments: ["家族と", "見る", "たびに、", "過ごした日々を"],
    correctOrder: [1, 2, 0, 3], // 見る たびに、 家族と 過ごした日々を
    starSlotIndex: 2, // 3rd slot -> 家族と (index 0)
    fullSentence: "この古い写真を見るたびに、家族と過ごした日々を思い出します。",
    english: "Every time I look at this old photo, I recall the days spent with my family.",
    explanation: "Verb [Dictionary form] / Noun + の + たびに indicates that every time an event occurs, another always follows.",
  },
];

/* =========================================================================
   COMPREHENSIVE JLPT PARTICLE CLOZE DRILLS (助詞マスター)
   ========================================================================= */

export const JLPT_PARTICLE_QUESTIONS: ParticleClozeQuestion[] = [
  // -------------------------------------------------------------
  // JLPT N5 PARTICLE DRILLS
  // -------------------------------------------------------------
  {
    id: "p-n5-1",
    level: "N5",
    sentenceBefore: "日曜日に図書館",
    sentenceAfter: "本を借りました。",
    options: ["で", "に", "へ", "を"],
    correctAnswer: "で",
    fullSentence: "日曜日に図書館で本を借りました。",
    english: "I borrowed a book at the library on Sunday.",
    explanation: "'で' marks the location where an active event or deliberate action takes place.",
  },
  {
    id: "p-n5-2",
    level: "N5",
    sentenceBefore: "毎朝７時",
    sentenceAfter: "起きて、朝ご飯を食べます。",
    options: ["に", "で", "を", "へ"],
    correctAnswer: "に",
    fullSentence: "毎朝７時に起きて、朝ご飯を食べます。",
    english: "I wake up at 7:00 every morning and eat breakfast.",
    explanation: "'に' marks a specific temporal coordinate on a clock or calendar.",
  },
  {
    id: "p-n5-3",
    level: "N5",
    sentenceBefore: "机の上",
    sentenceAfter: "猫がいます。",
    options: ["に", "で", "を", "と"],
    correctAnswer: "に",
    fullSentence: "机の上に猫がいます。",
    english: "There is a cat on the desk.",
    explanation: "'に' is paired with existence verbs (います / あります) to designate location of existence.",
  },
  {
    id: "p-n5-4",
    level: "N5",
    sentenceBefore: "私はリンゴ",
    sentenceAfter: "バナナが好きです。",
    options: ["と", "に", "で", "へ"],
    correctAnswer: "と",
    fullSentence: "私はリンゴとバナナが好きです。",
    english: "I like apples and bananas.",
    explanation: "'と' conjoins nouns in an exhaustive list ('A and B').",
  },
  {
    id: "p-n5-5",
    level: "N5",
    sentenceBefore: "新幹線",
    sentenceAfter: "京都へ行きました。",
    options: ["で", "に", "を", "から"],
    correctAnswer: "で",
    fullSentence: "新幹線で京都へ行きました。",
    english: "I went to Kyoto by Shinkansen.",
    explanation: "'で' marks the transportation means, tool, or instrument used.",
  },
  {
    id: "p-n5-6",
    level: "N5",
    sentenceBefore: "東京駅から京都駅",
    sentenceAfter: "約２時間かかります。",
    options: ["まで", "から", "に", "で"],
    correctAnswer: "まで",
    fullSentence: "東京駅から京都駅まで約２時間かかります。",
    english: "From Tokyo Station to Kyoto Station takes about 2 hours.",
    explanation: "'から' means 'from', paired with 'まで' meaning 'up to / until'.",
  },
  {
    id: "p-n5-7",
    level: "N5",
    sentenceBefore: "母",
    sentenceAfter: "誕生日プレゼントをあげました。",
    options: ["に", "で", "を", "へ"],
    correctAnswer: "に",
    fullSentence: "母に誕生日プレゼントをあげました。",
    english: "I gave a birthday present to my mother.",
    explanation: "'に' indicates the recipient of an action (giving/sending).",
  },
  {
    id: "p-n5-8",
    level: "N5",
    sentenceBefore: "この道",
    sentenceAfter: "まっすぐ歩いてください。",
    options: ["を", "で", "に", "へ"],
    correctAnswer: "を",
    fullSentence: "この道をまっすぐ歩いてください。",
    english: "Please walk straight along this road.",
    explanation: "'を' marks the path traversed when used with motion verbs like 歩く, 渡る, 散歩する.",
  },

  // -------------------------------------------------------------
  // JLPT N4 PARTICLE DRILLS
  // -------------------------------------------------------------
  {
    id: "p-n4-1",
    level: "N4",
    sentenceBefore: "電車が遅れたの",
    sentenceAfter: "、授業に遅刻しました。",
    options: ["で", "に", "を", "が"],
    correctAnswer: "で",
    fullSentence: "電車が遅れたので、授業に遅刻しました。",
    english: "Because the train was delayed, I was late for class.",
    explanation: "'〜ので' connects a cause or objective rationale to an outcome.",
  },
  {
    id: "p-n4-2",
    level: "N4",
    sentenceBefore: "弟は犬",
    sentenceAfter: "手をかまれました。",
    options: ["に", "で", "を", "へ"],
    correctAnswer: "に",
    fullSentence: "弟は犬に手をかまれました。",
    english: "My younger brother had his hand bitten by a dog.",
    explanation: "In passive constructions (受身), the active agent causing the action is marked with 'に'.",
  },
  {
    id: "p-n4-3",
    level: "N4",
    sentenceBefore: "子供",
    sentenceAfter: "部屋を掃除させました。",
    options: ["に", "で", "を", "へ"],
    correctAnswer: "に",
    fullSentence: "子供に部屋を掃除させました。",
    english: "I made the child clean the room (transitive causative).",
    explanation: "In transitive causative structures with an object marked by 'を', the causer directs the agent marked by 'に'.",
  },
  {
    id: "p-n4-4",
    level: "N4",
    sentenceBefore: "一生懸命勉強した",
    sentenceAfter: "、試験に不合格でした。",
    options: ["のに", "ので", "から", "でも"],
    correctAnswer: "のに",
    fullSentence: "一生懸命勉強したのに、試験に不合格でした。",
    english: "Even though I studied with all my might, I failed the exam.",
    explanation: "'〜のに' expresses unexpected contrast ('even though / despite'), frequently carrying disappointment.",
  },
  {
    id: "p-n4-5",
    level: "N4",
    sentenceBefore: "明日雨が降るかどう",
    sentenceAfter: "、天気予報を確認します。",
    options: ["か", "と", "に", "で"],
    correctAnswer: "か",
    fullSentence: "明日雨が降るかどうか、天気予報を確認します。",
    english: "I will check the weather forecast regarding whether or not it will rain tomorrow.",
    explanation: "'〜かどうか' embeds a yes-no question clause ('whether or not').",
  },
  {
    id: "p-n4-6",
    level: "N4",
    sentenceBefore: "友達と駅の前",
    sentenceAfter: "待ち合わせをしました。",
    options: ["で", "に", "へ", "を"],
    correctAnswer: "で",
    fullSentence: "友達と駅の前で待ち合わせをしました。",
    english: "I met up with my friend in front of the station.",
    explanation: "'で' marks the location where the rendezvous / active event occurs.",
  },

  // -------------------------------------------------------------
  // JLPT N3 PARTICLE DRILLS
  // -------------------------------------------------------------
  {
    id: "p-n3-1",
    level: "N3",
    sentenceBefore: "年齢",
    sentenceAfter: "かかわらず、誰でも参加できます。",
    options: ["に", "を", "で", "へ"],
    correctAnswer: "に",
    fullSentence: "年齢にかかわらず、誰でも参加できます。",
    english: "Anyone can participate regardless of age.",
    explanation: "'〜にかかわらず' is a standard N3 compound particle pattern meaning 'regardless of'.",
  },
  {
    id: "p-n3-2",
    level: "N3",
    sentenceBefore: "会議の結果",
    sentenceAfter: "ついて、明日報告します。",
    options: ["に", "を", "で", "と"],
    correctAnswer: "に",
    fullSentence: "会議の結果について、明日報告します。",
    english: "I will report regarding the results of the meeting tomorrow.",
    explanation: "'〜について' marks the subject matter or topic of inquiry/report ('about / regarding').",
  },
  {
    id: "p-n3-3",
    level: "N3",
    sentenceBefore: "お客様",
    sentenceAfter: "対して、丁寧な言葉を使いましょう。",
    options: ["に", "を", "で", "と"],
    correctAnswer: "に",
    fullSentence: "お客様に対して、丁寧な言葉を使いましょう。",
    english: "Let us use polite speech towards customers.",
    explanation: "'〜に対して' indicates the target of an action, attitude, or feeling ('towards / regarding').",
  },
  {
    id: "p-n3-4",
    level: "N3",
    sentenceBefore: "この法律",
    sentenceAfter: "もとづいて、厳しく処罰されます。",
    options: ["に", "を", "で", "へ"],
    correctAnswer: "に",
    fullSentence: "この法律にもとづいて、厳しく処罰されます。",
    english: "Based on this law, strict punishment will be enacted.",
    explanation: "'〜に基づいて (にもとづいて)' means 'based upon / founded on'.",
  },
  {
    id: "p-n3-5",
    level: "N3",
    sentenceBefore: "現代社会",
    sentenceAfter: "おける環境問題を議論する。",
    options: ["に", "で", "へ", "を"],
    correctAnswer: "に",
    fullSentence: "現代社会における環境問題を議論する。",
    english: "We discuss environmental problems in contemporary society.",
    explanation: "'〜における' is the noun-modifying formal equivalent of '〜での' ('in / at').",
  },
];
