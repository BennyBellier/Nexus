import { useState, useEffect, ChangeEvent } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { RxPlusCircled } from 'react-icons/rx';
import { HiQrcode } from 'react-icons/hi';
import { VscClose } from 'react-icons/vsc';
import { GrStatusGoodSmall } from 'react-icons/gr';
import { MdOutlineAutoFixHigh } from 'react-icons/md';
import Main from '../components/Main';
import * as NexusTypes from '../../main/Utils/Types';

export default function Match() {
  const maxRound = 12;
  // const phase = 'Phase de poules';
  const [timer, setTimer] = useState('00:00');
  const [percent, setPercent] = useState('0.00');
  const [isEscaped, setEscaped] = useState<boolean | undefined>();
  const [currentRound, setCurrentRound] = useState(0);

  const [homeName, setHomeName] = useState<String>();
  const [awayName, setAwayName] = useState<String>();

  const [home, setHome] = useState<NexusTypes.Score>();
  const [away, setAway] = useState<NexusTypes.Score>();
  const [runner, setRunner] = useState<
    typeof NexusTypes.HOME | typeof NexusTypes.AWAY | undefined
  >(NexusTypes.HOME);

  const [serverIP, setServerIP] = useState('');
  const [QrDisplayed, setQrDisplayed] = useState(false);
  const [tcpClients, setTcpClients] = useState(0);
  const [correction, setCorrection] = useState(false);

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
    const subscription = window.match.timeUpdated(
      (time: number, percentage: number) => {
        setTimer(timerToString(time));
        setPercent(percentage.toString());
      }
    );

    return () => {
      if (typeof subscription === 'function') subscription();
    };
  }, []);

  useEffect(() => {
    return window.match.scoreUpdated((match: NexusTypes.MatchState) => {
      setHome(match.home);
      setAway(match.away);
      setEscaped(match.escaped);
      setCurrentRound(match.roundNumber);
      setRunner(match.runner);
    });
  }, []);

  useEffect(() => {
    return window.match.loaded();
  }, []);

  useEffect(() => {
    async function fetchIP() {
      const ip = await window.nexus.tcp_ip();
      setServerIP(ip);
    }
    fetchIP();
  }, []);

  useEffect(() => {
    return window.nexus.tcp_clientsUpdated((clients: number) => {
      return setTcpClients(clients);
    });
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

  const qrButton = (
    <button
      type="button"
      onClick={() => {
        setQrDisplayed(!QrDisplayed);
      }}
      className="4h-fit px-4 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 hover:scale-[99%] duration-200 hover:border-cyan-200 ease-in-out flex items-center gap-2"
    >
      <HiQrcode /> Afficher le QR code
    </button>
  );

  const fixButton = (
    <div className="flex flex-row gap-2 justify-center items-center">
      <input
        type="checkbox"
        role="switch"
        checked={correction === true}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setCorrection(!correction);
          // window.match.setCorrection(event.target.checked);
        }}
        className="absolute appearance-none h-[34px] w-28 rounded-lg outline-none cursor-pointer border border-slate-300 hover:border-cyan-200 checked:bg-slate-100 checked:border-cyan-200"
      />
      <MdOutlineAutoFixHigh className="z-10 select-none pointer-events-none" />
      <span className="text-slate-800 z-10 select-none pointer-events-none">
        Correction
      </span>
    </div>
  );

  return (
    <Main
      title="Match"
      className="grid grid-rows-[auto_1fr_3fr]"
      createButton={createButton}
      qrButton={qrButton}
      fixButton={fixButton}
    >
      <div className="grid grid-cols-[6fr_1fr] py-10 gap-10">
        {/* TIMER */}

        <button
          type="button"
          id="StartStopTimer"
          name="StartStopTimer"
          data-testid="start-stop-timer"
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
        <div
          className={` ${
            runner === NexusTypes.HOME ? '' : 'shadow-cyan-200'
          } flex flex-col items-center gap-8 p-5 shadow-2xl bg-white rounded-2xl scale-150 select-none`}
        >
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
        <div
          className={` ${
            runner === NexusTypes.AWAY ? '' : 'shadow-cyan-200'
          } flex flex-col items-center gap-8 p-5 shadow-2xl bg-white rounded-2xl scale-150 select-none`}
        >
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
      <div
        className={` ${
          QrDisplayed ? 'block' : 'hidden'
        } absolute z-{999999} w-screen h-screen flex justify-center items-center bg-opacity-40 bg-gray-600 -translate-x-4 -translate-y-4 duration-500`}
      >
        <div className="absolute bg-white flex justify-center items-center left-1/2 top-1/2 h-1/2 w-fit rounded-xl shadow-3xl -translate-x-3/4 -translate-y-1/2 p-10 pt-11">
          <button
            type="button"
            onClick={() => {
              setQrDisplayed(!QrDisplayed);
            }}
            className="p-1 text-white bg-orange-500 rounded-full absolute top-4 right-0 -translate-x-2 -translate-y-2"
          >
            <VscClose />
          </button>
          <QRCodeSVG value={serverIP} className="w-full h-full" />
        </div>
      </div>
      <div className="absolute bottom-2 right-2 flex flex-row gap-1 justify-center items-center">
        {tcpClients}
        <span
          className={` ${
            tcpClients === 0 ? 'text-red-500' : 'text-green-500'
          } -translate-y-[1px]`}
        >
          <GrStatusGoodSmall />
        </span>
      </div>
    </Main>
  );
}
