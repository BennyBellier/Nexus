import { WebContents } from 'electron';
import ChaseTagManager from '../main/match';
import * as NexusTypes from '../main/Utils/Types';

jest.mock('electron', () => ({
  ipcMain: {
    on: jest.fn(),
  },
}));

jest.useFakeTimers();

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
        gameState: NexusTypes.RoundState.WAITING_START,
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

  describe('respect Chase tag rules', () => {
    //   it("shouldn't change score, refeering to rules of the game", () => {
    //     const sendMock = jest.fn();
    //     webContents.send = sendMock;

    //     chaseTagManager.initMatch();

    //     chaseTagManager.handleStartStopMatch();
    //     setTimeout(() => {
    //       chaseTagManager.handleStartStopMatch();
    //       expect(chaseTagManager.getMatchStatus()).toBe(
    //         NexusTypes.MatchStatus.READY
    //       );
    //       expect(chaseTagManager.getCurrentRound()).toBe(1);
    //       expect(chaseTagManager.getMatchScore()).toEqual({
    //         HOME: { score: 0, faults: 0, timeout: 0 },
    //         AWAY: { score: 0, faults: 0, timeout: 0 },
    //       });
    //       expect(sendMock.mock.calls.length).toBe(2);
    //       expect(sendMock.mock.calls[1]).toHaveBeenCalledWith(
    //         'match:score-update',
    //         {
    //           matchStatus: NexusTypes.MatchStatus.READY,
    //           gameState: NexusTypes.RoundState.WAITING_START,
    //           home: { score: 0, faults: 0, timeout: 0 },
    //           away: { score: 0, faults: 0, timeout: 0 },
    //           currentRound: 1,
    //           result: { escaped: false, winner: NexusTypes.HOME },
    //           teamRunner: NexusTypes.AWAY,
    //         }
    //       );
    //     }, 500);
    //   });

    it('should have a match status of not ready and round state to wainting start', () => {
      expect(chaseTagManager.getMatchStatus()).toBe(
        NexusTypes.MatchStatus.NOT_READY
      );
    });

    it('should have a match status of ready and round state to wainting start', () => {
      const sendMock = jest.fn();
      webContents.send = sendMock;

      chaseTagManager.initMatch();

      expect(chaseTagManager.getMatchStatus()).toBe(
        NexusTypes.MatchStatus.READY
      );
      expect(chaseTagManager.getRoundState()).toBe(
        NexusTypes.RoundState.WAITING_START
      );
    });

    it('should not update score', () => {
      const sendMock = jest.fn();
      webContents.send = sendMock;

      chaseTagManager.initMatch();

      chaseTagManager.handleStartStopMatch();

      expect(chaseTagManager.getMatchStatus()).toBe(
        NexusTypes.MatchStatus.STARTED
      );
      expect(chaseTagManager.getRoundState()).toBe(
        NexusTypes.RoundState.PLAYING
      );

      chaseTagManager.handleStartStopMatch();
      expect(chaseTagManager.getRoundState()).toBe(NexusTypes.RoundState.ENDED);
      expect(chaseTagManager.getMatchScore()).toEqual({
        HOME: { score: 0, faults: 0, timeout: 0 },
        AWAY: { score: 0, faults: 0, timeout: 0 },
      });
    });

    it('should update home score', () => {
      const sendMock = jest.fn();
      webContents.send = sendMock;

      chaseTagManager.initMatch();

      chaseTagManager.handleStartStopMatch();

      jest.advanceTimersByTime(20000);

      expect(chaseTagManager.getRoundState()).toBe(NexusTypes.RoundState.ENDED);
      expect(chaseTagManager.getMatchScore()).toEqual({
        HOME: { score: 1, faults: 0, timeout: 0 },
        AWAY: { score: 0, faults: 0, timeout: 0 },
      });
    });

    it('should not update round number when match not start', () => {
      const sendMock = jest.fn();
      webContents.send = sendMock;

      chaseTagManager.initMatch();

      chaseTagManager.handleNextRound();

      expect(chaseTagManager.getCurrentRound()).toBe(1);
    });

    it('should not update round number when round not ended', () => {
      const sendMock = jest.fn();
      webContents.send = sendMock;

      chaseTagManager.initMatch();

      chaseTagManager.handleStartStopMatch();

      chaseTagManager.handleNextRound();

      expect(chaseTagManager.getCurrentRound()).toBe(1);
    });

    it('should update round number', () => {
      const sendMock = jest.fn();
      webContents.send = sendMock;

      chaseTagManager.initMatch();

      chaseTagManager.handleStartStopMatch();

      jest.advanceTimersByTime(2000);

      chaseTagManager.handleStartStopMatch();

      chaseTagManager.handleNextRound();

      expect(chaseTagManager.getCurrentRound()).toBe(2);
    });

    it('should update away score', () => {
      const sendMock = jest.fn();
      webContents.send = sendMock;

      chaseTagManager.initMatch();

      chaseTagManager.handleStartStopMatch();

      jest.advanceTimersByTime(2000);

      chaseTagManager.handleStartStopMatch();

      chaseTagManager.handleNextRound();

      expect(chaseTagManager.getCurrentRound()).toBe(2);

      chaseTagManager.handleStartStopMatch();

      jest.advanceTimersByTime(20000);

      expect(chaseTagManager.getRoundState()).toBe(NexusTypes.RoundState.ENDED);
      expect(chaseTagManager.getMatchScore()).toEqual({
        HOME: { score: 0, faults: 0, timeout: 0 },
        AWAY: { score: 1, faults: 0, timeout: 0 },
      });
      expect(sendMock.mock.calls).toHaveBeenLastCalledWith(
        'match:score-update',
        {
          matchStatus: NexusTypes.MatchStatus.STARTED,
          gameState: NexusTypes.RoundState.ENDED,
          home: { score: 0, faults: 0, timeout: 0 },
          away: { score: 1, faults: 0, timeout: 0 },
          currentRound: 2,
          result: { escaped: true, winner: NexusTypes.AWAY },
          teamRunner: NexusTypes.AWAY,
        }
      );
    });
  });
});
