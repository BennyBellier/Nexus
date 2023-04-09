import { PodiumData } from '../../main/Utils/Types';

export default function Podium({ first, second, third }: PodiumData) {
  return (
    <div className="podium">
      <div className="crown" />
      <div className="podium__first">{first}</div>
      <div className="podium__second">{second}</div>
      <div className="podium__third">{third}</div>
    </div>
  );
}
