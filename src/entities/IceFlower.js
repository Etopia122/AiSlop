// Ice Flower Power-up - Grants ice shooting ability
class IceFlower extends PowerUp {
    constructor(x, y, engine) {
        super(x, y, engine);
        this.addTag('iceflower');
        this.addTag('powerup');
        
        // Ice flower properties
        this.pulseTimer = 0;
        this.pulseSpeed = 3;
        this.crystalTimer = 0;
        this.crystalInterval = 0.2;
        
        this.setupAnimations();
    }
    
    setupAnimations() {
        this.addAnimation('iceflower_idle', [
            { x: 0, y: 0, width: 32, height: 32 }
        ], 0.1, true);
        
        this.playAnimation('iceflower_idle');
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        
        // Pulsing effect
        this.pulseTimer += deltaTime * this.pulseSpeed;
        
        // Create ice crystals around the flower
        this.crystalTimer += deltaTime;
        if (this.crystalTimer >= this.crystalInterval) {
            this.createIceCrystal();
            this.crystalTimer = 0;
        }
        
        // Remove after some time if not collected
        this.lifetime -= deltaTime;
        if (this.lifetime <= 0) {
            this.destroy();
        }
    }
    
    createIceCrystal() {
        if (!this.engine || !this.engine.renderSystem) return;
        
        // Create floating ice crystals around the flower
        const angle = Math.random() * Math.PI * 2;
        const radius = 20 + Math.random() * 15;
        const x = this.position.x + this.size.x / 2 + Math.cos(angle) * radius;
        const y = this.position.y + this.size.y / 2 + Math.sin(angle) * radius;
        
        this.engine.renderSystem.createParticle({
            x: x,
            y: y,
            velocityX: Math.cos(angle) * 20,
            velocityY: Math.sin(angle) * 20 - 30,
            life: 1.5,
            size: 4,
            color: '#87CEEB',
            gravity: false,
            fadeOut: true
        });
    }
    
    onCollisionEnter(other) {
        if (other.hasTag('player')) {
            this.collectPowerUp(other);
        }
    }
    
    collectPowerUp(player) {
        // Grant ice power
        if (player.powerUp) {
            player.powerUp('ice');
        } else {
            // Fallback if powerUp method doesn't exist
            player.powerState = 'ice';
            player.updateAppearance();
        }
        
        // Add score
        if (this.engine) {
            this.engine.addScore(1000);
        }
        
        // Play power-up sound
        if (this.engine && this.engine.audio) {
            this.engine.audio.playPowerUpSound();
        }
        
        // Create collection effect
        this.createCollectionEffect();
        
        // Remove the flower
        this.destroy();
    }
    
    createCollectionEffect() {
        if (!this.engine || !this.engine.renderSystem) return;
        
        // Create ice burst effect
        for (let i = 0; i < 25; i++) {
            const angle = (i / 25) * Math.PI * 2;
            const speed = 120 + Math.random() * 80;
            
            this.engine.renderSystem.createParticle({
                x: this.position.x + this.size.x / 2,
                y: this.position.y + this.size.y / 2,
                velocityX: Math.cos(angle) * speed,
                velocityY: Math.sin(angle) * speed,
                life: 1.2,
                size: 3 + Math.random() * 3,
                color: i % 2 === 0 ? '#87CEEB' : '#B0E0E6',
                gravity: true
            });
        }
        
        // Create floating power-up text
        this.engine.renderSystem.createFloatingText({
            x: this.position.x + this.size.x / 2,
            y: this.position.y,
            text: 'ICE POWER!',
            color: '#87CEEB',
            fontSize: 14,
            velocity: { x: 0, y: -60 },
            life: 2.0
        });
    }
    
    render(ctx, camera) {
        ctx.save();
        
        // Apply ice-blue glow effect
        const pulseIntensity = (Math.sin(this.pulseTimer) + 1) * 0.5;
        ctx.shadowColor = '#87CEEB';
        ctx.shadowBlur = 8 + (pulseIntensity * 8);
        ctx.filter = `brightness(${1 + pulseIntensity * 0.3}) hue-rotate(200deg) saturate(1.3)`;
        
        super.render(ctx, camera);
        
        ctx.restore();
    }
    
    getDebugColor() {
        return '#87CEEB';
    }
}