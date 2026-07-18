const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../frontend/src/pages/TicTacToe.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

// The `return` section of setupPhase
content = content.replace(
  '    return (\n      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] py-10 px-4">',
  '    return (\n      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] py-2 px-4">'
);

// The main game `return` section
content = content.replace(
  '  return (\n    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] py-10 px-4">',
  '  return (\n    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] py-1 sm:py-2 px-2 sm:px-4 pb-12 sm:pb-2">'
);

// Title
content = content.replace(
  '<div className="text-center mb-8">',
  '<div className="text-center mb-1 sm:mb-2">'
);
content = content.replace(
  '<div className="text-center mb-8">', // for the other one
  '<div className="text-center mb-1 sm:mb-2">'
);
content = content.replace(
  '<h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#40e0f0] to-blue-500 mb-2">Tic Tac Toe</h1>',
  '<h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#40e0f0] to-blue-500 mb-0.5">Tic Tac Toe</h1>'
);
content = content.replace(
  '<h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#40e0f0] to-blue-500 mb-2">Tic Tac Toe</h1>', // for the other one
  '<h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#40e0f0] to-blue-500 mb-0.5">Tic Tac Toe</h1>'
);

// Score Board
content = content.replace(
  '<div className="flex justify-between w-full max-w-md mb-8 text-white text-xl font-black bg-[#0f172a] px-8 py-4 rounded-3xl border border-white/10 shadow-[0_0_30px_rgba(64,224,240,0.15)]">',
  '<div className="flex justify-between w-full max-w-xs sm:max-w-md mb-2 sm:mb-3 text-white font-black bg-[#0f172a] px-4 py-2 sm:px-6 sm:py-3 rounded-2xl sm:rounded-3xl border border-white/10 shadow-[0_0_20px_rgba(64,224,240,0.15)]">'
);

// Game Board Container
content = content.replace(
  '<div className="bg-[#0f172a]/80 border border-white/10 p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl max-w-md w-full relative">',
  '<div className="bg-[#0f172a]/80 border border-white/10 p-3 sm:p-5 rounded-2xl sm:rounded-3xl shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-2xl max-w-xs sm:max-w-md w-full relative">'
);
content = content.replace(
  '<div className="bg-[#0f172a]/80 border border-white/10 p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl max-w-md w-full animate-fade-in-up">',
  '<div className="bg-[#0f172a]/80 border border-white/10 p-4 sm:p-6 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-2xl max-w-sm w-full animate-fade-in-up">'
);

// Turn Indicator
content = content.replace(
  '<div className="mb-6 text-center h-8">',
  '<div className="mb-1 sm:mb-3 text-center h-5 sm:h-6">'
);
content = content.replace(
  '<p className={`text-xl font-black uppercase tracking-widest transition-all duration-300',
  '<p className={`text-xs sm:text-base font-black uppercase tracking-widest transition-all duration-300'
);

// Grid
content = content.replace(
  '<div className="grid grid-cols-3 gap-3 mb-8 bg-slate-900/50 p-4 rounded-3xl relative border border-white/5 shadow-inner">',
  '<div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-2 sm:mb-4 bg-slate-900/50 p-2 sm:p-3 rounded-xl sm:rounded-2xl relative border border-white/5 shadow-inner">'
);

// Cells
content = content.replace(
  'className={`aspect-square bg-[#0f172a] rounded-2xl flex items-center justify-center text-7xl transition-all duration-300 disabled:cursor-not-allowed border border-white/5 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] overflow-hidden relative group',
  'className={`aspect-square bg-[#0f172a] rounded-xl flex items-center justify-center text-4xl sm:text-6xl transition-all duration-300 disabled:cursor-not-allowed border border-white/5 shadow-[inset_0_0_15px_rgba(0,0,0,0.5)] overflow-hidden relative group'
);

// Action Buttons Container
content = content.replace(
  '<div className="flex flex-col gap-4">',
  '<div className="flex flex-col gap-1.5 sm:gap-3">'
);

// Setup Buttons (Change Settings)
content = content.replace(
  'className="w-full rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 py-4 text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-white shadow-lg hover:scale-[1.02] transition"',
  'className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 py-2 sm:py-3 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-white shadow-lg hover:scale-[1.02] transition"'
);

// Restart and Menu buttons gap
content = content.replace(
  '<div className="flex gap-4">',
  '<div className="flex gap-1.5 sm:gap-3">'
);

// Restart Button
content = content.replace(
  'className="flex-1 rounded-2xl bg-gradient-to-r from-[#f0e040] to-orange-400 py-4 text-sm font-black uppercase tracking-[0.2em] text-black shadow-lg hover:scale-[1.02] transition"',
  'className="flex-1 rounded-xl bg-gradient-to-r from-[#f0e040] to-orange-400 py-2 sm:py-3 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-black shadow-lg hover:scale-[1.02] transition"'
);

// Menu Button
content = content.replace(
  'className="flex-1 rounded-2xl bg-white/5 border border-white/10 py-4 text-sm font-black uppercase tracking-[0.2em] text-slate-300 hover:bg-white/10 transition"',
  'className="flex-1 rounded-xl bg-white/5 border border-white/10 py-2 sm:py-3 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-slate-300 hover:bg-white/10 transition"'
);

// Setup UI Game Mode and Opponent Buttons padding
content = content.replace(
  /py-4 text-sm/g,
  'py-2 sm:py-3 text-[10px] sm:text-xs'
);

fs.writeFileSync(filePath, content);
console.log('UI compressed successfully.');
