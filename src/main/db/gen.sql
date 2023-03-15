CREATE TABLE
  IF NOT EXISTS teams (
    name TEXT PRIMARY KEY NOT NULL,
    points INTEGER NOT NULL,
    wins INTEGER NOT NULL,
    losses INTEGER NOT NULL
  );$

CREATE TABLE
  IF NOT EXISTS played_games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    home_team TEXT NOT NULL,
    away_team TEXT NOT NULL,
    home_score INTEGER NOT NULL,
    away_score INTEGER NOT NULL,
    FOREIGN KEY (home_team) REFERENCES teams (name),
    FOREIGN KEY (away_team) REFERENCES teams (name)
  );$

CREATE TABLE
  IF NOT EXISTS scoring (
    on_win INTEGER NOT NULL,
    on_loss INTEGER NOT NULL
  );$

INSERT INTO scoring (on_win, on_loss) VALUES (3, 1);$

CREATE VIEW
  IF NOT EXISTS team_stats AS
SELECT
  name,
  points,
  wins,
  losses,
  wins + losses AS games_played
FROM
  teams;$

CREATE VIEW
  IF NOT EXISTS game_stats AS
SELECT
  id,
  home_team,
  away_team,
  home_score,
  away_score,
  CASE
    WHEN home_score > away_score THEN home_team
    WHEN home_score < away_score THEN away_team
    ELSE NULL
  END AS winner,
  CASE
    WHEN home_score > away_score THEN away_team
    WHEN home_score < away_score THEN home_team
    ELSE NULL
  END AS loser
FROM
  played_games;$

CREATE VIEW
  IF NOT EXISTS leaderboard AS
SELECT
  name,
  points,
  wins,
  losses,
  wins + losses AS games_played
FROM
  teams
ORDER BY
  points DESC,
  wins DESC,
  losses ASC;$

CREATE TRIGGER IF NOT EXISTS update_team_win_loses AFTER INSERT ON played_games
    BEGIN
      UPDATE teams
      SET wins = wins + CASE
          WHEN NEW.home_score > NEW.away_score AND name = NEW.home_team THEN 1
          WHEN NEW.home_score < NEW.away_score AND name = NEW.away_team THEN 1
          ELSE 0
        END,
        losses = losses + CASE
          WHEN NEW.home_score < NEW.away_score AND name = NEW.home_team THEN 1
          WHEN NEW.home_score > NEW.away_score AND name = NEW.away_team THEN 1
          ELSE 0
        END
      WHERE name = NEW.home_team OR name = NEW.away_team;
    END;$
