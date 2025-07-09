class Block extends GameObject {
    constructor(x, y, type, engine) {
        super(x, y, 32, 32);
        
        this.engine = engine;
        this.addTag('block');
        this.addTag('static');
        
        // Block properties
        this.type = type; // 'question', 'brick', 'invisible'
        this.empty = false;
        this.content = null; // What the block contains
        this.hit = false;
        this.breaking = false;
        this.breakTimer = 0;
        this.breakDuration = 0.3;
        this.bumpHeight = 0;
        this.bumpTimer = 0;
        this.bumpDuration = 0.2;
        this.bumpSpeed = 10;
        this.originalY = y;
        
        // Physics
        this.mass = 1000; // Very heavy
        this.solid = true;
        this.drag = 0;
        
        // Visual effects
        this.pieces = [];
        
        this.setupAnimations();
        this.setupContent();
    }

    setupAnimations() {
        switch (this.type) {
            case 'question':
                this.addAnimation('idle', [
                    { x: 0, y: 352, width: 32, height: 32 },
                    { x: 32, y: 352, width: 32, height: 32 },
                    { x: 64, y: 352, width: 32, height: 32 }
                ], 0.3, true);
                
                this.addAnimation('empty', [
                    { x: 96, y: 352, width: 32, height: 32 }
                ], 0.1, false);
                break;
                
            case 'brick':
                this.addAnimation('idle', [
                    { x: 128, y: 352, width: 32, height: 32 }
                ], 0.1, true);
                break;
                
            case 'invisible':
                this.addAnimation('idle', [
                    { x: 160, y: 352, width: 32, height: 32 }
                ], 0.1, true);
                this.visible = false;
                break;
        }
        
        this.playAnimation('idle');
    }

    setupContent() {
        // Set default content based on type
        if (this.type === 'question') {
            // Random content for question blocks
            const contents = ['coin', 'mushroom', 'fire_flower', 'coins_multiple'];
            this.content = contents[Math.floor(Math.random() * contents.length)];
        }
    }

    update(deltaTime) {
        super.update(deltaTime);
        
        if (this.breaking) {
            this.updateBreaking(deltaTime);
            return;
        }
        
        // Update bump animation
        if (this.bumpTimer > 0) {
            this.updateBump(deltaTime);
        }
        
        // Update pieces
        this.updatePieces(deltaTime);
    }

    updateBreaking(deltaTime) {
        this.breakTimer += deltaTime;
        
        // Shake effect
        this.position.x = this.originalX + (Math.random() - 0.5) * 2;
        
        if (this.breakTimer >= this.breakDuration) {
            this.destroy();
        }
    }

    updateBump(deltaTime) {
        this.bumpTimer -= deltaTime;
        
        if (this.bumpTimer <= 0) {
            this.bumpTimer = 0;
            this.position.y = this.originalY;
            this.bumpHeight = 0;
        } else {
            const progress = 1 - (this.bumpTimer / this.bumpDuration);
            this.bumpHeight = Math.sin(progress * Math.PI) * -this.bumpSpeed;
            this.position.y = this.originalY + this.bumpHeight;
        }
    }

    updatePieces(deltaTime) {
        this.pieces = this.pieces.filter(piece => {
            piece.life -= deltaTime;
            piece.velocity.y += 800 * deltaTime; // Gravity
            piece.position.x += piece.velocity.x * deltaTime;
            piece.position.y += piece.velocity.y * deltaTime;
            
            return piece.life > 0;
        });
    }

    activate(player) {
        if (this.empty || this.hit) return;
        
        this.hit = true;
        this.startBump();
        
        if (this.type === 'question') {
            this.empty = true;
            this.playAnimation('empty');
            this.spawnContent();
        } else if (this.type === 'brick') {
            if (player.canBreakBlocks) {
                this.break(player);
            } else {
                // Just bump
                this.startBump();
            }
        } else if (this.type === 'invisible') {
            this.visible = true;
            this.spawnContent();
        }
        
        // Play sound
        if (this.engine && this.engine.audio) {
            this.engine.audio.playBlockBreakSound();
        }
    }

    break(player) {
        this.breaking = true;
        this.breakTimer = 0;
        this.originalX = this.position.x;
        this.solid = false;
        
        // Create break pieces
        this.createBreakPieces();
        
        // Add score
        if (this.engine) {
            this.engine.addScore(50);
        }
        
        // Play sound
        if (this.engine && this.engine.audio) {
            this.engine.audio.playBlockBreakSound();
        }
    }

    startBump() {
        this.bumpTimer = this.bumpDuration;
    }

    spawnContent() {
        if (!this.content) return;
        
        let spawnedItem = null;
        
        switch (this.content) {
            case 'coin':
                spawnedItem = new Coin(this.position.x, this.position.y - 32, this.engine);
                break;
                
            case 'mushroom':
                spawnedItem = new Mushroom(this.position.x, this.position.y - 32, this.engine);
                if (spawnedItem) {
                    spawnedItem.emergeFromBlock(this.position.x, this.position.y - 32);
                }
                break;
                
            case 'fire_flower':
                spawnedItem = new FireFlower(this.position.x, this.position.y - 32, this.engine);
                if (spawnedItem) {
                    spawnedItem.emergeFromBlock(this.position.x, this.position.y - 32);
                }
                break;
                
            case 'coins_multiple':
                // Spawn multiple coins
                for (let i = 0; i < 3; i++) {
                    setTimeout(() => {
                        const coin = new Coin(this.position.x, this.position.y - 32, this.engine);
                        coin.velocity.y = -200;
                        coin.velocity.x = (Math.random() - 0.5) * 100;
                        if (this.engine) {
                            this.engine.addGameObject(coin);
                        }
                    }, i * 100);
                }
                break;
        }
        
        if (spawnedItem && this.engine) {
            this.engine.addGameObject(spawnedItem);
        }
    }

    createBreakPieces() {
        // Create 4 pieces for brick breaking
        const pieceSize = 8;
        const positions = [
            { x: 0, y: 0 },
            { x: 16, y: 0 },
            { x: 0, y: 16 },
            { x: 16, y: 16 }
        ];
        
        positions.forEach(pos => {
            this.pieces.push({
                position: {
                    x: this.position.x + pos.x,
                    y: this.position.y + pos.y
                },
                velocity: {
                    x: (Math.random() - 0.5) * 200,
                    y: -Math.random() * 200
                },
                size: pieceSize,
                life: 2.0,
                color: '#8B4513'
            });
        });
        
        // Add pieces to render system
        if (this.engine && this.engine.renderSystem) {
            this.pieces.forEach(piece => {
                this.engine.renderSystem.addParticle(
                    piece.position.x,
                    piece.position.y,
                    {
                        velocityX: piece.velocity.x,
                        velocityY: piece.velocity.y,
                        size: piece.size,
                        color: piece.color,
                        life: piece.life,
                        shape: 'square'
                    }
                );
            });
        }
    }

    render(ctx, camera) {
        super.render(ctx, camera);
        
        // Render pieces
        this.pieces.forEach(piece => {
            const screenX = piece.position.x - camera.x;
            const screenY = piece.position.y - camera.y;
            
            ctx.save();
            ctx.globalAlpha = piece.life / 2.0;
            ctx.fillStyle = piece.color;
            ctx.fillRect(screenX, screenY, piece.size, piece.size);
            ctx.restore();
        });
    }

    getDebugColor() {
        switch (this.type) {
            case 'question': return this.empty ? '#666666' : '#FFD700';
            case 'brick': return '#8B4513';
            case 'invisible': return '#404040';
            default: return '#808080';
        }
    }
}