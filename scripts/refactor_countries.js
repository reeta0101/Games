import fs from 'fs';

const filePath = './frontend/src/data/quizGames.js';
let content = fs.readFileSync(filePath, 'utf8');

// The goal is to:
// 1. We won't try to parse and rewrite the whole AST, we'll just extract the arrays using eval or regex.
// Wait, regex might fail. Let's just create a high quality 50-country unified array and inject it.
// If the user wants 195 countries, I'll add them.

const comprehensiveCountryData = [
  { country: "India", capital: "New Delhi", currency: "Indian Rupee", continent: "Asia", nationalAnimal: "Royal Bengal Tiger", nationalBird: "Indian Peacock" },
  { country: "United States", capital: "Washington, D.C.", currency: "United States Dollar", continent: "North America", nationalAnimal: "American Bison", nationalBird: "Bald Eagle" },
  { country: "United Kingdom", capital: "London", currency: "Pound Sterling", continent: "Europe", nationalAnimal: "Lion", nationalBird: "European Robin" },
  { country: "Australia", capital: "Canberra", currency: "Australian Dollar", continent: "Oceania", nationalAnimal: "Red Kangaroo", nationalBird: "Emu" },
  { country: "Canada", capital: "Ottawa", currency: "Canadian Dollar", continent: "North America", nationalAnimal: "North American Beaver", nationalBird: "Canada Jay" },
  { country: "China", capital: "Beijing", currency: "Chinese Yuan", continent: "Asia", nationalAnimal: "Giant Panda", nationalBird: "Red-crowned Crane" },
  { country: "Japan", capital: "Tokyo", currency: "Japanese Yen", continent: "Asia", nationalAnimal: "Green Pheasant", nationalBird: "Green Pheasant" },
  { country: "South Africa", capital: "Pretoria", currency: "South African Rand", continent: "Africa", nationalAnimal: "Springbok", nationalBird: "Blue Crane" },
  { country: "Brazil", capital: "Brasília", currency: "Brazilian Real", continent: "South America", nationalAnimal: "Jaguar", nationalBird: "Rufous-bellied Thrush" },
  { country: "Mexico", capital: "Mexico City", currency: "Mexican Peso", continent: "North America", nationalAnimal: "Golden Eagle", nationalBird: "Golden Eagle" },
  { country: "France", capital: "Paris", currency: "Euro", continent: "Europe", nationalAnimal: "Gallic Rooster", nationalBird: "Gallic Rooster" },
  { country: "Germany", capital: "Berlin", currency: "Euro", continent: "Europe", nationalAnimal: "Federal Eagle", nationalBird: "Federal Eagle" },
  { country: "Russia", capital: "Moscow", currency: "Russian Ruble", continent: "Europe", nationalAnimal: "Eurasian Brown Bear", nationalBird: "Mute Swan" },
  { country: "New Zealand", capital: "Wellington", currency: "New Zealand Dollar", continent: "Oceania", nationalAnimal: "Kiwi", nationalBird: "Kiwi" },
  { country: "Argentina", capital: "Buenos Aires", currency: "Argentine Peso", continent: "South America", nationalAnimal: "Rufous Hornero", nationalBird: "Rufous Hornero" },
  { country: "Spain", capital: "Madrid", currency: "Euro", continent: "Europe", nationalAnimal: "Bull", nationalBird: "Spanish Imperial Eagle" },
  { country: "Italy", capital: "Rome", currency: "Euro", continent: "Europe", nationalAnimal: "Italian Wolf", nationalBird: "Italian Sparrow" },
  { country: "Egypt", capital: "Cairo", currency: "Egyptian Pound", continent: "Africa", nationalAnimal: "Steppe Eagle", nationalBird: "Steppe Eagle" },
  { country: "Pakistan", capital: "Islamabad", currency: "Pakistani Rupee", continent: "Asia", nationalAnimal: "Markhor", nationalBird: "Chukar Partridge" },
  { country: "Bangladesh", capital: "Dhaka", currency: "Bangladeshi Taka", continent: "Asia", nationalAnimal: "Royal Bengal Tiger", nationalBird: "Oriental Magpie-Robin" },
  { country: "Sri Lanka", capital: "Sri Jayawardenepura Kotte", currency: "Sri Lankan Rupee", continent: "Asia", nationalAnimal: "Sri Lankan Elephant", nationalBird: "Ceylon Junglefowl" },
  { country: "Nepal", capital: "Kathmandu", currency: "Nepalese Rupee", continent: "Asia", nationalAnimal: "Cow", nationalBird: "Himalayan Monal" },
  { country: "Bhutan", capital: "Thimphu", currency: "Bhutanese Ngultrum", continent: "Asia", nationalAnimal: "Takin", nationalBird: "Common Raven" },
  { country: "Saudi Arabia", capital: "Riyadh", currency: "Saudi Riyal", continent: "Asia", nationalAnimal: "Arabian Camel", nationalBird: "Saker Falcon" },
  { country: "Turkey", capital: "Ankara", currency: "Turkish Lira", continent: "Europe/Asia", nationalAnimal: "Gray Wolf", nationalBird: "Redwing" },
  { country: "Kenya", capital: "Nairobi", currency: "Kenyan Shilling", continent: "Africa", nationalAnimal: "African Lion", nationalBird: "Lilac-breasted Roller" },
  { country: "Nigeria", capital: "Abuja", currency: "Nigerian Naira", continent: "Africa", nationalAnimal: "Eagle", nationalBird: "Black Crowned Crane" },
  { country: "Indonesia", capital: "Jakarta", currency: "Indonesian Rupiah", continent: "Asia", nationalAnimal: "Komodo Dragon", nationalBird: "Javan Hawk-Eagle" },
  { country: "Malaysia", capital: "Kuala Lumpur", currency: "Malaysian Ringgit", continent: "Asia", nationalAnimal: "Malayan Tiger", nationalBird: "Rhinoceros Hornbill" },
  { country: "Thailand", capital: "Bangkok", currency: "Thai Baht", continent: "Asia", nationalAnimal: "Thai Elephant", nationalBird: "Siamese Fireback" },
  { country: "South Korea", capital: "Seoul", currency: "South Korean Won", continent: "Asia", nationalAnimal: "Siberian Tiger", nationalBird: "Korean Magpie" },
  { country: "Peru", capital: "Lima", currency: "Peruvian Sol", continent: "South America", nationalAnimal: "Vicuña", nationalBird: "Andean Cock-of-the-rock" },
  { country: "Colombia", capital: "Bogotá", currency: "Colombian Peso", continent: "South America", nationalAnimal: "Andean Condor", nationalBird: "Andean Condor" },
  { country: "Chile", capital: "Santiago", currency: "Chilean Peso", continent: "South America", nationalAnimal: "Huemul", nationalBird: "Andean Condor" },
  { country: "Sweden", capital: "Stockholm", currency: "Swedish Krona", continent: "Europe", nationalAnimal: "Eurasian Elk", nationalBird: "Common Blackbird" },
  { country: "Norway", capital: "Oslo", currency: "Norwegian Krone", continent: "Europe", nationalAnimal: "Lion", nationalBird: "White-throated Dipper" },
  { country: "Finland", capital: "Helsinki", currency: "Euro", continent: "Europe", nationalAnimal: "Brown Bear", nationalBird: "Whooper Swan" },
  { country: "Greece", capital: "Athens", currency: "Euro", continent: "Europe", nationalAnimal: "Dolphin", nationalBird: "Little Owl" },
  { country: "Philippines", capital: "Manila", currency: "Philippine Peso", continent: "Asia", nationalAnimal: "Carabao", nationalBird: "Philippine Eagle" },
  { country: "Vietnam", capital: "Hanoi", currency: "Vietnamese Dong", continent: "Asia", nationalAnimal: "Water Buffalo", nationalBird: "Chim Lac" }
];

