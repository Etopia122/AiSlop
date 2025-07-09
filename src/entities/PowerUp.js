class PowerUp extends GameObject {
    constructor(x, y, width, height, engine) {
        super(x, y, width, height);
        
        this.engine = engine;
        this.addTag('powerup');
        
        // Power-up properties
        this.type = 'generic';
        this.scoreValue = 1000;
        this.emergingFromBlock = false;
        this.emergeSpeed = 50;
        this.emergeDistance = 32;
        this.emergeProgress = 0;
        this.initialY = y;
        this.collected = false;
        this.collectionTime = 0;
        this.collectionDuration = 0.5;
        
        // Movement properties
        this.speed = 30;
        this.direction = 1;
        this.bounceHeight = 0;
        this.bounceSpeed = 100;
        this.bounceTimer = 0;
        
        // Physics
        this.mass = 0.5;
        this.drag = 0.95;
        this.solid = false;
        this.bounciness = 0.3;
        
        // Visual effects
        this.alpha = 1;
        this.glowTimer = 0;
        this.glowSpeed = 3;
        
        this.setupBehavior();
    }

    setupBehavior() {
        // Override in subclasses
    }

    update(deltaTime) {
        super.update(deltaTime);
        
        if (this.collected) {
            this.updateCollection(deltaTime);
            return;
        }
        
        if (this.emergingFromBlock) {
            this.updateEmerging(deltaTime);
            return;
        }
        
        // Update movement
        this.updateMovement(deltaTime);
        
        // Update visual effects
        this.updateVisualEffects(deltaTime);
        
        // Check for falling off world
        this.checkWorldBounds();
    }

    updateEmerging(deltaTime) {
        this.emergeProgress += this.emergeSpeed * deltaTime;
        this.position.y = this.initialY - this.emergeProgress;
        
        if (this.emergeProgress >= this.emergeDistance) {
            this.emergingFromBlock = false;
            this.solid = false; // Can be collected now
        }
    }

    updateMovement(deltaTime) {
        // Basic horizontal movement
        this.velocity.x = this.direction * this.speed;
        
        // Simple bounce effect
        this.bounceTimer += deltaTime;
        this.bounceHeight = Math.sin(this.bounceTimer * this.bounceSpeed) * 2;
        
        // Check for direction changes (walls, edges)
        if (this.shouldTurn()) {
            this.direction *= -1;
        }
    }

    updateVisualEffects(deltaTime) {
        // Glow effect
        this.glowTimer += deltaTime;
        this.alpha = 0.8 + Math.sin(this.glowTimer * this.glowSpeed) * 0.2;
    }

    updateCollection(deltaTime) {
        this.collectionTime += deltaTime;
        
        // Float upward when collected
        this.velocity.y = -100;
        this.velocity.x = 0;
        
        // Fade out
        this.alpha = 1 - (this.collectionTime / this.collectionDuration);
        
        // Destroy after collection animation
        if (this.collectionTime >= this.collectionDuration) {
            this.destroy();
        }
    }

    shouldTurn() {
        // Simple boundary check
        if (this.position.x <= 0 || this.position.x >= 3200) {
            return true;
        }
        
        // Check for edges (simplified)
        const groundCheckY = this.position.y + this.size.y + 5;
        if (groundCheckY > 600) {
            return true;
        }
        
        return false;
    }

    checkWorldBounds() {
        // Remove if fallen off the world
        if (this.position.y > 700) {
            this.destroy();
        }
    }

    emergeFromBlock(blockX, blockY) {
        this.emergingFromBlock = true;
        this.emergeProgress = 0;
        this.initialY = blockY;
        this.position.x = blockX;
        this.position.y = blockY;
        this.solid = true; // Can't be collected while emerging
        this.visible = true;
    }

    collect(player) {
        if (this.collected || this.emergingFromBlock) return;
        
        this.collected = true;
        this.collectionTime = 0;
        this.solid = false;
        
        // Apply power-up effect
        this.applyEffect(player);
        
        // Play sound
        if (this.engine && this.engine.audio) {
            this.engine.audio.playPowerUpSound();
        }
        
        // Add score
        if (this.engine) {
            this.engine.addScore(this.scoreValue);
        }
        
        // Create visual effect
        if (this.engine && this.engine.renderSystem) {
            this.engine.renderSystem.addEffect('powerup', this.position.x, this.position.y, {
                color: this.getEffectColor(),
                life: 1.0
            });
        }
    }

    applyEffect(player) {
        // Override in subclasses
    }

    getEffectColor() {
        return '#FFD700'; // Gold color for generic power-up
    }

    render(ctx, camera) {
        if (!this.visible) return;
        
        const screenX = this.position.x - camera.x;
        const screenY = this.position.y - camera.y + this.bounceHeight;
        
        ctx.save();
        ctx.globalAlpha = this.alpha;
        
        // Draw the power-up
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
            ctx.fillStyle = this.getDebugColor();
            ctx.fillRect(screenX, screenY, this.size.x, this.size.y);
        }
        
        ctx.restore();
    }

    getDebugColor() {
        return '#FFD700'; // Gold color
    }
}