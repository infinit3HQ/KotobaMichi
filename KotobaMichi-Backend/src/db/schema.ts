import {
	pgTable,
	text,
	varchar,
	boolean,
	timestamp,
	pgEnum,
	index,
	uniqueIndex,
	vector,
	integer,
	jsonb,
} from 'drizzle-orm/pg-core';

// Enum equivalent of Prisma UserRole
export const userRoleEnum = pgEnum('UserRole', ['USER', 'ADMIN']);

// Users table
export const users = pgTable('users', {
	id: varchar('id', { length: 128 }).primaryKey(), // full UUID v7 (128 incl dashes)
	email: text('email').notNull().unique(),
	password: text('password'),
	googleId: text('google_id'),
	name: text('name'),
	picture: text('picture'),
	role: userRoleEnum('role').notNull().default('USER'),
	isEmailVerified: boolean('is_email_verified').notNull().default(false),
	createdAt: timestamp('created_at', { withTimezone: false })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: false })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
});

// Words table
export const words = pgTable(
	'words',
	{
		id: varchar('id', { length: 128 }).primaryKey(),
		hiragana: text('hiragana').notNull(),
		kanji: text('kanji'),
		romaji: text('romaji'), // Hepburn reading
		english: text('english').notNull(),
		level: varchar('level', { length: 8 }).notNull().default('N5'),
		pronunciationUrl: text('pronunciation_url'),
		topic: text('topic'),
		partOfSpeech: text('part_of_speech'),
		vector: vector('vector', { dimensions: 768 }), // pgvector embedding (optional for now)
		vectorText: text('vector_text'), // source text used to generate embedding
		contentHash: text('content_hash').notNull().unique(),
		createdAt: timestamp('created_at', { withTimezone: false })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: false })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	t => [
		index('words_topic_idx').on(t.topic),
		index('words_vector_cosine_idx').using(
			'hnsw',
			t.vector.op('vector_cosine_ops')
		),
	]
);

// Quizzes table
export const quizzes = pgTable(
	'quizzes',
	{
		id: varchar('id', { length: 128 }).primaryKey(),
		title: text('title').notNull(),
		description: text('description'),
		isPublic: boolean('is_public').notNull().default(false),
		createdById: varchar('created_by_id', { length: 128 })
			.notNull()
			.references(() => users.id, {
				onDelete: 'cascade',
				onUpdate: 'no action',
			}),
		createdAt: timestamp('created_at', { withTimezone: false })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: false })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	t => [index('quizzes_created_by_idx').on(t.createdById)]
);

// Quiz Words junction
export const quizWords = pgTable(
	'quiz_words',
	{
		id: varchar('id', { length: 128 }).primaryKey(),
		quizId: varchar('quiz_id', { length: 128 })
			.notNull()
			.references(() => quizzes.id, { onDelete: 'cascade' }),
		wordId: varchar('word_id', { length: 128 })
			.notNull()
			.references(() => words.id, { onDelete: 'cascade' }),
	},
	t => [
		uniqueIndex('quiz_words_quiz_word_unique').on(t.quizId, t.wordId),
		index('quiz_words_quiz_idx').on(t.quizId),
		index('quiz_words_word_idx').on(t.wordId),
	]
);

// Quiz Attempts
export const quizAttempts = pgTable(
	'quiz_attempts',
	{
		id: varchar('id', { length: 128 }).primaryKey(),
		userId: varchar('user_id', { length: 128 })
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		quizId: varchar('quiz_id', { length: 128 })
			.notNull()
			.references(() => quizzes.id, { onDelete: 'cascade' }),
		score: integer('score').notNull(),
		completedAt: timestamp('completed_at', { withTimezone: false })
			.notNull()
			.defaultNow(),
		createdAt: timestamp('created_at', { withTimezone: false })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: false })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	t => [
		index('quiz_attempts_user_idx').on(t.userId),
		index('quiz_attempts_quiz_idx').on(t.quizId),
	]
);

