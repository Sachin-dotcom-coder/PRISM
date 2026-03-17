type Bowler = {
  bowler: string;
  overs: number;
  maidens: number;
  runs: number;
  wickets: number;
  economyRates: string;
};

export default function BowlingTable({ bowlers }: { bowlers: Bowler[] }) {
  return (
    <div className="overflow-x-auto w-full mt-4 glass rounded-xl border border-zinc-800">
      <table className="w-full text-sm text-left">
        <thead className="bg-zinc-900/50 text-zinc-500 font-semibold uppercase tracking-widest text-xs border-b border-zinc-800">
          <tr>
            <th scope="col" className="px-6 py-4">Bowler</th>
            <th scope="col" className="px-4 py-4 text-center">O</th>
            <th scope="col" className="px-4 py-4 text-center">M</th>
            <th scope="col" className="px-4 py-4 text-center">R</th>
            <th scope="col" className="px-4 py-4 text-center">W</th>
            <th scope="col" className="px-4 py-4 text-center">ECON</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
          {bowlers.map((b, i) => (
            <tr key={i} className="hover:bg-zinc-900/30 transition-colors">
              <td className="px-6 py-3 font-semibold text-accent">{b.bowler}</td>
              <td className="px-4 py-3 text-center">{b.overs}</td>
              <td className="px-4 py-3 text-center">{b.maidens}</td>
              <td className="px-4 py-3 text-center">{b.runs}</td>
              <td className="px-4 py-3 text-center font-bold text-white">{b.wickets}</td>
              <td className="px-4 py-3 text-center">{b.economyRates}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
