import {
  stateCapitals,
  periodicElements,
  owsData,
  indianPresidents,
  indianVicePresidents,
  riverOriginData,
  nationalParksData,
  landmarkData,
  vitaminDeficiencyData,
  indianNationalData,
  famousBattlesData,
  countries,
} from "../data/quizGames";

// Helper for prime
function isPrime(value) {
  if (value < 2) return false;
  if (value === 2) return true;
  if (value % 2 === 0) return false;
  for (let d = 3; d <= Math.sqrt(value); d += 2) {
    if (value % d === 0) return false;
  }
  return true;
}

// Helper for roman
function toRoman(value) {
  const values = [100, 90, 50, 40, 10, 9, 5, 4, 1];
  const symbols = ["C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"];
  let remaining = value;
  let result = "";
  for (let i = 0; i < values.length; i++) {
    while (remaining >= values[i]) {
      result += symbols[i];
      remaining -= values[i];
    }
  }
  return result;
}

const TableWrapper = ({ columns, children }) => (
  <div className="w-full overflow-x-auto rounded-xl border border-white/10 bg-black/20 shadow-lg">
    <table className="w-full text-left text-sm text-slate-300">
      <thead className="bg-white/5 text-[10px] sm:text-xs uppercase tracking-widest text-slate-400">
        <tr>
          {columns.map((col, i) => (
            <th key={i} className="px-4 py-3 font-bold">
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-white/5">{children}</tbody>
    </table>
  </div>
);

export default function TestGameReader({ gameKey, customData }) {
  // If custom JSON data is provided for testing
  if (customData) {
    return (
      <TableWrapper columns={["Question", "Correct Answer"]}>
        {customData.map((item, i) => {
          const correctOpt = item.options.find((o) => o.id === item.correctOptionId);
          return (
            <tr key={i} className="transition hover:bg-white/5">
              <td className="px-4 py-3 text-sm text-slate-300 w-2/3 align-top">
                {item.question}
              </td>
              <td className="px-4 py-3 text-sm font-bold text-[#40e0f0] w-1/3">
                {correctOpt ? correctOpt.text : ""}
              </td>
            </tr>
          );
        })}
      </TableWrapper>
    );
  }

  if (gameKey === "alphabet") {
    return (
      <TableWrapper columns={["Letter", "Position"]}>
        {Array.from({ length: 26 }, (_, i) => (
          <tr key={i} className="transition hover:bg-white/5">
            <td className="px-4 py-2.5 text-lg font-black text-[#f0e040] w-1/2">
              {String.fromCharCode(65 + i)}
            </td>
            <td className="px-4 py-2.5 font-mono text-slate-400 w-1/2">
              {i + 1}
            </td>
          </tr>
        ))}
      </TableWrapper>
    );
  }

  if (gameKey === "reverseAlphabet") {
    return (
      <TableWrapper columns={["Letter", "Reverse Position"]}>
        {Array.from({ length: 26 }, (_, i) => (
          <tr key={i} className="transition hover:bg-white/5">
            <td className="px-4 py-2.5 text-lg font-black text-[#e879f9] w-1/2">
              {String.fromCharCode(65 + i)}
            </td>
            <td className="px-4 py-2.5 font-mono text-slate-400 w-1/2">
              {26 - i}
            </td>
          </tr>
        ))}
      </TableWrapper>
    );
  }

  if (gameKey === "square") {
    return (
      <TableWrapper columns={["Number", "Square (X²)"]}>
        {Array.from({ length: 100 }, (_, i) => (
          <tr key={i} className="transition hover:bg-white/5">
            <td className="px-4 py-2 font-mono text-slate-400 w-1/2">
              {i + 1}
            </td>
            <td className="px-4 py-2 text-base font-black text-[#40e0f0] w-1/2">
              {(i + 1) ** 2}
            </td>
          </tr>
        ))}
      </TableWrapper>
    );
  }

  if (gameKey === "cube") {
    return (
      <TableWrapper columns={["Number", "Cube (X³)"]}>
        {Array.from({ length: 30 }, (_, i) => (
          <tr key={i} className="transition hover:bg-white/5">
            <td className="px-4 py-2.5 font-mono text-slate-400 w-1/2">
              {i + 1}
            </td>
            <td className="px-4 py-2.5 text-base font-black text-[#a78bfa] w-1/2">
              {(i + 1) ** 3}
            </td>
          </tr>
        ))}
      </TableWrapper>
    );
  }

  if (gameKey === "multiplication") {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 14 }, (_, i) => i + 2).map((table) => (
          <TableWrapper key={table} columns={[`Table of ${table}`, "Result"]}>
            {Array.from({ length: 10 }, (_, j) => j + 1).map((mult) => (
              <tr key={mult} className="transition hover:bg-white/5">
                <td className="px-4 py-2 font-mono text-slate-400 w-1/2">
                  {table} × {mult}
                </td>
                <td className="px-4 py-2 text-base font-bold text-[#22d3ee] w-1/2">
                  {table * mult}
                </td>
              </tr>
            ))}
          </TableWrapper>
        ))}
      </div>
    );
  }

  if (gameKey === "prime") {
    const primes = [];
    for (let i = 2; i <= 100; i++) {
      if (isPrime(i)) primes.push(i);
    }
    return (
      <TableWrapper columns={["#", "Prime Number"]}>
        {primes.map((p, index) => (
          <tr key={p} className="transition hover:bg-white/5">
            <td className="px-4 py-2.5 font-mono text-slate-500 w-1/3">
              {index + 1}
            </td>
            <td className="px-4 py-2.5 text-base font-black text-[#f97316] w-2/3">
              {p}
            </td>
          </tr>
        ))}
      </TableWrapper>
    );
  }

  if (gameKey === "roman") {
    return (
      <TableWrapper columns={["Number", "Roman Numeral"]}>
        {Array.from({ length: 100 }, (_, i) => (
          <tr key={i} className="transition hover:bg-white/5">
            <td className="px-4 py-2 font-mono text-slate-400 w-1/2">
              {i + 1}
            </td>
            <td className="px-4 py-2 text-base font-bold text-[#84cc16] w-1/2">
              {toRoman(i + 1)}
            </td>
          </tr>
        ))}
      </TableWrapper>
    );
  }

  if (gameKey === "stateCapital") {
    return (
      <TableWrapper columns={["Indian State", "Capital City"]}>
        {stateCapitals.map((item, i) => (
          <tr key={i} className="transition hover:bg-white/5">
            <td className="px-4 py-3 font-medium text-slate-200 w-1/2">
              {item.state}
            </td>
            <td className="px-4 py-3 text-sm font-bold text-[#fb7185] w-1/2">
              {item.capital}
            </td>
          </tr>
        ))}
      </TableWrapper>
    );
  }

  if (gameKey === "worldCapitals") {
    return (
      <TableWrapper columns={["Country", "Capital City"]}>
        {countries.map((item, i) => (
          <tr key={i} className="transition hover:bg-white/5">
            <td className="px-4 py-2.5 font-medium text-slate-200 w-1/2">
              {item.country}
            </td>
            <td className="px-4 py-2.5 text-sm font-bold text-[#34d399] w-1/2">
              {item.capital}
            </td>
          </tr>
        ))}
      </TableWrapper>
    );
  }

  if (gameKey === "countryCurrency") {
    return (
      <TableWrapper columns={["Country", "Currency"]}>
        {countries.map((item, i) => (
          <tr key={i} className="transition hover:bg-white/5">
            <td className="px-4 py-2.5 font-medium text-slate-200 w-1/2">
              {item.country}
            </td>
            <td className="px-4 py-2.5 text-sm font-bold text-[#2dd4bf] w-1/2">
              {item.currency}
            </td>
          </tr>
        ))}
      </TableWrapper>
    );
  }

  if (gameKey === "periodicTable" || gameKey === "elementSymbol") {
    return (
      <TableWrapper columns={["Z", "Symbol", "Element Name", "Weight"]}>
        {periodicElements.map((item, i) => (
          <tr key={i} className="transition hover:bg-white/5">
            <td className="px-4 py-2.5 font-mono text-slate-400">
              {item.atomicNumber}
            </td>
            <td className="px-4 py-2.5 text-base font-black text-[#f59e0b]">
              {item.symbol}
            </td>
            <td className="px-4 py-2.5 font-bold text-slate-200">
              {item.name}
            </td>
            <td className="px-4 py-2.5 font-mono text-slate-400">
              {item.atomicWeight}
            </td>
          </tr>
        ))}
      </TableWrapper>
    );
  }

  if (gameKey === "oneWordSub") {
    return (
      <TableWrapper columns={["One Word", "Phrase"]}>
        {owsData.map((item, i) => (
          <tr key={i} className="transition hover:bg-white/5">
            <td className="px-4 py-3 text-base font-black text-[#c084fc] w-1/3 align-top">
              {item.word}
            </td>
            <td className="px-4 py-3 text-sm leading-6 text-slate-300 w-2/3">
              {item.phrase}
            </td>
          </tr>
        ))}
      </TableWrapper>
    );
  }

  if (gameKey === "indianPresident") {
    return (
      <TableWrapper columns={["Order", "President Name", "Term"]}>
        {indianPresidents.map((item, i) => (
          <tr key={i} className="transition hover:bg-white/5">
            <td className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
              {item.ordinal}
            </td>
            <td className="px-4 py-3 text-sm font-black text-[#f97316]">
              {item.name}
            </td>
            <td className="px-4 py-3 font-mono text-xs text-slate-400">
              {item.term}
            </td>
          </tr>
        ))}
      </TableWrapper>
    );
  }

  if (gameKey === "indianVicePresident") {
    return (
      <TableWrapper columns={["Order", "Vice President Name", "Term"]}>
        {indianVicePresidents.map((item, i) => (
          <tr key={i} className="transition hover:bg-white/5">
            <td className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
              {item.ordinal}
            </td>
            <td className="px-4 py-3 text-sm font-black text-[#fb7185]">
              {item.name}
            </td>
            <td className="px-4 py-3 font-mono text-xs text-slate-400">
              {item.term}
            </td>
          </tr>
        ))}
      </TableWrapper>
    );
  }

  if (gameKey === "riverOrigin") {
    return (
      <TableWrapper columns={["River", "Origin / Source"]}>
        {riverOriginData.map((item, i) => (
          <tr key={i} className="transition hover:bg-white/5">
            <td className="px-4 py-3 text-sm font-black text-[#38bdf8] w-1/3 align-top">
              {item.river}
            </td>
            <td className="px-4 py-3 text-sm leading-6 text-slate-300 w-2/3">
              {item.origin}
            </td>
          </tr>
        ))}
      </TableWrapper>
    );
  }

  if (gameKey === "nationalPark") {
    return (
      <TableWrapper columns={["National Park", "State"]}>
        {nationalParksData.map((item, i) => (
          <tr key={i} className="transition hover:bg-white/5">
            <td className="px-4 py-3 text-sm font-black text-[#4ade80] w-2/3 align-top">
              {item.park}
            </td>
            <td className="px-4 py-3 text-sm text-slate-300 w-1/3">
              {item.state}
            </td>
          </tr>
        ))}
      </TableWrapper>
    );
  }

  if (gameKey === "landmarkCountry") {
    return (
      <TableWrapper columns={["Landmark", "Country"]}>
        {landmarkData.map((item, i) => (
          <tr key={i} className="transition hover:bg-white/5">
            <td className="px-4 py-3 text-sm font-black text-[#f472b6] w-2/3 align-top">
              {item.landmark}
            </td>
            <td className="px-4 py-3 text-sm text-slate-300 w-1/3">
              {item.country}
            </td>
          </tr>
        ))}
      </TableWrapper>
    );
  }

  if (gameKey === "vitaminDeficiency") {
    return (
      <TableWrapper columns={["Vitamin", "Deficiency Disease"]}>
        {vitaminDeficiencyData.map((item, i) => (
          <tr key={i} className="transition hover:bg-white/5">
            <td className="px-4 py-3 text-sm font-black text-[#fb923c] w-1/3 align-top">
              {item.vitamin}
            </td>
            <td className="px-4 py-3 text-sm leading-6 text-slate-300 w-2/3">
              {item.deficiency}
            </td>
          </tr>
        ))}
      </TableWrapper>
    );
  }

  if (gameKey === "indianNational") {
    return (
      <TableWrapper columns={["Symbol Category", "Official Name"]}>
        {indianNationalData.map((item, i) => (
          <tr key={i} className="transition hover:bg-white/5">
            <td className="px-4 py-3 text-sm font-black text-[#f97316] w-1/3 align-top">
              {item.symbol}
            </td>
            <td className="px-4 py-3 text-sm leading-6 text-slate-300 w-2/3">
              {item.name}
            </td>
          </tr>
        ))}
      </TableWrapper>
    );
  }

  if (gameKey === "famousBattles") {
    return (
      <TableWrapper columns={["Battle", "Year"]}>
        {famousBattlesData.map((item, i) => (
          <tr key={i} className="transition hover:bg-white/5">
            <td className="px-4 py-3 text-sm font-black text-[#dc2626] w-2/3 align-top">
              {item.battle}
            </td>
            <td className="px-4 py-3 font-mono text-sm text-slate-300 w-1/3">
              {item.year}
            </td>
          </tr>
        ))}
      </TableWrapper>
    );
  }

  return (
    <div className="p-8 text-center text-slate-500 uppercase tracking-widest text-sm">
      Read view not available for this game.
    </div>
  );
}
