class RenderSystem {
    constructor(ctx, spriteManager = null) {
        this.ctx = ctx;
        this.canvas = ctx.canvas;
        this.spriteManager = spriteManager;
        this.effects = [];
        this.particles = [];
        this.debugMode = false;
        this.spriteRenderingEnabled = true;
        
        // Background layers
        this.backgroundLayers = [];
        
        // Lighting effects
        this.lighting = {
            enabled: false,
            ambientColor: '#404040',
            lights: []
        };
        
        // Screen effects
        this.screenEffects = {
            shake: { x: 0, y: 0, duration: 0, intensity: 0 },
            flash: { color: '#FFFFFF', alpha: 0, duration: 0 },
            fade: { color: '#000000', alpha: 0, duration: 0 }
        };
        
        // Render layers
        this.renderLayers = {
            background: 0,
            tiles: 1,
            entities: 2,
            particles: 3,
            ui: 4,
            effects: 5
        };
    }

    // Main render method
    render(gameObjects, camera) {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Apply screen shake
        this.ctx.save();
        this.applyScreenShake();
        
        // Render background layers
        this.renderBackgroundLayers(camera);
        
        // Render game objects in layers
        this.renderGameObjects(gameObjects, camera);
        
        // Render particles
        this.renderParticles(camera);
        
        // Render visual effects
        this.renderEffects(camera);
        
        // Render debug info
        if (this.debugMode) {
            this.renderDebugInfo(gameObjects, camera);
        }
        
        this.ctx.restore();
        
        // Render screen effects (after restore to avoid shake)
        this.renderScreenEffects();
    }

    // Render background layers with parallax
    renderBackgroundLayers(camera) {
        this.backgroundLayers.forEach(layer => {
            const parallaxX = camera.x * layer.parallaxX;
            const parallaxY = camera.y * layer.parallaxY;
            
            // Tile background if needed
            if (layer.tiled) {
                this.renderTiledBackground(layer, parallaxX, parallaxY);
            } else {
                this.ctx.drawImage(
                    layer.image,
                    -parallaxX,
                    -parallaxY,
                    layer.width,
                    layer.height
                );
            }
        });
    }

    // Render tiled background
    renderTiledBackground(layer, offsetX, offsetY) {
        const tileWidth = layer.tileWidth || layer.width;
        const tileHeight = layer.tileHeight || layer.height;
        
        const startX = Math.floor(offsetX / tileWidth);
        const startY = Math.floor(offsetY / tileHeight);
        const endX = Math.ceil((offsetX + this.canvas.width) / tileWidth);
        const endY = Math.ceil((offsetY + this.canvas.height) / tileHeight);
        
        for (let x = startX; x < endX; x++) {
            for (let y = startY; y < endY; y++) {
                this.ctx.drawImage(
                    layer.image,
                    x * tileWidth - offsetX,
                    y * tileHeight - offsetY,
                    tileWidth,
                    tileHeight
                );
            }
        }
    }

    // Render game objects sorted by layer
    renderGameObjects(gameObjects, camera) {
        // Sort objects by render layer
        const sortedObjects = gameObjects
            .filter(obj => obj.visible && this.isInViewport(obj, camera))
            .sort((a, b) => (a.renderLayer || 0) - (b.renderLayer || 0));
        
        sortedObjects.forEach(obj => {
            this.renderGameObject(obj, camera);
        });
    }

