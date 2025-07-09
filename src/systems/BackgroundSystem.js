// Background System - Handles parallax backgrounds and environmental rendering
class BackgroundSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.layers = [];
        this.skyColor = '#5C94FC';
        this.cloudTimer = 0;
        this.cloudSpeed = 10;
        this.clouds = [];
        this.hills = [];
        this.generateClouds();
        this.generateHills();
    }

    // Add a background layer
    addLayer(image, parallaxFactor, speed = 0, repeat = true) {
        this.layers.push({
            image: image,
            parallaxFactor: parallaxFactor,
            speed: speed,
            repeat: repeat,
            offsetX: 0,
            offsetY: 0
        });
    }

    // Generate procedural clouds
    generateClouds() {
        for (let i = 0; i < 8; i++) {
            this.clouds.push({
                x: Math.random() * this.canvas.width * 2,
                y: 50 + Math.random() * 150,
                size: 0.5 + Math.random() * 1.5,
                speed: 0.2 + Math.random() * 0.3,
                opacity: 0.6 + Math.random() * 0.4
            });
        }
    }

    // Generate procedural hills
    generateHills() {
        for (let i = 0; i < 5; i++) {
            this.hills.push({
                x: i * 200 - 100,
                y: this.canvas.height - 150 - Math.random() * 100,
                width: 200 + Math.random() * 200,
                height: 100 + Math.random() * 150,
                color: `hsl(${120 + Math.random() * 40}, ${50 + Math.random() * 30}%, ${30 + Math.random() * 20}%)`,
                parallax: 0.3 + Math.random() * 0.4
            });
        }
    }

    // Update background animations
    update(deltaTime, camera) {
        // Update clouds
        this.cloudTimer += deltaTime;
        this.clouds.forEach(cloud => {
            cloud.x += cloud.speed * this.cloudSpeed * deltaTime;
            
            // Wrap clouds around
            if (cloud.x > this.canvas.width + 100) {
                cloud.x = -100;
                cloud.y = 50 + Math.random() * 150;
            }
        });

        // Update layer speeds
        this.layers.forEach(layer => {
            layer.offsetX += layer.speed * deltaTime;
        });
    }

    // Render all background elements
    render(ctx, camera) {
        // Clear with sky color
        ctx.fillStyle = this.skyColor;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Render hills (furthest back)
        this.renderHills(ctx, camera);

        // Render clouds
        this.renderClouds(ctx, camera);

        // Render parallax layers
        this.renderLayers(ctx, camera);

        // Render atmospheric effects
        this.renderAtmosphere(ctx, camera);
    }

    // Render procedural hills
    renderHills(ctx, camera) {
        ctx.save();
        
        this.hills.forEach(hill => {
            const parallaxX = camera.x * hill.parallax;
            const screenX = hill.x - parallaxX;
            
            // Only render if visible
            if (screenX + hill.width > -100 && screenX < this.canvas.width + 100) {
                ctx.fillStyle = hill.color;
                
                // Draw hill as an ellipse
                ctx.beginPath();
                ctx.ellipse(
                    screenX + hill.width / 2,
                    hill.y + hill.height / 2,
                    hill.width / 2,
                    hill.height / 2,
                    0, 0, Math.PI * 2
                );
                ctx.fill();

                // Add highlight
                ctx.fillStyle = this.lightenColor(hill.color, 20);
                ctx.beginPath();
                ctx.ellipse(
                    screenX + hill.width / 2 - 20,
                    hill.y + hill.height / 2 - 10,
                    hill.width / 3,
                    hill.height / 3,
                    0, 0, Math.PI
                );
                ctx.fill();
            }
        });
        
        ctx.restore();
    }

    // Render procedural clouds
    renderClouds(ctx, camera) {
        ctx.save();
        
        this.clouds.forEach(cloud => {
            const parallaxX = camera.x * 0.1; // Very slow parallax for clouds
            const screenX = cloud.x - parallaxX;
            
            // Only render if visible
            if (screenX > -150 && screenX < this.canvas.width + 150) {
                ctx.globalAlpha = cloud.opacity;
                this.drawCloud(ctx, screenX, cloud.y, cloud.size);
            }
        });
        
        ctx.restore();
    }

    // Draw a single cloud
    drawCloud(ctx, x, y, size) {
        ctx.fillStyle = '#FFFFFF';
        
        // Main cloud body
        const baseSize = 40 * size;
        
        // Multiple circles to form cloud shape
        const circles = [
            { x: x, y: y, radius: baseSize * 0.6 },
            { x: x - baseSize * 0.4, y: y + baseSize * 0.2, radius: baseSize * 0.4 },
            { x: x + baseSize * 0.4, y: y + baseSize * 0.2, radius: baseSize * 0.5 },
            { x: x - baseSize * 0.2, y: y - baseSize * 0.3, radius: baseSize * 0.3 },
            { x: x + baseSize * 0.2, y: y - baseSize * 0.3, radius: baseSize * 0.35 }
        ];

        circles.forEach(circle => {
            ctx.beginPath();
            ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    // Render parallax layers
    renderLayers(ctx, camera) {
        this.layers.forEach(layer => {
            if (!layer.image) return;

            const parallaxX = camera.x * layer.parallaxFactor + layer.offsetX;
            const parallaxY = camera.y * layer.parallaxFactor + layer.offsetY;

            if (layer.repeat) {
                this.renderRepeatingLayer(ctx, layer, parallaxX, parallaxY);
            } else {
                ctx.drawImage(layer.image, -parallaxX, -parallaxY);
            }
        });
    }

    // Render a repeating background layer
    renderRepeatingLayer(ctx, layer, offsetX, offsetY) {
        const imageWidth = layer.image.width;
        const imageHeight = layer.image.height;
        
        // Calculate how many tiles we need
        const tilesX = Math.ceil(this.canvas.width / imageWidth) + 2;
        const tilesY = Math.ceil(this.canvas.height / imageHeight) + 2;
        
        // Calculate starting position
        const startX = Math.floor(offsetX / imageWidth) * imageWidth - offsetX;
        const startY = Math.floor(offsetY / imageHeight) * imageHeight - offsetY;
        
        for (let x = 0; x < tilesX; x++) {
            for (let y = 0; y < tilesY; y++) {
                ctx.drawImage(
                    layer.image,
                    startX + x * imageWidth,
                    startY + y * imageHeight
                );
            }
        }
    }

    // Render atmospheric effects
    renderAtmosphere(ctx, camera) {
        // Distance fog effect
        const fogOpacity = Math.min(0.3, camera.x / 5000);
        if (fogOpacity > 0) {
            ctx.save();
            ctx.globalAlpha = fogOpacity;
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            ctx.restore();
        }

        // Vignette effect
        this.renderVignette(ctx);
    }

    // Render vignette effect
    renderVignette(ctx) {
        ctx.save();
        
        const gradient = ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2, Math.max(this.canvas.width, this.canvas.height) / 2
        );
        
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        ctx.restore();
    }

    // Generate a simple background image
    generateSimpleBackground(width, height, type = 'sky') {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        switch (type) {
            case 'sky':
                this.generateSkyBackground(ctx, width, height);
                break;
            case 'mountains':
                this.generateMountainBackground(ctx, width, height);
                break;
            case 'forest':
                this.generateForestBackground(ctx, width, height);
                break;
            default:
                // Simple gradient
                const gradient = ctx.createLinearGradient(0, 0, 0, height);
                gradient.addColorStop(0, '#87CEEB');
                gradient.addColorStop(1, '#98D8E8');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, width, height);
                break;
        }

        return canvas;
    }

    // Generate sky background
    generateSkyBackground(ctx, width, height) {
        // Sky gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.4, '#98D8E8');
        gradient.addColorStop(1, '#B0E0E6');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Simple sun
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(width * 0.8, height * 0.2, 30, 0, Math.PI * 2);
        ctx.fill();

        // Sun rays
        ctx.strokeStyle = '#FFEF94';
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const startX = width * 0.8 + Math.cos(angle) * 35;
            const startY = height * 0.2 + Math.sin(angle) * 35;
            const endX = width * 0.8 + Math.cos(angle) * 50;
            const endY = height * 0.2 + Math.sin(angle) * 50;
            
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }
    }

    // Generate mountain background
    generateMountainBackground(ctx, width, height) {
        // Sky gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#4169E1');
        gradient.addColorStop(1, '#87CEEB');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Mountains
        const mountains = [
            { x: 0, peak: height * 0.3, width: width * 0.4, color: '#483D8B' },
            { x: width * 0.2, peak: height * 0.4, width: width * 0.5, color: '#6A5ACD' },
            { x: width * 0.5, peak: height * 0.35, width: width * 0.6, color: '#8A8ACD' }
        ];

        mountains.forEach(mountain => {
            ctx.fillStyle = mountain.color;
            ctx.beginPath();
            ctx.moveTo(mountain.x, height);
            ctx.lineTo(mountain.x + mountain.width / 2, mountain.peak);
            ctx.lineTo(mountain.x + mountain.width, height);
            ctx.closePath();
            ctx.fill();
        });
    }

    // Generate forest background
    generateForestBackground(ctx, width, height) {
        // Sky gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#228B22');
        gradient.addColorStop(1, '#32CD32');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Trees
        for (let i = 0; i < 20; i++) {
            const x = (i / 20) * width;
            const treeHeight = 100 + Math.random() * 200;
            const treeWidth = 30 + Math.random() * 40;
            
            // Tree trunk
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(x - 5, height - treeHeight / 4, 10, treeHeight / 4);
            
            // Tree foliage
            ctx.fillStyle = '#006400';
            ctx.beginPath();
            ctx.ellipse(x, height - treeHeight + 20, treeWidth / 2, treeHeight / 2, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Utility function to lighten a color
    lightenColor(color, percent) {
        // Simple HSL manipulation would be better, but this works for basic cases
        if (color.startsWith('hsl')) {
            return color.replace(/(\d+)%\)/, (match, p1) => {
                return Math.min(100, parseInt(p1) + percent) + '%)';
            });
        }
        return color;
    }

    // Set sky color
    setSkyColor(color) {
        this.skyColor = color;
    }

    // Clear all layers
    clearLayers() {
        this.layers = [];
    }

    // Get layer count
    getLayerCount() {
        return this.layers.length;
    }

    // Initialize default backgrounds
    initializeDefaults() {
        // Clear existing
        this.clearLayers();

        // Add default sky background
        const skyBg = this.generateSimpleBackground(800, 600, 'sky');
        this.addLayer(skyBg, 0, 0, true);

        // Add mountain layer
        const mountainBg = this.generateSimpleBackground(1200, 400, 'mountains');
        this.addLayer(mountainBg, 0.2, 5, true);

        console.log('Background system initialized with default layers');
    }
}