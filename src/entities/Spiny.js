// Spiny enemy - Hurts Mario when stomped on
class Spiny extends Enemy {
    constructor(x, y, engine) {
        super(x, y, 32, 32, engine);
        this.addTag('spiny');
        this.addTag('enemy');
        
        // Spiny properties
        this.walkSpeed = 50;
        this.spikeDamage = true; // Hurts when touched from any direction
        
        // Visual effects
        this.spikeGlintTimer = 0;
        this.spikeGlintInterval = 1.5;
        
        this.velocity.x = this.facingRight ? this.walkSpeed : -this.walkSpeed;
        
        this.setupAnimations();
    }
    
    setupAnimations() {
        // Walking animation
        this.addAnimation('spiny_walk', [
            { x: 0, y: 0, width: 32, height: 32 },
            { x: 32, y: 0, width: 32, height: 32 }
        ], 0.4, true);
        
        // Defensive animation when being approached
        this.addAnimation('spiny_defensive', [
            { x: 64, y: 0, width: 32, height: 32 }
        ], 0.1, true);
        
        this.playAnimation('spiny_walk');
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        
        // Handle freeze effect
        if (this.frozen) {
            this.updateFreeze(deltaTime);
            return;
        }
        
        // Normal walking behavior
        this.velocity.x = this.facingRight ? this.walkSpeed : -this.walkSpeed;
        
        // Check for walls and edges
        if (this.grounded) {
            if ((this.velocity.x > 0 && this.checkWallRight()) || 
                (this.velocity.x < 0 && this.checkWallLeft()) ||
                this.checkEdge()) {
                this.facingRight = !this.facingRight;
                this.velocity.x = this.facingRight ? this.walkSpeed : -this.walkSpeed;
            }
        }
        
        // Update spike glint effect
        this.spikeGlintTimer += deltaTime;
        if (this.spikeGlintTimer >= this.spikeGlintInterval) {
            this.createSpikeGlint();
            this.spikeGlintTimer = 0;
        }
        
        // Check for nearby player to become defensive
        this.checkPlayerProximity();
    }
    
    checkPlayerProximity() {
        if (!this.engine || !this.engine.gameObjects) return;
        
        const player = this.engine.gameObjects.find(obj => obj.hasTag('player'));
        if (!player) return;
        
        const distance = Math.sqrt(
            Math.pow(player.position.x - this.position.x, 2) +
            Math.pow(player.position.y - this.position.y, 2)
        );
        
        // Become defensive when player is close
        if (distance <= 64) {
            this.playAnimation('spiny_defensive');
        } else {
            this.playAnimation('spiny_walk');
        }
    }
    
    createSpikeGlint() {
        if (!this.engine || !this.engine.renderSystem) return;
        
        // Create glinting effect on spikes
        for (let i = 0; i < 3; i++) {
            const offsetX = (Math.random() - 0.5) * this.size.x;
            const offsetY = (Math.random() - 0.5) * this.size.y;
            
            this.engine.renderSystem.createParticle({
                x: this.position.x + this.size.x / 2 + offsetX,
                y: this.position.y + this.size.y / 2 + offsetY,
                velocityX: 0,
                velocityY: 0,
                life: 0.3,
                size: 2,
                color: '#FFFFFF',
                gravity: false,
                fadeOut: true
            });
        }
    }
    
    checkWallLeft() {
        return this.checkWallDirection(-5);
    }
    
    checkWallRight() {
        return this.checkWallDirection(this.size.x + 5);
    }
    
    checkWallDirection(offsetX) {
        if (!this.engine || !this.engine.gameObjects) return false;
        
        const testX = this.position.x + offsetX;
        const testY = this.position.y + this.size.y / 2;
        
        for (const obj of this.engine.gameObjects) {
            if (obj.solid && obj !== this && obj.hasTag('static')) {
                if (testX >= obj.position.x && testX <= obj.position.x + obj.size.x &&
                    testY >= obj.position.y && testY <= obj.position.y + obj.size.y) {
                    return true;
                }
            }
        }
        return false;
    }
    
    checkEdge() {
        if (!this.engine || !this.engine.gameObjects) return false;
        
        // Check for ground ahead
        const checkX = this.facingRight ? 
            this.position.x + this.size.x + 5 : 
            this.position.x - 5;
        const checkY = this.position.y + this.size.y + 10;
        
        let foundGround = false;
        for (const obj of this.engine.gameObjects) {
            if (obj.solid && obj.hasTag('static')) {
                if (checkX >= obj.position.x && checkX <= obj.position.x + obj.size.x &&
                    checkY >= obj.position.y && checkY <= obj.position.y + obj.size.y) {
                    foundGround = true;
                    break;
                }
            }
        }
        
        return !foundGround;
    }
    
    onCollisionEnter(other) {
        if (other.hasTag('player')) {
            this.handlePlayerCollision(other);
        } else if (other.hasTag('fireball')) {
            // Spinies can be defeated by fireballs
            this.takeDamage(1);
        } else if (other.hasTag('iceball')) {
            // Can be frozen by ice
            this.freeze(3.0);
        }
    }
    
    handlePlayerCollision(player) {
        // Spinies hurt Mario from ALL directions, including from above!
        this.damagePlayer(player);
    }
    
