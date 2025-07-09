// Piranha Plant enemy - Emerges from pipes
class PiranhaPlant extends Enemy {
    constructor(x, y, engine) {
        super(x, y, 32, 48, engine);
        this.addTag('piranha');
        this.addTag('enemy');
        
        // Piranha Plant properties
        this.state = 'hidden'; // 'hidden', 'emerging', 'exposed', 'retreating'
        this.emergeHeight = 48;
        this.hiddenY = y + this.emergeHeight;
        this.exposedY = y;
        this.currentY = this.hiddenY;
        
        // Timing
        this.stateTimer = 0;
        this.hiddenTime = 2.0;
        this.exposedTime = 3.0;
        this.emergeSpeed = 60;
        this.retreatSpeed = 80;
        
        // Player detection
        this.detectionRange = 48;
        this.playerNearby = false;
        
        // Visual effects
        this.chomping = false;
        this.chompTimer = 0;
        this.chompInterval = 0.3;
        
        // Set initial position
        this.position.y = this.hiddenY;
        this.solid = false; // Can't be stood on
        
        this.setupAnimations();
    }
    
    setupAnimations() {
        this.addAnimation('piranha_closed', [
            { x: 0, y: 0, width: 32, height: 48 }
        ], 0.1, true);
        
        this.addAnimation('piranha_open', [
            { x: 32, y: 0, width: 32, height: 48 }
        ], 0.1, true);
        
        this.addAnimation('piranha_chomp', [
            { x: 0, y: 0, width: 32, height: 48 },
            { x: 32, y: 0, width: 32, height: 48 }
        ], 0.15, true);
        
        this.playAnimation('piranha_closed');
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        
        // Check for nearby player
        this.checkPlayerProximity();
        
        // Update state machine
        this.updateState(deltaTime);
        
        // Update position based on current state
        this.updatePosition(deltaTime);
        
        // Update chomping animation
        this.updateChomping(deltaTime);
        
        // Handle freeze effect if frozen
        if (this.frozen) {
            this.updateFreeze(deltaTime);
            return;
        }
    }
    
    checkPlayerProximity() {
        if (!this.engine || !this.engine.gameObjects) {
            this.playerNearby = false;
            return;
        }
        
        const player = this.engine.gameObjects.find(obj => obj.hasTag('player'));
        if (!player) {
            this.playerNearby = false;
            return;
        }
        
        const distance = Math.abs(player.position.x - this.position.x);
        this.playerNearby = distance <= this.detectionRange;
    }
    
    updateState(deltaTime) {
        this.stateTimer += deltaTime;
        
        switch (this.state) {
            case 'hidden':
                if (this.stateTimer >= this.hiddenTime && !this.playerNearby) {
                    this.state = 'emerging';
                    this.stateTimer = 0;
                }
                break;
                
            case 'emerging':
                if (this.currentY <= this.exposedY) {
                    this.state = 'exposed';
                    this.stateTimer = 0;
                    this.chomping = true;
                    this.playAnimation('piranha_chomp');
                }
                break;
                
            case 'exposed':
                if (this.stateTimer >= this.exposedTime || this.playerNearby) {
                    this.state = 'retreating';
                    this.stateTimer = 0;
                    this.chomping = false;
                    this.playAnimation('piranha_closed');
                }
                break;
                
            case 'retreating':
                if (this.currentY >= this.hiddenY) {
                    this.state = 'hidden';
                    this.stateTimer = 0;
                }
                break;
        }
    }
    
    updatePosition(deltaTime) {
        switch (this.state) {
            case 'emerging':
                this.currentY -= this.emergeSpeed * deltaTime;
                if (this.currentY < this.exposedY) {
                    this.currentY = this.exposedY;
                }
                break;
                
            case 'retreating':
                this.currentY += this.retreatSpeed * deltaTime;
                if (this.currentY > this.hiddenY) {
                    this.currentY = this.hiddenY;
                }
                break;
        }
        
        this.position.y = this.currentY;
    }
    
