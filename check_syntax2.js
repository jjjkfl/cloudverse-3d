const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('index.html', 'utf-8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/g);
if (scriptMatch) {
    scriptMatch.forEach((scriptTag, idx) => {
        const jsCode = scriptTag.replace(/<\/?script>/g, '');
        try {
            new vm.Script(jsCode);
            console.log(`Script ${idx} is valid.`);
        } catch (e) {
            console.log(`Script ${idx} Error:`, e.message);
        }
    });
}