    // Render individual game object
    renderGameObject(obj, camera) {
        const screenX = obj.position.x - camera.x;
        const screenY = obj.position.y - camera.y;
        
        this.ctx.save();
        
        // Apply object transformations
        this.ctx.translate(screenX + obj.size.x / 2, screenY + obj.size.y / 2);
        
        // Apply rotation if object has it
        if (obj.rotation) {
            this.ctx.rotate(obj.rotation);
        }
        
        // Apply scale
        const scaleX = obj.facingRight ? 1 : -1;
        const scaleY = 1;
        this.ctx.scale(scaleX, scaleY);
        
        // Apply alpha
        if (obj.alpha !== undefined) {
            this.ctx.globalAlpha = obj.alpha;
        }
        
        // Render sprite from sprite manager, animation, or placeholder
        if (this.spriteManager && this.spriteRenderingEnabled && obj.spriteInfo) {
            this.renderSpriteFromManager(obj, -obj.size.x / 2, -obj.size.y / 2);
        } else if (obj.sprite && obj.currentAnimation) {
            this.renderSprite(obj, -obj.size.x / 2, -obj.size.y / 2);
        } else {
            this.renderPlaceholder(obj, -obj.size.x / 2, -obj.size.y / 2);
        }
        
        this.ctx.restore();
        
        // Render health bar if object has health
        if (obj.health !== undefined && obj.maxHealth !== undefined) {
            this.renderHealthBar(obj, camera);
        }
    }

    // Render sprite from sprite manager
    renderSpriteFromManager(obj, x, y) {
        if (!this.spriteManager || !obj.spriteInfo) return;
        
        const { sheetName, spriteName } = obj.spriteInfo;
        let currentSpriteName = spriteName;
        
        // Check if object has animation state
        if (obj.currentAnimation && obj.spriteAnimations) {
            const animFrames = obj.spriteAnimations[obj.currentAnimation];
            if (animFrames && animFrames.length > 0) {
                const frameIndex = Math.min(obj.frameIndex || 0, animFrames.length - 1);
                currentSpriteName = animFrames[frameIndex];
            }
        }
        
        this.spriteManager.drawSprite(
            this.ctx,
            sheetName,
            currentSpriteName,
            x, y,
            obj.size.x, obj.size.y,
            false, false // Flip handled by transform above
        );
    }

    // Render sprite with animation (legacy support)
    renderSprite(obj, x, y) {
        const animation = obj.animations[obj.currentAnimation];
        if (!animation) return;
        
        const frame = animation.frames[obj.frameIndex];
        if (!frame) return;
        
        if (obj.sprite) {
            this.ctx.drawImage(
                obj.sprite,
                frame.x, frame.y, frame.width, frame.height,
                x, y, obj.size.x, obj.size.y
            );
        }
    }

