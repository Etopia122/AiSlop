class PlayState extends GameState {
    constructor(engine) {
        super(engine);
        this.player = null;
        this.level = null;
        this.tiles = [];
        this.enemies = [];
        this.powerups = [];
        this.coins = [];
        this.blocks = [];
        this.levelWidth = 3200;
        this.levelHeight = 480;
        this.groundLevel = 500;
    }

    initialize() {
        this.createLevel();
        this.createPlayer();
        this.setupCamera();
    }

    onEnter() {
        // Start gameplay music
        // this.engine.audio.playMusic('level1');
    }

    onExit() {
        // Clean up
        this.engine.gameObjects = [];
    }

    createLevel() {
        // Create ground tiles
        this.createGround();
        
        // Create platforms
        this.createPlatforms();
        
        // Create enemies
        this.createEnemies();
        
        // Create blocks and power-ups
        this.createBlocks();
        
        // Create coins
        this.createCoins();
        
        // Create pipes
        this.createPipes();
    }

    createGround() {
        const tileSize = 32;
        const tilesPerRow = Math.ceil(this.levelWidth / tileSize);
        
        // Create ground tiles
        for (let x = 0; x < tilesPerRow; x++) {
            for (let y = 0; y < 3; y++) {
                const tile = new GameObject(x * tileSize, this.groundLevel + y * tileSize, tileSize, tileSize);
                tile.addTag('ground');
                tile.addTag('static');
                tile.solid = true;
                tile.mass = 1000;
                tile.getDebugColor = () => '#8B4513';
                this.tiles.push(tile);
                this.engine.addGameObject(tile);
            }
        }
    }

    createPlatforms() {
        const platforms = [
            { x: 300, y: 400, width: 128, height: 32 },
            { x: 500, y: 350, width: 96, height: 32 },
            { x: 700, y: 300, width: 64, height: 32 },
            { x: 900, y: 250, width: 96, height: 32 },
            { x: 1200, y: 400, width: 128, height: 32 },
            { x: 1500, y: 350, width: 96, height: 32 },
            { x: 1800, y: 300, width: 128, height: 32 },
            { x: 2100, y: 400, width: 96, height: 32 },
            { x: 2400, y: 350, width: 128, height: 32 },
            { x: 2700, y: 300, width: 96, height: 32 }
        ];
        
        platforms.forEach(platform => {
            const tile = new GameObject(platform.x, platform.y, platform.width, platform.height);
            tile.addTag('platform');
            tile.addTag('static');
            tile.solid = true;
            tile.mass = 1000;
            tile.getDebugColor = () => '#00FF00';
            this.tiles.push(tile);
            this.engine.addGameObject(tile);
        });
    }

    createEnemies() {
        const enemyPositions = [
            { x: 400, y: 450, type: 'goomba' },
            { x: 600, y: 450, type: 'goomba' },
            { x: 800, y: 450, type: 'koopa' },
            { x: 1000, y: 450, type: 'goomba' },
            { x: 1300, y: 450, type: 'koopa' },
            { x: 1600, y: 450, type: 'goomba' },
            { x: 1800, y: 450, type: 'goomba' },
            { x: 2000, y: 450, type: 'koopa' },
            { x: 2300, y: 450, type: 'goomba' },
            { x: 2500, y: 450, type: 'koopa' },
            { x: 2800, y: 450, type: 'goomba' }
        ];
        
        enemyPositions.forEach(pos => {
            let enemy;
            if (pos.type === 'goomba') {
                enemy = new Goomba(pos.x, pos.y, this.engine);
            } else if (pos.type === 'koopa') {
                enemy = new Koopa(pos.x, pos.y, this.engine);
            }
            
            if (enemy) {
                this.enemies.push(enemy);
                this.engine.addGameObject(enemy);
            }
        });
    }

    createBlocks() {
        const blockPositions = [
            { x: 320, y: 350, type: 'question' },
            { x: 352, y: 350, type: 'brick' },
            { x: 384, y: 350, type: 'question' },
            { x: 416, y: 350, type: 'brick' },
            { x: 520, y: 300, type: 'question' },
            { x: 720, y: 250, type: 'brick' },
            { x: 920, y: 200, type: 'question' },
            { x: 1220, y: 350, type: 'brick' },
            { x: 1252, y: 350, type: 'question' },
            { x: 1520, y: 300, type: 'brick' },
            { x: 1552, y: 300, type: 'question' },
            { x: 1820, y: 250, type: 'brick' },
            { x: 1852, y: 250, type: 'question' },
            { x: 1884, y: 250, type: 'brick' },
            { x: 2120, y: 350, type: 'question' },
            { x: 2420, y: 300, type: 'brick' },
            { x: 2452, y: 300, type: 'question' },
            { x: 2720, y: 250, type: 'brick' }
        ];
        
        blockPositions.forEach(pos => {
            const block = new Block(pos.x, pos.y, pos.type, this.engine);
            this.blocks.push(block);
            this.engine.addGameObject(block);
        });
    }

    createCoins() {
        const coinPositions = [
            { x: 350, y: 450 },
            { x: 450, y: 400 },
            { x: 550, y: 320 },
            { x: 650, y: 270 },
            { x: 750, y: 220 },
            { x: 850, y: 170 },
            { x: 950, y: 200 },
            { x: 1050, y: 450 },
            { x: 1150, y: 400 },
            { x: 1250, y: 320 },
            { x: 1350, y: 450 },
            { x: 1450, y: 400 },
            { x: 1550, y: 270 },
            { x: 1650, y: 450 },
            { x: 1750, y: 400 },
            { x: 1850, y: 220 },
            { x: 1950, y: 450 },
            { x: 2050, y: 400 },
            { x: 2150, y: 320 },
            { x: 2250, y: 450 },
            { x: 2350, y: 400 },
            { x: 2450, y: 270 },
            { x: 2550, y: 450 },
            { x: 2650, y: 400 },
            { x: 2750, y: 220 },
            { x: 2850, y: 450 }
        ];
        
        coinPositions.forEach(pos => {
            const coin = new Coin(pos.x, pos.y, this.engine);
            this.coins.push(coin);
            this.engine.addGameObject(coin);
        });
    }

    createPipes() {
        const pipePositions = [
            { x: 1000, y: 432 },
            { x: 1700, y: 432 },
            { x: 2900, y: 432 }
        ];
        
        pipePositions.forEach(pos => {
            const pipe = new GameObject(pos.x, pos.y, 64, 68);
            pipe.addTag('pipe');
            pipe.addTag('static');
            pipe.solid = true;
            pipe.mass = 1000;
            pipe.getDebugColor = () => '#00AA00';
            this.engine.addGameObject(pipe);
        });
    }

    createPlayer() {
        this.player = new Player(100, 400, this.engine);
        this.engine.addGameObject(this.player);
    }

    setupCamera() {
        this.engine.camera.target = this.player;
        this.engine.camera.bounds = {
            left: 0,
            right: this.levelWidth - this.engine.width,
            top: 0,
            bottom: this.levelHeight - this.engine.height
        };
    }

    update(deltaTime) {
        super.update(deltaTime);
        
        // Handle input
        this.handleInput();
        
        // Update render system effects
        if (this.engine.renderSystem) {
            this.engine.renderSystem.updateEffects(deltaTime);
        }
        
        // Check for level completion
        if (this.player && this.player.position.x >= this.levelWidth - 100) {
            this.completeLevel();
        }
        
        // Check for player death
        if (this.player && this.player.position.y > 600) {
            this.player.die();
        }
    }

    handleInput() {
        const input = this.engine.input;
        
        // Restart level
        if (input.isRestartPressed()) {
            this.restartLevel();
        }
        
        // Toggle debug mode
        if (input.wasPressed('KeyD')) {
            if (this.engine.renderSystem) {
                this.engine.renderSystem.toggleDebug();
            }
        }
    }

    render(ctx) {
        super.render(ctx);
        
        // Draw sky background
        this.drawBackground(ctx, '#5C94FC');
        
        // Draw clouds
        this.drawClouds(ctx);
        
        // Draw hills
        this.drawHills(ctx);
        
        // Game objects are rendered by the engine
    }

    drawClouds(ctx) {
        const camera = this.engine.camera;
        const clouds = [
            { x: 200, y: 100, size: 40 },
            { x: 600, y: 80, size: 50 },
            { x: 1000, y: 120, size: 45 },
            { x: 1400, y: 90, size: 55 },
            { x: 1800, y: 110, size: 40 },
            { x: 2200, y: 85, size: 48 },
            { x: 2600, y: 105, size: 42 },
            { x: 3000, y: 95, size: 52 }
        ];
        
        ctx.save();
        ctx.fillStyle = '#FFFFFF';
        
        clouds.forEach(cloud => {
            const screenX = cloud.x - camera.x * 0.3; // Parallax effect
            const screenY = cloud.y - camera.y * 0.1;
            
            if (screenX > -cloud.size && screenX < ctx.canvas.width + cloud.size) {
                // Simple cloud shape
                ctx.beginPath();
                ctx.arc(screenX, screenY, cloud.size * 0.6, 0, Math.PI * 2);
                ctx.arc(screenX + cloud.size * 0.5, screenY, cloud.size * 0.4, 0, Math.PI * 2);
                ctx.arc(screenX - cloud.size * 0.5, screenY, cloud.size * 0.4, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        
        ctx.restore();
    }

    drawHills(ctx) {
        const camera = this.engine.camera;
        const hills = [
            { x: 100, y: 400, width: 200, height: 100 },
            { x: 500, y: 420, width: 150, height: 80 },
            { x: 1000, y: 410, width: 180, height: 90 },
            { x: 1500, y: 430, width: 160, height: 70 },
            { x: 2000, y: 415, width: 190, height: 85 },
            { x: 2500, y: 425, width: 170, height: 75 }
        ];
        
        ctx.save();
        ctx.fillStyle = '#90EE90';
        
        hills.forEach(hill => {
            const screenX = hill.x - camera.x * 0.5; // Parallax effect
            const screenY = hill.y - camera.y * 0.2;
            
            if (screenX > -hill.width && screenX < ctx.canvas.width + hill.width) {
                // Simple hill shape
                ctx.beginPath();
                ctx.ellipse(screenX + hill.width / 2, screenY + hill.height / 2, 
                           hill.width / 2, hill.height / 2, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        
        ctx.restore();
    }

    completeLevel() {
        // Add bonus points
        this.engine.addScore(5000);
        
        // Transition to next level or victory screen
        console.log('Level completed!');
        
        // For now, just restart the level
        setTimeout(() => {
            this.restartLevel();
        }, 2000);
    }

    restartLevel() {
        // Clear all game objects
        this.engine.gameObjects = [];
        
        // Reset camera
        this.engine.camera.x = 0;
        this.engine.camera.y = 0;
        
        // Reset game state
        this.tiles = [];
        this.enemies = [];
        this.powerups = [];
        this.coins = [];
        this.blocks = [];
        
        // Recreate level
        this.createLevel();
        this.createPlayer();
        this.setupCamera();
    }

    loadLevel(levelData) {
        // Load level from data
        // This would be implemented for level editor support
        console.log('Loading level:', levelData);
    }
}