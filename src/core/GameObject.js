class GameObject {
    constructor(x = 0, y = 0, width = 32, height = 32) {
        this.position = new Vector2(x, y);
        this.velocity = Vector2.zero();
        this.size = new Vector2(width, height);
        this.active = true;
        this.visible = true;
        this.solid = false;
        this.grounded = false;
        this.facingRight = true;
        
        // Physics properties
        this.mass = 1;
        this.drag = 0.9;
        this.bounciness = 0;
        
        // Animation properties
        this.sprite = null;
        this.animations = {};
        this.currentAnimation = null;
        this.frameTime = 0;
        this.frameIndex = 0;
        
        // Sprite manager properties
        this.spriteInfo = null; // { sheetName: 'mario', spriteName: 'mario_small_idle' }
        this.spriteAnimations = {}; // Animation frame arrays for sprite manager
        
        // Collision properties
        this.collider = {
            x: 0,
            y: 0,
            width: width,
            height: height
        };
        
        // Tags for identification
        this.tags = new Set();
    }

    // Getters for bounds
    get left() { return this.position.x + this.collider.x; }
    get right() { return this.position.x + this.collider.x + this.collider.width; }
    get top() { return this.position.y + this.collider.y; }
    get bottom() { return this.position.y + this.collider.y + this.collider.height; }
    get centerX() { return this.left + this.collider.width / 2; }
    get centerY() { return this.top + this.collider.height / 2; }

    // Tag management
    addTag(tag) {
        this.tags.add(tag);
    }

    removeTag(tag) {
        this.tags.delete(tag);
    }

    hasTag(tag) {
        return this.tags.has(tag);
    }

    // Basic lifecycle methods
    update(deltaTime) {
        if (!this.active) return;
        
        // Update animation
        this.updateAnimation(deltaTime);
        
        // Apply physics
        this.updatePhysics(deltaTime);
    }

    updatePhysics(deltaTime) {
        // Apply velocity
        this.position = this.position.add(this.velocity.multiply(deltaTime));
        
        // Apply drag
        this.velocity = this.velocity.multiply(this.drag);
    }

    render(ctx, camera) {
        if (!this.visible) return;
        
        const screenX = this.position.x - camera.x;
        const screenY = this.position.y - camera.y;
        
        // Draw sprite or placeholder
        if (this.sprite && this.currentAnimation) {
            const animation = this.animations[this.currentAnimation];
            const frame = animation.frames[this.frameIndex];
            
            ctx.save();
            if (!this.facingRight) {
                ctx.scale(-1, 1);
                ctx.translate(-(screenX + this.size.x), 0);
            }
            
            ctx.drawImage(
                this.sprite,
                frame.x, frame.y, frame.width, frame.height,
                screenX, screenY, this.size.x, this.size.y
            );
            
            ctx.restore();
        } else {
            // Draw placeholder rectangle
            ctx.fillStyle = this.getDebugColor();
            ctx.fillRect(screenX, screenY, this.size.x, this.size.y);
        }
    }

    getDebugColor() {
        return '#FF0000'; // Red by default
    }

    // Collision detection
    intersects(other) {
        return this.left < other.right &&
               this.right > other.left &&
               this.top < other.bottom &&
               this.bottom > other.top;
    }

    // Animation management
    addAnimation(name, frames, frameRate = 0.1, loop = true) {
        this.animations[name] = {
            frames: frames,
            frameRate: frameRate,
            loop: loop
        };
    }

    playAnimation(name) {
        if (this.animations[name] || this.spriteAnimations[name]) {
            this.currentAnimation = name;
            this.frameIndex = 0;
            this.frameTime = 0;
        }
    }

    // Sprite manager methods
    setSpriteInfo(sheetName, spriteName) {
        this.spriteInfo = {
            sheetName: sheetName,
            spriteName: spriteName
        };
    }

    addSpriteAnimation(name, frameNames, frameRate = 0.1, loop = true) {
        this.spriteAnimations[name] = frameNames;
        // Also add to regular animations for timing
        this.animations[name] = {
            frames: frameNames.map(() => ({ x: 0, y: 0, width: 16, height: 16 })), // Dummy frames
            frameRate: frameRate,
            loop: loop
        };
    }

    updateAnimation(deltaTime) {
        if (!this.currentAnimation) return;
        
        // Check both sprite animations and regular animations
        const hasAnimation = this.animations[this.currentAnimation] || this.spriteAnimations[this.currentAnimation];
        if (!hasAnimation) return;
        
        const animation = this.animations[this.currentAnimation];
        this.frameTime += deltaTime;
        
        if (this.frameTime >= animation.frameRate) {
            this.frameTime = 0;
            
            // Get frame count from appropriate source
            let frameCount = 1;
            if (this.spriteAnimations[this.currentAnimation]) {
                frameCount = this.spriteAnimations[this.currentAnimation].length;
            } else if (animation) {
                frameCount = animation.frames.length;
            }
            
            this.frameIndex = (this.frameIndex + 1) % frameCount;
            
            if (this.frameIndex === 0 && animation && !animation.loop) {
                this.currentAnimation = null;
            }
        }
    }

    // Utility methods
    moveTo(x, y) {
        this.position.x = x;
        this.position.y = y;
    }

    moveBy(x, y) {
        this.position.x += x;
        this.position.y += y;
    }

    destroy() {
        this.active = false;
        this.visible = false;
    }

    clone() {
        const clone = new GameObject(this.position.x, this.position.y, this.size.x, this.size.y);
        clone.velocity = this.velocity.copy();
        clone.solid = this.solid;
        clone.mass = this.mass;
        clone.drag = this.drag;
        clone.bounciness = this.bounciness;
        clone.facingRight = this.facingRight;
        clone.tags = new Set(this.tags);
        return clone;
    }
}