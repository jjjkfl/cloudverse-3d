(function () {
    // Wait for DOM to ensure head is available
    document.addEventListener('DOMContentLoaded', () => {
        // Find existing favicon link or create a new one
        let link = document.querySelector("link[rel*='icon']");
        if (!link) {
            link = document.createElement('link');
            link.type = 'image/png';
            link.rel = 'icon';
            document.head.appendChild(link);
        }

        const canvas = document.createElement('canvas');
        canvas.width = 256; // Ultra high resolution for crispness
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        function drawFavicon() {
            ctx.clearRect(0, 0, 256, 256);
            ctx.save();
            
            // Calculate angle based on time (10 seconds per rotation) to perfectly match index page
            let angle = ((Date.now() % 10000) / 10000) * Math.PI * 2;
            
            // Move origin to center
            ctx.translate(128, 128);
            ctx.rotate(angle);
            
            // Atom styling (white with primary accent glow)
            ctx.shadowColor = '#01b8fd';
            ctx.shadowBlur = 12; // Tighter shadow to avoid clipping at edges
            ctx.fillStyle = '#ffffff'; 
            ctx.font = 'bold 340px sans-serif'; // Massively increased font size
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Draw the atom (scale up to fit full tab height)
            ctx.fillText('⚛', 0, 32); // Adjusted vertical tweak for the massive font
            
            ctx.restore();
            
            // Update the favicon
            link.href = canvas.toDataURL('image/png');
        }
        
        // Update favicon every 50ms (~20 FPS) for buttery smooth rotation
        setInterval(drawFavicon, 50);

        // Draw first frame immediately
        drawFavicon();
    });
})();
