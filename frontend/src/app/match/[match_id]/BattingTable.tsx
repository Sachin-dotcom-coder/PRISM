type Batter = {
  batter: string;
  status: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
};

export default function BattingTable({ batters }: { batters: Batter[] }) {
  return (
    <div className="overflow-x-auto w-full glass rounded-xl border border-zinc-800">
      <table className="w-full text-sm text-left">
        <thead className="bg-zinc-900/50 text-zinc-500 font-semibold uppercase tracking-widest text-xs border-b border-zinc-800">
          <tr>
            <th scope="col" className="px-6 py-4">Batter</th>
            <th scope="col" className="px-6 py-4"></th>
            <th scope="col" className="px-4 py-4 text-center">R</th>
            <th scope="col" className="px-4 py-4 text-center">B</th>
            <th scope="col" className="px-4 py-4 text-center">4s</th>
            <th scope="col" className="px-4 py-4 text-center">6s</th>
            <th scope="col" className="px-4 py-4 text-center">SR</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
          {batters.map((b, i) => (
            <tr key={i} className="hover:bg-zinc-900/30 transition-colors">
              <td className="px-6 py-3 font-semibold text-accent">
                {b.batter}
                {b.status === "not out" && " *"}
              </td>
              <td className="px-6 py-3 text-zinc-500 text-xs">{b.status}</td>
              <td className="px-4 py-3 text-center font-bold">{b.runs}</td>
              <td className="px-4 py-3 text-center">{b.balls}</td>
              <td className="px-4 py-3 text-center">{b.fours}</td>
              <td className="px-4 py-3 text-center">{b.sixes}</td>
              <td className="px-4 py-3 text-center">{b.strikeRate.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
