// Boo enemy - Ghost that follows Mario when not looking
class Boo extends Enemy {
    constructor(x, y, engine) {
        super(x, y, 32, 32, engine);
        this.addTag('boo');
        this.addTag('enemy');
        this.addTag('ghost');
        
        // Boo properties
        this.moveSpeed = 30;
        this.chaseSpeed = 60;
        this.state = 'hidden'; // 'hidden', 'following', 'shy'
        this.detectionRange = 120;
        this.shyDistance = 48;
        
        // Ghost properties
        this.solid = false; // Ghosts can pass through walls
        this.gravity = 0;   // Ghosts don't fall
        this.floatAmplitude = 8;
        this.floatSpeed = 2;
        this.floatTimer = 0;
        this.originalY = y;
        
        // Visual effects
        this.transparency = 0.8;
        this.pulseTimer = 0;
        this.pulseSpeed = 3;
        
        // Player tracking
        this.playerInRange = false;
        this.playerLookingAtBoo = false;
        this.lastPlayerDirection = 1;
        
        this.setupAnimations();
    }
    
    setupAnimations() {
        // Normal Boo animation
        this.addAnimation('boo_normal', [
            { x: 0, y: 0, width: 32, height: 32 },
            { x: 32, y: 0, width: 32, height: 32 }
        ], 0.5, true);
        
        // Shy Boo animation (when being looked at)
        this.addAnimation('boo_shy', [
            { x: 64, y: 0, width: 32, height: 32 }
        ], 0.1, true);
        
        // Aggressive Boo animation (when chasing)
        this.addAnimation('boo_chase', [
            { x: 96, y: 0, width: 32, height: 32 },
            { x: 128, y: 0, width: 32, height: 32 }
        ], 0.3, true);
        
        this.playAnimation('boo_normal');
    }
    
    update(deltaTime) {
        // Skip normal enemy update since ghosts don't use gravity
        GameObject.prototype.update.call(this, deltaTime);
        
        // Handle freeze effect
        if (this.frozen) {
            this.updateFreeze(deltaTime);
            return;
        }
        
        // Update floating animation
        this.floatTimer += deltaTime * this.floatSpeed;
        const floatOffset = Math.sin(this.floatTimer) * this.floatAmplitude;
        this.position.y = this.originalY + floatOffset;
        
        // Update pulse effect
        this.pulseTimer += deltaTime * this.pulseSpeed;
        
        // Check player status
        this.checkPlayerStatus();
        
        // Update AI behavior
        this.updateBehavior(deltaTime);
    }
    
    checkPlayerStatus() {
        if (!this.engine || !this.engine.gameObjects) {
            this.playerInRange = false;
            this.playerLookingAtBoo = false;
            return;
        }
        
        const player = this.engine.gameObjects.find(obj => obj.hasTag('player'));
        if (!player) {
            this.playerInRange = false;
            this.playerLookingAtBoo = false;
            return;
        }
        
        // Check if player is in range
        const distance = Math.sqrt(
            Math.pow(player.position.x - this.position.x, 2) +
            Math.pow(player.position.y - this.position.y, 2)
        );
        this.playerInRange = distance <= this.detectionRange;
        
        // Check if player is looking at Boo
        this.lastPlayerDirection = player.facingRight ? 1 : -1;
        const playerToBooDirX = this.position.x - player.position.x;
        
        // Player is looking at Boo if:
        // - Player faces right and Boo is to the right
        // - Player faces left and Boo is to the left
        // - Distance is close enough to be considered "looking at"
        this.playerLookingAtBoo = this.playerInRange && 
            distance <= this.shyDistance * 2 &&
            ((this.lastPlayerDirection > 0 && playerToBooDirX > 0) ||
             (this.lastPlayerDirection < 0 && playerToBooDirX < 0));
    }
    
    updateBehavior(deltaTime) {
        if (!this.playerInRange) {
            this.state = 'hidden';
            this.velocity.x = 0;
            this.velocity.y = 0;
            this.playAnimation('boo_normal');
            return;
        }
        
        if (this.playerLookingAtBoo) {
            // Player is looking - become shy
            this.state = 'shy';
            this.velocity.x = 0;
            this.velocity.y = 0;
            this.playAnimation('boo_shy');
            
            // Create shy effect
            if (Math.random() < 0.1) {
                this.createShyEffect();
            }
        } else {
            // Player not looking - chase them!
            this.state = 'following';
            this.chasePlayer();
            this.playAnimation('boo_chase');
        }
    }
    
