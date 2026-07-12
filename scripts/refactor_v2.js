const fs = require('fs');

const file = 'frontend/src/data/quizGames.js';
let content = fs.readFileSync(file, 'utf8');

const countriesData = fs.readFileSync('C:\\Users\\dell\\.gemini\\antigravity\\brain\\29b63a56-537b-4751-8a2c-ccff8a1d8a02\\scratch\\countries.js', 'utf8');

// 1. Delete the old arrays
content = content.replace(/export const worldCapitals = \[[^]*?\];\n*/g, '');
content = content.replace(/export const countryCurrencies = \[[^]*?\];\n*/g, '');
content = content.replace(/export const countryContinentData = \[[^]*?\];\n*/g, '');

// 2. Insert the new countries array at the beginning
content = content.replace('export const stateCapitals = [', countriesData + '\nexport const stateCapitals = [');

// 3. Replace generateWorldCapitalOptions function
const oldCapitalFunc = /function generateWorldCapitalOptions\([^]*?return shuffleArray\(\[\.\.\.options\]\);\n}/m;
const newCapitalFunc = 
"function generateWorldCapitalOptions(correctCapital) {\n" +
"  const options = new Set([correctCapital]);\n" +
"  const capitals = shuffleArray(countries.map((item) => item.capital));\n\n" +
"  for (const capital of capitals) {\n" +
"    if (options.size >= 4) break;\n" +
"    options.add(capital);\n" +
"  }\n\n" +
"  return shuffleArray([...options]);\n" +
"}";
content = content.replace(oldCapitalFunc, newCapitalFunc);

// 4. Replace worldCapitals game
const oldCapitalsGame = /worldCapitals: \{[^]*?const item = worldCapitals\[Math\.floor\(Math\.random\(\) \* worldCapitals\.length\)\];[^]*?\},/m;
const newCapitalsGame = 
"worldCapitals: {\n" +
"    key: \"worldCapitals\",\n" +
"    title: \"Country → Capital\",\n" +
"    bigLetter: \"🏛️\",\n" +
"    intro: \"Match the country to its capital city.\",\n" +
"    rules: \"<1s = 12pts · <2s = 8pts · <3s = 4pts · wrong = over\",\n" +
"    reference: \"Comprehensive list of countries and their capital cities.\",\n" +
"    accent: \"#ef4444\",\n" +
"    timeLimit: 3000,\n" +
"    prompt: \"Capital of\",\n" +
"    subtext: \"Pick the correct capital\",\n" +
"    cardBadge: \"Geography\",\n" +
"    cardTitle: \"Country → Capital\",\n" +
"    cardDescription: \"Test your knowledge of world capitals.\",\n" +
"    getScorePoints: standardScorePoints,\n" +
"    generateQuestion: () => {\n" +
"      const item = countries[Math.floor(Math.random() * countries.length)];\n" +
"      return {\n" +
"        display: item.country,\n" +
"        correctValue: item.capital,\n" +
"        options: generateWorldCapitalOptions(item.capital),\n" +
"      };\n" +
"    },\n" +
"  },";
content = content.replace(oldCapitalsGame, newCapitalsGame);

// 5. Replace countryCurrency game
const oldCurrencyGame = /countryCurrency: \{[^]*?const item = countryCurrencies\[Math\.floor\(Math\.random\(\) \* countryCurrencies\.length\)\];[^]*?\},/m;
const newCurrencyGame = 
"countryCurrency: {\n" +
"    key: \"countryCurrency\",\n" +
"    title: \"Country → Currency\",\n" +
"    bigLetter: \"💵\",\n" +
"    intro: \"Match the country to its official currency.\",\n" +
"    rules: \"<1s = 12pts · <2s = 8pts · <3s = 4pts · wrong = over\",\n" +
"    reference: \"Comprehensive list of countries and their currencies.\",\n" +
"    accent: \"#10b981\",\n" +
"    timeLimit: 3000,\n" +
"    prompt: \"Currency of\",\n" +
"    subtext: \"Pick the correct currency\",\n" +
"    cardBadge: \"Finance\",\n" +
"    cardTitle: \"Country → Currency\",\n" +
"    cardDescription: \"Match nations with their currencies.\",\n" +
"    getScorePoints: standardScorePoints,\n" +
"    generateQuestion: () => {\n" +
"      const item = countries[Math.floor(Math.random() * countries.length)];\n" +
"      return {\n" +
"        display: item.country,\n" +
"        correctValue: item.currency,\n" +
"        options: generatePoolOptions(item.currency, countries.map((c) => c.currency)),\n" +
"      };\n" +
"    },\n" +
"  },";
content = content.replace(oldCurrencyGame, newCurrencyGame);

