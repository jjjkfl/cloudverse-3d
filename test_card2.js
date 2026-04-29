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
        const cards = dom.window.document.querySelectorAll('.card');
        console.log("Found cards:", cards.length);
        if (cards.length > 0) {
            cards[0].querySelector('.card-btn').click();
            setTimeout(() => {
                const ov = dom.window.document.getElementById('tsOverlay');
                console.log("Overlay classes after card click:", ov.className);
                console.log("Overlay opacity:", ov.style.opacity);
            }, 1000);
        }
    } catch (e) {
        console.error("Error:", e);
    }
}, 500);
