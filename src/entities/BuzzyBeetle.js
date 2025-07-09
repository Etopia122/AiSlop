// Buzzy Beetle enemy - Immune to fireballs, similar to Koopa but tougher
class BuzzyBeetle extends Enemy {
    constructor(x, y, engine) {
        super(x, y, 32, 32, engine);
        this.addTag('buzzy');
        this.addTag('enemy');
        
        // Buzzy Beetle properties
        this.walkSpeed = 40;
        this.shellSpeed = 150;
        this.state = 'walking'; // 'walking', 'shell', 'spinning'
        this.stunTime = 8.0; // How long it stays in shell form
        this.currentStunTime = 0;
        
        // Shell properties
        this.shellBounceForce = 200;
        this.spinKickForce = 300;
        
        // Immunity to fire
        this.fireImmune = true;
        
        // Visual effects
        this.shellSparkTimer = 0;
        this.shellSparkInterval = 0.1;
        
        this.velocity.x = this.facingRight ? this.walkSpeed : -this.walkSpeed;
        
        this.setupAnimations();
    }
    
    setupAnimations() {
        // Walking animation
        this.addAnimation('buzzy_walk', [
            { x: 0, y: 0, width: 32, height: 32 },
            { x: 32, y: 0, width: 32, height: 32 }
        ], 0.3, true);
        
        // Shell animation (stationary)
        this.addAnimation('buzzy_shell', [
            { x: 64, y: 0, width: 32, height: 24 }
        ], 0.1, true);
        
        // Spinning shell animation
        this.addAnimation('buzzy_spin', [
            { x: 64, y: 0, width: 32, height: 24 },
            { x: 96, y: 0, width: 32, height: 24 },
            { x: 128, y: 0, width: 32, height: 24 },
            { x: 160, y: 0, width: 32, height: 24 }
        ], 0.1, true);
        
        this.playAnimation('buzzy_walk');
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        
        // Handle freeze effect
        if (this.frozen) {
            this.updateFreeze(deltaTime);
            return;
        }
        
        switch (this.state) {
            case 'walking':
                this.updateWalking(deltaTime);
                break;
            case 'shell':
                this.updateShell(deltaTime);
                break;
            case 'spinning':
                this.updateSpinning(deltaTime);
                break;
        }
    }
    
    updateWalking(deltaTime) {
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
    }
    
    updateShell(deltaTime) {
        // Shell state - stationary and vulnerable to kicks
        this.velocity.x = 0;
        
        // Count down stun time
        this.currentStunTime -= deltaTime;
        
        // Flash when about to emerge
        if (this.currentStunTime <= 2.0) {
            this.blinkTimer += deltaTime;
            if (this.blinkTimer >= 0.2) {
                this.blinkVisible = !this.blinkVisible;
                this.blinkTimer = 0;
            }
        }
        
        // Return to walking state
        if (this.currentStunTime <= 0) {
            this.returnToWalking();
        }
    }
    
    updateSpinning(deltaTime) {
        // Spinning shell - moves fast and destroys enemies
        this.velocity.x = this.facingRight ? this.shellSpeed : -this.shellSpeed;
        
        // Create sparks while spinning
        this.shellSparkTimer += deltaTime;
        if (this.shellSparkTimer >= this.shellSparkInterval) {
            this.createShellSparks();
            this.shellSparkTimer = 0;
        }
        
        // Check for walls to bounce off
        if (this.grounded) {
            if ((this.velocity.x > 0 && this.checkWallRight()) || 
                (this.velocity.x < 0 && this.checkWallLeft())) {
                this.facingRight = !this.facingRight;
                this.velocity.x = this.facingRight ? this.shellSpeed : -this.shellSpeed;
                
                // Create wall bounce effect
                this.createWallBounceEffect();
            }
        }
    }
    
    createShellSparks() {
        if (!this.engine || !this.engine.renderSystem) return;
        
        // Create sparks trailing behind the shell
        for (let i = 0; i < 3; i++) {
            this.engine.renderSystem.createParticle({
                x: this.position.x + (this.facingRight ? 0 : this.size.x),
                y: this.position.y + this.size.y,
                velocityX: (this.facingRight ? -50 : 50) + (Math.random() - 0.5) * 40,
                velocityY: -30 + (Math.random() - 0.5) * 20,
                life: 0.5,
                size: 2,
                color: '#FFAA00',
                gravity: true
            });
        }
    }
    
