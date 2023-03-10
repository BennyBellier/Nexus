import { ElectronHandler, DatabaseHandler } from 'main/preload';

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    electron: ElectronHandler;
    database: DatabaseHandler;
  }
}

export {};
