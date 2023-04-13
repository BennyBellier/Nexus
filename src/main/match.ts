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

  private teamsSet: boolean = false;

  constructor(webContents: WebContents) {
    ipcMain.on('match:start-stop', this.handleStartStop.bind(this));
    ipcMain.on('match:next-round', this.handleNextRound.bind(this));
    ipcMain.on('match:init', this.init.bind(this));
    ipcMain.on('match:pageLoaded', this.sendmatchState.bind(this));
    ipcMain.on('match:set-team', this.teamsFixed.bind(this));
    ipcMain.on('tcp:stop', this.handleStopMatch.bind(this));
    this.webContents = webContents;
  }

  public init(): void {
    if (this.matchState.status === NexusTypes.MatchStatus.ENDED) this.reset();
    if (this.matchState.status !== NexusTypes.MatchStatus.NOT_READY) return;
    if (!this.teamsSet) return;
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

  public teamsFixed(): void {
    this.teamsSet = true;
  }

  public setRunner(
    runner: typeof NexusTypes.HOME | typeof NexusTypes.AWAY
  ): void {
    this.matchState.runner = runner;
  }

  private isMatchNotReady(): boolean {
    return this.matchState.status === NexusTypes.MatchStatus.NOT_READY;
  }

  private isMatchEnded(): boolean {
    return this.matchState.status === NexusTypes.MatchStatus.ENDED;
  }

  private isMatchReady(): boolean {
    return this.matchState.status === NexusTypes.MatchStatus.READY;
  }

  private isRoundWaitingStart(): boolean {
    return this.matchState.round === NexusTypes.RoundStatus.WAITING_START;
  }

  private isRoundPlaying(): boolean {
    return this.matchState.round === NexusTypes.RoundStatus.PLAYING;
  }

  private isRoundEnded(): boolean {
    return this.matchState.round === NexusTypes.RoundStatus.ENDED;
  }

  private stopRound() {
    this.matchState.round = NexusTypes.RoundStatus.ENDED;
    this.stopInterval();
    this.sendmatchState();
  }

  private startStopRound() {
    if (this.isRoundWaitingStart()) {
      this.matchState.round = NexusTypes.RoundStatus.PLAYING;
      this.matchState.escaped = false;
      this.startRound();
    } else if (this.isRoundPlaying()) {
      this.stopRound();
    }
  }

  public handleStartStop(): void {
    if (this.isMatchNotReady() || this.isMatchEnded()) return;

    if (this.isMatchReady()) {
      this.matchState.status = NexusTypes.MatchStatus.STARTED;
    }

    this.startStopRound();
  }

  private handleStopMatch(): void {
    if (this.isRoundPlaying()) this.stopRound();
  }

  private isRunnerEscape(): boolean {
    return this.matchState.escaped === true;
  }

  private updateTeamRunner(): void {
    if (!this.isRunnerEscape()) {
      if (this.matchState.runner === NexusTypes.HOME)
        this.matchState.runner = NexusTypes.AWAY;
      else this.matchState.runner = NexusTypes.HOME;
    }
  }

  public handleNextRound(): void {
    if (this.isRoundEnded()) {
      this.sendTimeUpdate(0);
      this.matchState.round = NexusTypes.RoundStatus.WAITING_START;
      this.matchState.roundNumber += 1;
      this.updateTeamRunner();
      this.sendmatchState();
    }
  }

  private startRound(): void {
    this.startTime = Date.now();
    this.timer = setInterval(() => {
      this.updateInterval();
    }, 10);
  }

  private stopInterval(): void {
    clearInterval(this.timer!);
    this.timer = null;
    this.endTime = Date.now();
  }

  private sendTimeUpdate(time: number): void {
    this.webContents.send('match:time', time, (time / 2000) * 100);
  }

  private updateInterval(): void {
    const now = Date.now();
    const timeElapsedInCentiseconds = Math.floor((now - this.startTime!) / 10);
    // send time update
    this.sendTimeUpdate(timeElapsedInCentiseconds);

    // timer is over
    if (timeElapsedInCentiseconds >= 2000) {
      this.stopInterval();
      this.handleRoundEnded({ escaped: true });
      this.matchState.round = NexusTypes.RoundStatus.ENDED;
    }
  }

  private updateScore(): void {
    if (this.isRunnerEscape()) {
      if (this.matchState.runner === NexusTypes.HOME)
        this.matchState.home.score += 1;
      else this.matchState.away.score += 1;
    }
  }

  private handleRoundEnded(roundResult: NexusTypes.RoundResult): void {
    if (roundResult.escaped) {
      this.matchState.escaped = true;
      this.updateScore();
      this.sendmatchState();
    }
  }

  public getMatchState(): NexusTypes.MatchState {
    return this.matchState;
  }

  private sendmatchState(): void {
    this.webContents.send('match:score-update', this.matchState);
  }

  public getRoundStatus(): NexusTypes.RoundStatus | undefined {
    return this.matchState.round;
  }

  public getMatchStatus(): NexusTypes.MatchStatus {
    return this.matchState.status;
  }

  public getMatchScore(): NexusTypes.MatchScore {
    return { HOME: this.matchState.home, AWAY: this.matchState.away };
  }

  public setMatchStatus(status: NexusTypes.MatchStatus): void {
    this.matchState.status = status;
  }

  public getCurrentRound(): number {
    return this.matchState.roundNumber;
  }
}

export default ChaseTagManager;
