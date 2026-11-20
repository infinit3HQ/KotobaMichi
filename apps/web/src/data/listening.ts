// src/data/listening.ts
// Comprehensive Authentic JLPT Task-Based Listening Comprehension (聴解 Choukai) Datasets tagged by Level (N5, N4, N3)

import type { JLPTLevel } from "./grammar";

export interface DialogueLine {
  speaker: string;
  japanese: string;
  romaji: string;
  english: string;
}

export interface ListeningScenario {
  id: string;
  level: JLPTLevel;
  title: string;
  category: "Task-Based (課題理解)" | "Point Comprehension (ポイント理解)" | "Quick Response (即時応答)";
  situationJapanese: string;
  situationEnglish: string;
  questionJapanese: string;
  questionEnglish: string;
  dialogue: DialogueLine[];
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  vocabulary: { word: string; reading: string; meaning: string }[];
}

export const JLPT_LISTENING_SCENARIOS: ListeningScenario[] = [
  // -------------------------------------------------------------
  // JLPT N5 LISTENING SCENARIOS
  // -------------------------------------------------------------
  {
    id: "listen-n5-1",
    level: "N5",
    title: "At the Station (駅で)",
    category: "Task-Based (課題理解)",
    situationJapanese: "駅で男の人と駅員が話しています。",
    situationEnglish: "A man and a station attendant are talking at the station.",
    questionJapanese: "男の人は何番線の電車に乗りますか？",
    questionEnglish: "Which track's train will the man take?",
    dialogue: [
      {
        speaker: "男の人",
        japanese: "すみません、新宿行きの電車はどれですか？",
        romaji: "Sumimasen, Shinjuku-yuki no densha wa dore desu ka?",
        english: "Excuse me, which train goes to Shinjuku?",
      },
      {
        speaker: "駅員",
        japanese: "新宿行きですね。あちらの３番線から出ますよ。",
        romaji: "Shinjuku-yuki desu ne. Achira no san-bansen kara demasu yo.",
        english: "To Shinjuku? It departs from track number 3 over there.",
      },
      {
        speaker: "男の人",
        japanese: "２番線ではありませんか？",
        romaji: "Ni-bansen dewa arimasen ka?",
        english: "Isn't it track number 2?",
      },
      {
        speaker: "駅員",
        japanese: "２番線は渋谷行きです。新宿行きは３番線です。",
        romaji: "Ni-bansen wa Shibuya-yuki desu. Shinjuku-yuki wa san-bansen desu.",
        english: "Track 2 goes to Shibuya. Shinjuku is track 3.",
      },
      {
        speaker: "男の人",
        japanese: "わかりました。ありがとうございます。",
        romaji: "Wakarimashita. Arigatou gozaimasu.",
        english: "I understand. Thank you very much.",
      },
    ],
    options: ["１番線 (Track 1)", "２番線 (Track 2)", "３番線 (Track 3)", "４番線 (Track 4)"],
    correctAnswerIndex: 2,
    explanation: "The attendant clearly instructs: '新宿行きは３番線です' (Track 3 is for Shinjuku). Track 2 goes to Shibuya.",
    vocabulary: [
      { word: "駅員", reading: "えきいん", meaning: "station attendant" },
      { word: "新宿行き", reading: "しんじゅくゆき", meaning: "bound for Shinjuku" },
      { word: "３番線", reading: "さんばんせん", meaning: "track 3" },
    ],
  },
  {
    id: "listen-n5-2",
    level: "N5",
    title: "Convenience Store Checkout (コンビニの会計)",
    category: "Task-Based (課題理解)",
    situationJapanese: "店員と女の人が話しています。",
    situationEnglish: "A store clerk and a woman are talking at the register.",
    questionJapanese: "女の人はいくら払いますか？",
    questionEnglish: "How much will the woman pay in total?",
    dialogue: [
      {
        speaker: "店員",
        japanese: "いらっしゃいませ。お弁当が５００円、お茶が１５０円になります。",
        romaji: "Irasshaimase. Obentou ga gohyaku-en, ocha ga hyakugojuu-en ni narimasu.",
        english: "Welcome! The bento is 500 yen, and green tea is 150 yen.",
      },
      {
        speaker: "女の人",
        japanese: "あ、袋も一枚お願いします。",
        romaji: "A, fukuro mo ichimai onegai shimasu.",
        english: "Ah, please give me one plastic bag as well.",
      },
      {
        speaker: "店員",
        japanese: "はい、袋は５円です。全部で６５５円です。",
        romaji: "Hai, fukuro wa go-en desu. Zenbu de roppyaku gojuugo-en desu.",
        english: "Sure, the bag is 5 yen. That's 655 yen in total.",
      },
      {
        speaker: "女の人",
        japanese: "７００円からお願いします。",
        romaji: "Nanahyaku-en kara onegai shimasu.",
        english: "Here is 700 yen.",
      },
    ],
    options: ["５００円 (500 yen)", "６５０円 (650 yen)", "６５５円 (655 yen)", "７００円 (700 yen)"],
    correctAnswerIndex: 2,
    explanation: "500 yen (bento) + 150 yen (tea) + 5 yen (bag) = 655 yen total bill ('全部で６５５円です').",
    vocabulary: [
      { word: "お弁当", reading: "おべんとう", meaning: "bento lunch box" },
      { word: "お茶", reading: "おちゃ", meaning: "green tea" },
      { word: "袋", reading: "ふくろ", meaning: "bag" },
    ],
  },
  {
    id: "listen-n5-3",
    level: "N5",
    title: "Meeting Time Agreement (待ち合わせの時間)",
    category: "Point Comprehension (ポイント理解)",
    situationJapanese: "男の人と女の人が電話で話しています。",
    situationEnglish: "A man and a woman are speaking on the phone.",
    questionJapanese: "二人は何時に会いますか？",
    questionEnglish: "At what time will the two meet?",
    dialogue: [
      {
        speaker: "男の人",
        japanese: "もしもし、明日の映画は何時に会おうか？映画は２時からだよ。",
        romaji: "Moshi moshi, ashita no eiga wa nanji ni aou ka? Eiga wa niji kara da yo.",
        english: "Hello? What time should we meet for tomorrow's movie? The movie starts at 2:00.",
      },
      {
        speaker: "女の人",
        japanese: "じゃあ、１時半に映画館の前はどう？",
        romaji: "Jaa, ichijihan ni eigakan no mae wa dou?",
        english: "Then how about 1:30 in front of the movie theater?",
      },
      {
        speaker: "男の人",
        japanese: "お昼ご飯を一緒に食べない？１２時はどう？",
        romaji: "Ohirugohan o issho ni tabenai? Juuniji wa dou?",
        english: "Won't you eat lunch together first? How about 12:00?",
      },
      {
        speaker: "女の人",
        japanese: "いいね！じゃあ１２時に駅の改札前で会おう。",
        romaji: "Ii ne! Jaa juuniji ni eki no kaisatsu mae de aou.",
        english: "Sounds great! Then let's meet at 12:00 in front of the station ticket gates.",
      },
    ],
    options: ["１１時半 (11:30)", "１２時 (12:00)", "１時半 (1:30)", "２時 (2:00)"],
    correctAnswerIndex: 1,
    explanation: "Although the movie is at 2:00 and they discussed 1:30, they decided to eat lunch together first and agreed on 12:00 ('じゃあ１２時に駅の改札前で会おう').",
    vocabulary: [
      { word: "映画館", reading: "えいがかん", meaning: "movie theater" },
      { word: "お昼ご飯", reading: "おひるごはん", meaning: "lunch" },
      { word: "改札", reading: "かいさつ", meaning: "ticket barrier / gate" },
    ],
  },
  {
    id: "listen-n5-4",
    level: "N5",
    title: "Ordering at a Restaurant (レストランで注文)",
    category: "Task-Based (課題理解)",
    situationJapanese: "レストランで客と店員が話しています。",
    situationEnglish: "A customer and a waiter are talking at a restaurant.",
    questionJapanese: "男の人は何を注文しましたか？",
    questionEnglish: "What did the man order?",
    dialogue: [
      {
        speaker: "店員",
        japanese: "ご注文はお決まりですか？",
        romaji: "Gochuumon wa okimari desu ka?",
        english: "Are you ready to order?",
      },
      {
        speaker: "男の人",
        japanese: "カレーライスとアイスコーヒーをお願いします。",
        romaji: "Karee raisu to aisu koohii o onegai shimasu.",
        english: "I will have curry rice and an iced coffee, please.",
      },
      {
        speaker: "店員",
        japanese: "カレーは大盛りにいたしますか？無料ですよ。",
        romaji: "Karee wa oomori ni itashimasu ka? Muryou desu yo.",
        english: "Would you like a large serving of curry? It's free of charge.",
      },
      {
        speaker: "男の人",
        japanese: "あ、じゃあ普通盛りで大丈夫です。コーヒーは食後にお願いします。",
        romaji: "A, jaa futsuumori de daijoubu desu. Koohii wa shokugo ni onegai shimasu.",
        english: "Ah, regular serving is fine. Please bring the coffee after the meal.",
      },
    ],
    options: [
      "大盛りカレーとホットコーヒー (Large curry and hot coffee)",
      "普通盛りカレーと食後のアイスコーヒー (Regular curry and iced coffee after meal)",
      "ラーメンと冷たいお茶 (Ramen and cold tea)",
      "普通盛りカレーだけ (Only regular curry)",
    ],
    correctAnswerIndex: 1,
    explanation: "He ordered regular curry ('普通盛りで大丈夫です') and requested iced coffee after the meal ('コーヒーは食後にお願いします').",
    vocabulary: [
      { word: "注文", reading: "ちゅうもん", meaning: "order" },
      { word: "大盛り", reading: "おおもり", meaning: "large portion" },
      { word: "食後", reading: "しょくご", meaning: "after meal" },
    ],
  },

  // -------------------------------------------------------------
  // JLPT N4 LISTENING SCENARIOS
  // -------------------------------------------------------------
  {
    id: "listen-n4-1",
    level: "N4",
    title: "Weekend Plans & Weather (週末の約束)",
    category: "Point Comprehension (ポイント理解)",
    situationJapanese: "大学で男の学生と女の学生が話しています。",
    situationEnglish: "A male student and female student are talking at university.",
    questionJapanese: "二人は日曜日に何をしますか？",
    questionEnglish: "What will the two do on Sunday?",
    dialogue: [
      {
        speaker: "男の学生",
        japanese: "日曜日にみんなで山に登りに行かない？",
        romaji: "Nichiyoubi ni minna de yama ni nobori ni ikanai?",
        english: "Shall we go climb the mountain together with everyone on Sunday?",
      },
      {
        speaker: "女の学生",
        japanese: "行きたいけど、日曜日は雨が降るってニュースで言ってたよ。",
        romaji: "Ikitai kedo, nichiyoubi wa ame ga furu tte nyuusu de itteta yo.",
        english: "I'd love to, but the news said it's going to rain on Sunday.",
      },
      {
        speaker: "男の学生",
        japanese: "えっ、本当？じゃあ、美術館に行くのはどう？新しい展示があるんだ。",
        romaji: "E', hontou? Jaa, bijutsukan ni iku no wa dou? Atarashii tenji ga aru nda.",
        english: "Oh, really? Then how about going to the art museum? There's a new exhibition.",
      },
      {
        speaker: "女の学生",
        japanese: "いいね！それにしよう。何時に駅で会う？",
        romaji: "Ii ne! Sore ni shiyou. Nanji ni eki de au?",
        english: "Sounds great! Let's do that. What time should we meet at the station?",
      },
    ],
    options: [
      "山に登る (Climb the mountain)",
      "美術館に行く (Go to the art museum)",
      "図書館で勉強する (Study at the library)",
      "映画を見に行く (Go see a movie)",
    ],
    correctAnswerIndex: 1,
    explanation: "Because rain is forecasted, they drop the mountain climb and agree on the art museum ('美術館に行くのはどう？' -> 'いいね！それにしよう').",
    vocabulary: [
      { word: "山に登る", reading: "やまにのぼる", meaning: "to climb a mountain" },
      { word: "美術館", reading: "びじゅつかん", meaning: "art museum" },
      { word: "展示", reading: "てんじ", meaning: "exhibition / display" },
    ],
  },
  {
    id: "listen-n4-2",
    level: "N4",
    title: "Taking Cold Medication (病院で薬の説明)",
    category: "Task-Based (課題理解)",
    situationJapanese: "病院で医者と患者が話しています。",
    situationEnglish: "A doctor and patient are speaking at a clinic.",
    questionJapanese: "患者は白い薬をいつ飲みますか？",
    questionEnglish: "When should the patient take the white medicine?",
    dialogue: [
      {
        speaker: "医者",
        japanese: "風邪ですね。二種類の薬を出しておきます。",
        romaji: "Kaze desu ne. Nishurui no kusuri o dashite okimasu.",
        english: "You have a cold. I will prescribe two types of medicine.",
      },
      {
        speaker: "患者",
        japanese: "どのように飲めばいいですか？",
        romaji: "Dono you ni nomeba ii desu ka?",
        english: "How should I take them?",
      },
      {
        speaker: "医者",
        japanese: "この黄色い薬は毎食後、一日三回飲んでください。そして白い薬は熱が高い時だけ飲んでください。",
        romaji: "Kono kiiroi kusuri wa maishokugo, ichinichi sankai nonde kudasai. Soshite shiroi kusuri wa netsu ga takai toki dake nonde kudasai.",
        english: "Take this yellow medicine three times a day after every meal. And take the white medicine only when you have a high fever.",
      },
      {
        speaker: "患者",
        japanese: "熱がない時は白い薬は飲まなくてもいいですか？",
        romaji: "Netsu ga nai toki wa shiroi kusuri wa nomanakute mo ii desu ka?",
        english: "When I have no fever, is it okay not to take the white medicine?",
      },
      {
        speaker: "医者",
        japanese: "はい、飲まないでください。",
        romaji: "Hai, nomanaide kudasai.",
        english: "Yes, please do not take it.",
      },
    ],
    options: [
      "毎食後、一日三回 (Three times a day after every meal)",
      "寝る前に一回 (Once before sleeping)",
      "熱が高い時だけ (Only when having a high fever)",
      "朝ご飯の前 (Before breakfast)",
    ],
    correctAnswerIndex: 2,
    explanation: "The doctor specifically directs: '白い薬は熱が高い時だけ飲んでください' (Take the white medicine only when having a high fever). Yellow medicine is for after meals.",
    vocabulary: [
      { word: "患者", reading: "かんじゃ", meaning: "patient" },
      { word: "毎食後", reading: "まいしょくご", meaning: "after every meal" },
      { word: "熱", reading: "ねつ", meaning: "fever / heat" },
    ],
  },
  {
    id: "listen-n4-3",
    level: "N4",
    title: "Apartment Trash Sorting (アパートのゴミ出し)",
    category: "Task-Based (課題理解)",
    situationJapanese: "アパートの大家と新しい住人が話しています。",
    situationEnglish: "An apartment landlord and a new tenant are talking.",
    questionJapanese: "燃えるゴミは何曜日に出しますか？",
    questionEnglish: "On which days is burnable trash collected?",
    dialogue: [
      {
        speaker: "大家",
        japanese: "ゴミの出し方について説明しますね。分別がとても大切です。",
        romaji: "Gomi no dashikata ni tsuite setsumei shimasu ne. Bunbetsu ga totemo taisetsu desu.",
        english: "I will explain how to take out trash. Sorting is very important.",
      },
      {
        speaker: "住人",
        japanese: "はい、お願いします。",
        romaji: "Hai, onegai shimasu.",
        english: "Yes, please.",
      },
      {
        speaker: "大家",
        japanese: "燃えるゴミは火曜日と金曜日の朝８時までに出してください。ビンやカンは水曜日です。",
        romaji: "Moeru gomi wa kayoubi to kinyoubi no asa hachiji made ni dashite kudasai. Bin ya kan wa suiyoubi desu.",
        english: "Put out burnable trash by 8:00 AM on Tuesdays and Fridays. Bottles and cans are on Wednesdays.",
      },
      {
        speaker: "住人",
        japanese: "前日の夜に出してもいいですか？",
        romaji: "Zenjitsu no yoru ni dashite mo ii desu ka?",
        english: "May I put it out the previous evening?",
      },
      {
        speaker: "大家",
        japanese: "カラスが荒らすので、必ず当日の朝に出してください。",
        romaji: "Karasu ga arasu node, kanarazu toujitsu no asa ni dashite kudasai.",
        english: "Crows make a mess, so please always put it out on the morning of that day.",
      },
    ],
    options: [
      "月曜日と木曜日 (Monday and Thursday)",
      "火曜日と金曜日 (Tuesday and Friday)",
      "水曜日と土曜日 (Wednesday and Saturday)",
      "毎日いつでも (Every day anytime)",
    ],
    correctAnswerIndex: 1,
    explanation: "The landlord instructs: '燃えるゴミは火曜日と金曜日の朝８時までに出してください' (Burnable trash on Tuesday and Friday mornings).",
    vocabulary: [
      { word: "大家", reading: "おおや", meaning: "landlord" },
      { word: "燃えるゴミ", reading: "もえるごみ", meaning: "burnable trash" },
      { word: "分別", reading: "ぶんべつ", meaning: "sorting / separation" },
    ],
  },

  // -------------------------------------------------------------
  // JLPT N3 LISTENING SCENARIOS
  // -------------------------------------------------------------
  {
    id: "listen-n3-1",
    level: "N3",
    title: "Office Schedule Change (会社での相談)",
    category: "Task-Based (課題理解)",
    situationJapanese: "会社で課長と女性社員が明日の会議について話しています。",
    situationEnglish: "A section chief and female employee are discussing tomorrow's meeting at the office.",
    questionJapanese: "女性社員はこの後まず何をしなければなりませんか？",
    questionEnglish: "What must the female employee do first after this?",
    dialogue: [
      {
        speaker: "課長",
        japanese: "田中さん、明日の午前１０時からの企画会議だけど、部長の都合が悪くなってね。",
        romaji: "Tanaka-san, ashita no gozen juuji kara no kikaku kaigi dakedo, buchou no tsugou ga warukunatte ne.",
        english: "Ms. Tanaka, about tomorrow's 10:00 AM planning meeting, the general manager has a schedule conflict.",
      },
      {
        speaker: "女性社員",
        japanese: "そうですか。では、午後に変更いたしますか？",
        romaji: "Sou desu ka. Dewa, gogo ni henkou itashimasu ka?",
        english: "I see. Shall we reschedule it to the afternoon?",
      },
      {
        speaker: "課長",
        japanese: "うん、午後２時にしよう。まず参加者全員に日程変更のメールを送ってくれるかい？資料の印刷は明日でいいから。",
        romaji: "Un, gogo niji ni shiyou. Mazu sankasha zen'in ni nittei henkou no meeru o okutte kureru kai? Shiryou no insatsu wa ashita de ii kara.",
        english: "Yes, let's make it 2:00 PM. First, could you email all attendees regarding the date change? You can print materials tomorrow.",
      },
      {
        speaker: "女性社員",
        japanese: "かしこまりました。ただちに連絡いたします。",
        romaji: "Kashikomarimashita. Tadachi ni renraku itashimasu.",
        english: "Understood. I will notify everyone right away.",
      },
    ],
    options: [
      "会議室を予約する (Reserve the meeting room)",
      "参加者に変更のメールを送る (Email attendees about the schedule change)",
      "会議の資料を印刷する (Print meeting materials)",
      "部長に電話をかける (Call the general manager)",
    ],
    correctAnswerIndex: 1,
    explanation: "The section chief specifically asks: 'まず参加者全員に日程変更のメールを送ってくれるかい？' (First, send an email to all attendees). Printing materials is deferred to tomorrow.",
    vocabulary: [
      { word: "都合", reading: "つごう", meaning: "circumstances / availability" },
      { word: "変更", reading: "へんこう", meaning: "reschedule / alteration" },
      { word: "ただちに", reading: "ただちに", meaning: "immediately" },
    ],
  },
  {
    id: "listen-n3-2",
    level: "N3",
    title: "Hotel Reservation Inquiry (ホテルのキャンセル料)",
    category: "Point Comprehension (ポイント理解)",
    situationJapanese: "旅行代理店の窓口で男の人と店員が話しています。",
    situationEnglish: "A man and an agent are talking at a travel agency counter.",
    questionJapanese: "宿泊の３日前にキャンセルした場合、キャンセル料は何パーセントですか？",
    questionEnglish: "If canceled 3 days prior to lodging, what percentage is the cancellation fee?",
    dialogue: [
      {
        speaker: "男の人",
        japanese: "来週の温泉旅行の予約をお願いしたいのですが、万が一キャンセルした場合の手数料はどうなっていますか？",
        romaji: "Raishuu no onsen ryokou no yoyaku o onegai shitai no desu ga, man'gaichi kyanseru shita baai no tesuuryou wa dou natte imasu ka?",
        english: "I would like to book next week's hot spring trip, but what are the fees if by any chance I cancel?",
      },
      {
        speaker: "店員",
        japanese: "ご案内いたします。ご宿泊の７日前までは無料です。６日前から２日前までは宿泊料金の２０％、前日は５０％、当日は１００％となります。",
        romaji: "Go-annai itashimasu. Goshukuhaku no nanoka mae made wa muryou desu. Muika mae kara futsuka mae made wa shukuhaku ryoukin no nijuu paasento, zenjitsu wa gojuu paasento, toujitsu wa hyaku paasento to narimasu.",
        english: "I will explain. Up to 7 days prior is free. From 6 days to 2 days prior it is 20% of the room fee, the day before is 50%, and on the day is 100%.",
      },
      {
        speaker: "男の人",
        japanese: "なるほど、３日前なら２０％ですね。承知しました。",
        romaji: "Naruhodo, mikka mae nara nijuu paasento desu ne. Shouchi shimashita.",
        english: "I see, so 3 days prior would be 20%. Understood.",
      },
    ],
    options: ["無料 (Free / 0%)", "２０パーセント (20%)", "５０パーセント (50%)", "１００パーセント (100%)"],
    correctAnswerIndex: 1,
    explanation: "The clerk states that 6 days to 2 days prior incurs a 20% fee ('６日前から２日前までは宿泊料金の２０％'). 3 days prior falls right in this bracket.",
    vocabulary: [
      { word: "万が一", reading: "まんがいち", meaning: "by any chance / if worst comes to worst" },
      { word: "手数料", reading: "てすうりょう", meaning: "handling fee" },
      { word: "宿泊", reading: "しゅくはく", meaning: "lodging / accommodation" },
    ],
  },
];