    // Render placeholder rectangle
    renderPlaceholder(obj, x, y) {
        this.ctx.fillStyle = obj.getDebugColor();
        this.ctx.fillRect(x, y, obj.size.x, obj.size.y);
        
        // Add border
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, obj.size.x, obj.size.y);
    }

    // Render health bar
    renderHealthBar(obj, camera) {
        const screenX = obj.position.x - camera.x;
        const screenY = obj.position.y - camera.y - 8;
        const width = obj.size.x;
        const height = 4;
        
        const healthPercent = obj.health / obj.maxHealth;
        
        // Background
        this.ctx.fillStyle = '#FF0000';
        this.ctx.fillRect(screenX, screenY, width, height);
        
        // Health
        this.ctx.fillStyle = '#00FF00';
        this.ctx.fillRect(screenX, screenY, width * healthPercent, height);
        
        // Border
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(screenX, screenY, width, height);
    }

    // Render particles
    renderParticles(camera) {
        this.particles.forEach(particle => {
            if (!particle.active) return;
            
            const screenX = particle.position.x - camera.x;
            const screenY = particle.position.y - camera.y;
            
            this.ctx.save();
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.fillStyle = particle.color;
            
            if (particle.shape === 'circle') {
                this.ctx.beginPath();
                this.ctx.arc(screenX, screenY, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                this.ctx.fillRect(
                    screenX - particle.size / 2,
                    screenY - particle.size / 2,
                    particle.size,
                    particle.size
                );
            }
            
            this.ctx.restore();
        });
    }

    // Render visual effects
    renderEffects(camera) {
        this.effects.forEach(effect => {
            if (!effect.active) return;
            
            switch (effect.type) {
                case 'explosion':
                    this.renderExplosion(effect, camera);
                    break;
                case 'powerup':
                    this.renderPowerUpEffect(effect, camera);
                    break;
                case 'coin':
                    this.renderCoinEffect(effect, camera);
                    break;
                case 'damage':
                    this.renderDamageEffect(effect, camera);
                    break;
            }
        });
    }

    // Render explosion effect
    renderExplosion(effect, camera) {
        const screenX = effect.position.x - camera.x;
        const screenY = effect.position.y - camera.y;
        
        this.ctx.save();
        this.ctx.globalAlpha = effect.alpha;
        this.ctx.fillStyle = effect.color || '#FF6600';
        
        // Expanding circle
        this.ctx.beginPath();
        this.ctx.arc(screenX, screenY, effect.size, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }

    // Render power-up effect
    renderPowerUpEffect(effect, camera) {
        const screenX = effect.position.x - camera.x;
        const screenY = effect.position.y - camera.y;
        
        this.ctx.save();
        this.ctx.globalAlpha = effect.alpha;
        this.ctx.fillStyle = effect.color || '#FFD700';
        
        // Sparkle effect
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const x = screenX + Math.cos(angle) * effect.size;
            const y = screenY + Math.sin(angle) * effect.size;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }

    // Render coin collection effect
    renderCoinEffect(effect, camera) {
        const screenX = effect.position.x - camera.x;
        const screenY = effect.position.y - camera.y;
        
        this.ctx.save();
        this.ctx.globalAlpha = effect.alpha;
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('+200', screenX, screenY);
        this.ctx.restore();
    }

    // Render damage effect
    renderDamageEffect(effect, camera) {
        const screenX = effect.position.x - camera.x;
        const screenY = effect.position.y - camera.y;
        
        this.ctx.save();
        this.ctx.globalAlpha = effect.alpha;
        this.ctx.fillStyle = '#FF0000';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('DAMAGE', screenX, screenY);
        this.ctx.restore();
    }

    // Render debug information
    renderDebugInfo(gameObjects, camera) {
        this.ctx.save();
        this.ctx.fillStyle = '#00FF00';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'left';
        
        // Render collision boxes
        gameObjects.forEach(obj => {
            if (!obj.visible) return;
            
            const screenX = obj.position.x - camera.x;
            const screenY = obj.position.y - camera.y;
            
            // Collision box
            this.ctx.strokeStyle = obj.solid ? '#FF0000' : '#00FF00';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(
                screenX + obj.collider.x,
                screenY + obj.collider.y,
                obj.collider.width,
                obj.collider.height
            );
            
            // Velocity vector
            this.ctx.strokeStyle = '#0000FF';
            this.ctx.beginPath();
            this.ctx.moveTo(screenX + obj.size.x / 2, screenY + obj.size.y / 2);
            this.ctx.lineTo(
                screenX + obj.size.x / 2 + obj.velocity.x * 0.1,
                screenY + obj.size.y / 2 + obj.velocity.y * 0.1
            );
            this.ctx.stroke();
        });
        
        this.ctx.restore();
    }

    // Render screen effects
    renderScreenEffects() {
        // Flash effect
        if (this.screenEffects.flash.alpha > 0) {
            this.ctx.save();
            this.ctx.globalAlpha = this.screenEffects.flash.alpha;
            this.ctx.fillStyle = this.screenEffects.flash.color;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.restore();
        }
        
        // Fade effect
        if (this.screenEffects.fade.alpha > 0) {
            this.ctx.save();
            this.ctx.globalAlpha = this.screenEffects.fade.alpha;
            this.ctx.fillStyle = this.screenEffects.fade.color;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.restore();
        }
    }

    // Check if object is in viewport
    isInViewport(obj, camera) {
        const margin = 50; // Extra margin for smooth scrolling
        return obj.position.x + obj.size.x > camera.x - margin &&
               obj.position.x < camera.x + this.canvas.width + margin &&
               obj.position.y + obj.size.y > camera.y - margin &&
               obj.position.y < camera.y + this.canvas.height + margin;
    }

    // Apply screen shake
    applyScreenShake() {
        if (this.screenEffects.shake.duration > 0) {
            const shakeX = (Math.random() - 0.5) * this.screenEffects.shake.intensity;
            const shakeY = (Math.random() - 0.5) * this.screenEffects.shake.intensity;
            this.ctx.translate(shakeX, shakeY);
        }
    }

    // Add background layer
    addBackgroundLayer(image, parallaxX = 0, parallaxY = 0, tiled = false) {
        this.backgroundLayers.push({
            image: image,
            parallaxX: parallaxX,
            parallaxY: parallaxY,
            tiled: tiled,
            width: image.width,
            height: image.height
        });
    }

    // Add particle effect
    addParticle(x, y, options = {}) {
        const particle = {
            position: new Vector2(x, y),
            velocity: new Vector2(
                options.velocityX || (Math.random() - 0.5) * 100,
                options.velocityY || (Math.random() - 0.5) * 100
            ),
            size: options.size || 4,
            color: options.color || '#FFFFFF',
            alpha: options.alpha || 1,
            life: options.life || 1,
            maxLife: options.life || 1,
            shape: options.shape || 'square',
            active: true
        };
        
        this.particles.push(particle);
    }

    // Add visual effect
    addEffect(type, x, y, options = {}) {
        const effect = {
            type: type,
            position: new Vector2(x, y),
            size: options.size || 20,
            color: options.color || '#FFFFFF',
            alpha: options.alpha || 1,
            life: options.life || 1,
            maxLife: options.life || 1,
            active: true
        };
        
        this.effects.push(effect);
    }

    // Update particles and effects
    updateEffects(deltaTime) {
        // Update particles
        this.particles = this.particles.filter(particle => {
            if (!particle.active) return false;
            
            particle.position = particle.position.add(particle.velocity.multiply(deltaTime));
            particle.life -= deltaTime;
            particle.alpha = particle.life / particle.maxLife;
            
            if (particle.life <= 0) {
                particle.active = false;
            }
            
            return particle.active;
        });
        
        // Update effects
        this.effects = this.effects.filter(effect => {
            if (!effect.active) return false;
            
            effect.life -= deltaTime;
            effect.alpha = effect.life / effect.maxLife;
            
            // Update effect-specific properties
            switch (effect.type) {
                case 'explosion':
                    effect.size += 50 * deltaTime;
                    break;
                case 'powerup':
                    effect.size = 10 + Math.sin(effect.life * 10) * 5;
                    break;
            }
            
            if (effect.life <= 0) {
                effect.active = false;
            }
            
            return effect.active;
        });
        
        // Update screen effects
        if (this.screenEffects.shake.duration > 0) {
            this.screenEffects.shake.duration -= deltaTime;
            if (this.screenEffects.shake.duration <= 0) {
                this.screenEffects.shake.intensity = 0;
            }
        }
        
        if (this.screenEffects.flash.duration > 0) {
            this.screenEffects.flash.duration -= deltaTime;
            this.screenEffects.flash.alpha = this.screenEffects.flash.duration / this.screenEffects.flash.maxDuration;
        }
        
        if (this.screenEffects.fade.duration > 0) {
            this.screenEffects.fade.duration -= deltaTime;
            this.screenEffects.fade.alpha = this.screenEffects.fade.duration / this.screenEffects.fade.maxDuration;
        }
    }

    // Screen effect methods
    screenShake(intensity, duration) {
        this.screenEffects.shake.intensity = intensity;
        this.screenEffects.shake.duration = duration;
    }

    screenFlash(color, duration) {
        this.screenEffects.flash.color = color;
        this.screenEffects.flash.duration = duration;
        this.screenEffects.flash.maxDuration = duration;
        this.screenEffects.flash.alpha = 1;
    }

    screenFade(color, duration) {
        this.screenEffects.fade.color = color;
        this.screenEffects.fade.duration = duration;
        this.screenEffects.fade.maxDuration = duration;
        this.screenEffects.fade.alpha = 1;
    }

    // Toggle debug mode
    toggleDebug() {
        this.debugMode = !this.debugMode;
    }

    // Clear all effects
    clearEffects() {
        this.particles = [];
        this.effects = [];
    }
}