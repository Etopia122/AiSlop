class Tile extends GameObject {
    constructor(x, y, tileType, engine) {
        super(x, y, 32, 32);
        
        this.engine = engine;
        this.addTag('tile');
        this.addTag('static');
        
        // Tile properties
        this.tileType = tileType || 'ground';
        this.solid = true;
        this.mass = 1000;
        this.drag = 0;
        
        // Visual properties
        this.spriteX = 0;
        this.spriteY = 0;
        this.color = this.getTileColor();
        
        this.setupTileType();
    }

    setupTileType() {
        switch (this.tileType) {
            case 'ground':
                this.solid = true;
                this.color = '#8B4513';
                break;
            case 'brick':
                this.solid = true;
                this.color = '#DC143C';
                break;
            case 'stone':
                this.solid = true;
                this.color = '#696969';
                break;
            case 'ice':
                this.solid = true;
                this.color = '#B0E0E6';
                break;
            case 'lava':
                this.solid = false;
                this.color = '#FF4500';
                this.addTag('hazard');
                break;
            case 'water':
                this.solid = false;
                this.color = '#1E90FF';
                break;
            case 'cloud':
                this.solid = true;
                this.color = '#F0F8FF';
                break;
            case 'platform':
                this.solid = true;
                this.color = '#00FF00';
                break;
            default:
                this.solid = true;
                this.color = '#8B4513';
                break;
        }
    }

    getTileColor() {
        const colors = {
            'ground': '#8B4513',
            'brick': '#DC143C',
            'stone': '#696969',
            'ice': '#B0E0E6',
            'lava': '#FF4500',
            'water': '#1E90FF',
            'cloud': '#F0F8FF',
            'platform': '#00FF00'
        };
        
        return colors[this.tileType] || '#8B4513';
    }

    update(deltaTime) {
        super.update(deltaTime);
        
        // Special tile behaviors
        if (this.tileType === 'lava') {
            this.updateLavaTile(deltaTime);
        } else if (this.tileType === 'water') {
            this.updateWaterTile(deltaTime);
        }
    }

    updateLavaTile(deltaTime) {
        // Check for player collision with lava
        const player = this.engine.findGameObjectByTag('player');
        if (player && this.intersects(player)) {
            player.takeDamage(1);
        }
    }

    updateWaterTile(deltaTime) {
        // Water could slow down player or enemies
        const player = this.engine.findGameObjectByTag('player');
        if (player && this.intersects(player)) {
            player.velocity.x *= 0.5;
        }
    }

    render(ctx, camera) {
        if (!this.visible) return;
        
        const screenX = this.position.x - camera.x;
        const screenY = this.position.y - camera.y;
        
        ctx.save();
        
        // Draw tile
        ctx.fillStyle = this.color;
        ctx.fillRect(screenX, screenY, this.size.x, this.size.y);
        
        // Add tile-specific details
        this.renderTileDetails(ctx, screenX, screenY);
        
        // Draw border for some tiles
        if (this.tileType === 'brick' || this.tileType === 'stone') {
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.strokeRect(screenX, screenY, this.size.x, this.size.y);
        }
        
        ctx.restore();
    }

    renderTileDetails(ctx, screenX, screenY) {
        switch (this.tileType) {
            case 'brick':
                this.renderBrickPattern(ctx, screenX, screenY);
                break;
            case 'stone':
                this.renderStonePattern(ctx, screenX, screenY);
                break;
            case 'ice':
                this.renderIcePattern(ctx, screenX, screenY);
                break;
            case 'lava':
                this.renderLavaPattern(ctx, screenX, screenY);
                break;
            case 'water':
                this.renderWaterPattern(ctx, screenX, screenY);
                break;
            case 'cloud':
                this.renderCloudPattern(ctx, screenX, screenY);
                break;
        }
    }

    renderBrickPattern(ctx, screenX, screenY) {
        // Simple brick pattern
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(screenX + 2, screenY + 2, 12, 6);
        ctx.fillRect(screenX + 18, screenY + 2, 12, 6);
        ctx.fillRect(screenX + 10, screenY + 12, 12, 6);
        ctx.fillRect(screenX + 2, screenY + 22, 12, 6);
        ctx.fillRect(screenX + 18, screenY + 22, 12, 6);
    }

    renderStonePattern(ctx, screenX, screenY) {
        // Stone texture
        ctx.fillStyle = '#808080';
        for (let i = 0; i < 5; i++) {
            const x = screenX + Math.random() * 32;
            const y = screenY + Math.random() * 32;
            ctx.fillRect(x, y, 2, 2);
        }
    }

    renderIcePattern(ctx, screenX, screenY) {
        // Ice highlights
        ctx.fillStyle = '#E6F3FF';
        ctx.fillRect(screenX + 4, screenY + 4, 24, 2);
        ctx.fillRect(screenX + 4, screenY + 12, 16, 2);
        ctx.fillRect(screenX + 8, screenY + 20, 20, 2);
    }

    renderLavaPattern(ctx, screenX, screenY) {
        // Lava bubbles
        ctx.fillStyle = '#FF6600';
        ctx.beginPath();
        ctx.arc(screenX + 8, screenY + 8, 3, 0, Math.PI * 2);
        ctx.arc(screenX + 20, screenY + 16, 4, 0, Math.PI * 2);
        ctx.arc(screenX + 12, screenY + 24, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    renderWaterPattern(ctx, screenX, screenY) {
        // Water waves
        ctx.fillStyle = '#4169E1';
        ctx.beginPath();
        ctx.moveTo(screenX, screenY + 16);
        ctx.quadraticCurveTo(screenX + 8, screenY + 12, screenX + 16, screenY + 16);
        ctx.quadraticCurveTo(screenX + 24, screenY + 20, screenX + 32, screenY + 16);
        ctx.lineTo(screenX + 32, screenY + 32);
        ctx.lineTo(screenX, screenY + 32);
        ctx.fill();
    }

    renderCloudPattern(ctx, screenX, screenY) {
        // Cloud puffs
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(screenX + 6, screenY + 20, 6, 0, Math.PI * 2);
        ctx.arc(screenX + 16, screenY + 16, 8, 0, Math.PI * 2);
        ctx.arc(screenX + 26, screenY + 20, 6, 0, Math.PI * 2);
        ctx.fill();
    }

    getDebugColor() {
        return this.color;
    }

    // Static factory methods
    static createGround(x, y, engine) {
        return new Tile(x, y, 'ground', engine);
    }

    static createBrick(x, y, engine) {
        return new Tile(x, y, 'brick', engine);
    }

    static createStone(x, y, engine) {
        return new Tile(x, y, 'stone', engine);
    }

    static createIce(x, y, engine) {
        return new Tile(x, y, 'ice', engine);
    }

    static createLava(x, y, engine) {
        return new Tile(x, y, 'lava', engine);
    }

    static createWater(x, y, engine) {
        return new Tile(x, y, 'water', engine);
    }

    static createCloud(x, y, engine) {
        return new Tile(x, y, 'cloud', engine);
    }

    static createPlatform(x, y, engine) {
        return new Tile(x, y, 'platform', engine);
    }
}