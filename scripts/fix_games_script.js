const fs = require('fs');
const file = 'frontend/src/data/quizGames.js';
let content = fs.readFileSync(file, 'utf8');

// Replace worldCapitals game. The old one starts at "capitals: {" or "worldCapitals: {" ?
// Oh wait, my old regex looked for worldCapitals: {
// Let me just find it and replace it.

const worldCapitalsReplacement = `worldCapitals: {
    key: "worldCapitals",
    title: "Country → Capital",
    bigLetter: "🏛️",
    intro: "Match the country to its capital city.",
    rules: "<1s = 12pts · <2s = 8pts · <3s = 4pts · wrong = over",
    reference: "Comprehensive list of countries and their capital cities.",
    accent: "#ef4444",
    timeLimit: 3000,
    prompt: "Capital of",
    subtext: "Pick the correct capital",
    cardBadge: "Geography",
    cardTitle: "Country → Capital",
    cardDescription: "Test your knowledge of world capitals.",
    getScorePoints: standardScorePoints,
    generateQuestion: () => {
      const item = countries[Math.floor(Math.random() * countries.length)];
      return {
        display: item.country,
        correctValue: item.capital,
        options: generateWorldCapitalOptions(item.capital),
      };
    },
  },`;

const countryCurrencyReplacement = `countryCurrency: {
    key: "countryCurrency",
    title: "Country → Currency",
    bigLetter: "💵",
    intro: "Match the country to its official currency.",
    rules: "<1s = 12pts · <2s = 8pts · <3s = 4pts · wrong = over",
    reference: "Comprehensive list of countries and their currencies.",
    accent: "#10b981",
    timeLimit: 3000,
    prompt: "Currency of",
    subtext: "Pick the correct currency",
    cardBadge: "Finance",
    cardTitle: "Country → Currency",
    cardDescription: "Match nations with their currencies.",
    getScorePoints: standardScorePoints,
    generateQuestion: () => {
      const item = countries[Math.floor(Math.random() * countries.length)];
      return {
        display: item.country,
        correctValue: item.currency,
        options: generatePoolOptions(item.currency, countries.map((c) => c.currency)),
      };
    },
  },`;

// The old regex failed because of `const question = `. Let's use a regex that matches from `gameKey: {` to the next `  },`
content = content.replace(/worldCapitals:\s*\{[\s\S]*?generateQuestion:\s*\(\)\s*=>\s*\{[\s\S]*?\}\s*,\s*\n\s*\},\n/m, worldCapitalsReplacement + '\n');
content = content.replace(/countryCurrency:\s*\{[\s\S]*?generateQuestion:\s*\(\)\s*=>\s*\{[\s\S]*?\}\s*,\s*\n\s*\},\n/m, countryCurrencyReplacement + '\n');

// Also wait, I might need to make sure the regex works.
// Let's just output the matches to see if it works.
fs.writeFileSync('fix_games.js', content);
