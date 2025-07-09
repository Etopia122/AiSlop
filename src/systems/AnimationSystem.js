class AnimationSystem {
    constructor() {
        this.animations = new Map();
    }

    // Register an animation
    registerAnimation(name, spriteSheet, frames, frameRate = 0.1, loop = true) {
        this.animations.set(name, {
            spriteSheet: spriteSheet,
            frames: frames,
            frameRate: frameRate,
            loop: loop
        });
    }

    // Create an animation instance for a game object
    createAnimationInstance(gameObject, animationName) {
        const animation = this.animations.get(animationName);
        if (!animation) return null;

        return {
            name: animationName,
            spriteSheet: animation.spriteSheet,
            frames: animation.frames,
            frameRate: animation.frameRate,
            loop: animation.loop,
            currentFrame: 0,
            frameTime: 0,
            finished: false,
            gameObject: gameObject
        };
    }

    // Update animation instance
    updateAnimationInstance(instance, deltaTime) {
        if (instance.finished && !instance.loop) return;

        instance.frameTime += deltaTime;
        
        if (instance.frameTime >= instance.frameRate) {
            instance.frameTime = 0;
            instance.currentFrame++;
            
            if (instance.currentFrame >= instance.frames.length) {
                if (instance.loop) {
                    instance.currentFrame = 0;
                } else {
                    instance.currentFrame = instance.frames.length - 1;
                    instance.finished = true;
                }
            }
        }
    }

    // Get current frame data
    getCurrentFrame(instance) {
        if (!instance || !instance.frames) return null;
        return instance.frames[instance.currentFrame];
    }

    // Create default Mario-style animations
    createMarioAnimations() {
        const tileSize = 32;
        
        // Small Mario animations
        this.registerAnimation('mario_small_idle', null, [
            { x: 0, y: 0, width: tileSize, height: tileSize }
        ], 0.1, true);
        
        this.registerAnimation('mario_small_walk', null, [
            { x: 0, y: 0, width: tileSize, height: tileSize },
            { x: tileSize, y: 0, width: tileSize, height: tileSize },
            { x: tileSize * 2, y: 0, width: tileSize, height: tileSize }
        ], 0.15, true);
        
        this.registerAnimation('mario_small_jump', null, [
            { x: tileSize * 3, y: 0, width: tileSize, height: tileSize }
        ], 0.1, false);
        
        // Big Mario animations
        this.registerAnimation('mario_big_idle', null, [
            { x: 0, y: tileSize, width: tileSize, height: tileSize * 2 }
        ], 0.1, true);
        
        this.registerAnimation('mario_big_walk', null, [
            { x: 0, y: tileSize, width: tileSize, height: tileSize * 2 },
            { x: tileSize, y: tileSize, width: tileSize, height: tileSize * 2 },
            { x: tileSize * 2, y: tileSize, width: tileSize, height: tileSize * 2 }
        ], 0.15, true);
        
        this.registerAnimation('mario_big_jump', null, [
            { x: tileSize * 3, y: tileSize, width: tileSize, height: tileSize * 2 }
        ], 0.1, false);
        
        // Fire Mario animations
        this.registerAnimation('mario_fire_idle', null, [
            { x: 0, y: tileSize * 3, width: tileSize, height: tileSize * 2 }
        ], 0.1, true);
        
        this.registerAnimation('mario_fire_walk', null, [
            { x: 0, y: tileSize * 3, width: tileSize, height: tileSize * 2 },
            { x: tileSize, y: tileSize * 3, width: tileSize, height: tileSize * 2 },
            { x: tileSize * 2, y: tileSize * 3, width: tileSize, height: tileSize * 2 }
        ], 0.15, true);
        
        this.registerAnimation('mario_fire_jump', null, [
            { x: tileSize * 3, y: tileSize * 3, width: tileSize, height: tileSize * 2 }
        ], 0.1, false);
        
        // Goomba animations
        this.registerAnimation('goomba_walk', null, [
            { x: 0, y: tileSize * 5, width: tileSize, height: tileSize },
            { x: tileSize, y: tileSize * 5, width: tileSize, height: tileSize }
        ], 0.5, true);
        
        this.registerAnimation('goomba_squished', null, [
            { x: tileSize * 2, y: tileSize * 5, width: tileSize, height: tileSize }
        ], 0.1, false);
        
        // Koopa animations
        this.registerAnimation('koopa_walk', null, [
            { x: 0, y: tileSize * 6, width: tileSize, height: tileSize * 2 },
            { x: tileSize, y: tileSize * 6, width: tileSize, height: tileSize * 2 }
        ], 0.3, true);
        
        this.registerAnimation('koopa_shell', null, [
            { x: tileSize * 2, y: tileSize * 6, width: tileSize, height: tileSize }
        ], 0.1, false);
        
        this.registerAnimation('koopa_shell_spin', null, [
            { x: tileSize * 2, y: tileSize * 6, width: tileSize, height: tileSize },
            { x: tileSize * 3, y: tileSize * 6, width: tileSize, height: tileSize }
        ], 0.1, true);
        
        // Power-up animations
        this.registerAnimation('mushroom', null, [
            { x: 0, y: tileSize * 8, width: tileSize, height: tileSize }
        ], 0.1, true);
        
        this.registerAnimation('fire_flower', null, [
            { x: tileSize, y: tileSize * 8, width: tileSize, height: tileSize },
            { x: tileSize * 2, y: tileSize * 8, width: tileSize, height: tileSize },
            { x: tileSize * 3, y: tileSize * 8, width: tileSize, height: tileSize }
        ], 0.2, true);
        
        // Coin animation
        this.registerAnimation('coin', null, [
            { x: 0, y: tileSize * 9, width: tileSize, height: tileSize },
            { x: tileSize, y: tileSize * 9, width: tileSize, height: tileSize },
            { x: tileSize * 2, y: tileSize * 9, width: tileSize, height: tileSize },
            { x: tileSize * 3, y: tileSize * 9, width: tileSize, height: tileSize }
        ], 0.15, true);
        
        // Fireball animation
        this.registerAnimation('fireball', null, [
            { x: 0, y: tileSize * 10, width: tileSize, height: tileSize },
            { x: tileSize, y: tileSize * 10, width: tileSize, height: tileSize },
            { x: tileSize * 2, y: tileSize * 10, width: tileSize, height: tileSize },
            { x: tileSize * 3, y: tileSize * 10, width: tileSize, height: tileSize }
        ], 0.1, true);
        
        // Block animations
        this.registerAnimation('question_block', null, [
            { x: 0, y: tileSize * 11, width: tileSize, height: tileSize },
            { x: tileSize, y: tileSize * 11, width: tileSize, height: tileSize },
            { x: tileSize * 2, y: tileSize * 11, width: tileSize, height: tileSize }
        ], 0.3, true);
        
        this.registerAnimation('brick_block', null, [
            { x: tileSize * 3, y: tileSize * 11, width: tileSize, height: tileSize }
        ], 0.1, true);
        
        this.registerAnimation('empty_block', null, [
            { x: 0, y: tileSize * 12, width: tileSize, height: tileSize }
        ], 0.1, true);
    }

    // Helper method to create a simple frame array
    createFrameArray(startX, startY, width, height, frameCount, spacing = 0) {
        const frames = [];
        for (let i = 0; i < frameCount; i++) {
            frames.push({
                x: startX + i * (width + spacing),
                y: startY,
                width: width,
                height: height
            });
        }
        return frames;
    }

    // Blend two animations together
    blendAnimations(anim1, anim2, blendFactor) {
        // This could be used for smooth transitions between animations
        // For now, just return the first animation
        return anim1;
    }

    // Get animation by name
    getAnimation(name) {
        return this.animations.get(name);
    }

    // Check if animation exists
    hasAnimation(name) {
        return this.animations.has(name);
    }

    // Remove animation
    removeAnimation(name) {
        this.animations.delete(name);
    }

    // Clear all animations
    clearAnimations() {
        this.animations.clear();
    }
}