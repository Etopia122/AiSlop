// Iceball projectile for Ice Mario
class Iceball extends GameObject {
    constructor(x, y, direction, engine) {
        super(x, y, 16, 16);
        this.addTag('iceball');
        this.addTag('projectile');
        
        this.engine = engine;
        this.direction = direction; // true for right, false for left
        this.speed = 250;
        this.bounceCount = 0;
        this.maxBounces = 3;
        this.lifetime = 8.0;
        
        // Ice properties
        this.freezeRadius = 32;
        this.freezeDuration = 3.0;
        this.trailTimer = 0;
        this.trailInterval = 0.05;
        
        // Physics
        this.velocity.x = this.direction ? this.speed : -this.speed;
        this.velocity.y = 0;
        this.gravity = 400;
        this.bounceVelocity = -200;
        
        this.setupAnimations();
        
        // Play ice sound
        if (this.engine && this.engine.audio) {
            this.engine.audio.playIceballSound();
        }
    }
    
    setupAnimations() {
        this.addAnimation('iceball_spin', [
            { x: 0, y: 0, width: 16, height: 16 },
            { x: 16, y: 0, width: 16, height: 16 },
            { x: 32, y: 0, width: 16, height: 16 },
            { x: 48, y: 0, width: 16, height: 16 }
        ], 0.1, true);
        
        this.playAnimation('iceball_spin');
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        
        // Apply gravity
        this.velocity.y += this.gravity * deltaTime;
        
        // Create ice trail
        this.trailTimer += deltaTime;
        if (this.trailTimer >= this.trailInterval) {
            this.createIceTrail();
            this.trailTimer = 0;
        }
        
        // Decrease lifetime
        this.lifetime -= deltaTime;
        if (this.lifetime <= 0) {
            this.explode();
            return;
        }
        
        // Check for ground collision
        if (this.grounded && this.velocity.y > 0) {
            this.bounce();
        }
    }
    
    createIceTrail() {
        if (!this.engine || !this.engine.renderSystem) return;
        
        // Create ice crystal trail particles
        for (let i = 0; i < 2; i++) {
            this.engine.renderSystem.createParticle({
                x: this.position.x + this.size.x / 2 + (Math.random() - 0.5) * 8,
                y: this.position.y + this.size.y / 2 + (Math.random() - 0.5) * 8,
                velocityX: (Math.random() - 0.5) * 50,
                velocityY: (Math.random() - 0.5) * 50,
                life: 0.8,
                size: 3,
                color: '#B0E0E6',
                gravity: false,
                fadeOut: true
            });
        }
    }
    
    bounce() {
        if (this.bounceCount >= this.maxBounces) {
            this.explode();
            return;
        }
        
        this.velocity.y = this.bounceVelocity;
        this.bounceCount++;
        
        // Create bounce effect
        this.createBounceEffect();
        
        // Play bounce sound
        if (this.engine && this.engine.audio) {
            this.engine.audio.playBounceSound();
        }
    }
    
    createBounceEffect() {
        if (!this.engine || !this.engine.renderSystem) return;
        
        // Create ice shards on bounce
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const speed = 80 + Math.random() * 40;
            
            this.engine.renderSystem.createParticle({
                x: this.position.x + this.size.x / 2,
                y: this.position.y + this.size.y,
                velocityX: Math.cos(angle) * speed,
                velocityY: Math.sin(angle) * speed - 50,
                life: 0.6,
                size: 2 + Math.random() * 2,
                color: '#87CEEB',
                gravity: true
            });
        }
    }
    
    explode() {
        this.createExplosionEffect();
        this.freezeNearbyEnemies();
        
        // Play explosion sound
        if (this.engine && this.engine.audio) {
            this.engine.audio.playIceExplodeSound();
        }
        
        this.destroy();
    }
    
    createExplosionEffect() {
        if (!this.engine || !this.engine.renderSystem) return;
        
        // Create ice explosion
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const speed = 100 + Math.random() * 100;
            
            this.engine.renderSystem.createParticle({
                x: this.position.x + this.size.x / 2,
                y: this.position.y + this.size.y / 2,
                velocityX: Math.cos(angle) * speed,
                velocityY: Math.sin(angle) * speed,
                life: 1.0,
                size: 3 + Math.random() * 4,
                color: i % 3 === 0 ? '#87CEEB' : (i % 3 === 1 ? '#B0E0E6' : '#FFFFFF'),
                gravity: true
            });
        }
        
        // Create freeze radius indicator
        this.engine.renderSystem.createParticle({
            x: this.position.x + this.size.x / 2,
            y: this.position.y + this.size.y / 2,
            velocityX: 0,
            velocityY: 0,
            life: 0.3,
            size: this.freezeRadius * 2,
            color: 'rgba(135, 206, 235, 0.3)',
            gravity: false,
            fadeOut: true,
            isCircle: true
        });
    }
    
    freezeNearbyEnemies() {
        if (!this.engine || !this.engine.gameObjects) return;
        
        const centerX = this.position.x + this.size.x / 2;
        const centerY = this.position.y + this.size.y / 2;
        
        for (const obj of this.engine.gameObjects) {
            if (obj.hasTag('enemy')) {
                const distance = Math.sqrt(
                    Math.pow(obj.position.x + obj.size.x / 2 - centerX, 2) +
                    Math.pow(obj.position.y + obj.size.y / 2 - centerY, 2)
                );
                
                if (distance <= this.freezeRadius) {
                    this.freezeEnemy(obj);
                }
            }
        }
    }
    
    freezeEnemy(enemy) {
        if (!enemy.freeze) {
            // Add freeze capability to enemy if it doesn't have it
            enemy.frozen = true;
            enemy.freezeTime = this.freezeDuration;
            enemy.originalVelocity = { ...enemy.velocity };
            enemy.velocity.x = 0;
            enemy.velocity.y = Math.min(enemy.velocity.y, 0); // Don't stop falling
            
            // Visual freeze effect
            enemy.frozenTint = true;
            
            // Create freeze effect around enemy
            if (this.engine && this.engine.renderSystem) {
                for (let i = 0; i < 10; i++) {
                    const angle = (i / 10) * Math.PI * 2;
                    const radius = 20;
                    
                    this.engine.renderSystem.createParticle({
                        x: enemy.position.x + enemy.size.x / 2 + Math.cos(angle) * radius,
                        y: enemy.position.y + enemy.size.y / 2 + Math.sin(angle) * radius,
                        velocityX: Math.cos(angle) * 30,
                        velocityY: Math.sin(angle) * 30,
                        life: 1.0,
                        size: 3,
                        color: '#87CEEB',
                        gravity: false
                    });
                }
            }
        } else {
            // Use existing freeze method if available
            enemy.freeze(this.freezeDuration);
        }
        
        // Add score for freezing enemy
        if (this.engine) {
            this.engine.addScore(100);
        }
    }
    
    onCollisionEnter(other) {
        if (other.hasTag('enemy')) {
            // Freeze enemy on direct hit
            this.freezeEnemy(other);
            this.explode();
        } else if (other.hasTag('static') && !other.hasTag('platform')) {
            // Hit wall - explode
            this.explode();
        }
    }
    
    render(ctx, camera) {
        ctx.save();
        
        // Apply ice glow effect
        ctx.shadowColor = '#87CEEB';
        ctx.shadowBlur = 6;
        ctx.filter = 'brightness(1.2) saturate(1.3)';
        
        super.render(ctx, camera);
        
        ctx.restore();
    }
    
    getDebugColor() {
        return '#87CEEB';
    }
}