import { readFileSync } from 'fs';
import * as acorn from 'acorn';

const html = readFileSync('index.html', 'utf-8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/g);
if (scriptMatch) {
    scriptMatch.forEach((scriptTag, idx) => {
        const jsCode = scriptTag.replace(/<\/?script>/g, '');
        try {
            acorn.parse(jsCode, { ecmaVersion: 2020 });
            console.log(`Script ${idx} is valid.`);
        } catch (e) {
            console.log(`Script ${idx} Error:`, e.message);
        }
    });
}
