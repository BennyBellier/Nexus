import {
  ElectronHandler,
  DatabaseHandler,
  NexusHandler,
  MatchHandler,
} from 'main/preload';

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    electron: ElectronHandler;
    database: DatabaseHandler;
    nexus: NexusHandler;
    match: MatchHandler;
  }
}

export {};
