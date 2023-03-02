CREATE TABLE IF NOT EXISTS teams (
  name TEXT PRIMARY KEY NOT NULL,
  points INTEGER NOT NULL,
  wins INTEGER NOT NULL,
  losses INTEGER NOT NULL,
)

CREATE TABLE IF NOT EXISTS games (
  id INTEGER PRIMARY KEY NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  home_score INTEGER NOT NULL,
  away_score INTEGER NOT NULL,
  FOREIGN KEY (home_team) REFERENCES teams (name),
  FOREIGN KEY (away_team) REFERENCES teams (name)
)

CREATE VIEW IF NOT EXISTS team_stats AS
  SELECT name, points, wins, losses, wins + losses AS games_played
  FROM teams

CREATE VIEW IF NOT EXISTS game_stats AS
  SELECT id, home_team, away_team, home_score, away_score,
    CASE WHEN home_score > away_score THEN home_team
         WHEN home_score < away_score THEN away_team
         ELSE NULL END AS winner,
    CASE WHEN home_score > away_score THEN away_team
         WHEN home_score < away_score THEN home_team
         ELSE NULL END AS loser
  FROM games

CREATE VIEW IF NOT EXISTS leaderboard AS
  SELECT name, points, wins, losses, wins + losses AS games_played
  FROM teams
  ORDER BY points DESC, wins DESC, losses ASC

CREATE VIEW IF NOT EXISTS game_log AS
  SELECT id, home_team, away_team, home_score, away_score,
    CASE WHEN home_score > away_score THEN home_team
         WHEN home_score < away_score THEN away_team
         ELSE NULL END AS winner,
    CASE WHEN home_score > away_score THEN away_team
         WHEN home_score < away_score THEN home_team
         ELSE NULL END AS loser
  FROM games
  ORDER BY id DESC

-- Path: src/main/db/insert.sql