    createWallBounceEffect() {
        if (!this.engine || !this.engine.renderSystem) return;
        
        // Create impact effect when bouncing off walls
        for (let i = 0; i < 8; i++) {
            const angle = this.facingRight ? Math.PI : 0;
            const spread = Math.PI / 3;
            const particleAngle = angle + (Math.random() - 0.5) * spread;
            const speed = 80 + Math.random() * 40;
            
            this.engine.renderSystem.createParticle({
                x: this.position.x + this.size.x / 2,
                y: this.position.y + this.size.y / 2,
                velocityX: Math.cos(particleAngle) * speed,
                velocityY: Math.sin(particleAngle) * speed,
                life: 0.6,
                size: 3,
                color: '#FFAA00',
                gravity: true
            });
        }
        
        // Play bounce sound
        if (this.engine && this.engine.audio) {
            this.engine.audio.playBounceSound();
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
            // Buzzy Beetles are immune to fireballs!
            this.deflectFireball(other);
        } else if (other.hasTag('iceball')) {
            // Can be frozen by ice
            this.freeze(3.0);
        } else if (other.hasTag('enemy') && this.state === 'spinning') {
            // Destroy other enemies when spinning
            this.destroyEnemy(other);
        }
    }
    
    handlePlayerCollision(player) {
        const playerTop = player.position.y + player.size.y;
        const beetleTop = this.position.y;
        
        if (playerTop <= beetleTop + 8 && player.velocity.y > 0) {
            // Player jumped on Buzzy Beetle
            this.getStomped(player);
        } else if (this.state === 'shell') {
            // Player kicks shell
            this.getKicked(player);
        } else if (this.state === 'spinning') {
            // Spinning shell hurts player
            if (player.takeDamage) {
                player.takeDamage(1);
            }
        } else {
            // Normal collision - hurt player
            if (player.takeDamage) {
                player.takeDamage(1);
            }
        }
    }
    
    getStomped(player) {
        if (this.state === 'walking') {
            // First stomp - become shell
            this.becomeShell();
            
            // Give player bounce
            player.velocity.y = -200;
            
            // Add score
            if (this.engine) {
                this.engine.addScore(200);
            }
        } else if (this.state === 'spinning') {
            // Stop spinning
            this.becomeShell();
            
            // Give player bounce
            player.velocity.y = -200;
        }
        
        // Play stomp sound
        if (this.engine && this.engine.audio) {
            this.engine.audio.playStompSound();
        }
    }
    
    getKicked(player) {
        // Shell gets kicked and starts spinning
        this.state = 'spinning';
        this.facingRight = player.position.x < this.position.x;
        this.velocity.x = this.facingRight ? this.shellSpeed : -this.shellSpeed;
        this.playAnimation('buzzy_spin');
        
        // Create kick effect
        this.createKickEffect();
        
        // Add score
        if (this.engine) {
            this.engine.addScore(300);
        }
        
        // Play kick sound
        if (this.engine && this.engine.audio) {
            this.engine.audio.playKickSound();
        }
    }
    
    becomeShell() {
        this.state = 'shell';
        this.currentStunTime = this.stunTime;
        this.size.y = 24; // Smaller when in shell
        this.position.y += 8; // Adjust position
        this.velocity.x = 0;
        this.blinkVisible = true;
        this.blinkTimer = 0;
        this.playAnimation('buzzy_shell');
        
        // Create shell transformation effect
        this.createShellEffect();
    }
    
    returnToWalking() {
        this.state = 'walking';
        this.size.y = 32; // Return to normal size
        this.position.y -= 8; // Adjust position back
        this.velocity.x = this.facingRight ? this.walkSpeed : -this.walkSpeed;
        this.blinkVisible = true;
        this.playAnimation('buzzy_walk');
        
        // Create emergence effect
        this.createEmergenceEffect();
    }
    
