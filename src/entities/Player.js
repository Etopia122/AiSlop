class Player extends GameObject {
    constructor(x, y, engine) {
        super(x, y, 32, 32);
        
        this.engine = engine;
        this.addTag('player');
        
        // Mario-specific properties
        this.powerState = 'small'; // 'small', 'big', 'fire', 'ice'
        this.lives = 3;
        this.health = 1;
        this.maxHealth = 1;
        this.invincible = false;
        this.invincibilityTime = 0;
        this.canBreakBlocks = false;
        
        // Movement properties
        this.walkSpeed = 150;
        this.runSpeed = 250;
        this.jumpForce = 400;
        this.maxJumpTime = 0.25;
        this.jumpTime = 0;
        this.isJumping = false;
        this.canJump = true;
        this.coyoteTime = 0.1;
        this.coyoteTimer = 0;
        
        // Physics properties
        this.mass = 1;
        this.drag = 0.85;
        this.solid = true;
        this.maxVelocityX = 300;
        this.maxVelocityY = 600;
        
        // Animation state
        this.animationState = 'idle';
        this.blinkTimer = 0;
        this.blinkVisible = true;
        
        // Fire power properties
        this.fireballCooldown = 0;
        this.maxFireballs = 2;
        this.fireballs = [];
        
        // Ice power properties
        this.iceballCooldown = 0;
        this.maxIceballs = 2;
        this.iceballs = [];
        
        // Star power properties
        this.starPower = false;
        this.starTime = 0;
        
        // Ground detection
        this.groundCheckDistance = 4;
        
        // Initialize animations
        this.setupAnimations();
        this.setupSprites();
        this.updateAppearance();
    }

    setupAnimations() {
        // Small Mario animations
        this.addAnimation('small_idle', [
            { x: 0, y: 0, width: 32, height: 32 }
        ], 0.1, true);
        
        this.addAnimation('small_walk', [
            { x: 0, y: 0, width: 32, height: 32 },
            { x: 32, y: 0, width: 32, height: 32 },
            { x: 64, y: 0, width: 32, height: 32 }
        ], 0.15, true);
        
        this.addAnimation('small_jump', [
            { x: 96, y: 0, width: 32, height: 32 }
        ], 0.1, false);
        
        this.addAnimation('small_crouch', [
            { x: 128, y: 0, width: 32, height: 32 }
        ], 0.1, false);
        
        // Big Mario animations
        this.addAnimation('big_idle', [
            { x: 0, y: 32, width: 32, height: 64 }
        ], 0.1, true);
        
        this.addAnimation('big_walk', [
            { x: 0, y: 32, width: 32, height: 64 },
            { x: 32, y: 32, width: 32, height: 64 },
            { x: 64, y: 32, width: 32, height: 64 }
        ], 0.15, true);
        
        this.addAnimation('big_jump', [
            { x: 96, y: 32, width: 32, height: 64 }
        ], 0.1, false);
        
        this.addAnimation('big_crouch', [
            { x: 128, y: 32, width: 32, height: 64 }
        ], 0.1, false);
        
        // Fire Mario animations
        this.addAnimation('fire_idle', [
            { x: 0, y: 96, width: 32, height: 64 }
        ], 0.1, true);
        
        this.addAnimation('fire_walk', [
            { x: 0, y: 96, width: 32, height: 64 },
            { x: 32, y: 96, width: 32, height: 64 },
            { x: 64, y: 96, width: 32, height: 64 }
        ], 0.15, true);
        
        this.addAnimation('fire_jump', [
            { x: 96, y: 96, width: 32, height: 64 }
        ], 0.1, false);
        
        this.addAnimation('fire_crouch', [
            { x: 128, y: 96, width: 32, height: 64 }
        ], 0.1, false);
        
        // Ice Mario animations
        this.addAnimation('ice_idle', [
            { x: 0, y: 160, width: 32, height: 64 }
        ], 0.1, true);
        
        this.addAnimation('ice_walk', [
            { x: 0, y: 160, width: 32, height: 64 },
            { x: 32, y: 160, width: 32, height: 64 },
            { x: 64, y: 160, width: 32, height: 64 }
        ], 0.15, true);
        
        this.addAnimation('ice_jump', [
            { x: 96, y: 160, width: 32, height: 64 }
        ], 0.1, false);
        
        this.addAnimation('ice_crouch', [
            { x: 128, y: 160, width: 32, height: 64 }
        ], 0.1, false);
        
        // Transformation animations
        this.addAnimation('transform_grow', [
            { x: 0, y: 0, width: 32, height: 32 },
            { x: 0, y: 32, width: 32, height: 64 }
        ], 0.1, false);
        
        this.addAnimation('transform_shrink', [
            { x: 0, y: 32, width: 32, height: 64 },
            { x: 0, y: 0, width: 32, height: 32 }
        ], 0.1, false);
    }

    setupSprites() {
        // Set sprite sheet info
        this.setSpriteInfo('mario', 'mario_small_idle');
        
        // Small Mario animations
        this.addSpriteAnimation('small_idle', ['mario_small_idle'], 0.1, true);
        this.addSpriteAnimation('small_walk', ['mario_small_walk1', 'mario_small_walk2', 'mario_small_walk3'], 0.15, true);
        this.addSpriteAnimation('small_jump', ['mario_small_jump'], 0.1, false);
        this.addSpriteAnimation('small_crouch', ['mario_small_crouch'], 0.1, false);
        
        // Big Mario animations
        this.addSpriteAnimation('big_idle', ['mario_big_idle'], 0.1, true);
        this.addSpriteAnimation('big_walk', ['mario_big_walk1', 'mario_big_walk2', 'mario_big_walk3'], 0.15, true);
        this.addSpriteAnimation('big_jump', ['mario_big_jump'], 0.1, false);
        this.addSpriteAnimation('big_crouch', ['mario_big_crouch'], 0.1, false);
        
        // Fire Mario animations
        this.addSpriteAnimation('fire_idle', ['mario_fire_idle'], 0.1, true);
        this.addSpriteAnimation('fire_walk', ['mario_fire_walk1', 'mario_fire_walk2', 'mario_fire_walk3'], 0.15, true);
        this.addSpriteAnimation('fire_jump', ['mario_fire_jump'], 0.1, false);
        this.addSpriteAnimation('fire_crouch', ['mario_fire_crouch'], 0.1, false);
        
        // Ice Mario animations
        this.addSpriteAnimation('ice_idle', ['mario_ice_idle'], 0.1, true);
        this.addSpriteAnimation('ice_walk', ['mario_ice_walk1', 'mario_ice_walk2', 'mario_ice_walk3'], 0.15, true);
        this.addSpriteAnimation('ice_jump', ['mario_ice_jump'], 0.1, false);
        this.addSpriteAnimation('ice_crouch', ['mario_ice_crouch'], 0.1, false);
        
        // Transformation animations
        this.addSpriteAnimation('transform_grow', ['mario_small_idle', 'mario_big_idle'], 0.1, false);
        this.addSpriteAnimation('transform_shrink', ['mario_big_idle', 'mario_small_idle'], 0.1, false);
    }

    update(deltaTime) {
        super.update(deltaTime);
        
        // Handle input
        this.handleInput(deltaTime);
        
        // Update timers
        this.updateTimers(deltaTime);
        
        // Update animation state
        this.updateAnimationState();
        
        // Handle ground detection
        this.handleGroundDetection();
        
        // Update fireballs
        this.updateFireballs(deltaTime);
        
        // Clamp velocities
        this.clampVelocities();
        
        // Update camera target
        if (this.engine && this.engine.camera) {
            this.engine.camera.target = this;
        }
    }

    handleInput(deltaTime) {
        if (!this.engine || !this.engine.input) return;
        
        const input = this.engine.input;
        const physics = this.engine.physics;
        
        // Horizontal movement
        const horizontalInput = input.getHorizontalInput();
        const isRunning = input.isRunPressed();
        const speed = isRunning ? this.runSpeed : this.walkSpeed;
        
        if (horizontalInput !== 0) {
            physics.applyHorizontalMovement(this, horizontalInput, speed, deltaTime);
        }
        
        // Jumping
        if (input.isJumpJustPressed()) {
            this.startJump();
        }
        
        if (input.isJumpPressed() && this.isJumping) {
            this.continueJump(deltaTime);
        }
        
        if (input.wasReleased('jump')) {
            this.endJump();
        }
        
        // Crouching (only for big Mario)
        if (input.isCrouchPressed() && this.powerState !== 'small') {
            this.animationState = 'crouch';
            this.velocity.x *= 0.5; // Slow down when crouching
        }
        
        // Fire shooting
        if (input.isFireJustPressed() && this.powerState === 'fire') {
            this.shootFireball();
        }
        
        // Ice shooting
        if (input.isFireJustPressed() && this.powerState === 'ice') {
            this.shootIceball();
        }
    }

    updateTimers(deltaTime) {
        // Invincibility timer
        if (this.invincibilityTime > 0) {
            this.invincibilityTime -= deltaTime;
            this.blinkTimer += deltaTime;
            
            if (this.blinkTimer >= 0.1) {
                this.blinkVisible = !this.blinkVisible;
                this.blinkTimer = 0;
            }
            
            if (this.invincibilityTime <= 0) {
                this.invincible = false;
                this.blinkVisible = true;
            }
        }
        
        // Jump timer
        if (this.isJumping) {
            this.jumpTime += deltaTime;
            if (this.jumpTime >= this.maxJumpTime) {
                this.endJump();
            }
        }
        
        // Coyote time
        if (this.coyoteTimer > 0) {
            this.coyoteTimer -= deltaTime;
        }
        
        // Fireball cooldown
        if (this.fireballCooldown > 0) {
            this.fireballCooldown -= deltaTime;
        }
        
        // Iceball cooldown
        if (this.iceballCooldown > 0) {
            this.iceballCooldown -= deltaTime;
        }
        
        // Star power timer
        if (this.starTime > 0) {
            this.starTime -= deltaTime;
            if (this.starTime <= 0) {
                this.starPower = false;
                this.invincible = false;
            }
        }
    }

    updateAnimationState() {
        let newState = 'idle';
        
        if (this.engine && this.engine.input) {
            const input = this.engine.input;
            
            if (input.isCrouchPressed() && this.powerState !== 'small') {
                newState = 'crouch';
            } else if (!this.grounded) {
                newState = 'jump';
            } else if (Math.abs(this.velocity.x) > 10) {
                newState = 'walk';
            }
        }
        
        if (newState !== this.animationState) {
            this.animationState = newState;
            this.playAnimation(`${this.powerState}_${newState}`);
        }
    }

    handleGroundDetection() {
        if (!this.grounded && this.velocity.y > 0) {
            this.coyoteTimer = this.coyoteTime;
        }
        
        if (this.grounded) {
            this.canJump = true;
            this.isJumping = false;
            this.jumpTime = 0;
        }
    }

    updateFireballs(deltaTime) {
        // Update existing fireballs
        this.fireballs = this.fireballs.filter(fireball => {
            fireball.update(deltaTime);
            return fireball.active;
        });
        
        // Update existing iceballs
        this.iceballs = this.iceballs.filter(iceball => {
            iceball.update(deltaTime);
            return iceball.active;
        });
    }

    clampVelocities() {
        // Clamp horizontal velocity
        if (Math.abs(this.velocity.x) > this.maxVelocityX) {
            this.velocity.x = Math.sign(this.velocity.x) * this.maxVelocityX;
        }
        
        // Clamp vertical velocity
        if (Math.abs(this.velocity.y) > this.maxVelocityY) {
            this.velocity.y = Math.sign(this.velocity.y) * this.maxVelocityY;
        }
    }

    startJump() {
        if (this.canJump || this.coyoteTimer > 0) {
            this.velocity.y = -this.jumpForce;
            this.isJumping = true;
            this.jumpTime = 0;
            this.grounded = false;
            this.canJump = false;
            this.coyoteTimer = 0;
            
            // Play jump sound
            if (this.engine && this.engine.audio) {
                this.engine.audio.playJumpSound();
            }
        }
    }

    continueJump(deltaTime) {
        if (this.isJumping) {
            // Apply additional upward force for variable jump height
            const jumpForce = this.jumpForce * 0.5 * (1 - this.jumpTime / this.maxJumpTime);
            this.velocity.y -= jumpForce * deltaTime;
        }
    }

    endJump() {
        this.isJumping = false;
        this.jumpTime = 0;
        
        // If moving upward, reduce velocity for more responsive jumping
        if (this.velocity.y < 0) {
            this.velocity.y *= 0.5;
        }
    }

    shootFireball() {
        if (this.fireballCooldown <= 0 && this.fireballs.length < this.maxFireballs) {
            const fireball = new Fireball(
                this.position.x + (this.facingRight ? this.size.x : 0),
                this.position.y + this.size.y / 2,
                this.facingRight,
                this.engine
            );
            
            this.fireballs.push(fireball);
            if (this.engine) {
                this.engine.addGameObject(fireball);
            }
            
            this.fireballCooldown = 0.3;
            
            // Play fireball sound
            if (this.engine && this.engine.audio) {
                this.engine.audio.playFireballSound();
            }
        }
    }
    
    shootIceball() {
        if (this.iceballCooldown <= 0 && this.iceballs.length < this.maxIceballs) {
            const iceball = new Iceball(
                this.position.x + (this.facingRight ? this.size.x : 0),
                this.position.y + this.size.y / 2,
                this.facingRight,
                this.engine
            );
            
            this.iceballs.push(iceball);
            if (this.engine) {
                this.engine.addGameObject(iceball);
            }
            
            this.iceballCooldown = 0.3;
            
            // Play iceball sound
            if (this.engine && this.engine.audio) {
                this.engine.audio.playIceballSound();
            }
        }
    }

    powerUp(powerType) {
        const oldPowerState = this.powerState;
        
        switch (powerType) {
            case 'big':
                if (this.powerState === 'small') {
                    this.powerState = 'big';
                    this.size.y = 64;
                    this.collider.height = 64;
                    this.position.y -= 32; // Adjust position to keep feet on ground
                    this.canBreakBlocks = true;
                    this.playAnimation('transform_grow');
                } else {
                    // Already big, just add score
                    if (this.engine) {
                        this.engine.addScore(1000);
                    }
                }
                break;
                
            case 'fire':
                if (this.powerState === 'small') {
                    // First become big, then fire
                    this.powerUp('big');
                    setTimeout(() => {
                        this.powerState = 'fire';
                        this.updateAppearance();
                    }, 500);
                } else {
                    this.powerState = 'fire';
                } 
                break;
                
            case 'ice':
                if (this.powerState === 'small') {
                    // First become big, then ice
                    this.powerUp('big');
                    setTimeout(() => {
                        this.powerState = 'ice';
                        this.updateAppearance();
                    }, 500);
                } else {
                    this.powerState = 'ice';
                } 
                break;
        }
        
        if (oldPowerState !== this.powerState) {
            this.updateAppearance();
            this.makeInvincible(1.0);
            
            // Update mobile fireball button visibility (show for fire or ice)
            if (this.engine && this.engine.input) {
                this.engine.input.setFireballButtonVisible(this.powerState === 'fire' || this.powerState === 'ice');
            }
        }
    }

    takeDamage(amount = 1) {
        if (this.invincible) return;
        
        if (this.powerState === 'fire' || this.powerState === 'ice') {
            this.powerState = 'big';
            this.updateAppearance();
            this.makeInvincible(2.0);
            
            // Hide fireball button when losing special power
            if (this.engine && this.engine.input) {
                this.engine.input.setFireballButtonVisible(false);
            }
        } else if (this.powerState === 'big') {
            this.powerState = 'small';
            this.size.y = 32;
            this.collider.height = 32;
            this.position.y += 32;
            this.canBreakBlocks = false;
            this.updateAppearance();
            this.makeInvincible(2.0);
        } else {
            // Small Mario dies
            this.die();
        }
        
        // Play damage sound
        if (this.engine && this.engine.audio) {
            this.engine.audio.playPlayerDeathSound();
        }
    }

    makeInvincible(duration) {
        this.invincible = true;
        this.invincibilityTime = duration;
        this.blinkTimer = 0;
        this.blinkVisible = true;
    }
    
    makeStarInvincible(duration) {
        this.invincible = true;
        this.starPower = true;
        this.starTime = duration;
        this.blinkTimer = 0;
        this.blinkVisible = true;
    }

    die() {
        this.lives--;
        
        if (this.engine) {
            this.engine.loseLife();
        }
        
        // Death animation
        this.velocity.x = 0;
        this.velocity.y = -200;
        this.solid = false;
        
        // Remove from collision detection
        this.removeTag('player');
        
        // Respawn after delay
        setTimeout(() => {
            this.respawn();
        }, 2000);
    }

    respawn() {
        this.powerState = 'small';
        this.size.y = 32;
        this.collider.height = 32;
        this.canBreakBlocks = false;
        this.solid = true;
        this.addTag('player');
        this.updateAppearance();
        
        // Hide fireball button when respawning as small Mario
        if (this.engine && this.engine.input) {
            this.engine.input.setFireballButtonVisible(false);
        }
        
        // Reset position to checkpoint or level start
        this.position.x = 100;
        this.position.y = 400;
        this.velocity = Vector2.zero();
        this.grounded = false;
        
        this.makeInvincible(3.0);
    }

    updateAppearance() {
        // Update collider based on power state
        if (this.powerState === 'small') {
            this.collider.height = 32;
            this.size.y = 32;
        } else {
            this.collider.height = 64;
            this.size.y = 64;
        }
        
        // Play appropriate animation
        this.playAnimation(`${this.powerState}_idle`);
    }

    render(ctx, camera) {
        // Skip rendering if blinking during invincibility
        if (this.invincible && !this.blinkVisible && !this.starPower) {
            return;
        }
        
        ctx.save();
        
        // Apply star power rainbow effect
        if (this.starPower) {
            const time = Date.now() * 0.01;
            const hue = (time * 60) % 360;
            ctx.filter = `hue-rotate(${hue}deg) brightness(1.3) saturate(1.5)`;
            
            // Create star sparkles
            if (Math.random() < 0.3 && this.engine && this.engine.renderSystem) {
                this.engine.renderSystem.createParticle({
                    x: this.position.x + Math.random() * this.size.x,
                    y: this.position.y + Math.random() * this.size.y,
                    velocityX: (Math.random() - 0.5) * 50,
                    velocityY: (Math.random() - 0.5) * 50,
                    life: 0.5,
                    size: 3,
                    color: '#FFD700',
                    gravity: false,
                    fadeOut: true
                });
            }
        }
        
        super.render(ctx, camera);
        
        ctx.restore();
    }

    getDebugColor() {
        switch (this.powerState) {
            case 'small': return '#FF0000';
            case 'big': return '#00FF00';
            case 'fire': return '#FF6600';
            case 'ice': return '#87CEEB';
            default: return '#FF0000';
        }
    }

    // Mario-specific collision handlers
    onCollisionEnter(other) {
        if (other.hasTag('enemy')) {
            this.handleEnemyCollision(other);
        } else if (other.hasTag('powerup')) {
            this.handlePowerUpCollision(other);
        } else if (other.hasTag('coin')) {
            this.handleCoinCollision(other);
        }
    }

    handleEnemyCollision(enemy) {
        // This is handled by the collision system
        // But we can add specific player responses here
    }

    handlePowerUpCollision(powerup) {
        // This is handled by the collision system
        // But we can add specific player responses here
    }

    handleCoinCollision(coin) {
        // This is handled by the collision system
        // But we can add specific player responses here
    }

    // Save/Load state for checkpoints
    saveState() {
        return {
            powerState: this.powerState,
            lives: this.lives,
            position: this.position.copy(),
            facingRight: this.facingRight
        };
    }

    loadState(state) {
        this.powerState = state.powerState;
        this.lives = state.lives;
        this.position = state.position.copy();
        this.facingRight = state.facingRight;
        this.updateAppearance();
    }
}