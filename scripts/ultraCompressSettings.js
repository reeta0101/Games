const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../frontend/src/pages/TicTacToe.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Setup screen container
content = content.replace(
  'p-4 sm:p-6 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-2xl max-w-sm w-full animate-fade-in-up',
  'p-3 sm:p-5 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-2xl max-w-[280px] sm:max-w-sm w-full animate-fade-in-up'
);

// Space between setup fields
content = content.replace(
  'className="space-y-6"',
  'className="space-y-3 sm:space-y-4"'
);

content = content.replace(
  'className="mt-8 flex flex-col gap-3"',
  'className="mt-4 sm:mt-6 flex flex-col gap-2"'
);

fs.writeFileSync(filePath, content);
console.log('Setup UI compressed successfully.');
