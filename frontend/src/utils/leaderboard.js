// Leaderboard utility — stores scores in localStorage, auto-cleans entries > 7 days

const STORAGE_KEY = 'arcade_leaderboard';
const HIGH_SCORES_KEY = 'arcade_high_scores';
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

export function getUserHighScores(name) {
  try {
    const all = JSON.parse(localStorage.getItem(HIGH_SCORES_KEY) || '{}');
    return all[name] || {};
  } catch {
    return {};
  }
}

function updateUserHighScore(name, mode, difficulty, score) {
  try {
    const all = JSON.parse(localStorage.getItem(HIGH_SCORES_KEY) || '{}');
    if (!all[name]) all[name] = {};
    const key = `${mode}__${difficulty}`;
    if (!all[name][key] || score > all[name][key]) {
      all[name][key] = score;
      localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(all));
    }
  } catch { /* ignore */ }
}

export function saveScore({ name, score, mode, difficulty, questions }) {
  // Update per-user high score
  updateUserHighScore(name, mode, difficulty, score);

  const lb = getLeaderboard();
  lb.push({ name, score, mode, difficulty, questions, timestamp: Date.now() });

  // Keep top 20 per mode+difficulty (best score per player, then top 20 overall)
  const grouped = {};
  for (const entry of lb) {
    const key = `${entry.mode}__${entry.difficulty}`;
    if (!grouped[key]) grouped[key] = {};
    const prev = grouped[key][entry.name];
    if (!prev || entry.score > prev.score) grouped[key][entry.name] = entry;
  }
  const pruned = [];
  for (const key of Object.keys(grouped)) {
    const top20 = Object.values(grouped[key])
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);
    pruned.push(...top20);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pruned));
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
  cube: 'Cube',
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