    chasePlayer() {
        if (!this.engine || !this.engine.gameObjects) return;
        
        const player = this.engine.gameObjects.find(obj => obj.hasTag('player'));
        if (!player) return;
        
        // Move towards player
        const dirX = player.position.x - this.position.x;
        const dirY = player.position.y - this.position.y;
        const distance = Math.sqrt(dirX * dirX + dirY * dirY);
        
        if (distance > 0) {
            // Normalize direction and apply speed
            this.velocity.x = (dirX / distance) * this.chaseSpeed;
            this.velocity.y = (dirY / distance) * this.chaseSpeed;
            
            // Face the direction of movement
            this.facingRight = dirX > 0;
            
            // Create chase particles
            if (Math.random() < 0.3) {
                this.createChaseEffect();
            }
        }
    }
    
    createShyEffect() {
        if (!this.engine || !this.engine.renderSystem) return;
        
        // Create embarrassed particles
        for (let i = 0; i < 3; i++) {
            this.engine.renderSystem.createParticle({
                x: this.position.x + Math.random() * this.size.x,
                y: this.position.y + Math.random() * this.size.y,
                velocityX: (Math.random() - 0.5) * 40,
                velocityY: -20 - Math.random() * 20,
                life: 0.8,
                size: 2,
                color: '#FFB6C1',
                gravity: false,
                fadeOut: true
            });
        }
    }
    
    createChaseEffect() {
        if (!this.engine || !this.engine.renderSystem) return;
        
        // Create ghostly trail
        this.engine.renderSystem.createParticle({
            x: this.position.x + this.size.x / 2,
            y: this.position.y + this.size.y / 2,
            velocityX: -this.velocity.x * 0.5,
            velocityY: -this.velocity.y * 0.5,
            life: 1.0,
            size: this.size.x * 0.8,
            color: 'rgba(255, 255, 255, 0.3)',
            gravity: false,
            fadeOut: true,
            isCircle: true
        });
    }
    
    onCollisionEnter(other) {
        if (other.hasTag('player') && this.state === 'following') {
            // Only hurt player when actively chasing
            this.damagePlayer(other);
        } else if (other.hasTag('fireball')) {
            // Ghosts are immune to fireballs
            this.deflectFireball(other);
        } else if (other.hasTag('iceball')) {
            // Can be frozen by ice
            this.freeze(4.0);
        }
    }
    
    damagePlayer(player) {
        if (player.takeDamage) {
            player.takeDamage(1);
        }
        
        // Create spooky damage effect
        this.createSpookyDamageEffect();
        
        // Knock player away from Boo
        const dirX = player.position.x - this.position.x;
        const dirY = player.position.y - this.position.y;
        const distance = Math.sqrt(dirX * dirX + dirY * dirY);
        
        if (distance > 0) {
            const knockbackForce = 150;
            player.velocity.x = (dirX / distance) * knockbackForce;
            player.velocity.y = Math.min((dirY / distance) * knockbackForce, -50);
        }
        
        // Play spooky sound
        if (this.engine && this.engine.audio) {
            this.engine.audio.playSpookySound();
        }
        
        // Boo becomes shy after attacking
        this.state = 'shy';
        this.velocity.x = 0;
        this.velocity.y = 0;
        this.playAnimation('boo_shy');
    }
    
    createSpookyDamageEffect() {
        if (!this.engine || !this.engine.renderSystem) return;
        
        // Create ghostly damage effect
        for (let i = 0; i < 15; i++) {
            const angle = (i / 15) * Math.PI * 2;
            const speed = 60 + Math.random() * 40;
            
            this.engine.renderSystem.createParticle({
                x: this.position.x + this.size.x / 2,
                y: this.position.y + this.size.y / 2,
                velocityX: Math.cos(angle) * speed,
                velocityY: Math.sin(angle) * speed,
                life: 1.0,
                size: 4,
                color: i % 2 === 0 ? '#FFFFFF' : '#E0E0E0',
                gravity: false,
                fadeOut: true
            });
        }
        
        // Create screen flash effect
        this.engine.renderSystem.createParticle({
            x: this.position.x + this.size.x / 2,
            y: this.position.y + this.size.y / 2,
            velocityX: 0,
            velocityY: 0,
            life: 0.3,
            size: 100,
            color: 'rgba(255, 255, 255, 0.5)',
            gravity: false,
            fadeOut: true,
            isCircle: true
        });
    }
    
