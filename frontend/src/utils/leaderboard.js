// Leaderboard utility — stores scores in localStorage, auto-cleans entries > 7 days

const STORAGE_KEY = 'arcade_leaderboard';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function getLeaderboard() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const cutoff = Date.now() - MAX_AGE_MS;
    return data.filter((e) => e.timestamp > cutoff);
  } catch {
    return [];
  }
}

export function saveScore({ name, score, mode, difficulty, questions }) {
  const lb = getLeaderboard();
  lb.push({
    name,
    score,
    mode,
    difficulty,
    questions,
    timestamp: Date.now(),
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lb));
}

export function clearLeaderboard() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getTimeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export const MODE_LABELS = {
  alphabet: 'Alpha',
  square: 'Square',
  periodicTable: 'Periodic',
  stateCapital: 'States',
  worldCapital: 'World',
};

export const DIFF_LABELS = {
  beginner: 'BEG',
  intermediate: 'INT',
  advanced: 'ADV',
};

export const DIFFICULTIES = {
  beginner:     { label: 'Beginner',     timeMs: 9000, icon: '🌱' },
  intermediate: { label: 'Intermediate', timeMs: 6000, icon: '⚡' },
  advanced:     { label: 'Advanced',     timeMs: 3000, icon: '🔥' },
};
