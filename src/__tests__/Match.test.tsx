import { WebContents } from 'electron';
import ChaseTagManager from '../main/Match';
import * as NexusTypes from '../main/Utils/Types';

jest.mock('electron', () => ({
  ipcMain: {
    on: jest.fn(),
  },
}));

describe('ChaseTagManager', () => {
  let webContents: WebContents;
  let chaseTagManager: ChaseTagManager;

  beforeEach(() => {
    webContents = {} as WebContents;
    chaseTagManager = new ChaseTagManager(webContents);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('initMatch', () => {
    it('should set match status to ready and reset scores', () => {
      const sendMock = jest.fn();
      webContents.send = sendMock;

      chaseTagManager.initMatch();

      expect(chaseTagManager.getMatchStatus()).toBe(
        NexusTypes.MatchStatus.READY
      );
      expect(chaseTagManager.getMatchScore()).toEqual({
        HOME: { score: 0, faults: 0, timeout: 0 },
        AWAY: { score: 0, faults: 0, timeout: 0 },
      });
      expect(sendMock).toHaveBeenCalledWith('match:score-update', {
        matchStatus: NexusTypes.MatchStatus.READY,
        gameState: NexusTypes.GameState.WAITING,
        score: {
          HOME: { score: 0, faults: 0, timeout: 0 },
          AWAY: { score: 0, faults: 0, timeout: 0 },
        },
      });
    });

    it('should not do anything if match status is not not_ready', () => {
      chaseTagManager.setMatchStatus(NexusTypes.MatchStatus.STARTED);
      chaseTagManager.initMatch();

      expect(chaseTagManager.getMatchStatus()).toBe(
        NexusTypes.MatchStatus.STARTED
      );
    });
  });

  describe('updateScore', () => {
    it("shouldn't change score, refeering to rules of the game", () => {
      const sendMock = jest.fn();
      webContents.send = sendMock;

      chaseTagManager.initMatch();

      chaseTagManager.handleStartStopMatch();
      setTimeout(() => {
        chaseTagManager.handleStartStopMatch();
        expect(chaseTagManager.getMatchStatus()).toBe(
          NexusTypes.MatchStatus.READY
        );
        expect(chaseTagManager.getCurrentRound()).toBe(1);
        expect(chaseTagManager.getMatchScore()).toEqual({
          HOME: { score: 0, faults: 0, timeout: 0 },
          AWAY: { score: 0, faults: 0, timeout: 0 },
        });
        expect(sendMock.mock.calls.length).toBe(2);
        expect(sendMock.mock.calls[1]).toHaveBeenCalledWith(
          'match:score-update',
          {
            matchStatus: NexusTypes.MatchStatus.READY,
            gameState: NexusTypes.GameState.WAITING,
            home: { score: 0, faults: 0, timeout: 0 },
            away: { score: 0, faults: 0, timeout: 0 },
            currentRound: 1,
            result: { escaped: false, winner: NexusTypes.HOME },
            teamRunner: NexusTypes.AWAY,
          }
        );
      }, 500);
    });
  });
});
