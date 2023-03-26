import { useState } from 'react';
import Main from '../components/Main';

const homeData = {
  name: 'Team1',
  score: 1,
  faults: 1,
  timeouts: 0,
};

const awayData = {
  name: 'Team2',
  score: 0,
  faults: 0,
  timeouts: 1500,
};

function Timer() {
  const [time, setTime] = useState(1599);
  // const [isRunning, setIsRunning] = useState(false);
  const [percentage, setPercentage] = useState(75);
  const [escaped, setEscaped] = useState(false);

  function tick() {
    setTime(time + 1);
    setPercentage(Math.ceil((time / 100) * 20));
    if (time >= 20000) {
      setEscaped(true);
    }
  }

  function timeToString() {
    const seconds = Math.floor(time / 100);
    const centiseconds = time % 100;

    const secondsString = seconds < 10 ? `0${seconds}` : `${seconds}`;
    const centisecondsString =
      centiseconds < 10 ? `0${centiseconds}` : `${centiseconds}`;

    return `${secondsString}:${centisecondsString}`;
  }

  return (
    <div className="rounded-2xl flex items-center justify-end overflow-hidden shadow-2xl">
      <div
        className={`w-full h-full flex flex-row justify-start items-center ${
          escaped ? 'before:bg-green-500' : 'before:bg-red-600'
        } before:h-full before:w-[${percentage.toString()}%]`}
      />
      <span className="border-l-2 border-slate-300 h-full text-center w-1/5 text-3xl flex justify-center items-center text-slate-800">
        {timeToString()}
      </span>
    </div>
  );
}

function Round({ maxRound, currentRound }: any) {
  return (
    <div className="bg-white rounded-2xl grid grid-rows-3 grid-cols-1 justify-center items-center text-3xl text-slate-800 shadow-2xl">
      <span className="text-center">
        {currentRound === undefined ? 0 : currentRound}
      </span>
      <hr className="w-3/5 text-slate-300 mx-auto" />
      <span className="text-center">
        {maxRound === undefined ? 0 : maxRound}
      </span>
    </div>
  );
}

function TeamElement({ team }: any) {
  function timeToString(time: number) {
    const seconds = Math.floor(time / 100);
    const centiseconds = time % 100;

    const secondsString = seconds < 10 ? `0${seconds}` : `${seconds}`;
    const centisecondsString =
      centiseconds < 10 ? `0${centiseconds}` : `${centiseconds}`;

    return `${secondsString}:${centisecondsString}`;
  }

  return (
    <div className="flex flex-col items-center gap-8 p-5 shadow-2xl bg-white rounded-2xl m-20 scale-150">
      <span className="text-3xl">{team.name}</span>
      <hr className="w-3/5 text-slate-300" />
      <div className="flex flex-row gap-8">
        <div className="flex flex-col gap-2 text-2xl text-center font-medium">
          <span className="text-slate-400">Score</span>
          <span>{team.score}</span>
        </div>
        <div className="flex flex-col gap-2 text-2xl text-center font-medium">
          <span className="text-slate-400">Fautes</span>
          <span>{team.faults}</span>
        </div>
      </div>
      <div className="flex flex-col gap-2 text-2xl text-center font-medium">
        <span
          className={`${
            timeToString(team.timeouts) !== '00:00'
              ? 'text-slate-800'
              : 'text-white'
          }`}
        >
          {timeToString(team.timeouts)}
        </span>
      </div>
    </div>
  );
}

function Teams({ home, away }: any) {
  return (
    <div className="w-full h-full flex flex-row justify-between items-center">
      <TeamElement team={home} />
      <TeamElement team={away} />
    </div>
  );
}

export default function Match() {
  const phase = 'Phase de poules';

  return (
    <Main title={phase} className="grid grid-rows-[auto_1fr_3fr]">
      <div className="grid grid-cols-[5fr_1fr] py-10 gap-5">
        <Timer />
        <Round />
      </div>
      <Teams home={homeData} away={awayData} />
    </Main>
  );
}
