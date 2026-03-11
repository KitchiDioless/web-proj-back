CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(50)  NOT NULL UNIQUE,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT         NOT NULL,
  avatar_url    TEXT,
  role          VARCHAR(20)  NOT NULL DEFAULT 'user',
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS games (
  id              SERIAL PRIMARY KEY,
  title           VARCHAR(255) NOT NULL,
  slug            VARCHAR(255) NOT NULL UNIQUE,
  description     TEXT,
  cover_image_url TEXT,
  released_at     DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quizzes (
  id                 SERIAL PRIMARY KEY,
  game_id            INT          NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  created_by_user_id INT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title              VARCHAR(255) NOT NULL,
  description        TEXT,
  difficulty         VARCHAR(20)  NOT NULL,
  average_rating     NUMERIC(3,2) NOT NULL DEFAULT 0,
  plays_count        INT          NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quizzes_game_id      ON quizzes(game_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_created_by   ON quizzes(created_by_user_id);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id                 SERIAL PRIMARY KEY,
  quiz_id            INT  NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  "order"            INT  NOT NULL,
  text               TEXT NOT NULL,
  options            JSONB NOT NULL,
  correct_option_idx INT  NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);

CREATE TABLE IF NOT EXISTS quiz_results (
  id              SERIAL PRIMARY KEY,
  quiz_id         INT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id         INT NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
  score           INT NOT NULL,
  correct_answers INT NOT NULL,
  total_questions INT NOT NULL,
  time_seconds    INT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_results_quiz_id ON quiz_results(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON quiz_results(user_id);

CREATE TABLE IF NOT EXISTS quiz_votes (
  id         SERIAL PRIMARY KEY,
  quiz_id    INT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id    INT NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
  value      INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (quiz_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_quiz_votes_quiz_id ON quiz_votes(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_votes_user_id ON quiz_votes(user_id);