    damagePlayer(player) {
        if (player.takeDamage) {
            player.takeDamage(1);
        }
        
        // Create spike damage effect
        this.createSpikeDamageEffect();
        
        // Knock player back slightly
        if (player.position.x < this.position.x) {
            player.velocity.x = -100; // Knock left
        } else {
            player.velocity.x = 100;  // Knock right
        }
        
        // Small upward bounce for player
        if (player.velocity.y > -50) {
            player.velocity.y = -50;
        }
        
        // Play spike hurt sound
        if (this.engine && this.engine.audio) {
            this.engine.audio.playSpikeHurtSound();
        }
    }
    
    createSpikeDamageEffect() {
        if (!this.engine || !this.engine.renderSystem) return;
        
        // Create red spike particles when hurting player
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const speed = 80 + Math.random() * 40;
            
            this.engine.renderSystem.createParticle({
                x: this.position.x + this.size.x / 2,
                y: this.position.y + this.size.y / 2,
                velocityX: Math.cos(angle) * speed,
                velocityY: Math.sin(angle) * speed,
                life: 0.6,
                size: 3,
                color: '#FF4444',
                gravity: true
            });
        }
        
        // Create warning effect
        for (let i = 0; i < 6; i++) {
            this.engine.renderSystem.createParticle({
                x: this.position.x + Math.random() * this.size.x,
                y: this.position.y + Math.random() * this.size.y,
                velocityX: (Math.random() - 0.5) * 60,
                velocityY: (Math.random() - 0.5) * 60,
                life: 0.4,
                size: 4,
                color: '#FFFF00',
                gravity: false
            });
        }
    }
    
    takeDamage(amount) {
        // Spinies can only be defeated by fireballs, iceballs, or other special attacks
        this.die();
    }
    
    die() {
        // Create death effect
        this.createDeathEffect();
        
        // Add score
        if (this.engine) {
            this.engine.addScore(500); // Higher score for dangerous enemy
        }
        
        // Play death sound
        if (this.engine && this.engine.audio) {
            this.engine.audio.playEnemyDeathSound();
        }
        
        this.destroy();
    }
    
    createDeathEffect() {
        if (!this.engine || !this.engine.renderSystem) return;
        
        // Create spiky destruction particles
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const speed = 100 + Math.random() * 100;
            const isSpike = i % 3 === 0;
            
            this.engine.renderSystem.createParticle({
                x: this.position.x + this.size.x / 2,
                y: this.position.y + this.size.y / 2,
                velocityX: Math.cos(angle) * speed,
                velocityY: Math.sin(angle) * speed - 30,
                life: 1.0,
                size: isSpike ? 5 : 3,
                color: isSpike ? '#666666' : '#AA0000',
                gravity: true
            });
        }
        
        // Create explosion flash
        this.engine.renderSystem.createParticle({
            x: this.position.x + this.size.x / 2,
            y: this.position.y + this.size.y / 2,
            velocityX: 0,
            velocityY: 0,
            life: 0.2,
            size: this.size.x * 2,
            color: 'rgba(255, 255, 255, 0.8)',
            gravity: false,
            fadeOut: true,
            isCircle: true
        });
    }
    
    freeze(duration) {
        this.frozen = true;
        this.freezeTime = duration;
        this.frozenTint = true;
        
        // Store original velocity
        this.originalVelocity = { ...this.velocity };
        this.velocity.x = 0;
        this.velocity.y = Math.min(this.velocity.y, 0);
        
        // Frozen spinies can't hurt player
        this.spikeDamage = false;
    }
    
    updateFreeze(deltaTime) {
        if (this.freezeTime > 0) {
            this.freezeTime -= deltaTime;
            
            // Create ice crystals while frozen
            if (Math.random() < 0.15 && this.engine && this.engine.renderSystem) {
                this.engine.renderSystem.createParticle({
                    x: this.position.x + Math.random() * this.size.x,
                    y: this.position.y + Math.random() * this.size.y,
                    velocityX: (Math.random() - 0.5) * 20,
                    velocityY: (Math.random() - 0.5) * 20,
                    life: 1.0,
                    size: 2,
                    color: '#87CEEB',
                    gravity: false
                });
            }
        } else {
            this.frozen = false;
            this.frozenTint = false;
            this.spikeDamage = true; // Restore spike damage
            if (this.originalVelocity) {
                this.velocity = { ...this.originalVelocity };
            }
        }
    }
    
    render(ctx, camera) {
        ctx.save();
        
        // Apply freeze tint if frozen
        if (this.frozenTint) {
            ctx.filter = 'brightness(0.8) saturate(0.5) hue-rotate(180deg)';
        } else {
            // Add slight red tint to show danger
            ctx.filter = 'brightness(1.1) saturate(1.2) hue-rotate(-10deg)';
        }
        
        super.render(ctx, camera);
        
        // Draw warning indicator when not frozen
        if (!this.frozen && this.engine && this.engine.renderSystem && this.engine.renderSystem.debugMode) {
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.6)';
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(
                this.position.x - camera.x - 4,
                this.position.y - camera.y - 4,
                this.size.x + 8,
                this.size.y + 8
            );
            ctx.setLineDash([]);
        }
        
        ctx.restore();
    }
    
    getDebugColor() {
        return this.frozen ? '#87CEEB' : '#AA0000';
    }
}