    deflectFireball(fireball) {
        // Ghosts are immune to fireballs - pass right through
        // Create ghostly interaction effect
        if (this.engine && this.engine.renderSystem) {
            for (let i = 0; i < 8; i++) {
                this.engine.renderSystem.createParticle({
                    x: fireball.position.x + fireball.size.x / 2,
                    y: fireball.position.y + fireball.size.y / 2,
                    velocityX: (Math.random() - 0.5) * 80,
                    velocityY: (Math.random() - 0.5) * 80,
                    life: 0.6,
                    size: 3,
                    color: '#DDDDDD',
                    gravity: false,
                    fadeOut: true
                });
            }
        }
        
        // Play deflection sound
        if (this.engine && this.engine.audio) {
            this.engine.audio.playGhostSound();
        }
    }
    
    freeze(duration) {
        this.frozen = true;
        this.freezeTime = duration;
        this.frozenTint = true;
        
        // Store original behavior
        this.originalState = this.state;
        this.state = 'frozen';
        this.velocity.x = 0;
        this.velocity.y = 0;
    }
    
    updateFreeze(deltaTime) {
        if (this.freezeTime > 0) {
            this.freezeTime -= deltaTime;
            
            // Create ice crystals while frozen
            if (Math.random() < 0.08 && this.engine && this.engine.renderSystem) {
                this.engine.renderSystem.createParticle({
                    x: this.position.x + Math.random() * this.size.x,
                    y: this.position.y + Math.random() * this.size.y,
                    velocityX: (Math.random() - 0.5) * 20,
                    velocityY: (Math.random() - 0.5) * 20,
                    life: 1.5,
                    size: 3,
                    color: '#87CEEB',
                    gravity: false,
                    fadeOut: true
                });
            }
        } else {
            this.frozen = false;
            this.frozenTint = false;
            this.state = this.originalState || 'hidden';
        }
    }
    
    render(ctx, camera) {
        // Don't render if hidden and player not in range
        if (this.state === 'hidden') {
            return;
        }
        
        ctx.save();
        
        // Apply transparency
        let alpha = this.transparency;
        
        // Pulse effect
        const pulse = (Math.sin(this.pulseTimer) + 1) * 0.1;
        alpha += pulse;
        
        // Apply freeze tint if frozen
        if (this.frozenTint) {
            ctx.filter = 'brightness(0.9) saturate(0.6) hue-rotate(180deg)';
            alpha *= 0.9;
        }
        
        // Make Boo more transparent when shy
        if (this.state === 'shy') {
            alpha *= 0.6;
        }
        
        ctx.globalAlpha = alpha;
        
        super.render(ctx, camera);
        
        // Draw detection range in debug mode
        if (this.engine && this.engine.renderSystem && this.engine.renderSystem.debugMode) {
            ctx.globalAlpha = 0.2;
            ctx.strokeStyle = this.playerInRange ? '#FF0000' : '#FFFF00';
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
            
            // Draw shy distance
            ctx.strokeStyle = '#00FFFF';
            ctx.beginPath();
            ctx.arc(
                this.position.x + this.size.x / 2 - camera.x,
                this.position.y + this.size.y / 2 - camera.y,
                this.shyDistance * 2,
                0,
                Math.PI * 2
            );
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    getDebugColor() {
        switch (this.state) {
            case 'hidden': return 'rgba(255, 255, 255, 0.3)';
            case 'shy': return 'rgba(255, 192, 203, 0.6)';
            case 'following': return 'rgba(255, 255, 255, 0.8)';
            case 'frozen': return 'rgba(135, 206, 235, 0.8)';
            default: return 'rgba(255, 255, 255, 0.5)';
        }
    }
}