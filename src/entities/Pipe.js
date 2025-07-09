class Pipe extends GameObject {
    constructor(x, y, height, engine) {
        super(x, y, 64, height || 68);
        
        this.engine = engine;
        this.addTag('pipe');
        this.addTag('static');
        
        // Pipe properties
        this.type = 'normal'; // 'normal', 'entrance', 'exit'
        this.destination = null; // For warp pipes
        this.canWarp = false;
        this.warpCooldown = 0;
        this.warpDelay = 1.0;
        
        // Physics
        this.solid = true;
        this.mass = 1000;
        this.drag = 0;
        
        // Visual
        this.color = '#00AA00';
        this.darkColor = '#008800';
        
        this.setupAnimations();
    }

    setupAnimations() {
        // Simple pipe animation (could be enhanced with sprites)
        this.addAnimation('idle', [
            { x: 0, y: 416, width: 64, height: 68 }
        ], 0.1, true);
        
        this.playAnimation('idle');
    }

    update(deltaTime) {
        super.update(deltaTime);
        
        // Update warp cooldown
        if (this.warpCooldown > 0) {
            this.warpCooldown -= deltaTime;
        }
        
        // Check for player interaction
        this.checkPlayerInteraction();
    }

    checkPlayerInteraction() {
        if (!this.canWarp || this.warpCooldown > 0) return;
        
        const player = this.engine.findGameObjectByTag('player');
        if (!player) return;
        
        // Check if player is on top of pipe and pressing down
        const onPipe = player.bottom <= this.top + 5 && 
                      player.bottom >= this.top - 5 &&
                      player.left < this.right &&
                      player.right > this.left;
        
        if (onPipe && this.engine.input.isPressed('down')) {
            this.warpPlayer(player);
        }
    }

    warpPlayer(player) {
        if (!this.destination) return;
        
        this.warpCooldown = this.warpDelay;
        
        // Play warp animation
        this.startWarpAnimation(player);
        
        // Play warp sound
        if (this.engine.audio) {
            this.engine.audio.playWarpSound();
        }
        
        // Move player after delay
        setTimeout(() => {
            this.teleportPlayer(player);
        }, this.warpDelay * 1000);
    }

    startWarpAnimation(player) {
        // Make player slide down into pipe
        player.velocity.x = 0;
        player.velocity.y = 50;
        player.solid = false;
        
        // Create warp effect
        if (this.engine.renderSystem) {
            this.engine.renderSystem.addEffect('warp', this.centerX, this.top, {
                color: '#00FF00',
                size: 64,
                life: this.warpDelay
            });
        }
    }

    teleportPlayer(player) {
        if (this.destination) {
            player.position.x = this.destination.x;
            player.position.y = this.destination.y - player.size.y;
            player.velocity = Vector2.zero();
            player.solid = true;
            
            // Update camera
            this.engine.camera.x = player.position.x - this.engine.width / 2;
            this.engine.camera.y = player.position.y - this.engine.height / 2;
        }
    }

    // Set warp destination
    setDestination(x, y) {
        this.destination = { x, y };
        this.canWarp = true;
    }

    // Connect two pipes for warping
    static connectPipes(pipe1, pipe2) {
        pipe1.setDestination(pipe2.position.x, pipe2.position.y);
        pipe2.setDestination(pipe1.position.x, pipe1.position.y);
    }

    render(ctx, camera) {
        if (!this.visible) return;
        
        const screenX = this.position.x - camera.x;
        const screenY = this.position.y - camera.y;
        
        // Draw pipe body
        ctx.save();
        
        // Main pipe body
        ctx.fillStyle = this.color;
        ctx.fillRect(screenX + 8, screenY, this.size.x - 16, this.size.y);
        
        // Pipe top
        ctx.fillStyle = this.darkColor;
        ctx.fillRect(screenX, screenY, this.size.x, 16);
        
        // Pipe body shading
        ctx.fillStyle = this.darkColor;
        ctx.fillRect(screenX + 8, screenY + 16, 4, this.size.y - 16);
        ctx.fillRect(screenX + this.size.x - 12, screenY + 16, 4, this.size.y - 16);
        
        // Pipe highlights
        ctx.fillStyle = '#00CC00';
        ctx.fillRect(screenX + 16, screenY + 16, 4, this.size.y - 16);
        ctx.fillRect(screenX + this.size.x - 20, screenY + 16, 4, this.size.y - 16);
        
        // Pipe top highlights
        ctx.fillStyle = '#00CC00';
        ctx.fillRect(screenX + 4, screenY + 4, 4, 8);
        ctx.fillRect(screenX + this.size.x - 8, screenY + 4, 4, 8);
        
        ctx.restore();
        
        // Draw warp indicator if can warp
        if (this.canWarp && this.warpCooldown <= 0) {
            const player = this.engine.findGameObjectByTag('player');
            if (player && 
                player.bottom <= this.top + 20 && 
                player.bottom >= this.top - 20 &&
                player.left < this.right &&
                player.right > this.left) {
                
                // Draw down arrow
                ctx.save();
                ctx.fillStyle = '#FFFF00';
                ctx.font = '20px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('↓', screenX + this.size.x / 2, screenY - 10);
                ctx.restore();
            }
        }
    }

    getDebugColor() {
        return this.canWarp ? '#00FF00' : '#00AA00';
    }
}