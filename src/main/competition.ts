// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import fs from 'fs';
import path from 'path';
import log from 'electron-log';
import sqlite from 'sqlite3';

const sqlite3 = sqlite.verbose();
log.transports.file.level = 'verbose';
log.transports.file.file = path.join(
  __dirname,
  'assets',
  'log',
  '${Date.now()}.log'
);
log.transports.console.format = '%c{h}:{i}:{s}:{ms} %f %l %m';
log.transports.file.format =
  '{y}-{m}-{d} {h}:{i}:{s}:{ms} {z} | {level} | {text}';

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
            log.verbose('Executed SQL:', sql);
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
