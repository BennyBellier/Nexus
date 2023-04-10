import { ipcMain, WebContents } from 'electron';
import * as NexusTypes from './Utils/Types';

class ChaseTagManager {
  private timer: any = null;

  private startTime: number | null = null;

  private endTime: number | null = null;

  private matchState: NexusTypes.MatchState = {
    status: NexusTypes.MatchStatus.NOT_READY,
    round: undefined,
    roundNumber: 0,
    home: { score: 0, faults: 0, timeout: 0 },
    away: { score: 0, faults: 0, timeout: 0 },
    runner: undefined,
    escaped: undefined,
  };

  private webContents: WebContents;

  private teamSet: boolean = false;

  constructor(webContents: WebContents) {
    ipcMain.on('match:start-stop', this.handleStartStopMatch.bind(this));
    ipcMain.on('match:next-round', this.handleNextRound.bind(this));
    ipcMain.on('match:init', this.init.bind(this));
    ipcMain.on('match:pageLoaded', this.sendScoreUpdate.bind(this));
    ipcMain.on('match:set-team', this.setTeam.bind(this));
    ipcMain.on('tcp:stop', this.handleStopMatch.bind(this));
    this.webContents = webContents;
  }

  public init(): void {
    if (this.matchState.status === NexusTypes.MatchStatus.ENDED) this.reset();
    if (this.matchState.status !== NexusTypes.MatchStatus.NOT_READY) return;
    if (!this.teamSet) return;
    if (this.matchState.runner === undefined) return;

    this.matchState.status = NexusTypes.MatchStatus.READY;
    this.matchState.round = NexusTypes.RoundStatus.WAITING_START;
    this.matchState.roundNumber = 1;

    this.webContents.send('match:score-update', this.matchState);
  }

  public reset(): void {
    this.matchState = {
      status: NexusTypes.MatchStatus.NOT_READY,
      round: undefined,
      roundNumber: 0,
      home: { score: 0, faults: 0, timeout: 0 },
      away: { score: 0, faults: 0, timeout: 0 },
      runner: undefined,
      escaped: undefined,
    };
  }

  public setTeam(): void {
    this.teamSet = true;
  }

  public handleStartStopMatch(): void {
    if (this.matchState.mat === NexusTypes.MatchStatus.NOT_READY) return;

    if (this.matchStatus === NexusTypes.MatchStatus.READY) {
      this.matchStatus = NexusTypes.MatchStatus.STARTED;
    }

    if (this.gameState === NexusTypes.RoundState.WAITING_START) {
      this.gameState = NexusTypes.RoundState.PLAYING;
      this.startRound();
    } else if (this.gameState === NexusTypes.RoundState.PLAYING) {
      this.gameState = NexusTypes.RoundState.ENDED;
      this.stopRound();
      this.sendScoreUpdate();
    }
  }

  private handleStopMatch(): void {
    if (this.gameState === NexusTypes.RoundState.PLAYING)
      this.handleStartStopMatch();
  }

  public handleNextRound(): void {
    if (this.gameState === NexusTypes.RoundState.ENDED) {
      this.sendTimeUpdate(0);
      this.gameState = NexusTypes.RoundState.WAITING_START;
      this.currentRound += 1;
      this.teamRunner =
        this.currentRound % 2 === 0 ? NexusTypes.AWAY : NexusTypes.HOME;
      this.sendScoreUpdate();
    }
  }

  private startRound(): void {
    this.startTime = Date.now();
    this.timer = setInterval(() => {
      this.updateScore();
    }, 10);
  }

  private stopRound(): void {
    clearInterval(this.timer!);
    this.timer = null;
    this.endTime = Date.now();
  }

  private sendTimeUpdate(time: number): void {
    this.webContents.send('match:time', time, (time / 2000) * 100);
  }

  private updateScore(): void {
    const now = Date.now();
    const timeElapsedInCentiseconds = Math.floor((now - this.startTime!) / 10);
    this.sendTimeUpdate(timeElapsedInCentiseconds);

    if (timeElapsedInCentiseconds >= 2000) {
      this.stopRound();
      this.handleRoundEnded({ escaped: true });
      this.gameState = NexusTypes.RoundState.ENDED;
    }
  }

  private handleRoundEnded(roundResult: NexusTypes.RoundResult): void {
    if (roundResult.escaped) {
      this.roundResult.escaped = true;
      if (this.teamRunner === NexusTypes.HOME) this.score.AWAY.score += 1;
      else this.score.HOME.score += 1;
      this.sendScoreUpdate();
      this.roundResult.escaped = false;
    }
  }

  private sendScoreUpdate(): void {
    const scoreUpdate: NexusTypes.MatchScoreUpdate = {
      matchStatus: this.matchStatus,
      gameState: this.gameState,
      home: this.score.HOME,
      away: this.score.AWAY,
      currentRound: this.currentRound,
      result: this.roundResult,
      teamRunner: this.teamRunner,
    };
    this.webContents.send('match:score-update', scoreUpdate);
  }

  public getRoundState(): NexusTypes.RoundState {
    return this.gameState;
  }

  public getMatchStatus(): NexusTypes.MatchStatus {
    return this.matchStatus;
  }

  public getMatchScore(): NexusTypes.MatchScore {
    return this.score;
  }

  public setMatchStatus(status: NexusTypes.MatchStatus): void {
    this.matchStatus = status;
  }

  public getCurrentRound(): number {
    return this.currentRound;
  }
}

export default ChaseTagManager;
