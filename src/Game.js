class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.engine = null;
        this.initialized = false;
        this.loadingProgress = 0;
        this.loadingStages = [
            'Initializing engine...',
            'Loading audio system...',
            'Setting up game states...',
            'Preparing level data...',
            'Ready to play!'
        ];
        this.currentLoadingStage = 0;
        
        console.log('Mario-inspired Platformer Engine v1.0.0');
        console.log('Initializing game...');
    }

    async start() {
        try {
            // Show loading screen
            this.showLoadingScreen();
            
            // Initialize engine
            await this.initializeEngine();
            
            // Start the game loop
            this.engine.start();
            
            console.log('Game started successfully!');
            
        } catch (error) {
            console.error('Failed to start game:', error);
            this.showErrorScreen(error);
        }
    }

    async initializeEngine() {
        // Stage 1: Initialize engine
        this.updateLoadingStage(0);
        await this.sleep(500);
        
        this.engine = new GameEngine(this.canvas);
        
        // Stage 2: Load audio system
        this.updateLoadingStage(1);
        await this.sleep(300);
        
        // Audio is initialized in the engine constructor
        
        // Stage 3: Set up game states
        this.updateLoadingStage(2);
        await this.sleep(400);
        
        // Game states are initialized in the engine constructor
        
        // Stage 4: Prepare level data
        this.updateLoadingStage(3);
        await this.sleep(600);
        
        // Level data is prepared in the PlayState
        
        // Stage 5: Ready to play
        this.updateLoadingStage(4);
        await this.sleep(200);
        
        this.initialized = true;
    }

    updateLoadingStage(stage) {
        this.currentLoadingStage = stage;
        this.loadingProgress = (stage / (this.loadingStages.length - 1)) * 100;
        this.showLoadingScreen();
    }

    showLoadingScreen() {
        const ctx = this.canvas.getContext('2d');
        
        // Clear canvas
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Background
        ctx.fillStyle = '#000033';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Title
        ctx.save();
        ctx.font = 'bold 32px monospace';
        ctx.fillStyle = '#FFD700';
        ctx.textAlign = 'center';
        ctx.fillText('MARIO PLATFORMER ENGINE', this.canvas.width / 2, 150);
        ctx.restore();
        
        // Loading text
        ctx.save();
        ctx.font = '16px monospace';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        
        if (this.currentLoadingStage < this.loadingStages.length) {
            ctx.fillText(this.loadingStages[this.currentLoadingStage], this.canvas.width / 2, 250);
        }
        
        ctx.restore();
        
        // Progress bar
        const barWidth = 400;
        const barHeight = 20;
        const barX = (this.canvas.width - barWidth) / 2;
        const barY = 300;
        
        // Progress bar background
        ctx.fillStyle = '#333333';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Progress bar fill
        const fillWidth = (this.loadingProgress / 100) * barWidth;
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(barX, barY, fillWidth, barHeight);
        
        // Progress bar border
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        // Progress percentage
        ctx.save();
        ctx.font = '14px monospace';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(this.loadingProgress)}%`, this.canvas.width / 2, barY + 40);
        ctx.restore();
        
        // Instructions
        ctx.save();
        ctx.font = '12px monospace';
        ctx.fillStyle = '#AAAAAA';
        ctx.textAlign = 'center';
        ctx.fillText('Controls: Arrow Keys to Move, Space to Jump, Z to Run, X to Fire', 
                    this.canvas.width / 2, this.canvas.height - 50);
        ctx.fillText('Press R to Restart, ESC to Pause, D to Toggle Debug Mode', 
                    this.canvas.width / 2, this.canvas.height - 30);
        ctx.restore();
    }

    showErrorScreen(error) {
        const ctx = this.canvas.getContext('2d');
        
        // Clear canvas
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Background
        ctx.fillStyle = '#330000';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Error title
        ctx.save();
        ctx.font = 'bold 32px monospace';
        ctx.fillStyle = '#FF0000';
        ctx.textAlign = 'center';
        ctx.fillText('ERROR', this.canvas.width / 2, 150);
        ctx.restore();
        
        // Error message
        ctx.save();
        ctx.font = '16px monospace';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText('Failed to initialize game engine', this.canvas.width / 2, 200);
        ctx.fillText(error.message, this.canvas.width / 2, 220);
        ctx.restore();
        
        // Instructions
        ctx.save();
        ctx.font = '14px monospace';
        ctx.fillStyle = '#AAAAAA';
        ctx.textAlign = 'center';
        ctx.fillText('Please refresh the page to try again', this.canvas.width / 2, 300);
        ctx.restore();
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Utility methods for debugging
    getEngineInfo() {
        if (!this.engine) return null;
        
        return {
            running: this.engine.running,
            paused: this.engine.paused,
            currentState: this.engine.currentState.constructor.name,
            gameObjectCount: this.engine.gameObjects.length,
            score: this.engine.score,
            lives: this.engine.lives,
            level: this.engine.level,
            camera: {
                x: this.engine.camera.x,
                y: this.engine.camera.y
            }
        };
    }

    // Performance monitoring
    getPerformanceInfo() {
        if (!this.engine) return null;
        
        return {
            fps: Math.round(1 / this.engine.deltaTime),
            deltaTime: this.engine.deltaTime,
            gameObjects: this.engine.gameObjects.length,
            particles: this.engine.renderSystem ? this.engine.renderSystem.particles.length : 0,
            effects: this.engine.renderSystem ? this.engine.renderSystem.effects.length : 0
        };
    }

    // Debug methods
    toggleDebugMode() {
        if (this.engine && this.engine.renderSystem) {
            this.engine.renderSystem.toggleDebug();
        }
    }

    addDebugObject(type, x, y) {
        if (!this.engine) return;
        
        let obj;
        switch (type) {
            case 'goomba':
                obj = new Goomba(x, y, this.engine);
                break;
            case 'koopa':
                obj = new Koopa(x, y, this.engine);
                break;
            case 'coin':
                obj = new Coin(x, y, this.engine);
                break;
            case 'mushroom':
                obj = new Mushroom(x, y, this.engine);
                break;
            case 'fire_flower':
                obj = new FireFlower(x, y, this.engine);
                break;
            case 'block':
                obj = new Block(x, y, 'question', this.engine);
                break;
            default:
                console.warn('Unknown debug object type:', type);
                return;
        }
        
        if (obj) {
            this.engine.addGameObject(obj);
        }
    }

    // Cleanup
    destroy() {
        if (this.engine) {
            this.engine.destroy();
            this.engine = null;
        }
        
        this.initialized = false;
        console.log('Game destroyed');
    }
}

// Global debug functions (for development)
window.debugGame = function() {
    if (window.game && window.game.engine) {
        console.log('Game Info:', window.game.getEngineInfo());
        console.log('Performance:', window.game.getPerformanceInfo());
    }
};

window.addDebugObject = function(type, x, y) {
    if (window.game) {
        window.game.addDebugObject(type, x || 200, y || 200);
    }
};

window.toggleDebug = function() {
    if (window.game) {
        window.game.toggleDebugMode();
    }
};

// Store game instance globally for debugging
window.game = null;