    deflectFireball(fireball) {
        // Buzzy Beetles deflect fireballs!
        if (fireball.velocity) {
            fireball.velocity.x = -fireball.velocity.x;
            fireball.velocity.y = -100; // Bounce upward
        }
        
        // Create deflection effect
        this.createDeflectionEffect();
        
        // Play deflection sound
        if (this.engine && this.engine.audio) {
            this.engine.audio.playDeflectSound();
        }
    }
    
    destroyEnemy(enemy) {
        if (enemy.die) {
            enemy.die();
        } else {
            enemy.destroy();
        }
        
        // Add score for destroying enemy
        if (this.engine) {
            this.engine.addScore(100);
        }
    }
    
    createShellEffect() {
        if (!this.engine || !this.engine.renderSystem) return;
        
        for (let i = 0; i < 10; i++) {
            const angle = (i / 10) * Math.PI * 2;
            const speed = 60 + Math.random() * 40;
            
            this.engine.renderSystem.createParticle({
                x: this.position.x + this.size.x / 2,
                y: this.position.y + this.size.y / 2,
                velocityX: Math.cos(angle) * speed,
                velocityY: Math.sin(angle) * speed,
                life: 0.8,
                size: 3,
                color: '#666666',
                gravity: true
            });
        }
    }
    
    createEmergenceEffect() {
        if (!this.engine || !this.engine.renderSystem) return;
        
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const speed = 50 + Math.random() * 30;
            
            this.engine.renderSystem.createParticle({
                x: this.position.x + this.size.x / 2,
                y: this.position.y + this.size.y / 2,
                velocityX: Math.cos(angle) * speed,
                velocityY: Math.sin(angle) * speed - 30,
                life: 0.6,
                size: 2,
                color: '#444444',
                gravity: true
            });
        }
    }
    
    createKickEffect() {
        if (!this.engine || !this.engine.renderSystem) return;
        
        for (let i = 0; i < 12; i++) {
            const angle = this.facingRight ? 0 : Math.PI;
            const spread = Math.PI / 2;
            const particleAngle = angle + (Math.random() - 0.5) * spread;
            const speed = 80 + Math.random() * 60;
            
            this.engine.renderSystem.createParticle({
                x: this.position.x + this.size.x / 2,
                y: this.position.y + this.size.y / 2,
                velocityX: Math.cos(particleAngle) * speed,
                velocityY: Math.sin(particleAngle) * speed,
                life: 0.7,
                size: 3,
                color: '#FFAA00',
                gravity: true
            });
        }
    }
    
    createDeflectionEffect() {
        if (!this.engine || !this.engine.renderSystem) return;
        
        for (let i = 0; i < 6; i++) {
            this.engine.renderSystem.createParticle({
                x: this.position.x + this.size.x / 2,
                y: this.position.y + this.size.y / 2,
                velocityX: (Math.random() - 0.5) * 100,
                velocityY: (Math.random() - 0.5) * 100,
                life: 0.5,
                size: 4,
                color: '#FFFFFF',
                gravity: false
            });
        }
    }
    
    freeze(duration) {
        this.frozen = true;
        this.freezeTime = duration;
        this.frozenTint = true;
        
        // Store original velocity
        this.originalVelocity = { ...this.velocity };
        this.velocity.x = 0;
        this.velocity.y = Math.min(this.velocity.y, 0);
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
            if (this.originalVelocity) {
                this.velocity = { ...this.originalVelocity };
            }
        }
    }
    
    render(ctx, camera) {
        // Skip rendering if blinking in shell state
        if (this.state === 'shell' && !this.blinkVisible) {
            return;
        }
        
        ctx.save();
        
        // Apply freeze tint if frozen
        if (this.frozenTint) {
            ctx.filter = 'brightness(0.8) saturate(0.5) hue-rotate(180deg)';
        }
        
        super.render(ctx, camera);
        
        ctx.restore();
    }
    
    getDebugColor() {
        switch (this.state) {
            case 'walking': return '#444444';
            case 'shell': return '#666666';
            case 'spinning': return '#FFAA00';
            default: return '#444444';
        }
    }
}