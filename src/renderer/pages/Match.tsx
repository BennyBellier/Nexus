import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { RxPlusCircled } from 'react-icons/rx';
import Main from '../components/Main';
import {
  Score,
  MatchScoreUpdate,
  HOME,
  AWAY,
  GameState,
  MatchStatus,
  RoundResult,
  MatchScore,
} from '../Utils/Types';

export default function Match() {
  const maxRound = 12;
  // const phase = 'Phase de poules';
  const [timer, setTimer] = useState('00:00');
  const [percent, setPercent] = useState('0.00');
  const [isEscaped, setEscaped] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);

  const [homeName, setHomeName] = useState<String>();
  const [awayName, setAwayName] = useState<String>();

  const [home, setHome] = useState<Score>();
  const [away, setAway] = useState<Score>();
  const [runner, setRunner] = useState<typeof HOME | typeof AWAY>();

  function timerToString(time: number | undefined) {
    if (time === undefined) {
      return '00:00';
    }
    const seconds = Math.floor(time / 100);
    const centiseconds = time % 100;
    const secondsString = seconds < 10 ? `0${seconds}` : `${seconds}`;
    const centisecondsString =
      centiseconds < 10 ? `0${centiseconds}` : `${centiseconds}`;

    return `${secondsString}:${centisecondsString}`;
  }

  useEffect(() => {
    return window.match.timeUpdated((time: number, percentage: number) => {
      setTimer(timerToString(time));
      setPercent(percentage.toString());
    });
  }, []);

  useEffect(() => {
    return window.match.scoreUpdated((score: MatchScoreUpdate) => {
      setHome(score.home);
      setAway(score.away);
      setEscaped(score.result.escaped);
      setCurrentRound(score.currentRound);
      setRunner(score.teamRunner);
    });
  }, []);

  useEffect(() => {
    return window.match.loaded();
  }, []);

  const createButton = (
    <button
      type="button"
      onClick={() => {
        console.log('create a match');
      }}
      className="4h-fit px-4 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 hover:scale-[99%] duration-200 hover:border-cyan-200 ease-in-out flex items-center gap-2"
    >
      <RxPlusCircled /> Nouveau match
    </button>
  );

  return (
    <Main
      title="Match"
      className="grid grid-rows-[auto_1fr_3fr]"
      other={createButton}
    >
      <div className="grid grid-cols-[6fr_1fr] py-10 gap-10">
        {/* TIMER */}

        <button
          type="button"
          onClick={() => {
            window.match.startStop();
          }}
          className="rounded-2xl flex items-center justify-end overflow-hidden shadow-2xl select-none"
        >
          <div className="w-full h-full flex flex-row justify-start items-center overflow-hidden">
            <div
              className={`h-full ${isEscaped ? 'bg-green-500' : 'bg-red-600'}`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="border-l-2 border-slate-300 h-full text-center w-1/5 text-3xl flex justify-center items-center text-slate-800">
            {timer}
          </span>
        </button>

        {/* ROUND */}

        <button
          type="button"
          onClick={() => {
            window.match.nextRound();
          }}
          className="bg-white rounded-2xl flex flex-col justify-around items-center text-3xl text-slate-800 shadow-2xl select-none"
        >
          <span className="text-center select-none">
            {currentRound === undefined ? 0 : currentRound}
          </span>
          <hr className="w-3/5 text-slate-300 mx-auto" />
          <span className="text-center select-none">
            {maxRound === undefined ? 0 : maxRound}
          </span>
        </button>
      </div>
      {/* TEAMS */}
      <div className="w-full h-full flex flex-row justify-around items-center">
        {/* HOME */}
        <div className="flex flex-col items-center gap-8 p-5 shadow-2xl bg-white rounded-2xl scale-150 select-none">
          <span className="text-3xl">{homeName}</span>
          <hr className="w-3/5 text-slate-300" />
          <div className="flex flex-row gap-8">
            <div className="flex flex-col gap-2 text-2xl text-center font-medium">
              <span className="text-slate-400">Score</span>
              <span>{home?.score}</span>
            </div>
            <div className="flex flex-col gap-2 text-2xl text-center font-medium">
              <span className="text-slate-400">Fautes</span>
              <span>{home?.faults}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 text-2xl text-center font-medium">
            <span
              className={`${
                timerToString(home?.timeout) !== '00:00'
                  ? 'text-slate-800'
                  : 'text-white'
              } select-none`}
            >
              {timerToString(home?.timeout)}
            </span>
          </div>
        </div>

        {/* AWAY */}
        <div className="flex flex-col items-center gap-8 p-5 shadow-2xl bg-white rounded-2xl scale-150 select-none">
          <span className="text-3xl">{awayName}</span>
          <hr className="w-3/5 text-slate-300" />
          <div className="flex flex-row gap-8">
            <div className="flex flex-col gap-2 text-2xl text-center font-medium">
              <span className="text-slate-400">Score</span>
              <span>{away?.score}</span>
            </div>
            <div className="flex flex-col gap-2 text-2xl text-center font-medium">
              <span className="text-slate-400">Fautes</span>
              <span>{away?.faults}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 text-2xl text-center font-medium">
            <span
              className={`${
                timerToString(away?.timeout) !== '00:00'
                  ? 'text-slate-800'
                  : 'text-white'
              } select-none`}
            >
              {timerToString(away?.timeout)}
            </span>
          </div>
        </div>
      </div>
      <div className="absolute z-{999999} w-screen h-screen flex justify-center items-center bg-opacity-40 bg-gray-600 -translate-x-4 -translate-y-4">
        <div className="absolute bg-white flex justify-center items-center left-1/2 top-1/2 h-1/2 w-fit rounded-xl shadow-3xl -translate-x-3/4 -translate-y-1/2 p-10">
          <QRCodeSVG value="192.168.0.94" className="w-full h-full" />
        </div>
      </div>
    </Main>
  );
}
