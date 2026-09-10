// src/data/reading.ts
// Comprehensive Authentic JLPT Reading & Paragraph Comprehension (読解 Dokkai) Datasets tagged by Level (N5, N4, N3)

import type { JLPTLevel } from "./grammar";

export interface ReadingQuestion {
  id: string;
  questionJapanese: string;
  questionEnglish: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface ReadingPassage {
  id: string;
  level: JLPTLevel;
  title: string;
  type: "Short Passage (短文)" | "Medium Passage (中文)" | "Information Notice (情報検索)";
  contentJapanese: string;
  sentences: string[]; // For sentence-by-sentence audio shadowing
  contentEnglish: string;
  glossary: { word: string; reading: string; meaning: string }[];
  questions: ReadingQuestion[];
}

export const JLPT_READING_PASSAGES: ReadingPassage[] = [
  // -------------------------------------------------------------
  // JLPT N5 READING PASSAGES
  // -------------------------------------------------------------
  {
    id: "read-n5-1",
    level: "N5",
    title: "Tanaka's Weekend in Kyoto (田中さんの週末)",
    type: "Short Passage (短文)",
    contentJapanese:
      "私は先週の日曜日に友達のリーさんと京都へ行きました。新幹線で一時間半かかりました。京都で有名なお寺を見ました。紅葉がとてもきれいでした。昼ご飯に京都のおいしいそばを食べました。リーさんはお土産に抹茶のお菓子を買いました。とても楽しかったです。また行きたいです。",
    sentences: [
      "私は先週の日曜日に友達のリーさんと京都へ行きました。",
      "新幹線で一時間半かかりました。",
      "京都で有名なお寺を見ました。",
      "紅葉がとてもきれいでした。",
      "昼ご飯に京都のおいしいそばを食べました。",
      "リーさんはお土産に抹茶のお菓子を買いました。",
      "とても楽しかったです。",
      "また行きたいです。",
    ],
    contentEnglish:
      "Last Sunday, I went to Kyoto with my friend Lee. It took an hour and a half by Shinkansen. In Kyoto, we saw famous temples. The autumn leaves were very beautiful. For lunch, we ate delicious Kyoto soba noodles. Lee bought matcha sweets as souvenirs. It was very fun. I want to go again.",
    glossary: [
      { word: "先週", reading: "せんしゅう", meaning: "last week" },
      { word: "お寺", reading: "おてら", meaning: "temple" },
      { word: "紅葉", reading: "こうよう", meaning: "autumn leaves / foliage" },
      { word: "お土産", reading: "おみやげ", meaning: "souvenir" },
      { word: "抹茶", reading: "まっちゃ", meaning: "matcha / green tea powder" },
    ],
    questions: [
      {
        id: "rq-n5-1-1",
        questionJapanese: "二人は京都で何をしましたか？",
        questionEnglish: "What did the two do in Kyoto?",
        options: [
          "山に登って写真を撮った",
          "お寺を見てそばを食べた",
          "新幹線でお弁当を食べた",
          "リーさんの家で遊んだ",
        ],
        correctAnswerIndex: 1,
        explanation: "The text states they saw famous temples ('有名なお寺を見ました') and ate delicious soba for lunch ('おいしいそばを食べました').",
      },
      {
        id: "rq-n5-1-2",
        questionJapanese: "リーさんは何を買いましたか？",
        questionEnglish: "What did Lee buy?",
        options: [
          "京都のお寺の写真",
          "新幹線の切符",
          "抹茶のお菓子",
          "おいしいそば",
        ],
        correctAnswerIndex: 2,
        explanation: "The text explicitly says: 'リーさんはお土産に抹茶のお菓子を買いました' (Lee bought matcha sweets as souvenirs).",
      },
    ],
  },
  {
    id: "read-n5-2",
    level: "N5",
    title: "Central Library Notice (中央図書館からのお願い)",
    type: "Information Notice (情報検索)",
    contentJapanese:
      "【中央図書館の利用案内】\n開館時間：午前９時〜午後８時（日曜日は午後５時まで）\n休館日：毎週月曜日（月曜日が祝日の場合は火曜日）\n本は一人５冊まで、２週間借りることができます。\n館内での飲食や携帯電話での通話はご遠慮ください。パソコンは２階の専用スペースでのみ使用できます。",
    sentences: [
      "中央図書館の利用案内です。",
      "開館時間は午前９時から午後８時までです。ただし日曜日は午後５時までです。",
      "休館日は毎週月曜日です。",
      "本は一人５冊まで、２週間借りることができます。",
      "館内での飲食や携帯電話での通話はご遠慮ください。",
      "パソコンは２階の専用スペースでのみ使用できます。",
    ],
    contentEnglish:
      "[Central Library Guide]\nOpening Hours: 9:00 AM – 8:00 PM (Sundays until 5:00 PM)\nClosed: Every Monday (If Monday is a public holiday, closed on Tuesday)\nBooks: Up to 5 books per person, for 2 weeks.\nPlease refrain from eating/drinking and phone calls inside the library. Laptops can only be used in the dedicated 2nd floor space.",
    glossary: [
      { word: "開館時間", reading: "かいかんじかん", meaning: "opening hours" },
      { word: "休館日", reading: "きゅうかんび", meaning: "closed days" },
      { word: "利用", reading: "りよう", meaning: "usage" },
      { word: "専用", reading: "せんよう", meaning: "dedicated / reserved for" },
    ],
    questions: [
      {
        id: "rq-n5-2-1",
        questionJapanese: "日曜日の午後６時に図書館で本を借りることができますか？",
        questionEnglish: "Can you borrow books at the library at 6:00 PM on Sunday?",
        options: [
          "はい、午後８時まで開いているので借りられます。",
          "いいえ、日曜日は午後５時で閉まるので借りられません。",
          "はい、２階のパソコンスペースなら借りられます。",
          "いいえ、日曜日は休館日です。",
        ],
        correctAnswerIndex: 1,
        explanation: "The notice says: '日曜日は午後５時まで' (Sundays until 5:00 PM). It is closed by 6:00 PM on Sunday.",
      },
      {
        id: "rq-n5-2-2",
        questionJapanese: "パソコンはどこで使えますか？",
        questionEnglish: "Where can laptops be used?",
        options: [
          "図書館の１階",
          "２階の専用スペース",
          "館内のどの席でもよい",
          "図書館の外だけ",
        ],
        correctAnswerIndex: 1,
        explanation: "The notice specifies: 'パソコンは２階の専用スペースでのみ使用できます' (Only in the 2nd floor dedicated space).",
      },
    ],
  },
  {
    id: "read-n5-3",
    level: "N5",
    title: "Cooking Curry Together (みんなでカレー作り)",
    type: "Short Passage (短文)",
    contentJapanese:
      "昨日の夜、寮の友達とみんなでカレーを作りました。まず、スーパーへ行って牛肉と玉ねぎと人参とじゃがいもを買いました。部屋に戻ってから、みんなで野菜の皮をむいて一口サイズに切りました。大きな鍋でお肉と野菜を炒めて、水を入れました。３０分煮てからカレールーを入れました。とてもおいしいカレーができて、みんなでおかわりをしました。",
    sentences: [
      "昨日の夜、寮の友達とみんなでカレーを作りました。",
      "まず、スーパーへ行って牛肉と玉ねぎと人参とじゃがいもを買いました。",
      "部屋に戻ってから、みんなで野菜の皮をむいて一口サイズに切りました。",
      "大きな鍋でお肉と野菜を炒めて、水を入れました。",
      "３０分煮てからカレールーを入れました。",
      "とてもおいしいカレーができて、みんなでおかわりをしました。",
    ],
    contentEnglish:
      "Last night, I made curry with my friends from the dormitory. First, we went to the supermarket and bought beef, onions, carrots, and potatoes. After returning to the room, we all peeled the vegetables and cut them into bite-sized pieces. We stir-fried the meat and vegetables in a large pot and added water. After simmering for 30 minutes, we put in the curry roux. It made very delicious curry, and everyone had seconds.",
    glossary: [
      { word: "寮", reading: "りょう", meaning: "dormitory" },
      { word: "玉ねぎ", reading: "たまねぎ", meaning: "onion" },
      { word: "人参", reading: "にんじん", meaning: "carrot" },
      { word: "鍋", reading: "なべ", meaning: "pot" },
      { word: "炒める", reading: "いためる", meaning: "to stir-fry" },
    ],
    questions: [
      {
        id: "rq-n5-3-1",
        questionJapanese: "カレールーはいつ入れましたか？",
        questionEnglish: "When was the curry roux added?",
        options: [
          "スーパーから戻ってすぐ",
          "お肉と野菜を炒める前",
          "３０分煮てから",
          "食べる直前のお皿の上",
        ],
        correctAnswerIndex: 2,
        explanation: "The text says: '３０分煮てからカレールーを入れました' (After simmering for 30 minutes, we put in the curry roux).",
      },
    ],
  },

  // -------------------------------------------------------------
  // JLPT N4 READING PASSAGES
  // -------------------------------------------------------------
  {
    id: "read-n4-1",
    level: "N4",
    title: "Eco-Bags and Daily Life (エコバッグと毎日の生活)",
    type: "Short Passage (短文)",
    contentJapanese:
      "最近、スーパーやコンビニへ行く時に、自分の袋（エコバッグ）を持って行く人が増えています。日本では数年前からレジ袋が有料になりました。一枚数円ですが、毎回買うとお金がかかりますし、プラスチックのゴミが増えて環境にも良くありません。私も最初はエコバッグをよく忘れていましたが、いつも使うカバンの中に小さく畳んで入れておくようにしてから、忘れなくなりました。小さなことですが、地球のために続けたいと思います。",
    sentences: [
      "最近、スーパーやコンビニへ行く時に、自分の袋を持って行く人が増えています。",
      "日本では数年前からレジ袋が有料になりました。",
      "一枚数円ですが、毎回買うとお金がかかりますし、プラスチックのゴミが増えて環境にも良くありません。",
      "私も最初はエコバッグをよく忘れていましたが、いつも使うカバンの中に小さく畳んで入れておくようにしてから、忘れなくなりました。",
      "小さなことですが、地球のために続けたいと思います。",
    ],
    contentEnglish:
      "Recently, the number of people who bring their own bag (eco-bag) when going to supermarkets or convenience stores has increased. In Japan, plastic shopping bags became fee-based several years ago. While only a few yen per bag, buying them every time adds up, and increasing plastic waste harms the environment. At first, I often forgot my eco-bag, but ever since keeping it folded up small inside the bag I always use, I stopped forgetting. It is a small thing, but I want to continue it for the sake of the Earth.",
    glossary: [
      { word: "有料", reading: "ゆうりょう", meaning: "paid / fee-based" },
      { word: "環境", reading: "かんきょう", meaning: "environment" },
      { word: "畳む", reading: "たたむ", meaning: "to fold" },
      { word: "地球", reading: "ちきゅう", meaning: "the Earth / planet" },
    ],
    questions: [
      {
        id: "rq-n4-1-1",
        questionJapanese: "筆者はエコバッグを忘れないためにどうしましたか？",
        questionEnglish: "What did the author do to avoid forgetting their eco-bag?",
        options: [
          "スーパーの入り口で新しい袋を買うようにした。",
          "いつも使うカバンに畳んで入れておくようにした。",
          "カレンダーにメモを書いて貼っておいた。",
          "コンビニに行くのをやめた。",
        ],
        correctAnswerIndex: 1,
        explanation: "The author states: 'いつも使うカバンの中に小さく畳んで入れておくようにしてから、忘れなくなりました' (Since keeping it folded inside the everyday bag, stopped forgetting).",
      },
    ],
  },
  {
    id: "read-n4-2",
    level: "N4",
    title: "Flea Market Participation Flyer (地域フリーマーケットのお知らせ)",
    type: "Information Notice (情報検索)",
    contentJapanese:
      "【みどり公園 青空フリーマーケット出店者募集】\n日時：１０月１４日（土）午前１０時〜午後３時（雨天中止）\n場所：みどり公園 中央広場\n出店料：１ブース（2m×2m）１，０００円\n参加資格：市内在住または在勤の方（プロの業者は参加不可）\n申込方法：９月３０日までに公式ウェブサイトよりお申し込みください。定員（５０ブース）になり次第締め切ります。\n※食品や危険物の販売は禁止されています。ゴミは各自でお持ち帰りください。",
    sentences: [
      "みどり公園青空フリーマーケットの出店者募集です。",
      "日時は１０月１４日土曜日の午前１０時から午後３時までです。雨天の場合は中止になります。",
      "場所はみどり公園の中央広場です。",
      "出店料は１ブース１，０００円です。",
      "参加資格は市内在住または在勤の方です。プロの業者は参加できません。",
      "申込は９月３０日までに公式ウェブサイトから行ってください。定員になり次第締め切られます。",
      "食品や危険物の販売は禁止されています。ゴミは各自でお持ち帰りください。",
    ],
    contentEnglish:
      "[Midori Park Open-Air Flea Market Vendor Call]\nDate & Time: Saturday, October 14, 10:00 AM – 3:00 PM (Canceled in case of rain)\nLocation: Midori Park Central Plaza\nFee: 1,000 yen per booth (2m x 2m)\nEligibility: City residents or workers (Professional businesses not allowed)\nHow to Apply: Please apply via official website by September 30. Registration closes once capacity (50 booths) is reached.\n*Selling food or hazardous items is strictly forbidden. Please take all trash home.",
    glossary: [
      { word: "出店者", reading: "しゅってんしゃ", meaning: "vendor / stall operator" },
      { word: "雨天中止", reading: "うてんちゅうし", meaning: "canceled in case of rain" },
      { word: "締め切る", reading: "しめきる", meaning: "to close (registration) / deadline" },
      { word: "危険物", reading: "きけんぶつ", meaning: "hazardous materials" },
    ],
    questions: [
      {
        id: "rq-n4-2-1",
        questionJapanese: "このフリーマーケットについて正しいものはどれですか？",
        questionEnglish: "Which statement is correct regarding this flea market?",
        options: [
          "手作りのクッキーやパンを売ることができる。",
          "雨が降っても屋内で開催される。",
          "市内在住であれば、プロの業者も参加できる。",
          "定員の５０ブースに達したら、９月３０日前でも募集が終わる。",
        ],
        correctAnswerIndex: 3,
        explanation: "The flyer states: '定員（５０ブース）になり次第締め切ります' (Closes as soon as capacity is reached). Food is banned, rain cancels the event, and professional vendors cannot participate.",
      },
    ],
  },
  {
    id: "read-n4-3",
    level: "N4",
    title: "The Joy of Ekiben (駅弁の魅力)",
    type: "Short Passage (短文)",
    contentJapanese:
      "日本の鉄道の旅で大きな楽しみの一つが「駅弁」です。駅弁とは、駅や列車の中で売られている特別な弁当のことです。全国各地の駅で、その土地の有名な食材や伝統的な料理を使った駅弁が売られています。例えば、北海道の海の幸が詰まった弁当や、仙台の牛タン弁当などがあります。新幹線の窓から流れる美しい景色を眺めながら食べる駅弁は格別です。最近では、駅弁を買うこと自体を目的に旅行する人もいます。",
    sentences: [
      "日本の鉄道の旅で大きな楽しみの一つが「駅弁」です。",
      "駅弁とは、駅や列車の中で売られている特別な弁当のことです。",
      "全国各地の駅で、その土地の有名な食材や伝統的な料理を使った駅弁が売られています。",
      "例えば、北海道の海の幸が詰まった弁当や、仙台の牛タン弁当などがあります。",
      "新幹線の窓から流れる美しい景色を眺めながら食べる駅弁は格別です。",
      "最近では、駅弁を買うこと自体を目的に旅行する人もいます。",
    ],
    contentEnglish:
      "One of the great pleasures of train travel in Japan is 'Ekiben'. Ekiben refers to special bento lunchboxes sold at train stations or inside trains. Stations all across the country sell ekiben featuring regional famous ingredients and traditional dishes. For example, there are bentos packed with seafood from Hokkaido and beef tongue bentos from Sendai. Eating an ekiben while watching beautiful scenery drift by outside the Shinkansen window is truly exceptional. Recently, some people even travel with the sole purpose of buying ekiben.",
    glossary: [
      { word: "駅弁", reading: "えきべん", meaning: "station bento" },
      { word: "食材", reading: "しょくざい", meaning: "ingredients" },
      { word: "海の幸", reading: "うみのさち", meaning: "seafood / bounty of the sea" },
      { word: "格別", reading: "かくべつ", meaning: "exceptional / extraordinary" },
    ],
    questions: [
      {
        id: "rq-n4-3-1",
        questionJapanese: "駅弁の特徴として文章に書かれていることは何ですか？",
        questionEnglish: "What is written in the text as a characteristic of ekiben?",
        options: [
          "すべて同じ値段で買えること",
          "その土地の有名な食材や料理が使われていること",
          "外国からの輸入品を多く使っていること",
          "新幹線の運転手が作っていること",
        ],
        correctAnswerIndex: 1,
        explanation: "The text states: 'その土地の有名な食材や伝統的な料理を使った駅弁が売られています' (Ekiben made with local famous ingredients and traditional dishes are sold).",
      },
    ],
  },

  // -------------------------------------------------------------
  // JLPT N3 READING PASSAGES
  // -------------------------------------------------------------
  {
    id: "read-n3-1",
    level: "N3",
    title: "Digital Detox and Rest (デジタルデトックスのすすめ)",
    type: "Medium Passage (中文)",
    contentJapanese:
      "スマートフォンは私たちの生活を劇的に便利にした。調べたいことは瞬時に分かり、遠くの友人ともいつでも繋がることができる。しかしその一方で、常に通知を気にしたり、無意識に画面を見続けたりすることで、集中力の低下や睡眠障害を訴える人が少なくない。そこで近年注目されているのが「デジタルデトックス」である。これは一定期間、デジタル機器から意図的に距離を置く試みだ。完全に手放すのが難しければ、例えば『食事中や就寝１時間前はスマホを見ない』といった身近なルールから始めるだけでも、心の休息や深い睡眠を取り戻す効果があると言われている。",
    sentences: [
      "スマートフォンは私たちの生活を劇的に便利にしました。",
      "調べたいことは瞬時に分かり、遠くの友人ともいつでも繋がることができます。",
      "しかしその一方で、常に通知を気にしたり、無意識に画面を見続けたりすることで、集中力の低下や睡眠障害を訴える人が少なくありません。",
      "そこで近年注目されているのが「デジタルデトックス」です。",
      "これは一定期間、デジタル機器から意図的に距離を置く試みです。",
      "完全に手放すのが難しければ、例えば食事中や就寝１時間前はスマホを見ないといった身近なルールから始めるだけでも、心の休息を取り戻す効果があると言われています。",
    ],
    contentEnglish:
      "Smartphones have made our lives dramatically convenient. What we want to look up can be found in an instant, and we can connect with distant friends anytime. On the other hand, by constantly worrying about notifications and unconsciously staring at the screen, many people report decreased concentration and sleep disorders. What has garnered attention in recent years is 'Digital Detox'—an intentional effort to distance oneself from digital devices for a set period. Even starting with simple rules like 'not looking at smartphones during meals or one hour before sleep' is said to restore mental rest and deep sleep.",
    glossary: [
      { word: "劇的に", reading: "げきてきに", meaning: "dramatically" },
      { word: "瞬時に", reading: "しゅんじに", meaning: "instantly" },
      { word: "低下", reading: "ていか", meaning: "decline / deterioration" },
      { word: "意図的に", reading: "いとてきに", meaning: "intentionally" },
      { word: "就寝", reading: "しゅうしん", meaning: "going to bed" },
    ],
    questions: [
      {
        id: "rq-n3-1-1",
        questionJapanese: "この文章で筆者が最も伝えたいことは何か？",
        questionEnglish: "What does the author most want to convey in this passage?",
        options: [
          "スマートフォンの使用を社会全体で完全に禁止すべきだということ。",
          "デジタル機器と上手に距離を置き、心身の休息を意識することが大切だということ。",
          "最新のスマートフォン機能を使って連絡を頻繁に取るべきだということ。",
          "睡眠障害の原因はすべて運動不足によるものであるということ。",
        ],
        correctAnswerIndex: 1,
        explanation: "The author advocates practicing digital detox (distancing oneself intentionally from digital devices to restore rest and sleep) rather than total permanent bans or neglecting the problem.",
      },
    ],
  },
  {
    id: "read-n3-2",
    level: "N3",
    title: "Revival of Traditional Crafts (伝統工芸の新たな挑戦)",
    type: "Medium Passage (中文)",
    contentJapanese:
      "日本には長い歴史を持つ陶磁器や漆器、染め物などの伝統工芸が数多く存在する。しかし、ライフスタイルの西洋化や安価な工業製品の普及に伴い、職人の高齢化や後継者不足が深刻な問題となっている。こうした中、伝統工芸に現代的なデザインを取り入れ、新たな活路を見出そうとする若手職人が増えてきた。例えば、伝統的な焼き物の技法を生かしつつ、現代の洋食やカフェに合うモダンなプレートを制作したり、海外の展示会に積極的に出展して販路を広げたりしている。伝統とは単に昔の形を守り続けることではなく、時代に合わせて変化しながら本質を受け継ぐことなのである。",
    sentences: [
      "日本には長い歴史を持つ陶磁器や漆器、染め物などの伝統工芸が数多く存在します。",
      "しかし、ライフスタイルの西洋化や安価な工業製品の普及に伴い、後継者不足が深刻な問題となっています。",
      "こうした中、伝統工芸に現代的なデザインを取り入れ、新たな活路を見出そうとする若手職人が増えてきました。",
      "例えば、伝統的な焼き物の技法を生かしつつ、現代のカフェに合うモダンなプレートを制作しています。",
      "海外の展示会に積極的に出展して販路を広げる動きもあります。",
      "伝統とは単に昔の形を守り続けることではなく、時代に合わせて変化しながら本質を受け継ぐことなのです。",
    ],
    contentEnglish:
      "In Japan, numerous traditional crafts such as ceramics, lacquerware, and dyed textiles possess long histories. However, with the Westernization of lifestyles and the spread of inexpensive industrial products, aging artisans and a shortage of successors have become serious problems. In this context, an increasing number of young craftspeople are incorporating contemporary designs into traditional crafts to carve out a new path. For instance, while preserving traditional pottery techniques, they produce modern plates suited to modern cafes, and actively exhibit at overseas trade shows to expand sales channels. Tradition is not merely preserving old forms, but passing down the essence while evolving in step with the times.",
    glossary: [
      { word: "陶磁器", reading: "とうじき", meaning: "ceramics / porcelain" },
      { word: "漆器", reading: "しっき", meaning: "lacquerware" },
      { word: "後継者", reading: "こうけいしゃ", meaning: "successor" },
      { word: "活路", reading: "かつろ", meaning: "a way out / new opportunity" },
      { word: "本質", reading: "ほんしつ", meaning: "essence / true nature" },
    ],
    questions: [
      {
        id: "rq-n3-2-1",
        questionJapanese: "筆者が考える「伝統」とはどのようなものか？",
        questionEnglish: "What kind of thing does the author consider 'tradition' to be?",
        options: [
          "過去の道具や技法を一切変えずに保管すること。",
          "時代に合わせて変化を取り入れながら、本質を未来へ受け継ぐこと。",
          "海外の製品だけを模倣して新しい製品を作ること。",
          "職人がいなくなったら自然に消えていくべきもの。",
        ],
        correctAnswerIndex: 1,
        explanation: "The conclusion clearly states: '伝統とは単に昔の形を守り続けることではなく、時代に合わせて変化しながら本質を受け継ぐことなのである' (Tradition is passing down the essence while evolving in step with the times).",
      },
    ],
  },
];
