const fs = require('fs');
const css = fs.readFileSync('styles.css', 'utf-8');
const lines = css.split('\n');
const zIndexes = [];
lines.forEach((line, i) => {
    if (line.includes('z-index:')) {
        zIndexes.push(`${i + 1}: ${line.trim()}`);
    }
});
console.log(zIndexes.join('\n'));
