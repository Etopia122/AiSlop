// Star Power-up - Grants temporary invincibility
class Star extends PowerUp {
    constructor(x, y, engine) {
        super(x, y, engine);
        this.addTag('star');
        this.addTag('powerup');
        
        // Star properties
        this.bounceHeight = 200;
        this.bounceSpeed = 300;
        this.sparkleTimer = 0;
        this.sparkleInterval = 0.1;
        this.colorPhase = 0;
        
        // Star movement
        this.velocity.y = -this.bounceHeight;
        this.velocity.x = this.facingRight ? this.bounceSpeed : -this.bounceSpeed;
        
        this.setupAnimations();
    }
    
    setupAnimations() {
        this.addAnimation('star_spin', [
            { x: 0, y: 0, width: 32, height: 32 },
            { x: 32, y: 0, width: 32, height: 32 },
            { x: 64, y: 0, width: 32, height: 32 },
            { x: 96, y: 0, width: 32, height: 32 }
        ], 0.1, true);
        
        this.playAnimation('star_spin');
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        
        // Star bounces around
        if (this.grounded && this.velocity.y >= 0) {
            this.velocity.y = -this.bounceHeight;
            
            // Play bounce sound
            if (this.engine && this.engine.audio) {
                this.engine.audio.playBounceSound();
            }
        }
        
        // Reverse direction when hitting walls
        if (this.velocity.x > 0 && this.checkWallRight()) {
            this.velocity.x = -this.bounceSpeed;
            this.facingRight = false;
        } else if (this.velocity.x < 0 && this.checkWallLeft()) {
            this.velocity.x = this.bounceSpeed;
            this.facingRight = true;
        }
        
        // Update sparkle effect
        this.sparkleTimer += deltaTime;
        this.colorPhase += deltaTime * 5;
        
        if (this.sparkleTimer >= this.sparkleInterval) {
            this.createSparkleEffect();
            this.sparkleTimer = 0;
        }
        
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
    
    createSparkleEffect() {
        if (!this.engine || !this.engine.renderSystem) return;
        
        // Create sparkle particles around the star
        for (let i = 0; i < 2; i++) {
            const offsetX = (Math.random() - 0.5) * this.size.x * 2;
            const offsetY = (Math.random() - 0.5) * this.size.y * 2;
            
            this.engine.renderSystem.createParticle({
                x: this.position.x + this.size.x / 2 + offsetX,
                y: this.position.y + this.size.y / 2 + offsetY,
                velocityX: (Math.random() - 0.5) * 100,
                velocityY: (Math.random() - 0.5) * 100,
                life: 0.5,
                size: 3,
                color: this.getSparkleColor(),
                gravity: false
            });
        }
    }
    
    getSparkleColor() {
        // Cycle through rainbow colors
        const colors = ['#FFD700', '#FF6B47', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
        const index = Math.floor(this.colorPhase) % colors.length;
        return colors[index];
    }
    
    onCollisionEnter(other) {
        if (other.hasTag('player')) {
            this.collectPowerUp(other);
        }
    }
    
    collectPowerUp(player) {
        // Grant invincibility
        if (player.makeInvincible) {
            player.makeInvincible(10.0); // 10 seconds of invincibility
            player.starPower = true;
            player.starTime = 10.0;
        }
        
        // Add score
        if (this.engine) {
            this.engine.addScore(1000);
        }
        
        // Play power-up sound
        if (this.engine && this.engine.audio) {
            this.engine.audio.playStarSound();
        }
        
        // Create collection effect
        this.createCollectionEffect();
        
        // Remove the star
        this.destroy();
    }
    
    createCollectionEffect() {
        if (!this.engine || !this.engine.renderSystem) return;
        
        // Create burst of star particles
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const speed = 150 + Math.random() * 100;
            
            this.engine.renderSystem.createParticle({
                x: this.position.x + this.size.x / 2,
                y: this.position.y + this.size.y / 2,
                velocityX: Math.cos(angle) * speed,
                velocityY: Math.sin(angle) * speed,
                life: 1.0,
                size: 4,
                color: this.getSparkleColor(),
                gravity: true
            });
        }
    }
    
    render(ctx, camera) {
        // Apply rainbow color effect
        ctx.save();
        
        const hue = (this.colorPhase * 60) % 360;
        ctx.filter = `hue-rotate(${hue}deg) brightness(1.2) saturate(1.5)`;
        
        super.render(ctx, camera);
        
        ctx.restore();
    }
    
    getDebugColor() {
        return '#FFD700';
    }
}