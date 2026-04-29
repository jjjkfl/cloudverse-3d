const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf-8');

const dom = new JSDOM(html, {
    runScripts: "dangerously",
    resources: "usable"
});

setTimeout(() => {
    try {
        const btn = dom.window.document.getElementById('mainCta');
        console.log("Found mainCta:", !!btn);
        btn.click();
        
        setTimeout(() => {
            const ov = dom.window.document.getElementById('tsOverlay');
            console.log("Overlay classes:", ov.className);
            console.log("Overlay opacity:", ov.style.opacity);
        }, 100);
    } catch (e) {
        console.error("Error:", e);
    }
}, 500);
