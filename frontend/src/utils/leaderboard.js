// Leaderboard utility — fetches from and saves to the MongoDB backend

const API_BASE = '/api/score';

export async function getLeaderboard(mode, difficulty, limit = 20) {
  try {
    const res = await fetch(`${API_BASE}/leaderboard/${mode}/${difficulty}?limit=${limit}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch leaderboard');
    const data = await res.json();
    return data.scores || [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function getUserHighScores(name) {
  try {
    const res = await fetch(`${API_BASE}/personal/${name}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch high scores');
    const data = await res.json();
    return data.highScores || {};
  } catch (err) {
    console.error(err);
    return {};
  }
}

export async function saveScore({ name, score, mode, difficulty, questions }) {
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, score, mode, difficulty, questions }),
    });
    if (!res.ok) throw new Error('Failed to save score');
    return await res.json();
  } catch (err) {
    console.error(err);
  }
}

export function getTimeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime();
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
  periodicTable: 'Element',
  stateCapital: 'States',
  worldCapital: 'World',
  multiplication: 'Multiply',
  reverseAlphabet: 'Rev Alpha',
  prime: 'Prime',
  roman: 'Roman',
  countryCurrency: 'Currency',
  elementSymbol: 'Symbol',
  oneWordSub: 'OWS',
  indianPresident: 'IND Pres',
  indianVicePresident: 'IND VP',
  nationalOfficials: 'Nat Off',
  stateOfficials: 'State CM',
  diseaseCause: 'Disease',
  animalKingdom: 'Animals',
  siUnits: 'SI Units',
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
