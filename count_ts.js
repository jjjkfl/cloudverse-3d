const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const m = html.match(/id=["']tsOverlay["']/g);
console.log('Matches:', m ? m.length : 0);