// 6. Replace countryContinent game
const oldContinentGame = /countryContinent: \{[^]*?const item = countryContinentData\[Math\.floor\(Math\.random\(\) \* countryContinentData\.length\)\];[^]*?\},/m;
const newContinentGame = 
"countryContinent: {\n" +
"    key: \"countryContinent\",\n" +
"    title: \"Country → Continent\",\n" +
"    bigLetter: \"🗺️\",\n" +
"    intro: \"Which continent is this country located in?\",\n" +
"    rules: \"<1s = 12pts · <2s = 8pts · <3s = 4pts · wrong = over\",\n" +
"    reference: \"Comprehensive list of countries mapped to their continents.\",\n" +
"    accent: \"#f97316\",\n" +
"    timeLimit: 3000,\n" +
"    prompt: \"Located in\",\n" +
"    subtext: \"Pick the correct continent\",\n" +
"    cardBadge: \"Geography\",\n" +
"    cardTitle: \"Country → Continent\",\n" +
"    cardDescription: \"Match countries to their continents.\",\n" +
"    getScorePoints: standardScorePoints,\n" +
"    generateQuestion: () => {\n" +
"      const item = countries[Math.floor(Math.random() * countries.length)];\n" +
"      return {\n" +
"        display: item.country,\n" +
"        correctValue: item.continent,\n" +
"        options: generatePoolOptions(item.continent, countries.map((c) => c.continent)),\n" +
"      };\n" +
"    },\n" +
"  },";
content = content.replace(oldContinentGame, newContinentGame);