    updateChomping(deltaTime) {
        if (this.chomping) {
            this.chompTimer += deltaTime;
            if (this.chompTimer >= this.chompInterval) {
                // Play chomp sound occasionally
                if (Math.random() < 0.3 && this.engine && this.engine.audio) {
                    this.engine.audio.playEnemySound();
                }
                this.chompTimer = 0;
            }
        }
    }
    
    updateFreeze(deltaTime) {
        if (this.freezeTime > 0) {
            this.freezeTime -= deltaTime;
            
            // Create ice crystals while frozen
            if (Math.random() < 0.1 && this.engine && this.engine.renderSystem) {
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
        }
    }
    
    onCollisionEnter(other) {
        if (other.hasTag('player') && this.state === 'exposed') {
            // Only hurt player when fully exposed
            this.damagePlayer(other);
        } else if (other.hasTag('fireball') || other.hasTag('iceball')) {
            // Destroy the plant
            this.takeDamage(1);
        }
    }
    
    damagePlayer(player) {
        if (player.takeDamage) {
            player.takeDamage(1);
        }
        
        // Create bite effect
        this.createBiteEffect();
        
        // Play attack sound
        if (this.engine && this.engine.audio) {
            this.engine.audio.playEnemyAttackSound();
        }
    }
    
    createBiteEffect() {
        if (!this.engine || !this.engine.renderSystem) return;
        
        // Create chomp particles
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const speed = 80 + Math.random() * 40;
            
            this.engine.renderSystem.createParticle({
                x: this.position.x + this.size.x / 2,
                y: this.position.y + this.size.y / 2,
                velocityX: Math.cos(angle) * speed,
                velocityY: Math.sin(angle) * speed,
                life: 0.5,
                size: 3,
                color: '#FF0000',
                gravity: true
            });
        }
    }
    
    takeDamage(amount) {
        // Piranha plants are destroyed in one hit
        this.die();
    }
    
    die() {
        // Create death effect
        this.createDeathEffect();
        
        // Add score
        if (this.engine) {
            this.engine.addScore(400);
        }
        
        // Play death sound
        if (this.engine && this.engine.audio) {
            this.engine.audio.playEnemyDeathSound();
        }
        
        this.destroy();
    }
    
    createDeathEffect() {
        if (!this.engine || !this.engine.renderSystem) return;
        
        // Create plant destruction particles
        for (let i = 0; i < 15; i++) {
            const angle = (i / 15) * Math.PI * 2;
            const speed = 100 + Math.random() * 100;
            
            this.engine.renderSystem.createParticle({
                x: this.position.x + this.size.x / 2,
                y: this.position.y + this.size.y / 2,
                velocityX: Math.cos(angle) * speed,
                velocityY: Math.sin(angle) * speed - 50,
                life: 1.0,
                size: 4,
                color: i % 2 === 0 ? '#00AA00' : '#FFAA00',
                gravity: true
            });
        }
    }
    
    freeze(duration) {
        this.frozen = true;
        this.freezeTime = duration;
        this.frozenTint = true;
        
        // Stop movement while frozen
        this.originalState = this.state;
        this.state = 'frozen';
    }
    
    render(ctx, camera) {
        // Don't render if completely hidden
        if (this.state === 'hidden' && this.currentY >= this.hiddenY) {
            return;
        }
        
        ctx.save();
        
        // Apply freeze tint if frozen
        if (this.frozenTint) {
            ctx.filter = 'brightness(0.8) saturate(0.5) hue-rotate(180deg)';
        }
        
        super.render(ctx, camera);
        
        ctx.restore();
        
        // Debug: Draw detection range
        if (this.engine && this.engine.renderSystem && this.engine.renderSystem.debugMode) {
            ctx.save();
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(
                this.position.x + this.size.x / 2 - camera.x,
                this.position.y + this.size.y / 2 - camera.y,
                this.detectionRange,
                0,
                Math.PI * 2
            );
            ctx.stroke();
            ctx.restore();
        }
    }
    
    getDebugColor() {
        return this.state === 'exposed' ? '#FF0000' : '#AA0000';
    }
}