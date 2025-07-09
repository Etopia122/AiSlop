class Goomba extends Enemy {
    constructor(x, y, engine) {
        super(x, y, 32, 32, engine);
        
        this.walkingSpeed = 50;
        this.scoreValue = 100;
        this.squishDuration = 0.2;
        this.squished = false;
        
        this.setupAnimations();
        this.setupBehavior();
    }

    setupAnimations() {
        this.addAnimation('walk', [
            { x: 0, y: 160, width: 32, height: 32 },
            { x: 32, y: 160, width: 32, height: 32 }
        ], 0.5, true);
        
        this.addAnimation('squished', [
            { x: 64, y: 160, width: 32, height: 32 }
        ], 0.1, false);
        
        this.playAnimation('walk');
    }

    setupBehavior() {
        this.turnOnWall = true;
        this.turnOnEdge = true;
        this.canFallOffEdges = false;
        this.playerDetectionRange = 0; // Goombas don't actively chase
    }

    update(deltaTime) {
        super.update(deltaTime);
        
        if (this.squished) {
            this.velocity.x = 0;
            this.velocity.y = 0;
        }
    }

    onStomp(player) {
        if (!this.squished) {
            this.squish();
            
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
        }
    }

    squish() {
        this.squished = true;
        this.dying = true;
        this.deathTimer = 0;
        this.deathDuration = this.squishDuration;
        this.solid = false;
        this.velocity.x = 0;
        this.velocity.y = 0;
        this.size.y = 16;
        this.collider.height = 16;
        this.playAnimation('squished');
    }

    onPlayerTouch(player) {
        if (!this.squished) {
            super.onPlayerTouch(player);
        }
    }

    getDebugColor() {
        return this.squished ? '#654321' : '#8B4513';
    }
}