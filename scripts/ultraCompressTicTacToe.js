const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../frontend/src/pages/TicTacToe.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

// The main game `return` section padding
content = content.replace(
  'py-1 sm:py-2 px-2 sm:px-4 pb-12 sm:pb-2',
  'py-0 sm:py-2 px-2 sm:px-4 pb-8 sm:pb-2'
);

// Score Board Max Width
content = content.replace(
  'max-w-xs sm:max-w-md mb-2 sm:mb-3 text-white font-black bg-[#0f172a] px-4 py-2 sm:px-6 sm:py-3',
  'max-w-[280px] sm:max-w-[380px] mb-2 sm:mb-3 text-white font-black bg-[#0f172a] px-3 py-1.5 sm:px-6 sm:py-2'
);

// Game Board Container Max Width and Padding
content = content.replace(
  'max-w-xs sm:max-w-md w-full relative',
  'max-w-[280px] sm:max-w-[380px] w-full relative'
);
content = content.replace(
  'p-3 sm:p-5 rounded-2xl sm:rounded-3xl',
  'p-2.5 sm:p-4 rounded-2xl'
);

// Action Buttons padding
content = content.replace(
  /py-2 sm:py-3 text-\[10px\]/g,
  'py-1.5 sm:py-2.5 text-[10px]'
);

// Title size and margin
content = content.replace(
  'mb-1 sm:mb-2',
  'mb-1'
);

content = content.replace(
  'text-2xl sm:text-3xl',
  'text-xl sm:text-3xl'
);

fs.writeFileSync(filePath, content);
console.log('UI ultra compressed successfully.');
