class Player extends GameObject {
    constructor(x, y, engine) {
        super(x, y, 32, 32);
        
        this.engine = engine;
        this.addTag('player');
        
        // Mario-specific properties
        this.powerState = 'small'; // 'small', 'big', 'fire'
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
        
        // Ground detection
        this.groundCheckDistance = 4;
        
        // Initialize animations
        this.setupAnimations();
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
        }
        
        if (oldPowerState !== this.powerState) {
            this.updateAppearance();
            this.makeInvincible(1.0);
            
            // Update mobile fireball button visibility
            if (this.engine && this.engine.input) {
                this.engine.input.setFireballButtonVisible(this.powerState === 'fire');
            }
        }
    }

    takeDamage(amount = 1) {
        if (this.invincible) return;
        
        if (this.powerState === 'fire') {
            this.powerState = 'big';
            this.updateAppearance();
            this.makeInvincible(2.0);
            
            // Hide fireball button when losing fire power
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
        if (this.invincible && !this.blinkVisible) {
            return;
        }
        
        super.render(ctx, camera);
    }

    getDebugColor() {
        switch (this.powerState) {
            case 'small': return '#FF0000';
            case 'big': return '#00FF00';
            case 'fire': return '#FF6600';
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