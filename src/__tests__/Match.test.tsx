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

      expect(chaseTagManager.getMatchState()).toStrictEqual({
        status: NexusTypes.MatchStatus.NOT_READY,
        round: undefined,
        roundNumber: 0,
        home: { score: 0, faults: 0, timeout: 0 },
        away: { score: 0, faults: 0, timeout: 0 },
        runner: undefined,
        escaped: undefined,
      });

      chaseTagManager.teamsFixed();
      chaseTagManager.setRunner(NexusTypes.HOME);

      chaseTagManager.init();

      expect(chaseTagManager.getMatchState()).toStrictEqual({
        status: NexusTypes.MatchStatus.READY,
        round: NexusTypes.RoundStatus.WAITING_START,
        roundNumber: 1,
        home: { score: 0, faults: 0, timeout: 0 },
        away: { score: 0, faults: 0, timeout: 0 },
        runner: NexusTypes.HOME,
        escaped: undefined,
      });
    });

    it('should not do anything if match status is not not_ready', () => {
      chaseTagManager.setMatchStatus(NexusTypes.MatchStatus.STARTED);
      chaseTagManager.init();

      expect(chaseTagManager.getMatchStatus()).toBe(
        NexusTypes.MatchStatus.STARTED
      );
    });
  });

  describe('respect Chase tag rules', () => {
    beforeEach(() => {
      const sendMock = jest.fn();
      webContents.send = sendMock;

      chaseTagManager.teamsFixed();
      chaseTagManager.setRunner(NexusTypes.HOME);

      chaseTagManager.init();
    });

    it('should update home score and not change team runner', () => {
      chaseTagManager.handleStartStop();

      jest.advanceTimersByTime(20000);

      expect(chaseTagManager.getMatchState()).toStrictEqual({
        status: NexusTypes.MatchStatus.STARTED,
        round: NexusTypes.RoundStatus.ENDED,
        roundNumber: 1,
        home: { score: 1, faults: 0, timeout: 0 },
        away: { score: 0, faults: 0, timeout: 0 },
        runner: NexusTypes.HOME,
        escaped: true,
      });
    });

    it('should not update round number when match not start', () => {
      chaseTagManager.handleNextRound();

      expect(chaseTagManager.getMatchState()).toStrictEqual({
        status: NexusTypes.MatchStatus.READY,
        round: NexusTypes.RoundStatus.WAITING_START,
        roundNumber: 1,
        home: { score: 0, faults: 0, timeout: 0 },
        away: { score: 0, faults: 0, timeout: 0 },
        runner: NexusTypes.HOME,
        escaped: undefined,
      });
    });

    it('should not update round number when round not ended', () => {
      chaseTagManager.handleStartStop();

      chaseTagManager.handleNextRound();

      expect(chaseTagManager.getMatchState()).toStrictEqual({
        status: NexusTypes.MatchStatus.STARTED,
        round: NexusTypes.RoundStatus.PLAYING,
        roundNumber: 1,
        home: { score: 0, faults: 0, timeout: 0 },
        away: { score: 0, faults: 0, timeout: 0 },
        runner: NexusTypes.HOME,
        escaped: false,
      });
    });

    it('should update round number and change team runner', () => {
      chaseTagManager.handleStartStop();

      jest.advanceTimersByTime(2000);

      chaseTagManager.handleStartStop();

      chaseTagManager.handleNextRound();

      expect(chaseTagManager.getMatchState()).toStrictEqual({
        status: NexusTypes.MatchStatus.STARTED,
        round: NexusTypes.RoundStatus.WAITING_START,
        roundNumber: 2,
        home: { score: 0, faults: 0, timeout: 0 },
        away: { score: 0, faults: 0, timeout: 0 },
        runner: NexusTypes.AWAY,
        escaped: false,
      });
    });

    it('should update away score and change team runner once', () => {
      chaseTagManager.handleStartStop();

      jest.advanceTimersByTime(2000);

      chaseTagManager.handleStartStop();

      chaseTagManager.handleNextRound();

      chaseTagManager.handleStartStop();

      jest.advanceTimersByTime(20000);

      expect(chaseTagManager.getMatchState()).toStrictEqual({
        status: NexusTypes.MatchStatus.STARTED,
        round: NexusTypes.RoundStatus.ENDED,
        roundNumber: 2,
        home: { score: 0, faults: 0, timeout: 0 },
        away: { score: 1, faults: 0, timeout: 0 },
        runner: NexusTypes.AWAY,
        escaped: true,
      });
    });

    it('should change team runner twice and not change scores', () => {
      chaseTagManager.handleStartStop();

      jest.advanceTimersByTime(2000);

      chaseTagManager.handleStartStop();

      chaseTagManager.handleNextRound();

      expect(chaseTagManager.getMatchState()).toStrictEqual({
        status: NexusTypes.MatchStatus.STARTED,
        round: NexusTypes.RoundStatus.WAITING_START,
        roundNumber: 2,
        home: { score: 0, faults: 0, timeout: 0 },
        away: { score: 0, faults: 0, timeout: 0 },
        runner: NexusTypes.AWAY,
        escaped: false,
      });

      chaseTagManager.handleStartStop();

      jest.advanceTimersByTime(2000);

      chaseTagManager.handleStartStop();

      chaseTagManager.handleNextRound();

      expect(chaseTagManager.getMatchState()).toStrictEqual({
        status: NexusTypes.MatchStatus.STARTED,
        round: NexusTypes.RoundStatus.WAITING_START,
        roundNumber: 3,
        home: { score: 0, faults: 0, timeout: 0 },
        away: { score: 0, faults: 0, timeout: 0 },
        runner: NexusTypes.HOME,
        escaped: false,
      });
    });
  });
});
