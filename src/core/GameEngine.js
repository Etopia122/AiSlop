class GameEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        
        // Core systems
        this.physics = new Physics();
        this.input = new Input();
        this.audio = new Audio();
        this.spriteManager = new SpriteManager();
        
        // Game systems
        this.animationSystem = new AnimationSystem();
        this.collisionSystem = new CollisionSystem();
        this.backgroundSystem = new BackgroundSystem(this.canvas);
        this.renderSystem = new RenderSystem(this.ctx, this.spriteManager);
        
        // Game state
        this.gameObjects = [];
        this.gameStates = {};
        this.currentState = null;
        this.deltaTime = 0;
        this.lastTime = 0;
        this.running = false;
        this.paused = false;
        
        // Camera
        this.camera = {
            x: 0,
            y: 0,
            target: null,
            smoothing: 0.1,
            bounds: {
                left: 0,
                right: 3200,
                top: 0,
                bottom: 480
            }
        };
        
        // Game data
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.time = 400;
        
        // Initialize
        this.init();
    }

    async init() {
        // Load audio
        await this.audio.loadAllSounds();
        
        // Load sprites
        await this.spriteManager.loadAllSprites();
        
        // Setup canvas
        this.setupCanvas();
        
        // Initialize game states
        this.initGameStates();
        
        // Initialize background system
        this.backgroundSystem.initializeDefaults();
        
        console.log('Game Engine initialized');
    }

    setupCanvas() {
        // Set up canvas for pixel art
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.msImageSmoothingEnabled = false;
        
        // Set up canvas styles
        this.canvas.style.imageRendering = 'pixelated';
        this.canvas.style.imageRendering = '-moz-crisp-edges';
        this.canvas.style.imageRendering = 'crisp-edges';
    }

    initGameStates() {
        this.gameStates = {
            menu: new MenuState(this),
            play: new PlayState(this),
            gameOver: new GameOverState(this)
        };
        
        this.currentState = this.gameStates.menu;
    }

    // Game loop
    start() {
        if (this.running) return;
        this.running = true;
        this.lastTime = performance.now();
        this.gameLoop();
    }

    stop() {
        this.running = false;
    }

    pause() {
        this.paused = !this.paused;
        if (this.paused) {
            this.audio.pauseMusic();
        } else {
            this.audio.resumeMusic();
        }
    }

    gameLoop() {
        if (!this.running) return;
        
        const currentTime = performance.now();
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        // Cap delta time to prevent large jumps
        this.deltaTime = Math.min(this.deltaTime, 0.016);
        
        if (!this.paused) {
            this.update();
            this.render();
        }
        
        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        // Update input
        this.input.update();
        
        // Handle pause
        if (this.input.isPausePressed()) {
            this.pause();
            return;
        }
        
        // Update current state
        if (this.currentState) {
            this.currentState.update(this.deltaTime);
        }
        
        // Update camera
        this.updateCamera();
        
        // Update physics for all objects
        this.gameObjects.forEach(obj => {
            if (obj.active) {
                this.physics.applyGravity(obj, this.deltaTime);
                this.physics.applyFriction(obj);
            }
        });
        
        // Update all game objects
        this.gameObjects.forEach(obj => obj.update(this.deltaTime));
        
        // Update background system
        this.backgroundSystem.update(this.deltaTime, this.camera);
        
        // Handle collisions
        this.collisionSystem.update(this.gameObjects, this.deltaTime);
        
        // Remove inactive objects
        this.gameObjects = this.gameObjects.filter(obj => obj.active);
        
        // Update UI
        this.updateUI();
    }

    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Render background
        this.backgroundSystem.render(this.ctx, this.camera);
        
        // Render current state
        if (this.currentState) {
            this.currentState.render(this.ctx);
        }
        
        // Render all game objects
        this.gameObjects.forEach(obj => obj.render(this.ctx, this.camera));
        
        // Render UI
        this.renderUI();
        
        // Render pause overlay
        if (this.paused) {
            this.renderPauseOverlay();
        }
    }

    updateCamera() {
        if (!this.camera.target) return;
        
        const target = this.camera.target;
        const targetX = target.position.x - this.width / 2;
        const targetY = target.position.y - this.height / 2;
        
        // Smooth camera movement
        this.camera.x += (targetX - this.camera.x) * this.camera.smoothing;
        this.camera.y += (targetY - this.camera.y) * this.camera.smoothing;
        
        // Apply camera bounds
        this.camera.x = Math.max(this.camera.bounds.left, 
                        Math.min(this.camera.bounds.right - this.width, this.camera.x));
        this.camera.y = Math.max(this.camera.bounds.top, 
                        Math.min(this.camera.bounds.bottom - this.height, this.camera.y));
    }

    updateUI() {
        // Update score display
        document.getElementById('score').textContent = this.score.toString().padStart(6, '0');
        document.getElementById('lives').textContent = this.lives.toString();
    }

    renderUI() {
        // Additional UI rendering can go here
    }

    renderPauseOverlay() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '32px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSED', this.width / 2, this.height / 2);
        
        this.ctx.font = '16px monospace';
        this.ctx.fillText('Press ESC to resume', this.width / 2, this.height / 2 + 40);
    }

    // Game object management
    addGameObject(gameObject) {
        this.gameObjects.push(gameObject);
    }

    removeGameObject(gameObject) {
        const index = this.gameObjects.indexOf(gameObject);
        if (index > -1) {
            this.gameObjects.splice(index, 1);
        }
    }

    findGameObjectsByTag(tag) {
        return this.gameObjects.filter(obj => obj.hasTag(tag));
    }

    findGameObjectByTag(tag) {
        return this.gameObjects.find(obj => obj.hasTag(tag));
    }

    // State management
    changeState(stateName) {
        if (this.gameStates[stateName]) {
            if (this.currentState && this.currentState.exit) {
                this.currentState.exit();
            }
            
            this.currentState = this.gameStates[stateName];
            
            if (this.currentState.enter) {
                this.currentState.enter();
            }
        }
    }

    // Game actions
    addScore(points) {
        this.score += points;
    }

    loseLife() {
        this.lives--;
        if (this.lives <= 0) {
            this.changeState('gameOver');
        }
    }

    gainLife() {
        this.lives++;
    }

    // Level management
    loadLevel(levelData) {
        // Clear existing objects
        this.gameObjects = [];
        
        // Reset camera
        this.camera.x = 0;
        this.camera.y = 0;
        
        // Load level will be implemented in the level system
        if (this.currentState && this.currentState.loadLevel) {
            this.currentState.loadLevel(levelData);
        }
    }

    // Utility methods
    isInBounds(x, y) {
        return x >= this.camera.x && x <= this.camera.x + this.width &&
               y >= this.camera.y && y <= this.camera.y + this.height;
    }

    worldToScreen(worldPos) {
        return {
            x: worldPos.x - this.camera.x,
            y: worldPos.y - this.camera.y
        };
    }

    screenToWorld(screenPos) {
        return {
            x: screenPos.x + this.camera.x,
            y: screenPos.y + this.camera.y
        };
    }

    // Cleanup
    destroy() {
        this.stop();
        this.audio.destroy();
        this.gameObjects = [];
    }
}