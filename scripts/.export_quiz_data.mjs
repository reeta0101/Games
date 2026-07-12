import fs from 'fs';
import * as quizData from './frontend/src/data/quizGames.js';

let output = 'STUDY ARCADE - ALL QUIZ DATA\n==============================\n\n';

for (const [key, value] of Object.entries(quizData)) {
  if (Array.isArray(value)) {
    output += `\n========== Category: ${key.toUpperCase()} ==========\n\n`;
    value.forEach((item, index) => {
      // Format each item nicely instead of raw JSON if possible
      let line = `${index + 1}. `;
      const entries = Object.entries(item);
      entries.forEach(([k, v], i) => {
        line += `${k}: ${v}${i < entries.length - 1 ? ' | ' : ''}`;
      });
      output += line + '\n';
    });
    output += '\n';
  }
}

fs.writeFileSync('all_quiz_data.txt', output, 'utf-8');
console.log('Successfully wrote to all_quiz_data.txt');
