import fs from 'fs';
import { app, WebContents } from 'electron';
import log from 'electron-log';
import sqlite3 from 'sqlite3';
import path from 'path';

const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, '../../assets');

const getAssetPath = (...paths: string[]): string => {
  return path.join(RESOURCES_PATH, ...paths);
};

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

const sqlite = sqlite3.verbose();

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

  private db: sqlite3.Database;

  private web: WebContents;

  public constructor(dbName: string, web: WebContents) {
    this.dbName = getAssetPath('db', dbName);
    this.web = web;
    this.db = new sqlite.Database(this.dbName, (err) => {
      if (err) {
        log.error('Database creation:', err.message);
      }
      log.info('Connected to the database', this.dbName, 'successfully.');
    });
    this.setupDatabase();
  }

  private setupDatabase(): void {
    const sql = fs.readFileSync(path.join(__dirname, 'db', 'gen.sql'), 'utf8');
    const sqlArr = sql.split('$\n');

    this.db.serialize(() => {
      this.db.run('PRAGMA foreign_keys = ON');
      this.db.run('BEGIN TRANSACTION');
      sqlArr.forEach((s) => {
        if (s !== '') {
          this.db.run(s, (err) => {
            if (err) {
              log.error('Database setup:', s, '\n', err.message);
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

  public async query(sql: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, async (err, rows) => {
        if (err) {
          await log.error('Database query:', sql, '\n', err.message);
          reject(err);
        }
        await log.info('Database query:', sql);
        await log.verbose('Database query result:', rows);
        await resolve(rows);
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

  public async addTeam(
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
          log.error(
            'Team insertion: ',
            name,
            ' : ',
            points,
            '/',
            wins,
            '/',
            losses,
            '\n',
            err.message
          );
          return;
        }
        log.info('Added team', name, 'successfully.');
      }
    );
    // this.web.send('database:updated', this.getData());
  }

  public async addPLayedMatch(
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
          log.error(
            'Match insertion: ',
            homeTeam,
            ':',
            homeScore,
            'vs',
            awayTeam,
            ':',
            awayScore,
            err.message
          );
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
    await this.db.run('DROP TABLE IF EXISTS scoring');
    await this.db.run('DROP VIEW IF EXISTS team_stats');
    await this.db.run('DROP VIEW IF EXISTS game_stats');
    await this.db.run('DROP VIEW IF EXISTS leaderboard');
    await this.db.run('DROP TRIGGER IF EXISTS update_team_win_loses');
    await this.db.run('DROP TRIGGER IF EXISTS update_team_points');
    await this.db.run('DROP TRIGGER IF EXISTS update_scoring');
    await log.info('Database', this.dbName, 'reset complete.');
    await this.setupDatabase();
  }

  public load() {
    this.query('UPDATE scoring SET on_win = 1, on_loss = 0')
      .then(() => this.addTeam('Team 1'))
      .then(() => this.addTeam('Team 2'))
      .then(() => this.addTeam('Team 3'))
      .then(() => this.addTeam('Team 4'))
      .then(() => this.addPLayedMatch('Team 1', 'Team 2', 1, 2))
      .then(() => this.addPLayedMatch('Team 3', 'Team 4', 3, 4))
      .then(() => this.addPLayedMatch('Team 1', 'Team 3', 1, 3))
      .then(() => this.addPLayedMatch('Team 2', 'Team 4', 2, 4))
      .then(() => this.addPLayedMatch('Team 1', 'Team 4', 1, 4))
      .then(() => this.updated())
      .catch((err) => log.error(err));
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

  public getContent() {
    this.updated();
  }
}