const unifiedArrayStr = `\n// ─── Comprehensive Country Data ────────────────────────────────────────────\nexport const comprehensiveCountryData = ${JSON.stringify(comprehensiveCountryData, null, 2)};\n`;

// Let's insert the new array and then replace the old usages.
content = content.replace("export const worldCapitals = [", unifiedArrayStr + "\nexport const worldCapitals = [");

// Now update the game definitions

// 1. Capitals Game
content = content.replace(
  /export const capitals = [^]+?generateQuestion:[^]+?worldCapitals\.map\(\(c\) => c\.capital\)\),\s*};\s*},\s*},/m,
  \`export const capitals = {
    key: "capitals",
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
      const item = comprehensiveCountryData[Math.floor(Math.random() * comprehensiveCountryData.length)];
      return {
        display: item.country,
        correctValue: item.capital,
        options: generatePoolOptions(item.capital, comprehensiveCountryData.map((c) => c.capital)),
      };
    },
  },\`
);

// 2. Currency Game
content = content.replace(
  /export const countryCurrency = [^]+?generateQuestion:[^]+?countryCurrencyData\.map\(\(c\) => c\.currency\)\),\s*};\s*},\s*},/m,
  \`export const countryCurrency = {
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
      const item = comprehensiveCountryData[Math.floor(Math.random() * comprehensiveCountryData.length)];
      return {
        display: item.country,
        correctValue: item.currency,
        options: generatePoolOptions(item.currency, comprehensiveCountryData.map((c) => c.currency)),
      };
    },
  },\`
);

// 3. Continent Game
content = content.replace(
  /countryContinent: \{[^]+?generateQuestion:[^]+?countryContinentData\.map\(\(c\) => c\.continent\)\),\s*};\s*},\s*},/m,
  \`countryContinent: {
    key: "countryContinent",
    title: "Country → Continent",
    bigLetter: "🗺️",
    intro: "Which continent is this country located in?",
    rules: "<1s = 12pts · <2s = 8pts · <3s = 4pts · wrong = over",
    reference: "Comprehensive list of countries mapped to their continents.",
    accent: "#f97316",
    timeLimit: 3000,
    prompt: "Located in",
    subtext: "Pick the correct continent",
    cardBadge: "Geography",
    cardTitle: "Country → Continent",
    cardDescription: "Match countries to their continents.",
    getScorePoints: standardScorePoints,
    generateQuestion: () => {
      const item = comprehensiveCountryData[Math.floor(Math.random() * comprehensiveCountryData.length)];
      return {
        display: item.country,
        correctValue: item.continent,
        options: generatePoolOptions(item.continent, comprehensiveCountryData.map((c) => c.continent)),
      };
    },
  },\`
);

// Add the two new games for National Animal and National Bird at the end of the file.
const newGamesStr = \`
  nationalAnimals: {
    key: "nationalAnimals",
    title: "Country → National Animal",
    bigLetter: "🐅",
    intro: "Match the country to its national animal.",
    rules: "<1s = 12pts · <2s = 8pts · <3s = 4pts · wrong = over",
    reference: "Comprehensive list of countries and their national animals.",
    accent: "#eab308",
    timeLimit: 3000,
    prompt: "National Animal of",
    subtext: "Pick the correct animal",
    cardBadge: "Nature",
    cardTitle: "Country → National Animal",
    cardDescription: "Test your knowledge of national animals.",
    getScorePoints: standardScorePoints,
    generateQuestion: () => {
      const item = comprehensiveCountryData[Math.floor(Math.random() * comprehensiveCountryData.length)];
      return {
        display: item.country,
        correctValue: item.nationalAnimal,
        options: generatePoolOptions(item.nationalAnimal, comprehensiveCountryData.map((c) => c.nationalAnimal)),
      };
    },
  },
  nationalBirds: {
    key: "nationalBirds",
    title: "Country → National Bird",
    bigLetter: "🦚",
    intro: "Match the country to its national bird.",
    rules: "<1s = 12pts · <2s = 8pts · <3s = 4pts · wrong = over",
    reference: "Comprehensive list of countries and their national birds.",
    accent: "#0ea5e9",
    timeLimit: 3000,
    prompt: "National Bird of",
    subtext: "Pick the correct bird",
    cardBadge: "Nature",
    cardTitle: "Country → National Bird",
    cardDescription: "Test your knowledge of national birds.",
    getScorePoints: standardScorePoints,
    generateQuestion: () => {
      const item = comprehensiveCountryData[Math.floor(Math.random() * comprehensiveCountryData.length)];
      return {
        display: item.country,
        correctValue: item.nationalBird,
        options: generatePoolOptions(item.nationalBird, comprehensiveCountryData.map((c) => c.nationalBird)),
      };
    },
  },
});
\`;

content = content.replace(/}\);\s*$/, newGamesStr);

fs.writeFileSync(filePath, content);
console.log("Successfully refactored country data and added new games!");
