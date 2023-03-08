// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels = 'ipc-example';
export type DBChannels = 'db';

interface DBUpdate {
  teamDataQuery: unknown[];
  gameDataQuery: unknown[];
  leaderboardDataQuery: unknown[];
}

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, args: unknown[]) {
      ipcRenderer.send(channel, args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
};

const databaseHandler = {
  onUpdate: (func: (teams: [], matches: [], leaderboard: []) => void) => {
    const subscription = (
      _event: IpcRendererEvent,
      teams: [],
      matches: [],
      leaderboard: []
    ) => func(teams, matches, leaderboard);
    ipcRenderer.on('database:updated', subscription);

    return () => {
      ipcRenderer.removeListener('database:updated', subscription);
    };
  },
  loadData: () => {
    ipcRenderer.send('database:loadData');
  },
  resetDB: () => {
    ipcRenderer.send('database:resetDB');
  },
  dBContent: () => {
    ipcRenderer.send('database:content');
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);
contextBridge.exposeInMainWorld('database', databaseHandler);

export type ElectronHandler = typeof electronHandler;
export type DatabaseHandler = typeof databaseHandler;
