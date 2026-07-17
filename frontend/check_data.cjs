const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'src', 'data');

function checkFile(filePath, name) {
    if (!filePath.endsWith('.json')) return;
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(content);
        
        if (Array.isArray(parsed)) {
            const hasQuestions = parsed.length > 0 && parsed[0].question !== undefined;
            console.log(`[OK] ${name} - Array of ${parsed.length} items. Has 'question' field: ${hasQuestions}`);
        } else {
            console.log(`[WARN] ${name} - Not an array! Keys: ${Object.keys(parsed).join(', ')}`);
        }
    } catch (e) {
        console.log(`[ERROR] ${name} - Could not parse JSON`);
    }
}

function scanDir(dir, prefix = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const name = prefix ? `${prefix}/${entry.name}` : entry.name;
        
        if (entry.isDirectory()) {
            scanDir(fullPath, name);
        } else {
            checkFile(fullPath, name);
        }
    }
}

scanDir(dataDir);