// User Progress
export const userProgress = pgTable(
	'user_progress',
	{
		id: varchar('id', { length: 128 }).primaryKey(),
		userId: varchar('user_id', { length: 128 })
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		wordId: varchar('word_id', { length: 128 })
			.notNull()
			.references(() => words.id, { onDelete: 'cascade' }),
		masteryLevel: integer('mastery_level').notNull().default(0), // e.g., 0-10 scale
		lastReviewedAt: timestamp('last_reviewed_at', { withTimezone: false }),
		nextReviewAt: timestamp('next_review_at', { withTimezone: false }),
		createdAt: timestamp('created_at', { withTimezone: false })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: false })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	t => [
		uniqueIndex('user_progress_user_word_unique').on(t.userId, t.wordId),
		index('user_progress_user_idx').on(t.userId),
		index('user_progress_word_idx').on(t.wordId),
		index('user_progress_next_review_idx').on(t.nextReviewAt),
	]
);

// Refresh Tokens
export const refreshTokens = pgTable(
	'refresh_tokens',
	{
		id: varchar('id', { length: 128 }).primaryKey(),
		jti: text('jti').notNull().unique(),
		userId: varchar('user_id', { length: 128 })
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		tokenHash: text('token_hash').notNull(),
		expiresAt: timestamp('expires_at', { withTimezone: false }).notNull(),
		revokedAt: timestamp('revoked_at', { withTimezone: false }),
		replacedById: varchar('replaced_by_id', { length: 128 }),
		createdAt: timestamp('created_at', { withTimezone: false })
			.notNull()
			.defaultNow(),
	},
	t => [index('refresh_tokens_user_idx').on(t.userId)]
);

// Email Verification Tokens
export const emailVerificationTokens = pgTable(
	'email_verification_tokens',
	{
		id: varchar('id', { length: 128 }).primaryKey(),
		userId: varchar('user_id', { length: 128 })
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		tokenHash: text('token_hash').notNull().unique(),
		expiresAt: timestamp('expires_at', { withTimezone: false }).notNull(),
		usedAt: timestamp('used_at', { withTimezone: false }),
		createdAt: timestamp('created_at', { withTimezone: false })
			.notNull()
			.defaultNow(),
	},
	t => [index('email_verification_tokens_user_idx').on(t.userId)]
);

// Password Reset Tokens
export const passwordResetTokens = pgTable(
	'password_reset_tokens',
	{
		id: varchar('id', { length: 128 }).primaryKey(),
		userId: varchar('user_id', { length: 128 })
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		tokenHash: text('token_hash').notNull().unique(),
		expiresAt: timestamp('expires_at', { withTimezone: false }).notNull(),
		usedAt: timestamp('used_at', { withTimezone: false }),
		createdAt: timestamp('created_at', { withTimezone: false })
			.notNull()
			.defaultNow(),
	},
	t => [index('password_reset_tokens_user_idx').on(t.userId)]
);

// Grammar Questions (Star-Order Puzzles & Particle Cloze)
export const grammarQuestions = pgTable(
	'grammar_questions',
	{
		id: varchar('id', { length: 128 }).primaryKey(),
		level: varchar('level', { length: 8 }).notNull().default('N5'),
		type: varchar('type', { length: 32 }).notNull(), // 'STAR_ORDER' | 'PARTICLE_CLOZE'
		grammarPoint: text('grammar_point'),
		category: text('category'),
		sentenceBefore: text('sentence_before'),
		sentenceAfter: text('sentence_after'),
		fragments: jsonb('fragments'), // [string, string, string, string]
		correctOrder: jsonb('correct_order'), // [number, number, number, number]
		starSlotIndex: integer('star_slot_index'), // 0, 1, 2, 3
		options: jsonb('options'), // string[] for cloze
		correctAnswer: text('correct_answer'),
		fullSentence: text('full_sentence').notNull(),
		english: text('english').notNull(),
		explanation: text('explanation'),
		createdAt: timestamp('created_at', { withTimezone: false })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: false })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	t => [index('grammar_questions_level_idx').on(t.level)]
);

