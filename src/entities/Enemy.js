class Enemy extends GameObject {
    constructor(x, y, width, height, engine) {
        super(x, y, width, height);
        
        this.engine = engine;
        this.addTag('enemy');
        
        // Enemy properties
        this.health = 1;
        this.maxHealth = 1;
        this.speed = 50;
        this.direction = -1; // -1 for left, 1 for right
        this.walkingSpeed = 50;
        this.solid = true;
        this.canFallOffEdges = false;
        this.turnOnWall = true;
        this.turnOnEdge = true;
        
        // AI properties
        this.aiState = 'walking';
        this.stateTimer = 0;
        this.playerDetectionRange = 100;
        this.attackRange = 32;
        
        // Death properties
        this.dying = false;
        this.deathTimer = 0;
        this.deathDuration = 0.5;
        this.scoreValue = 100;
        
        // Animation
        this.animationState = 'walk';
        
        // Physics
        this.mass = 1;
        this.drag = 0.9;
        this.maxVelocityX = 200;
        this.maxVelocityY = 600;
        
        this.setupBehavior();
    }

    setupBehavior() {
        // Override in subclasses
    }

    update(deltaTime) {
        super.update(deltaTime);
        
        if (this.dying) {
            this.updateDeath(deltaTime);
            return;
        }
        
        // Update AI
        this.updateAI(deltaTime);
        
        // Update movement
        this.updateMovement(deltaTime);
        
        // Update facing direction
        this.updateFacing();
        
        // Check for falling off world
        this.checkWorldBounds();
    }

    updateAI(deltaTime) {
        this.stateTimer += deltaTime;
        
        switch (this.aiState) {
            case 'walking':
                this.updateWalkingAI(deltaTime);
                break;
            case 'chasing':
                this.updateChasingAI(deltaTime);
                break;
            case 'attacking':
                this.updateAttackingAI(deltaTime);
                break;
            case 'stunned':
                this.updateStunnedAI(deltaTime);
                break;
        }
    }

    updateWalkingAI(deltaTime) {
        // Move in current direction
        this.velocity.x = this.direction * this.walkingSpeed;
        
        // Check for walls or edges
        if (this.shouldTurn()) {
            this.turn();
        }
        
        // Check for player
        const player = this.findPlayer();
        if (player && this.canSeePlayer(player)) {
            this.changeState('chasing');
        }
    }

    updateChasingAI(deltaTime) {
        const player = this.findPlayer();
        if (player) {
            // Move towards player
            const direction = Math.sign(player.position.x - this.position.x);
            this.velocity.x = direction * this.walkingSpeed * 1.5;
            this.direction = direction;
            
            // Check if close enough to attack
            const distance = Math.abs(player.position.x - this.position.x);
            if (distance <= this.attackRange) {
                this.changeState('attacking');
            }
            
            // Stop chasing if player is too far
            if (distance > this.playerDetectionRange * 2) {
                this.changeState('walking');
            }
        } else {
            this.changeState('walking');
        }
    }

    updateAttackingAI(deltaTime) {
        // Override in subclasses
        this.velocity.x = 0;
        
        if (this.stateTimer > 1.0) {
            this.changeState('walking');
        }
    }

    updateStunnedAI(deltaTime) {
        this.velocity.x = 0;
        
        if (this.stateTimer > 2.0) {
            this.changeState('walking');
        }
    }

    updateMovement(deltaTime) {
        // Apply basic physics
        this.velocity.x = Math.max(-this.maxVelocityX, Math.min(this.maxVelocityX, this.velocity.x));
        this.velocity.y = Math.max(-this.maxVelocityY, Math.min(this.maxVelocityY, this.velocity.y));
    }

    updateFacing() {
        this.facingRight = this.direction > 0;
    }

    updateDeath(deltaTime) {
        this.deathTimer += deltaTime;
        
        if (this.deathTimer >= this.deathDuration) {
            this.destroy();
        }
    }

    shouldTurn() {
        if (!this.turnOnWall && !this.turnOnEdge) return false;
        
        // Check for wall collision
        if (this.turnOnWall) {
            // Simple wall detection - this would be improved with proper collision detection
            const nextX = this.position.x + this.direction * this.size.x;
            // This is a simplified check - in a real implementation, you'd check against tiles
            if (nextX < 0 || nextX > 3200) {
                return true;
            }
        }
        
        // Check for edge
        if (this.turnOnEdge && !this.canFallOffEdges) {
            // Simple edge detection
            const groundCheckX = this.position.x + this.direction * this.size.x;
            const groundCheckY = this.position.y + this.size.y + 5;
            
            // This is a simplified check
            if (groundCheckY > 600) {
                return true;
            }
        }
        
        return false;
    }

    turn() {
        this.direction *= -1;
        this.facingRight = this.direction > 0;
    }

    changeState(newState) {
        this.aiState = newState;
        this.stateTimer = 0;
        this.onStateChange(newState);
    }

    onStateChange(newState) {
        // Override in subclasses
    }

    findPlayer() {
        if (this.engine) {
            return this.engine.findGameObjectByTag('player');
        }
        return null;
    }

    canSeePlayer(player) {
        const distance = Math.abs(player.position.x - this.position.x);
        return distance <= this.playerDetectionRange;
    }

    takeDamage(amount = 1) {
        if (this.dying) return;
        
        this.health -= amount;
        
        if (this.health <= 0) {
            this.die();
        } else {
            this.onDamage(amount);
        }
    }

    onDamage(amount) {
        // Override in subclasses
        this.changeState('stunned');
    }

    die() {
        this.dying = true;
        this.deathTimer = 0;
        this.solid = false;
        this.velocity.x = 0;
        this.velocity.y = -150; // Pop up slightly
        
        // Add score
        if (this.engine) {
            this.engine.addScore(this.scoreValue);
        }
        
        // Play death sound
        if (this.engine && this.engine.audio) {
            this.engine.audio.playEnemyDeathSound();
        }
        
        this.onDeath();
    }

    onDeath() {
        // Override in subclasses
    }

    checkWorldBounds() {
        // Remove if fallen off the world
        if (this.position.y > 700) {
            this.destroy();
        }
    }

    // Collision handling
    onCollisionEnter(other) {
        if (other.hasTag('player')) {
            this.handlePlayerCollision(other);
        } else if (other.hasTag('enemy')) {
            this.handleEnemyCollision(other);
        } else if (other.hasTag('projectile')) {
            this.handleProjectileCollision(other);
        }
    }

    handlePlayerCollision(player) {
        // Basic collision - override in subclasses
        if (player.velocity.y > 0 && player.position.y < this.position.y) {
            // Player is jumping on enemy
            this.onStomp(player);
        } else {
            // Player touches enemy
            this.onPlayerTouch(player);
        }
    }

    handleEnemyCollision(enemy) {
        // Simple enemy collision
        if (enemy !== this) {
            this.turn();
        }
    }

    handleProjectileCollision(projectile) {
        this.takeDamage(1);
        projectile.destroy();
    }

    onStomp(player) {
        // Default stomp behavior
        this.takeDamage(1);
        
        // Give player a bounce
        player.velocity.y = -300;
        player.grounded = false;
    }

    onPlayerTouch(player) {
        // Default touch behavior - damage player
        if (!player.invincible) {
            player.takeDamage(1);
        }
    }

    getDebugColor() {
        if (this.dying) return '#888888';
        
        switch (this.aiState) {
            case 'walking': return '#FF0000';
            case 'chasing': return '#FF6600';
            case 'attacking': return '#FF0000';
            case 'stunned': return '#FFFF00';
            default: return '#FF0000';
        }
    }
}