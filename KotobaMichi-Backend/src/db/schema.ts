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
	real,
	smallint,
	date,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

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

export type LearnerBookmark = {
	mode: string;
	itemKey: string | null;
	cursor: number;
};

// Catalog study cards. Keys are frontend ids such as tanos-n5-1, not words.id.
export const learnerCards = pgTable(
	'learner_cards',
	{
		id: varchar('id', { length: 128 }).primaryKey(),
		userId: varchar('user_id', { length: 128 })
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		itemKey: text('item_key').notNull(),
		kind: varchar('kind', { length: 16 }).notNull().default('word'),
		level: varchar('level', { length: 8 }).notNull(),
		mastery: integer('mastery').notNull().default(0),
		// SM-2 ease from before FSRS. Read once to convert old cards, no longer written.
		ease: real('ease').notNull().default(2.5),
		// FSRS scheduled_days.
		intervalDays: integer('interval_days').notNull().default(0),
		reps: integer('reps').notNull().default(0),
		lapses: integer('lapses').notNull().default(0),
		// FSRS memory state. Null stability or difficulty means a card from the SM-2 era.
		stability: real('stability'),
		difficulty: real('difficulty'),
		// FSRS State: 0 new, 1 learning, 2 review, 3 relearning.
		fsrsState: smallint('fsrs_state').notNull().default(0),
		learningSteps: integer('learning_steps').notNull().default(0),
		lastGrade: varchar('last_grade', { length: 8 }),
		learnedAt: timestamp('learned_at', { withTimezone: false }),
		lastSeenAt: timestamp('last_seen_at', { withTimezone: false }),
		lastSeenDay: varchar('last_seen_day', { length: 10 }),
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
		uniqueIndex('learner_cards_user_item_unique').on(t.userId, t.itemKey),
		index('learner_cards_user_level_idx').on(t.userId, t.level),
		index('learner_cards_due_idx').on(t.userId, t.nextReviewAt),
	]
);

export const learnerState = pgTable('learner_state', {
	userId: varchar('user_id', { length: 128 })
		.primaryKey()
		.references(() => users.id, { onDelete: 'cascade' }),
	level: varchar('level', { length: 8 }).notNull().default('N5'),
	mode: varchar('mode', { length: 24 }).notNull().default('flashcard'),
	itemKey: text('item_key'),
	cursorIndex: integer('cursor_index').notNull().default(0),
	bookmarks: jsonb('bookmarks')
		.$type<Record<string, LearnerBookmark>>()
		.notNull()
		.default({}),
	streakDays: integer('streak_days').notNull().default(0),
	lastActiveOn: date('last_active_on', { mode: 'string' }),
	updatedAt: timestamp('updated_at', { withTimezone: false })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
});

export type MockExamScore = {
	id: string;
	title: string;
	correct: number;
	total: number;
};

export const mockExamAttempts = pgTable(
	'mock_exam_attempts',
	{
		id: varchar('id', { length: 128 }).primaryKey(),
		userId: varchar('user_id', { length: 128 })
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		examId: varchar('exam_id', { length: 64 }).notNull(),
		status: varchar('status', { length: 16 }).notNull().default('in_progress'),
		sectionIndex: integer('section_index').notNull().default(0),
		sectionStartedAt: timestamp('section_started_at', {
			withTimezone: false,
		}).notNull(),
		answers: jsonb('answers')
			.$type<Record<string, number>>()
			.notNull()
			.default({}),
		scores: jsonb('scores').$type<MockExamScore[]>(),
		finishedAt: timestamp('finished_at', { withTimezone: false }),
		createdAt: timestamp('created_at', { withTimezone: false })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: false })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	t => [
		index('mock_exam_attempts_user_idx').on(t.userId, t.createdAt),
		uniqueIndex('mock_exam_attempts_open_unique')
			.on(t.userId, t.examId)
			.where(sql`${t.status} = 'in_progress'`),
	]
);
