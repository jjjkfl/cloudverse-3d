const fs = require('fs');
const css = fs.readFileSync('styles.css', 'utf8');

// Basic brace counting
let open = 0;
for(let i=0; i<css.length; i++) {
    if(css[i] === '{') open++;
    if(css[i] === '}') open--;
    if(open < 0) {
        console.log("Unmatched closing brace at index", i);
        break;
    }
}
console.log("Final brace count:", open);
