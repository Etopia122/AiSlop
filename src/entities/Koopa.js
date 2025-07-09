class Koopa extends Enemy {
    constructor(x, y, engine) {
        super(x, y, 32, 64, engine);
        
        this.walkingSpeed = 40;
        this.scoreValue = 200;
        this.shellSpeed = 300;
        this.inShell = false;
        this.spinning = false;
        this.shellTimer = 0;
        this.shellDuration = 10; // Shell state duration
        this.emergeTime = 2; // Time before emerging from shell
        this.emergeTimer = 0;
        this.blinkTimer = 0;
        this.blinkDuration = 0.2;
        this.shouldBlink = false;
        
        this.setupAnimations();
        this.setupBehavior();
    }

    setupAnimations() {
        // Walking animations
        this.addAnimation('walk', [
            { x: 0, y: 192, width: 32, height: 64 },
            { x: 32, y: 192, width: 32, height: 64 }
        ], 0.3, true);
        
        // Shell animations
        this.addAnimation('shell', [
            { x: 64, y: 192, width: 32, height: 32 }
        ], 0.1, false);
        
        this.addAnimation('shell_spin', [
            { x: 64, y: 192, width: 32, height: 32 },
            { x: 96, y: 192, width: 32, height: 32 }
        ], 0.1, true);
        
        // Emerging animation
        this.addAnimation('emerging', [
            { x: 64, y: 192, width: 32, height: 32 },
            { x: 128, y: 192, width: 32, height: 48 },
            { x: 0, y: 192, width: 32, height: 64 }
        ], 0.3, false);
        
        this.playAnimation('walk');
    }

    setupBehavior() {
        this.turnOnWall = true;
        this.turnOnEdge = true;
        this.canFallOffEdges = false;
        this.playerDetectionRange = 0;
    }

    update(deltaTime) {
        super.update(deltaTime);
        
        if (this.inShell) {
            this.updateShellState(deltaTime);
        }
        
        // Update blinking when about to emerge
        if (this.shouldBlink) {
            this.blinkTimer += deltaTime;
            if (this.blinkTimer >= this.blinkDuration) {
                this.blinkTimer = 0;
                this.visible = !this.visible;
            }
        }
    }

    updateShellState(deltaTime) {
        this.shellTimer += deltaTime;
        
        if (this.spinning) {
            // Spinning shell behavior
            this.velocity.x = this.direction * this.shellSpeed;
            
            // Check for wall collision to bounce
            if (this.shouldTurn()) {
                this.direction *= -1;
                this.facingRight = this.direction > 0;
            }
        } else {
            // Stationary shell
            this.velocity.x = 0;
            this.emergeTimer += deltaTime;
            
            // Start blinking before emerging
            if (this.emergeTimer >= this.emergeTime - 1) {
                this.shouldBlink = true;
            }
            
            // Emerge from shell
            if (this.emergeTimer >= this.emergeTime) {
                this.emergeFromShell();
            }
        }
    }

    enterShell() {
        this.inShell = true;
        this.spinning = false;
        this.shellTimer = 0;
        this.emergeTimer = 0;
        this.shouldBlink = false;
        this.visible = true;
        this.blinkTimer = 0;
        
        // Change size and collision
        this.size.y = 32;
        this.collider.height = 32;
        this.position.y += 32; // Adjust position
        
        // Add shell tag
        this.addTag('shell');
        
        this.playAnimation('shell');
    }

    emergeFromShell() {
        this.inShell = false;
        this.spinning = false;
        this.shouldBlink = false;
        this.visible = true;
        this.shellTimer = 0;
        this.emergeTimer = 0;
        this.blinkTimer = 0;
        
        // Restore size and collision
        this.size.y = 64;
        this.collider.height = 64;
        this.position.y -= 32; // Adjust position
        
        // Remove shell tag
        this.removeTag('shell');
        
        this.playAnimation('walk');
    }

    startSpinning(direction) {
        if (this.inShell) {
            this.spinning = true;
            this.direction = direction;
            this.facingRight = direction > 0;
            this.playAnimation('shell_spin');
            this.shellTimer = 0; // Reset shell timer
        }
    }

    stopSpinning() {
        if (this.spinning) {
            this.spinning = false;
            this.velocity.x = 0;
            this.playAnimation('shell');
        }
    }

    onStomp(player) {
        if (!this.inShell) {
            // First stomp - enter shell
            this.enterShell();
            
            // Give player a bounce
            player.velocity.y = -300;
            player.grounded = false;
            
            // Play sound and add score
            if (this.engine && this.engine.audio) {
                this.engine.audio.playEnemyDeathSound();
            }
            
            if (this.engine) {
                this.engine.addScore(this.scoreValue);
            }
        } else if (this.spinning) {
            // Stop spinning shell
            this.stopSpinning();
            
            // Give player a bounce
            player.velocity.y = -300;
            player.grounded = false;
            
            if (this.engine) {
                this.engine.addScore(this.scoreValue);
            }
        } else {
            // Kick shell in direction of player
            const kickDirection = player.position.x < this.position.x ? -1 : 1;
            this.startSpinning(kickDirection);
            
            // Give player a bounce
            player.velocity.y = -300;
            player.grounded = false;
            
            if (this.engine) {
                this.engine.addScore(this.scoreValue);
            }
        }
    }

    onPlayerTouch(player) {
        if (this.inShell && !this.spinning) {
            // Player can kick stationary shell
            const kickDirection = player.position.x < this.position.x ? -1 : 1;
            this.startSpinning(kickDirection);
            
            // Play sound and add score
            if (this.engine && this.engine.audio) {
                this.engine.audio.playEnemyDeathSound();
            }
            
            if (this.engine) {
                this.engine.addScore(this.scoreValue / 2);
            }
        } else if (this.spinning) {
            // Spinning shell damages player
            super.onPlayerTouch(player);
        } else {
            // Normal walking koopa
            super.onPlayerTouch(player);
        }
    }

    handleEnemyCollision(enemy) {
        if (this.spinning) {
            // Spinning shell kills other enemies
            enemy.takeDamage(1);
        } else {
            super.handleEnemyCollision(enemy);
        }
    }

    onStateChange(newState) {
        if (newState === 'walking' && !this.inShell) {
            this.playAnimation('walk');
        }
    }

    shouldTurn() {
        if (this.spinning) {
            // Check for wall collision
            const nextX = this.position.x + this.direction * this.size.x;
            if (nextX < 0 || nextX > 3200) {
                return true;
            }
        }
        
        return super.shouldTurn();
    }

    getDebugColor() {
        if (this.inShell) {
            return this.spinning ? '#228B22' : '#32CD32';
        }
        return '#006400';
    }
}