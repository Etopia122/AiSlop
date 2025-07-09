class Fireball extends GameObject {
    constructor(x, y, direction, engine) {
        super(x, y, 16, 16);
        
        this.engine = engine;
        this.addTag('fireball');
        this.addTag('projectile');
        
        // Fireball properties
        this.speed = 200;
        this.direction = direction ? 1 : -1;
        this.bounceHeight = 150;
        this.bounceCount = 0;
        this.maxBounces = 3;
        this.lifeTime = 5; // Seconds
        this.lifeTimer = 0;
        this.gravity = 400;
        
        // Physics
        this.mass = 0.2;
        this.drag = 0.98;
        this.solid = false;
        this.bounciness = 0.7;
        
        // Visual effects
        this.trailParticles = [];
        this.sparkTimer = 0;
        this.sparkInterval = 0.1;
        
        // Initialize
        this.velocity.x = this.direction * this.speed;
        this.velocity.y = -this.bounceHeight;
        this.facingRight = direction;
        
        this.setupAnimations();
    }

    setupAnimations() {
        this.addAnimation('fly', [
            { x: 0, y: 320, width: 16, height: 16 },
            { x: 16, y: 320, width: 16, height: 16 },
            { x: 32, y: 320, width: 16, height: 16 },
            { x: 48, y: 320, width: 16, height: 16 }
        ], 0.1, true);
        
        this.playAnimation('fly');
    }

    update(deltaTime) {
        super.update(deltaTime);
        
        // Update lifetime
        this.lifeTimer += deltaTime;
        if (this.lifeTimer >= this.lifeTime) {
            this.destroy();
            return;
        }
        
        // Apply gravity
        this.velocity.y += this.gravity * deltaTime;
        
        // Maintain horizontal speed
        this.velocity.x = this.direction * this.speed;
        
        // Handle ground bouncing
        if (this.grounded && this.velocity.y > 0) {
            this.handleBounce();
        }
        
        // Create trail effect
        this.createTrailEffect(deltaTime);
        
        // Update particles
        this.updateParticles(deltaTime);
        
        // Check for bounds
        this.checkBounds();
    }

    handleBounce() {
        this.bounceCount++;
        
        if (this.bounceCount >= this.maxBounces) {
            this.explode();
            return;
        }
        
        // Bounce up
        this.velocity.y = -this.bounceHeight;
        this.grounded = false;
        
        // Create bounce effect
        this.createBounceEffect();
    }

    createTrailEffect(deltaTime) {
        this.sparkTimer += deltaTime;
        
        if (this.sparkTimer >= this.sparkInterval) {
            this.sparkTimer = 0;
            
            // Add trail particle
            this.trailParticles.push({
                x: this.position.x + this.size.x / 2,
                y: this.position.y + this.size.y / 2,
                life: 0.3,
                maxLife: 0.3,
                size: 4,
                color: '#FF4500'
            });
            
            // Add to render system if available
            if (this.engine && this.engine.renderSystem) {
                this.engine.renderSystem.addParticle(
                    this.position.x + this.size.x / 2,
                    this.position.y + this.size.y / 2,
                    {
                        velocityX: (Math.random() - 0.5) * 50,
                        velocityY: (Math.random() - 0.5) * 50,
                        size: 3,
                        color: '#FF4500',
                        life: 0.3,
                        shape: 'circle'
                    }
                );
            }
        }
    }

    updateParticles(deltaTime) {
        this.trailParticles = this.trailParticles.filter(particle => {
            particle.life -= deltaTime;
            return particle.life > 0;
        });
    }

    createBounceEffect() {
        // Create bounce particles
        if (this.engine && this.engine.renderSystem) {
            for (let i = 0; i < 5; i++) {
                this.engine.renderSystem.addParticle(
                    this.position.x + this.size.x / 2,
                    this.position.y + this.size.y,
                    {
                        velocityX: (Math.random() - 0.5) * 100,
                        velocityY: -Math.random() * 100,
                        size: 2,
                        color: '#FFD700',
                        life: 0.5,
                        shape: 'circle'
                    }
                );
            }
        }
    }

    explode() {
        // Create explosion effect
        if (this.engine && this.engine.renderSystem) {
            this.engine.renderSystem.addEffect('explosion', this.position.x, this.position.y, {
                color: '#FF4500',
                size: 20,
                life: 0.5
            });
            
            // Create explosion particles
            for (let i = 0; i < 10; i++) {
                this.engine.renderSystem.addParticle(
                    this.position.x + this.size.x / 2,
                    this.position.y + this.size.y / 2,
                    {
                        velocityX: (Math.random() - 0.5) * 200,
                        velocityY: (Math.random() - 0.5) * 200,
                        size: 4,
                        color: '#FF4500',
                        life: 1.0,
                        shape: 'circle'
                    }
                );
            }
        }
        
        this.destroy();
    }

    checkBounds() {
        // Destroy if out of bounds
        if (this.position.x < -50 || this.position.x > 3250 || this.position.y > 650) {
            this.destroy();
        }
    }

    // Override collision handling
    onCollisionEnter(other) {
        if (other.hasTag('enemy')) {
            this.handleEnemyCollision(other);
        } else if (other.hasTag('block') && other.solid) {
            this.handleBlockCollision(other);
        }
    }

    handleEnemyCollision(enemy) {
        // Damage enemy
        enemy.takeDamage(1);
        
        // Explode
        this.explode();
    }

    handleBlockCollision(block) {
        // Explode on contact with solid blocks
        this.explode();
    }

    render(ctx, camera) {
        super.render(ctx, camera);
        
        // Render trail particles
        this.trailParticles.forEach(particle => {
            const alpha = particle.life / particle.maxLife;
            const screenX = particle.x - camera.x;
            const screenY = particle.y - camera.y;
            
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(screenX, screenY, particle.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }

    getDebugColor() {
        return '#FF4500';
    }
}