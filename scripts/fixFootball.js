const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../frontend/src/pages/PenaltyShootout.jsx');
let content = fs.readFileSync(file, 'utf8');

const uiStart = content.indexOf('{/* Header */}');
const uiEnd = content.indexOf('{/* 3D Scene Container - Ball, GK, Targets */}');
if (uiStart === -1 || uiEnd === -1) {
  console.log('Could not find UI boundaries');
  process.exit(1);
}

const uiContent = content.substring(uiStart, uiEnd);
content = content.replace(uiContent, ''); 

const fieldStart = content.indexOf('{/* 3D FOOTBALL FIELD WITH PENALTY BOX */}');
if (fieldStart === -1) {
  console.log('Could not find Field start');
  process.exit(1);
}

content = content.substring(0, fieldStart) + uiContent + content.substring(fieldStart);

const fieldContainerRegex = /\{\/\*\ 3D FOOTBALL FIELD WITH PENALTY BOX\ \*\/\}[\s\S]*?<div[\s\S]*?style=\{\{[\s\S]*?translateZ\(-50px\)",[\s\S]*?\}\}[\s\S]*?>/;
const match1 = content.match(fieldContainerRegex);
if (!match1) {
  console.log('Could not find field container regex');
  process.exit(1);
}

const mergedContainerStart = `        {/* 3D Scene Container - Merged Field, Ball, GK, Targets */}
        <div
          className="relative"
          style={{
            width: "100%",
            maxWidth: "min(500px, 60vh)", // Prevent overflowing height
            aspectRatio: "1 / 1.3",
            transformStyle: "preserve-3d",
            transform: "rotateX(55deg) translateZ(-50px)",
            pointerEvents: "auto",
          }}
        >`;

content = content.replace(match1[0], mergedContainerStart);

const gapRegex = /<\/div>\s*<\/div>\s*\{\/\*\ 3D Scene Container - Ball, GK, Targets\ \*\/\}[\s\S]*?<div[\s\S]*?style=\{\{[\s\S]*?translateZ\(-50px\)",[\s\S]*?pointerEvents:[\s\S]*?\}\}[\s\S]*?>/;
const match2 = content.match(gapRegex);
if (!match2) {
  console.log('Could not find gap regex');
  process.exit(1);
}

content = content.replace(match2[0], '</div>');

content = content.replace(/mb-6/g, 'mb-2 sm:mb-4');
content = content.replace(/py-10/g, 'py-2 sm:py-4');
content = content.replace(/text-4xl md:text-5xl/g, 'text-2xl md:text-4xl');
content = content.replace(/text-3xl md:text-4xl/g, 'text-xl md:text-3xl'); 
content = content.replace(/px-6 py-4/g, 'px-3 py-2 sm:px-6 sm:py-4');
content = content.replace(/h-12/g, 'h-8');
content = content.replace(/text-xl md:text-2xl/g, 'text-sm md:text-xl');
content = content.replace(/min-h-screen/g, 'min-h-[calc(100vh-120px)]');

fs.writeFileSync(file, content);
console.log('Successfully merged 3D containers and scaled UI.');
