CREATE TABLE
  IF NOT EXISTS teams (
    name TEXT PRIMARY KEY NOT NULL,
    points INTEGER NOT NULL,
    wins INTEGER NOT NULL,
    losses INTEGER NOT NULL
  );

CREATE TABLE
  IF NOT EXISTS played_games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    home_team TEXT NOT NULL,
    away_team TEXT NOT NULL,
    home_score INTEGER NOT NULL,
    away_score INTEGER NOT NULL,
    FOREIGN KEY (home_team) REFERENCES teams (name),
    FOREIGN KEY (away_team) REFERENCES teams (name)
  );

CREATE VIEW
  IF NOT EXISTS team_stats AS
SELECT
  name,
  points,
  wins,
  losses,
  wins + losses AS games_played
FROM
  teams;

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
  played_games;

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
  losses ASC;

CREATE VIEW
  IF NOT EXISTS update_team_stats AFTER INSERT ON played_games BEGIN
UPDATE teams
SET
  points = (
    SELECT
      SUM(
        CASE
          WHEN home_team = NEW.name THEN CASE
            WHEN home_score > away_score THEN 3
            WHEN home_score = away_score THEN 1
            ELSE 0
          END
          ELSE CASE
            WHEN away_score > home_score THEN 3
            WHEN away_score = home_score THEN 1
            ELSE 0
          END
        END
      )
    FROM
      played_games
    WHERE
      home_team = NEW.name
      OR away_team = NEW.name
  ),
  wins = (
    SELECT
      COUNT(*)
    FROM
      played_games
    WHERE
      (
        (
          home_team = NEW.name
          AND home_score > away_score
        )
        OR (
          away_team = NEW.name
          AND away_score > home_score
        )
      )
  ),
  losses = (
    SELECT
      COUNT(*)
    FROM
      played_games
    WHERE
      (
        (
          home_team = NEW.name
          AND home_score < away_score
        )
        OR (
          away_team = NEW.name
          AND away_score < home_score
        )
      )
  )
WHERE
  name = NEW.home_team
  OR name = NEW.away_team;

END;
