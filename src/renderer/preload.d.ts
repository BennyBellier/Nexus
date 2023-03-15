import { ElectronHandler, DatabaseHandler, NexusHandler } from 'main/preload';

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    electron: ElectronHandler;
    database: DatabaseHandler;
    nexus: NexusHandler;
  }
}

export {};
