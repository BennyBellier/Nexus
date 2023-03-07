import fs from 'fs';
import { app, WebContents } from 'electron';
import log from 'electron-log';
import sqlite from 'sqlite3';
import path from 'path';

const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, '../../assets');

const getAssetPath = (...paths: string[]): string => {
  return path.join(RESOURCES_PATH, ...paths);
};

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

const sqlite3 = sqlite.verbose();

log.transports.file.level = 'verbose';
log.transports.console.level = 'info';
const today = new Date(Date.now()).toISOString().slice(0, -8);
if (isDebug) {
  const currentLogExist = fs.existsSync(getAssetPath('logs', 'current.log'));
  if (currentLogExist) {
    fs.unlinkSync(getAssetPath('logs', 'current.log'));
    log.info('Deleted current.log');
  }
  log.transports.file.file = getAssetPath('logs', 'current.log');
} else {
  log.transports.file.file = getAssetPath('logs', `${today}.log`);
}

log.transports.file.format = '{y}-{m}-{d} {h}:{i}:{s}.{ms} [{level}] {text}';
log.transports.console.useStyles = true;

export default class Database {
  private dbName: string;

  private db: sqlite.Database;

  private web: WebContents;

  public constructor(dbName: string, web: WebContents) {
    this.dbName = getAssetPath('db', dbName);
    this.web = web;
    this.db = new sqlite3.Database(this.dbName, (err) => {
      if (err) {
        log.error('Database creation:', err.message);
      }
      log.info('Connected to the database', this.dbName, 'successfully.');
    });
    this.setupDatabase();
  }

  private setupDatabase(): void {
    const sql = fs.readFileSync(path.join(__dirname, 'db', 'gen.sql'), 'utf8');
    const sqlArr = sql.split(';\n');

    this.db.serialize(() => {
      this.db.run('PRAGMA foreign_keys = ON');
      this.db.run('BEGIN TRANSACTION');
      sqlArr.forEach((s) => {
        if (s !== '') {
          this.db.run(s, (err) => {
            if (err) {
              log.error('Database setup:', err.message);
            }
          });
        }
      });
      this.db.run('COMMIT');
    });
    log.info('Database', this.dbName, 'setup complete.');
  }

  public close(): void {
    this.db.close((err) => {
      if (err) {
        log.error('Database close:', err.message);
      }
      log.info('Database', this.dbName, 'closed.');
    });
  }

  public query(sql: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, (err, rows) => {
        if (err) {
          log.error('Database query:', err.message);
          reject(err);
        }
        log.info('Database query:', sql);
        log.verbose('Database query result:', rows);
        resolve(rows);
      });
    });
  }

  private async getData() {
    const teams = await this.query('SELECT * FROM team_stats');
    const matches = await this.query(
      'SELECT id, home_team, home_score, away_team, away_score, winner, loser FROM game_stats'
    );
    const leaderboard = await this.query('SELECT * FROM leaderboard');
    return { teams, matches, leaderboard };
  }

  public addTeam(
    name: string,
    points: number = 0,
    wins: number = 0,
    losses: number = 0
  ) {
    this.db.run(
      'INSERT INTO teams (name, points, wins, losses) VALUES (?, ?, ?, ?)',
      name,
      points,
      wins,
      losses,
      (err: any) => {
        if (err) {
          log.error('Team insertion:', err.message);
          return;
        }
        log.info('Added team', name, 'successfully.');
      }
    );
    // this.web.send('database:updated', this.getData());
  }

  public addPLayedMatch(
    homeTeam: string,
    awayTeam: string,
    homeScore: number,
    awayScore: number
  ) {
    this.db.run(
      'INSERT INTO played_games (home_team, away_team, home_score, away_score) VALUES (?, ?, ?, ?)',
      homeTeam,
      awayTeam,
      homeScore,
      awayScore,
      (err: any) => {
        if (err) {
          log.error('Match insertion:', err.message);
          return;
        }
        log.info(
          'Added match',
          homeTeam,
          ':',
          homeScore,
          'vs',
          awayTeam,
          ':',
          awayScore,
          'successfully.'
        );
      }
    );
    // this.web.send('database:updated', this.getData());
  }

  public async reset() {
    await this.db.run('DROP TABLE IF EXISTS played_games');
    await this.db.run('DROP TABLE IF EXISTS teams');
    await this.setupDatabase();
  }

  public async load() {
    await this.addTeam('Team 1');
    await this.addTeam('Team 2');
    await this.addTeam('Team 3');
    await this.addTeam('Team 4');

    await this.addPLayedMatch('Team 1', 'Team 2', 1, 2);
    await this.addPLayedMatch('Team 3', 'Team 4', 3, 4);
    await this.addPLayedMatch('Team 1', 'Team 3', 1, 3);
    await this.addPLayedMatch('Team 2', 'Team 4', 2, 4);
    await this.addPLayedMatch('Team 1', 'Team 4', 1, 4);
    await this.addPLayedMatch('Team 2', 'Team 3', 2, 3);

    await this.updated();
  }

  private async updated() {
    const teams = await this.query('SELECT * FROM team_stats');
    const games = await this.query(
      'SELECT id, home_team, home_score, away_team, away_score, winner, loser FROM game_stats'
    );
    const lead = await this.query('SELECT * FROM leaderboard');
    await log.info(teams);
    await log.info(games);
    await log.info(lead);
    await this.web.send('database:updated', teams, games, lead);
  }
}
