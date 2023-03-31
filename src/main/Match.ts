import { ipcMain, WebContents } from 'electron';
import {
  MatchStatus,
  GameState,
  HOME,
  AWAY,
  // MatchInitData,
  MatchScoreUpdate,
  RoundResult,
  MatchScore,
} from '../renderer/Utils/Types';

class ChaseTagManager {
  private timer: any = null;

  private startTime: number | null = null;

  private endTime: number | null = null;

  private currentRound: number = 1;

  private teamRunner: typeof HOME | typeof AWAY = AWAY;

  private gameState: GameState = GameState.WAITING;

  private matchStatus: MatchStatus = MatchStatus.NOT_READY;

  private roundResult: RoundResult = {
    escaped: false,
    winner: HOME,
  };

  private score: MatchScore = {
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
    this.webContents = webContents;
  }

  private initMatch(): void {
    if (this.matchStatus !== MatchStatus.NOT_READY) return;

    this.score = {
      HOME: { score: 0, faults: 0, timeout: 0 },
      AWAY: { score: 0, faults: 0, timeout: 0 },
    };

    this.webContents.send('match:score-update', {
      matchStatus: MatchStatus.READY,
      gameState: GameState.WAITING,
      score: this.score,
    });
    this.matchStatus = MatchStatus.READY;
  }

  private handleStartStopMatch(): void {
    if (this.gameState === GameState.WAITING) {
      this.gameState = GameState.PLAYING;
      this.startRound();
    } else if (this.gameState === GameState.PLAYING) {
      this.gameState = GameState.ENDED;
      this.stopRound();
      this.sendScoreUpdate();
    }
  }

  private handleNextRound(): void {
    if (this.gameState === GameState.ENDED) {
      this.sendTimeUpdate(0);
      this.gameState = GameState.WAITING;
      this.currentRound += 1;
      this.teamRunner = this.currentRound % 2 === 0 ? AWAY : HOME;
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
      this.gameState = GameState.ENDED;
    }
  }

  private handleRoundEnded(roundResult: RoundResult): void {
    if (roundResult.escaped) {
      this.roundResult.escaped = true;
      if (this.teamRunner === HOME) this.score.AWAY.score += 1;
      else this.score.HOME.score += 1;
      this.sendScoreUpdate();
      this.roundResult.escaped = false;
    }
  }

  private sendScoreUpdate(): void {
    const scoreUpdate: MatchScoreUpdate = {
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
}

export default ChaseTagManager;
