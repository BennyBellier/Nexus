// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import fs, { writeFile } from 'fs';
import path from 'path';
import log, { LogMessage } from 'electron-log';
import sqlite from 'sqlite3';
import util from 'util';

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

const sqlite3 = sqlite.verbose();
log.transports.file.level = 'verbose';
log.transports.console.level = 'info';
const today = new Date(Date.now()).toISOString().slice(0, -8);
if (isDebug) {
  log.transports.file.file = path.join(
    __dirname,
    'assets',
    'log',
    'current.log'
  );
} else {
  log.transports.file.file = path.join(
    __dirname,
    'assets',
    'log',
    `${today}.log`
  );
}

log.transports.file.format = '{y}-{m}-{d} {h}:{i}:{s}.{ms} [{level}] {text}';
log.transports.console.useStyles = true;

class Database {
  private db: any;

  private dbExists: boolean;

  constructor(dbPath: string) {
    this.dbExists = fs.existsSync(dbPath);

    this.db = new sqlite3.Database(dbPath, sqlite3.OPEN_CREATE, (err: any) => {
      if (err) {
        log.error(err.message);
      }
      log.info('Connected to the database', dbPath, 'successfully.');
    });

    if (!this.dbExists) {
      const genSql = fs
        .readFileSync(path.join(__dirname, 'db', 'gen.sql'), 'utf8')
        .toString();
      const genArr = genSql.split(';');

      this.db.serialize(() => {
        this.db.run('PRAGMA foreign_keys = ON');

        this.db.run('BEGIN TRANSACTION');

        genArr.forEach((sql: string) => {
          if (sql !== '') {
            this.db.run(sql);
            log.silly('Executed SQL:', sql);
          }
        });

        this.db.run('COMMIT');
      });

      log.info('Created the database', dbPath, 'successfully.');
    }
  }

  public close() {
    this.db.close((err: any) => {
      if (err) {
        log.error(err.message);
      }
      log.info('Closed the database connection.');
    });
  }
}

export default Database;
