// Every custom event the app sends, with its properties. PostHog adds page, device,
// browser, OS, country, city and referrer properties to each one automatically.
export type AnalyticsEvents = {
  // Accounts
  signed_up: { email_sent: boolean };
  logged_in: { method: "password" };
  google_sign_in_started: { page: string };
  logged_out: { source: "navbar" | "profile" };

  // Preferences
  locale_changed: { from: string; to: string };
  theme_changed: { to: string };
  exam_goal_saved: { fields: string[] };

  // Practice and review
  practice_drill_selected: { drill: string; level: string };
  practice_level_selected: { level: string; drill: string };
  card_reviewed: { level: string; grade: string; signed_in: boolean };

  // Quizzes
  quiz_submitted: { quiz_id: string; score: number; total_questions: number; percent: number };

  // Mock exams
  mock_exam_started: { exam_id: string; level: string; mode: string; section: string };
  mock_section_opened: { exam_id: string; level: string; mode: string; section: string };
  mock_section_finished: { exam_id: string; level: string; mode: string; section: string; answered: number };
  mock_exam_completed: { exam_id: string; level: string; mode: string; answered: number; signed_in: boolean };
  mock_exam_finished: { exam_id: string; mode: string; answered: number };
  mock_result_shared: { exam_id: string; method: "native" | "clipboard"; total: number; max: number; passes: boolean };

  // App
  pwa_installed: Record<string, never>;
};
