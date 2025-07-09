class Coin extends GameObject {
    constructor(x, y, engine) {
        super(x, y, 24, 24);
        
        this.engine = engine;
        this.addTag('coin');
        
        // Coin properties
        this.scoreValue = 200;
        this.collected = false;
        this.collectionTime = 0;
        this.collectionDuration = 0.3;
        this.floatHeight = 0;
        this.floatTimer = 0;
        this.floatSpeed = 4;
        
        // Physics
        this.mass = 0.1;
        this.solid = false;
        this.drag = 1;
        
        // Visual effects
        this.sparkleTimer = 0;
        this.sparkleInterval = 0.5;
        
        this.setupAnimations();
    }

    setupAnimations() {
        this.addAnimation('spin', [
            { x: 0, y: 288, width: 24, height: 24 },
            { x: 24, y: 288, width: 24, height: 24 },
            { x: 48, y: 288, width: 24, height: 24 },
            { x: 72, y: 288, width: 24, height: 24 }
        ], 0.15, true);
        
        this.playAnimation('spin');
    }

    update(deltaTime) {
        super.update(deltaTime);
        
        if (this.collected) {
            this.updateCollection(deltaTime);
            return;
        }
        
        // Floating animation
        this.floatTimer += deltaTime;
        this.floatHeight = Math.sin(this.floatTimer * this.floatSpeed) * 3;
        
        // Sparkle effect
        this.sparkleTimer += deltaTime;
        if (this.sparkleTimer >= this.sparkleInterval) {
            this.sparkleTimer = 0;
            this.createSparkle();
        }
    }

    updateCollection(deltaTime) {
        this.collectionTime += deltaTime;
        
        // Float upward and fade out
        this.velocity.y = -100;
        this.alpha = 1 - (this.collectionTime / this.collectionDuration);
        
        // Destroy after animation
        if (this.collectionTime >= this.collectionDuration) {
            this.destroy();
        }
    }

    createSparkle() {
        if (this.engine && this.engine.renderSystem) {
            this.engine.renderSystem.addParticle(
                this.position.x + this.size.x / 2,
                this.position.y + this.size.y / 2,
                {
                    velocityX: (Math.random() - 0.5) * 20,
                    velocityY: (Math.random() - 0.5) * 20,
                    size: 2,
                    color: '#FFD700',
                    life: 0.3,
                    shape: 'circle'
                }
            );
        }
    }

    collect(player) {
        if (this.collected) return;
        
        this.collected = true;
        this.collectionTime = 0;
        this.solid = false;
        
        // Play sound
        if (this.engine && this.engine.audio) {
            this.engine.audio.playCoinSound();
        }
        
        // Add score
        if (this.engine) {
            this.engine.addScore(this.scoreValue);
        }
        
        // Create collection effect
        if (this.engine && this.engine.renderSystem) {
            this.engine.renderSystem.addEffect('coin', this.position.x, this.position.y, {
                color: '#FFD700',
                life: 0.5
            });
        }
    }

    render(ctx, camera) {
        if (!this.visible) return;
        
        const screenX = this.position.x - camera.x;
        const screenY = this.position.y - camera.y + this.floatHeight;
        
        ctx.save();
        ctx.globalAlpha = this.alpha || 1;
        
        // Draw the coin
        if (this.sprite && this.currentAnimation) {
            const animation = this.animations[this.currentAnimation];
            const frame = animation.frames[this.frameIndex];
            
            ctx.drawImage(
                this.sprite,
                frame.x, frame.y, frame.width, frame.height,
                screenX, screenY, this.size.x, this.size.y
            );
        } else {
            // Draw placeholder
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(screenX + this.size.x / 2, screenY + this.size.y / 2, this.size.x / 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }

    getDebugColor() {
        return '#FFD700';
    }
}