// 7. Add new games
const newGames = 
"  countryLanguages: {\n" +
"    key: \"countryLanguages\",\n" +
"    title: \"Country → Language\",\n" +
"    bigLetter: \"🗣️\",\n" +
"    intro: \"Match the country to its official language.\",\n" +
"    rules: \"<1s = 12pts · <2s = 8pts · <3s = 4pts · wrong = over\",\n" +
"    reference: \"Comprehensive list of countries and their official languages.\",\n" +
"    accent: \"#3b82f6\",\n" +
"    timeLimit: 3000,\n" +
"    prompt: \"Official Language of\",\n" +
"    subtext: \"Pick the correct language\",\n" +
"    cardBadge: \"Culture\",\n" +
"    cardTitle: \"Country → Language\",\n" +
"    cardDescription: \"Match countries to their official language.\",\n" +
"    getScorePoints: standardScorePoints,\n" +
"    generateQuestion: () => {\n" +
"      const item = countries[Math.floor(Math.random() * countries.length)];\n" +
"      const language = item.officialLanguages[Math.floor(Math.random() * item.officialLanguages.length)];\n" +
"      return {\n" +
"        display: item.country,\n" +
"        correctValue: language,\n" +
"        options: generatePoolOptions(language, countries.flatMap((c) => c.officialLanguages)),\n" +
"      };\n" +
"    },\n" +
"  },\n" +
"  nationalAnimals: {\n" +
"    key: \"nationalAnimals\",\n" +
"    title: \"Country → National Animal\",\n" +
"    bigLetter: \"🐅\",\n" +
"    intro: \"Match the country to its national animal.\",\n" +
"    rules: \"<1s = 12pts · <2s = 8pts · <3s = 4pts · wrong = over\",\n" +
"    reference: \"Comprehensive list of countries and their national animals.\",\n" +
"    accent: \"#eab308\",\n" +
"    timeLimit: 3000,\n" +
"    prompt: \"National Animal of\",\n" +
"    subtext: \"Pick the correct animal\",\n" +
"    cardBadge: \"Nature\",\n" +
"    cardTitle: \"Country → National Animal\",\n" +
"    cardDescription: \"Test your knowledge of national animals.\",\n" +
"    getScorePoints: standardScorePoints,\n" +
"    generateQuestion: () => {\n" +
"      const item = countries[Math.floor(Math.random() * countries.length)];\n" +
"      return {\n" +
"        display: item.country,\n" +
"        correctValue: item.nationalAnimal,\n" +
"        options: generatePoolOptions(item.nationalAnimal, countries.map((c) => c.nationalAnimal)),\n" +
"      };\n" +
"    },\n" +
"  },\n" +
"  nationalBirds: {\n" +
"    key: \"nationalBirds\",\n" +
"    title: \"Country → National Bird\",\n" +
"    bigLetter: \"🦚\",\n" +
"    intro: \"Match the country to its national bird.\",\n" +
"    rules: \"<1s = 12pts · <2s = 8pts · <3s = 4pts · wrong = over\",\n" +
"    reference: \"Comprehensive list of countries and their national birds.\",\n" +
"    accent: \"#0ea5e9\",\n" +
"    timeLimit: 3000,\n" +
"    prompt: \"National Bird of\",\n" +
"    subtext: \"Pick the correct bird\",\n" +
"    cardBadge: \"Nature\",\n" +
"    cardTitle: \"Country → National Bird\",\n" +
"    cardDescription: \"Test your knowledge of national birds.\",\n" +
"    getScorePoints: standardScorePoints,\n" +
"    generateQuestion: () => {\n" +
"      const item = countries[Math.floor(Math.random() * countries.length)];\n" +
"      return {\n" +
"        display: item.country,\n" +
"        correctValue: item.nationalBird,\n" +
"        options: generatePoolOptions(item.nationalBird, countries.map((c) => c.nationalBird)),\n" +
"      };\n" +
"    },\n" +
"  },\n" +
"  nationalFlowers: {\n" +
"    key: \"nationalFlowers\",\n" +
"    title: \"Country → National Flower\",\n" +
"    bigLetter: \"🌸\",\n" +
"    intro: \"Match the country to its national flower.\",\n" +
"    rules: \"<1s = 12pts · <2s = 8pts · <3s = 4pts · wrong = over\",\n" +
"    reference: \"Comprehensive list of countries and their national flowers.\",\n" +
"    accent: \"#ec4899\",\n" +
"    timeLimit: 3000,\n" +
"    prompt: \"National Flower of\",\n" +
"    subtext: \"Pick the correct flower\",\n" +
"    cardBadge: \"Nature\",\n" +
"    cardTitle: \"Country → National Flower\",\n" +
"    cardDescription: \"Test your knowledge of national flowers.\",\n" +
"    getScorePoints: standardScorePoints,\n" +
"    generateQuestion: () => {\n" +
"      const item = countries[Math.floor(Math.random() * countries.length)];\n" +
"      return {\n" +
"        display: item.country,\n" +
"        correctValue: item.nationalFlower,\n" +
"        options: generatePoolOptions(item.nationalFlower, countries.map((c) => c.nationalFlower)),\n" +
"      };\n" +
"    },\n" +
"  },\n" +
"  nationalTrees: {\n" +
"    key: \"nationalTrees\",\n" +
"    title: \"Country → National Tree\",\n" +
"    bigLetter: \"🌳\",\n" +
"    intro: \"Match the country to its national tree.\",\n" +
"    rules: \"<1s = 12pts · <2s = 8pts · <3s = 4pts · wrong = over\",\n" +
"    reference: \"Comprehensive list of countries and their national trees.\",\n" +
"    accent: \"#22c55e\",\n" +
"    timeLimit: 3000,\n" +
"    prompt: \"National Tree of\",\n" +
"    subtext: \"Pick the correct tree\",\n" +
"    cardBadge: \"Nature\",\n" +
"    cardTitle: \"Country → National Tree\",\n" +
"    cardDescription: \"Test your knowledge of national trees.\",\n" +
"    getScorePoints: standardScorePoints,\n" +
"    generateQuestion: () => {\n" +
"      const item = countries[Math.floor(Math.random() * countries.length)];\n" +
"      return {\n" +
"        display: item.country,\n" +
"        correctValue: item.nationalTree,\n" +
"        options: generatePoolOptions(item.nationalTree, countries.map((c) => c.nationalTree)),\n" +
"      };\n" +
"    },\n" +
"  },\n" +
"  nationalFruits: {\n" +
"    key: \"nationalFruits\",\n" +
"    title: \"Country → National Fruit\",\n" +
"    bigLetter: \"🥭\",\n" +
"    intro: \"Match the country to its national fruit.\",\n" +
"    rules: \"<1s = 12pts · <2s = 8pts · <3s = 4pts · wrong = over\",\n" +
"    reference: \"Comprehensive list of countries and their national fruits.\",\n" +
"    accent: \"#f59e0b\",\n" +
"    timeLimit: 3000,\n" +
"    prompt: \"National Fruit of\",\n" +
"    subtext: \"Pick the correct fruit\",\n" +
"    cardBadge: \"Nature\",\n" +
"    cardTitle: \"Country → National Fruit\",\n" +
"    cardDescription: \"Test your knowledge of national fruits.\",\n" +
"    getScorePoints: standardScorePoints,\n" +
"    generateQuestion: () => {\n" +
"      const item = countries[Math.floor(Math.random() * countries.length)];\n" +
"      return {\n" +
"        display: item.country,\n" +
"        correctValue: item.nationalFruit,\n" +
"        options: generatePoolOptions(item.nationalFruit, countries.map((c) => c.nationalFruit)),\n" +
"      };\n" +
"    },\n" +
"  },\n" +
"  internetDomains: {\n" +
"    key: \"internetDomains\",\n" +
"    title: \"Country → Internet Domain\",\n" +
"    bigLetter: \"🌐\",\n" +
"    intro: \"Match the country to its top-level internet domain.\",\n" +
"    rules: \"<1s = 12pts · <2s = 8pts · <3s = 4pts · wrong = over\",\n" +
"    reference: \"List of countries and their internet domains (.us, .in, etc.).\",\n" +
"    accent: \"#6366f1\",\n" +
"    timeLimit: 3000,\n" +
"    prompt: \"Internet Domain for\",\n" +
"    subtext: \"Pick the correct domain\",\n" +
"    cardBadge: \"Technology\",\n" +
"    cardTitle: \"Country → Internet Domain\",\n" +
"    cardDescription: \"Match nations with their internet domains.\",\n" +
"    getScorePoints: standardScorePoints,\n" +
"    generateQuestion: () => {\n" +
"      const item = countries[Math.floor(Math.random() * countries.length)];\n" +
"      return {\n" +
"        display: item.country,\n" +
"        correctValue: item.internetDomain,\n" +
"        options: generatePoolOptions(item.internetDomain, countries.map((c) => c.internetDomain)),\n" +
"      };\n" +
"    },\n" +
"  },\n" +
"  callingCodes: {\n" +
"    key: \"callingCodes\",\n" +
"    title: \"Country → Calling Code\",\n" +
"    bigLetter: \"📞\",\n" +
"    intro: \"Match the country to its international calling code.\",\n" +
"    rules: \"<1s = 12pts · <2s = 8pts · <3s = 4pts · wrong = over\",\n" +
"    reference: \"List of countries and their calling codes (+1, +91, etc.).\",\n" +
"    accent: \"#14b8a6\",\n" +
"    timeLimit: 3000,\n" +
"    prompt: \"Calling Code for\",\n" +
"    subtext: \"Pick the correct code\",\n" +
"    cardBadge: \"Technology\",\n" +
"    cardTitle: \"Country → Calling Code\",\n" +
"    cardDescription: \"Match nations with their calling codes.\",\n" +
"    getScorePoints: standardScorePoints,\n" +
"    generateQuestion: () => {\n" +
"      const item = countries[Math.floor(Math.random() * countries.length)];\n" +
"      return {\n" +
"        display: item.country,\n" +
"        correctValue: item.callingCode,\n" +
"        options: generatePoolOptions(item.callingCode, countries.map((c) => c.callingCode)),\n" +
"      };\n" +
"    },\n" +
"  },\n" +
"  timezones: {\n" +
"    key: \"timezones\",\n" +
"    title: \"Country → Timezone\",\n" +
"    bigLetter: \"🕒\",\n" +
"    intro: \"Match the country to its primary timezone.\",\n" +
"    rules: \"<1s = 12pts · <2s = 8pts · <3s = 4pts · wrong = over\",\n" +
"    reference: \"List of countries and their primary UTC timezones.\",\n" +
"    accent: \"#8b5cf6\",\n" +
"    timeLimit: 3000,\n" +
"    prompt: \"Timezone for\",\n" +
"    subtext: \"Pick the correct timezone\",\n" +
"    cardBadge: \"Geography\",\n" +
"    cardTitle: \"Country → Timezone\",\n" +
"    cardDescription: \"Match nations with their timezones.\",\n" +
"    getScorePoints: standardScorePoints,\n" +
"    generateQuestion: () => {\n" +
"      const item = countries[Math.floor(Math.random() * countries.length)];\n" +
"      return {\n" +
"        display: item.country,\n" +
"        correctValue: item.timezone,\n" +
"        options: generatePoolOptions(item.timezone, countries.map((c) => c.timezone)),\n" +
"      };\n" +
"    },\n" +
"  },\n" +
"};\n";

content = content.replace(/}\);\s*$/, newGames);

fs.writeFileSync(file, content);
console.log("Successfully ran refactor!");