// Listening Comprehension Scenarios (Choukai)
export const listeningScenarios = pgTable(
	'listening_scenarios',
	{
		id: varchar('id', { length: 128 }).primaryKey(),
		level: varchar('level', { length: 8 }).notNull().default('N5'),
		title: text('title').notNull(),
		category: text('category'),
		situationJapanese: text('situation_japanese').notNull(),
		situationEnglish: text('situation_english'),
		questionJapanese: text('question_japanese').notNull(),
		questionEnglish: text('question_english'),
		dialogue: jsonb('dialogue').notNull(), // array of DialogueLine
		options: jsonb('options').notNull(), // string[]
		correctAnswerIndex: integer('correct_answer_index').notNull(),
		explanation: text('explanation'),
		vocabulary: jsonb('vocabulary'), // array of { word, reading, meaning }
		createdAt: timestamp('created_at', { withTimezone: false })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: false })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	t => [index('listening_scenarios_level_idx').on(t.level)]
);

// Reading & Paragraph Passages (Dokkai)
export const readingPassages = pgTable(
	'reading_passages',
	{
		id: varchar('id', { length: 128 }).primaryKey(),
		level: varchar('level', { length: 8 }).notNull().default('N5'),
		title: text('title').notNull(),
		passageType: varchar('passage_type', { length: 64 }).notNull(), // 'SHORT' | 'MEDIUM' | 'NOTICE'
		contentJapanese: text('content_japanese').notNull(),
		sentences: jsonb('sentences').notNull(), // string[]
		contentEnglish: text('content_english'),
		glossary: jsonb('glossary'), // array of { word, reading, meaning }
		questions: jsonb('questions').notNull(), // array of ReadingQuestion
		createdAt: timestamp('created_at', { withTimezone: false })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: false })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	t => [index('reading_passages_level_idx').on(t.level)]
);

// JLPT Grammar Points Master (N5-N1 Reference Dictionary)
export const grammarPoints = pgTable(
	'grammar_points',
	{
		id: varchar('id', { length: 128 }).primaryKey(),
		level: varchar('level', { length: 8 }).notNull().default('N5'),
		point: text('point').notNull(),
		meaning: text('meaning').notNull(),
		formation: text('formation'),
		exampleJapanese: text('example_japanese').notNull(),
		exampleRomaji: text('example_romaji'),
		exampleEnglish: text('example_english').notNull(),
		createdAt: timestamp('created_at', { withTimezone: false })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: false })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	t => [index('grammar_points_level_idx').on(t.level)]
);

// JLPT Kanji Master (N5-N1 with Radicals & Compounds)
export const kanjiCharacters = pgTable(
	'kanji_characters',
	{
		id: varchar('id', { length: 128 }).primaryKey(),
		level: varchar('level', { length: 8 }).notNull().default('N5'),
		character: varchar('character', { length: 16 }).notNull(),
		meaning: text('meaning').notNull(),
		dominantReading: text('dominant_reading'),
		onYomi: jsonb('on_yomi'),
		kunYomi: jsonb('kun_yomi'),
		radicals: jsonb('radicals').notNull(), // array of { character, meaning }
		mnemonic: text('mnemonic'),
		vocabulary: jsonb('vocabulary'), // array of { word, reading, meaning }
		createdAt: timestamp('created_at', { withTimezone: false })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: false })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	t => [
		index('kanji_characters_level_idx').on(t.level),
		uniqueIndex('kanji_characters_character_unique').on(t.character),
	]
);

// Example Sentences Master (5,193 Authentic Sentences with Romaji & English)
export const exampleSentences = pgTable(
	'example_sentences',
	{
		id: varchar('id', { length: 128 }).primaryKey(),
		word: text('word'),
		category: varchar('category', { length: 64 }).notNull().default('General'),
		sentenceJapanese: text('sentence_japanese').notNull(),
		sentenceRomaji: text('sentence_romaji'),
		sentenceEnglish: text('sentence_english').notNull(),
		createdAt: timestamp('created_at', { withTimezone: false })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: false })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	t => [
		index('example_sentences_word_idx').on(t.word),
		index('example_sentences_category_idx').on(t.category),
	]
);
