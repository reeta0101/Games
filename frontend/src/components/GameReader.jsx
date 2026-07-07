import {
  stateCapitals,
  worldCapitals,
  periodicElements,
  owsData,
  countryCurrencies,
  indianPresidents,
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

export default function GameReader({ gameKey }) {
  if (gameKey === "alphabet") {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9">
        {Array.from({ length: 26 }, (_, i) => (
          <div key={i} className="rounded-xl border border-white/10 bg-black/20 p-3 text-center">
            <div className="text-xl font-black text-[#f0e040]">{String.fromCharCode(65 + i)}</div>
            <div className="mt-1 text-xs text-slate-500 font-mono">{i + 1}</div>
          </div>
        ))}
      </div>
    );
  }
  if (gameKey === "reverseAlphabet") {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9">
        {Array.from({ length: 26 }, (_, i) => (
          <div key={i} className="rounded-xl border border-white/10 bg-black/20 p-3 text-center">
            <div className="text-xl font-black text-[#e879f9]">{String.fromCharCode(65 + i)}</div>
            <div className="mt-1 text-xs text-slate-500 font-mono">{26 - i}</div>
          </div>
        ))}
      </div>
    );
  }
  if (gameKey === "square") {
    return (
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10">
        {Array.from({ length: 100 }, (_, i) => (
          <div key={i} className="rounded-xl border border-white/10 bg-black/20 p-2 text-center flex flex-col justify-center">
            <div className="text-[10px] sm:text-xs font-bold text-slate-400 mb-1">{i + 1}²</div>
            <div className="text-sm sm:text-lg font-black text-[#40e0f0]">{(i + 1) ** 2}</div>
          </div>
        ))}
      </div>
    );
  }
  if (gameKey === "cube") {
    return (
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-10">
        {Array.from({ length: 30 }, (_, i) => (
          <div key={i} className="rounded-xl border border-white/10 bg-black/20 p-3 text-center flex flex-col justify-center">
            <div className="text-[10px] sm:text-xs font-bold text-slate-400 mb-1">{i + 1}³</div>
            <div className="text-sm sm:text-xl font-black text-[#a78bfa]">{(i + 1) ** 3}</div>
          </div>
        ))}
      </div>
    );
  }
  if (gameKey === "multiplication") {
    return (
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 14 }, (_, i) => i + 2).map((table) => (
          <div key={table} className="rounded-xl border border-white/10 bg-black/20 p-4">
            <h3 className="mb-3 text-center text-sm uppercase tracking-widest font-black text-[#22d3ee]">Table of {table}</h3>
            <div className="space-y-1">
              {Array.from({ length: 10 }, (_, j) => j + 1).map((mult) => (
                <div key={mult} className="flex justify-between border-b border-white/5 pb-1 text-xs sm:text-sm text-slate-300">
                  <span>{table} × {mult}</span>
                  <span className="font-bold text-white">{table * mult}</span>
                </div>
              ))}
            </div>
          </div>
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
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
        {primes.map((p) => (
          <div key={p} className="flex items-center justify-center rounded-xl border border-white/10 bg-black/20 p-3 text-center text-lg font-black text-[#f97316]">
            {p}
          </div>
        ))}
      </div>
    );
  }
  if (gameKey === "roman") {
    return (
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10">
        {Array.from({ length: 100 }, (_, i) => (
          <div key={i} className="rounded-xl border border-white/10 bg-black/20 p-2 text-center flex flex-col justify-center">
            <div className="text-[10px] text-slate-500 mb-1">{i + 1}</div>
            <div className="text-sm font-bold text-[#84cc16]">{toRoman(i + 1)}</div>
          </div>
        ))}
      </div>
    );
  }
  if (gameKey === "stateCapital") {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stateCapitals.map((item, i) => (
          <div key={i} className="flex flex-col justify-center rounded-xl border border-white/10 bg-black/20 p-3">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">{item.state}</span>
            <span className="text-sm font-bold text-[#fb7185]">{item.capital}</span>
          </div>
        ))}
      </div>
    );
  }
  if (gameKey === "worldCapital") {
    return (
      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {worldCapitals.map((item, i) => (
          <div key={i} className="flex flex-col justify-center rounded-xl border border-white/10 bg-black/20 p-2">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 mb-1 truncate" title={item.country}>{item.country}</span>
            <span className="text-xs font-bold text-[#34d399] truncate" title={item.capital}>{item.capital}</span>
          </div>
        ))}
      </div>
    );
  }
  if (gameKey === "countryCurrency") {
    return (
      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {countryCurrencies.map((item, i) => (
          <div key={i} className="flex flex-col justify-center rounded-xl border border-white/10 bg-black/20 p-2">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 mb-1 truncate" title={item.country}>{item.country}</span>
            <span className="text-xs font-bold text-[#2dd4bf] truncate" title={item.currency}>{item.currency}</span>
          </div>
        ))}
      </div>
    );
  }
  if (gameKey === "periodicTable" || gameKey === "elementSymbol") {
    return (
      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {periodicElements.map((item, i) => (
          <div key={i} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 p-3">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded bg-white/10 text-sm font-black text-[#f59e0b]">
                {item.symbol}
              </span>
              <span className="text-xs font-bold text-slate-200">{item.name}</span>
            </div>
            <div className="text-right text-[10px] font-mono text-slate-400 leading-tight">
              Z: {item.atomicNumber} <br /> W: {item.atomicWeight}
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (gameKey === "oneWordSub") {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {owsData.map((item, i) => (
          <div key={i} className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="text-sm font-black text-[#c084fc] mb-2">{item.word}</div>
            <div className="text-xs leading-5 text-slate-300">{item.phrase}</div>
          </div>
        ))}
      </div>
    );
  }
  if (gameKey === "indianPresident") {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {indianPresidents.map((item, i) => (
          <div key={i} className="rounded-xl border border-white/10 bg-black/20 p-4 flex flex-col justify-center">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{item.ordinal} President</span>
              <span className="text-[10px] font-mono text-slate-400">{item.term}</span>
            </div>
            <div className="text-sm font-black text-[#f97316]">{item.name}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-8 text-center text-slate-500 uppercase tracking-widest text-sm">
      Read view not available for this game.
    </div>
  );
}
