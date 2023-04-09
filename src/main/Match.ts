import { ipcMain, WebContents } from 'electron';
import * as NexusTypes from './Utils/Types';

class ChaseTagManager {
  private timer: any = null;

  private startTime: number | null = null;

  private endTime: number | null = null;

  private currentRound: number = 1;

  private teamRunner: typeof NexusTypes.HOME | typeof NexusTypes.AWAY =
    NexusTypes.AWAY;

  private gameState: NexusTypes.GameState = NexusTypes.GameState.WAITING;

  private matchStatus: NexusTypes.MatchStatus =
    NexusTypes.MatchStatus.NOT_READY;

  private roundResult: NexusTypes.RoundResult = {
    escaped: false,
    winner: NexusTypes.HOME,
  };

  private score: NexusTypes.MatchScore = {
    HOME: { score: 0, faults: 0, timeout: 0 },
    AWAY: { score: 0, faults: 0, timeout: 0 },
  };

  private webContents: WebContents;

  private teamSet: boolean = false;

  constructor(webContents: WebContents) {
    ipcMain.on('match:start-stop', this.handleStartStopMatch.bind(this));
    ipcMain.on('match:next-round', this.handleNextRound.bind(this));
    ipcMain.on('match:init', this.initMatch.bind(this));
    ipcMain.on('match:pageLoaded', this.sendScoreUpdate.bind(this));
    ipcMain.on('tcp:stop', this.handleStopMatch.bind(this));
    this.webContents = webContents;
  }

  public initMatch(): void {
    if (this.matchStatus !== NexusTypes.MatchStatus.NOT_READY) return;

    this.score = {
      HOME: { score: 0, faults: 0, timeout: 0 },
      AWAY: { score: 0, faults: 0, timeout: 0 },
    };

    this.webContents.send('match:score-update', {
      matchStatus: NexusTypes.MatchStatus.READY,
      gameState: NexusTypes.GameState.WAITING,
      score: this.score,
    });
    this.matchStatus = NexusTypes.MatchStatus.READY;
  }

  public handleStartStopMatch(): void {
    if (this.gameState === NexusTypes.GameState.WAITING) {
      this.gameState = NexusTypes.GameState.PLAYING;
      this.startRound();
    } else if (this.gameState === NexusTypes.GameState.PLAYING) {
      this.gameState = NexusTypes.GameState.ENDED;
      this.stopRound();
      this.sendScoreUpdate();
    }
  }

  private handleStopMatch(): void {
    if (this.gameState === NexusTypes.GameState.PLAYING)
      this.handleStartStopMatch();
  }

  private handleNextRound(): void {
    if (this.gameState === NexusTypes.GameState.ENDED) {
      this.sendTimeUpdate(0);
      this.gameState = NexusTypes.GameState.WAITING;
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
      this.gameState = NexusTypes.GameState.ENDED;
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
