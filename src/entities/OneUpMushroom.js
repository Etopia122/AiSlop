// 1-Up Mushroom Power-up - Grants extra life
class OneUpMushroom extends PowerUp {
    constructor(x, y, engine) {
        super(x, y, engine);
        this.addTag('oneup');
        this.addTag('powerup');
        
        // 1-Up mushroom properties
        this.moveSpeed = 80;
        this.floatAmplitude = 3;
        this.floatSpeed = 2;
        this.floatTimer = 0;
        this.originalY = y;
        
        // Green color and distinctive appearance
        this.glowTimer = 0;
        this.glowIntensity = 0;
        
        this.setupAnimations();
    }
    
    setupAnimations() {
        this.addAnimation('oneup_idle', [
            { x: 0, y: 0, width: 32, height: 32 }
        ], 0.1, true);
        
        this.playAnimation('oneup_idle');
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        
        // Horizontal movement
        this.velocity.x = this.facingRight ? this.moveSpeed : -this.moveSpeed;
        
        // Reverse direction when hitting walls or edges
        if (this.grounded) {
            if ((this.velocity.x > 0 && this.checkWallRight()) || 
                (this.velocity.x < 0 && this.checkWallLeft()) ||
                this.checkEdge()) {
                this.facingRight = !this.facingRight;
            }
        }
        
        // Gentle floating animation
        this.floatTimer += deltaTime * this.floatSpeed;
        const floatOffset = Math.sin(this.floatTimer) * this.floatAmplitude;
        this.position.y = this.originalY + floatOffset;
        
        // Update glow effect
        this.glowTimer += deltaTime * 3;
        this.glowIntensity = (Math.sin(this.glowTimer) + 1) * 0.5;
        
        // Remove after some time if not collected
        this.lifetime -= deltaTime;
        if (this.lifetime <= 0) {
            this.destroy();
        }
    }
    
    checkWallLeft() {
        if (!this.engine || !this.engine.gameObjects) return false;
        
        const testX = this.position.x - 5;
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
    
    checkWallRight() {
        if (!this.engine || !this.engine.gameObjects) return false;
        
        const testX = this.position.x + this.size.x + 5;
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
        
        return !foundGround; // True if there's an edge (no ground ahead)
    }
    
    onCollisionEnter(other) {
        if (other.hasTag('player')) {
            this.collectPowerUp(other);
        }
    }
    
    collectPowerUp(player) {
        // Grant extra life
        if (this.engine) {
            this.engine.addLife();
        }
        
        // Add score
        if (this.engine) {
            this.engine.addScore(1000);
        }
        
        // Play 1-up sound
        if (this.engine && this.engine.audio) {
            this.engine.audio.playOneUpSound();
        }
        
        // Create collection effect
        this.createCollectionEffect();
        
        // Remove the mushroom
        this.destroy();
    }
    
    createCollectionEffect() {
        if (!this.engine || !this.engine.renderSystem) return;
        
        // Create green sparkle effect
        for (let i = 0; i < 15; i++) {
            const angle = (i / 15) * Math.PI * 2;
            const speed = 100 + Math.random() * 50;
            
            this.engine.renderSystem.createParticle({
                x: this.position.x + this.size.x / 2,
                y: this.position.y + this.size.y / 2,
                velocityX: Math.cos(angle) * speed,
                velocityY: Math.sin(angle) * speed,
                life: 1.0,
                size: 3,
                color: '#00FF00',
                gravity: true
            });
        }
        
        // Create floating "1UP" text
        this.engine.renderSystem.createFloatingText({
            x: this.position.x + this.size.x / 2,
            y: this.position.y,
            text: '1UP',
            color: '#00FF00',
            fontSize: 16,
            velocity: { x: 0, y: -50 },
            life: 2.0
        });
    }
    
    render(ctx, camera) {
        ctx.save();
        
        // Apply green glow effect
        const glowAlpha = 0.3 + (this.glowIntensity * 0.4);
        ctx.shadowColor = '#00FF00';
        ctx.shadowBlur = 10 + (this.glowIntensity * 10);
        ctx.filter = `brightness(${1 + this.glowIntensity * 0.3}) saturate(1.5)`;
        
        super.render(ctx, camera);
        
        ctx.restore();
    }
    
    getDebugColor() {
        return '#00FF00';
    }
}