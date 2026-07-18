const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../frontend/src/pages/PenaltyShootout.jsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Rename FootballGame to PenaltyShootout (just in case)
content = content.replace(/FootballGame/g, 'PenaltyShootout');

// 2. Change PENALTY BOX from bottom: "0" to top: "0"
content = content.replace(
  /\{\/\* PENALTY BOX - The 18-yard box \*\/\}\s*<div\s*style=\{\{\s*position: "absolute",\s*bottom: "0",/g,
  '{/* PENALTY BOX - The 18-yard box */}\n            <div\n              style={{\n                position: "absolute",\n                top: "0",'
);
// Fix Penalty arc: it should be at bottom of the box, extending downwards
content = content.replace(
  /\{\/\* Penalty arc \(D\) \*\/\}\s*<div\s*style=\{\{\s*position: "absolute",\s*top: "0",\s*left: "50%",\s*width: "100px",\s*height: "100px",\s*border: "3px solid rgba\(255,255,255,0\.5\)",\s*borderBottom: "none",\s*borderRadius: "50px 50px 0 0",\s*transform: "translateX\(-50%\) translateY\(-50%\)",/g,
  '{/* Penalty arc (D) */}\n              <div\n                style={{\n                  position: "absolute",\n                  bottom: "0",\n                  left: "50%",\n                  width: "100px",\n                  height: "100px",\n                  border: "3px solid rgba(255,255,255,0.5)",\n                  borderTop: "none",\n                  borderRadius: "0 0 50px 50px",\n                  transform: "translateX(-50%) translateY(50%)",'
);
// Fix Penalty spot: should be bottom of box
content = content.replace(
  /\{\/\* Penalty spot \*\/\}\s*<div\s*style=\{\{\s*position: "absolute",\s*top: "28%",/g,
  '{/* Penalty spot */}\n              <div\n                style={{\n                  position: "absolute",\n                  bottom: "28%",'
);

// 3. Change GOAL AREA from bottom: "0" to top: "0"
content = content.replace(
  /\{\/\* GOAL AREA - 6-yard box \*\/\}\s*<div\s*style=\{\{\s*position: "absolute",\s*bottom: "0",/g,
  '{/* GOAL AREA - 6-yard box */}\n            <div\n              style={{\n                position: "absolute",\n                top: "0",'
);

// 4. Change GOAL POSTS from bottom: "0" to top: "0"
content = content.replace(
  /\{\/\* GOAL POSTS - 3D structure \*\/\}\s*<div\s*style=\{\{\s*position: "absolute",\s*bottom: "0",/g,
  '{/* GOAL POSTS - 3D structure */}\n            <div\n              style={{\n                position: "absolute",\n                top: "0",'
);

// 5. Change ZONE_3D_POSITIONS and GK_3D_POSITIONS
content = content.replace(
  /const ZONE_3D_POSITIONS = \{[\s\S]*?\};/,
  `const ZONE_3D_POSITIONS = {
  TL: { x: -35, y: -35, z: -18, rotX: -50, rotY: 18, rotZ: -720 },
  TC: { x: 0, y: -38, z: -22, rotX: -55, rotY: 0, rotZ: 720 },
  TR: { x: 35, y: -35, z: -18, rotX: -50, rotY: -18, rotZ: 720 },
  BL: { x: -28, y: -15, z: -8, rotX: -25, rotY: 22, rotZ: -360 },
  BC: { x: 0, y: -12, z: -12, rotX: -30, rotY: 0, rotZ: 360 },
  BR: { x: 28, y: -15, z: -8, rotX: -25, rotY: -22, rotZ: 360 },
  start: { x: 0, y: 40, z: 0, rotX: 0, rotY: 0, rotZ: 0 },
};`
);
content = content.replace(
  /const GK_3D_POSITIONS = \{[\s\S]*?\};/,
  `const GK_3D_POSITIONS = {
  TL: { x: -28, y: -38, z: -10, rotX: -35, rotY: 28, rotZ: -60 },
  TC: { x: 0, y: -42, z: -12, rotX: -40, rotY: 0, rotZ: 0 },
  TR: { x: 28, y: -38, z: -10, rotX: -35, rotY: -28, rotZ: 60 },
  BL: { x: -22, y: -20, z: -2, rotX: -15, rotY: 32, rotZ: -80 },
  BC: { x: 0, y: -22, z: -4, rotX: -20, rotY: 0, rotZ: 0 },
  BR: { x: 22, y: -20, z: -2, rotX: -15, rotY: -32, rotZ: 80 },
  start: { x: 0, y: -38, z: 0, rotX: 0, rotY: 0, rotZ: 0 },
};`
);

// 6. Fix Distance Marker
content = content.replace(
  /\{\/\* Distance marker - penalty spot indicator \*\/\}\s*<div\s*style=\{\{\s*position: "absolute",\s*bottom: "38%",\s*left: "50%",\s*transform: "translateX\(-50%\)",\s*pointerEvents: "none",\s*\}\}\s*>\s*<div\s*style=\{\{\s*width: "2px",\s*height: "60px",\s*background:\s*"linear-gradient\(180deg, transparent, rgba\(255,255,255,0\.4\)\)",\s*margin: "0 auto",\s*\}\}\s*><\/div>\s*<div\s*style=\{\{\s*width: "40px",\s*height: "2px",\s*background: "rgba\(255,255,255,0\.4\)",\s*margin: "4px auto 0",\s*\}\}\s*><\/div>/,
  `{/* Distance marker - penalty spot indicator */}
            <div
              style={{
                position: "absolute",
                top: "28%",
                left: "50%",
                transform: "translateX(-50%)",
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "2px",
                  background: "rgba(255,255,255,0.4)",
                  margin: "0 auto 4px",
                }}
              ></div>
              <div
                style={{
                  width: "2px",
                  height: "60px",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.4), transparent)",
                  margin: "0 auto",
                }}
              ></div>`
);

fs.writeFileSync(file, content);
