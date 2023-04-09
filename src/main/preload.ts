// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import {
  DashboardDescription,
  MatchInitData,
  MatchScoreUpdate,
} from './Utils/Types';

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
  dbUpdated: (func: (teams: [], matches: [], leaderboard: []) => void) => {
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

const matchHandler = {
  startStop: () => {
    ipcRenderer.send('match:start-stop');
  },
  nextRound: () => {
    ipcRenderer.send('match:next-round');
  },
  loaded: () => {
    ipcRenderer.send('match:pageLoaded');
  },
  init: (data: MatchInitData) => {
    ipcRenderer.send('match:init', data);
  },
  scoreUpdated: (func: (score: MatchScoreUpdate) => void) => {
    const subscription = (_event: IpcRendererEvent, score: any) => func(score);
    ipcRenderer.on('match:score-update', subscription);

    return () => {
      ipcRenderer.removeListener('match:score-update', subscription);
    };
  },
  timeUpdated: (
    func: (time: number, percentage: number) => void,
    disableIPCListener = false
  ) => {
    const subscription = (
      _event: IpcRendererEvent,
      time: number,
      percentage: number
    ) => func(time, percentage);

    if (!disableIPCListener) {
      ipcRenderer.on('match:time', subscription);
    }

    return () => {
      if (!disableIPCListener) {
        ipcRenderer.removeListener('match:time', subscription);
      }
    };
  },
};

const nexusHandler = {
  getAssetsPath: (func: (file: string) => string) => {
    const subscription = (_event: IpcRendererEvent, file: string) => func(file);
    ipcRenderer.on('nexus:getAssetspath', subscription);

    return () => {
      ipcRenderer.removeListener('nexus:getAssetspath', subscription);
    };
  },
  descriptionUpdated: (func: (desc: DashboardDescription) => void) => {
    const subscription = (
      _event: IpcRendererEvent,
      desc: DashboardDescription
    ) => func(desc);
    ipcRenderer.on('nexus:descriptionUpdated', subscription);

    return () => {
      ipcRenderer.removeListener('nexus:descriptionUpdated', subscription);
    };
  },
  tcp_ip: (): Promise<string> => ipcRenderer.invoke('tcp:ip'),
  tcp_clientsUpdated: (func: (clients: number) => void) => {
    const subscription = (_event: IpcRendererEvent, clients: number) =>
      func(clients);
    ipcRenderer.on('tcp:clients', subscription);

    return () => {
      ipcRenderer.removeListener('tcp:clients', subscription);
    };
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);
contextBridge.exposeInMainWorld('database', databaseHandler);
contextBridge.exposeInMainWorld('nexus', nexusHandler);
contextBridge.exposeInMainWorld('match', matchHandler);

export type ElectronHandler = typeof electronHandler;
export type DatabaseHandler = typeof databaseHandler;
export type NexusHandler = typeof nexusHandler;
export type MatchHandler = typeof matchHandler;
