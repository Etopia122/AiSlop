// Sprite Manager - Handles loading and managing sprite sheets
class SpriteManager {
    constructor() {
        this.sprites = new Map();
        this.spriteSheets = new Map();
        this.loadingPromises = new Map();
        this.loadedCount = 0;
        this.totalCount = 0;
    }

    // Load a sprite sheet
    async loadSpriteSheet(name, imagePath, spriteData) {
        if (this.loadingPromises.has(name)) {
            return this.loadingPromises.get(name);
        }

        const promise = new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.spriteSheets.set(name, {
                    image: img,
                    sprites: spriteData,
                    width: img.width,
                    height: img.height
                });
                this.loadedCount++;
                console.log(`Loaded sprite sheet: ${name}`);
                resolve(img);
            };
            img.onerror = () => {
                console.warn(`Failed to load sprite sheet: ${name}, using generated fallback`);
                
                // Use SpriteGenerator to create fallback sprites
                let generatedCanvas;
                switch (name) {
                    case 'mario':
                        generatedCanvas = SpriteGenerator.generateMarioSprites();
                        break;
                    case 'enemies':
                        generatedCanvas = SpriteGenerator.generateEnemySprites();
                        break;
                    case 'powerups':
                        generatedCanvas = SpriteGenerator.generatePowerupSprites();
                        break;
                    case 'blocks':
                        generatedCanvas = SpriteGenerator.generateBlockSprites();
                        break;
                    case 'tiles':
                        generatedCanvas = SpriteGenerator.generateTileSprites();
                        break;
                    case 'effects':
                        generatedCanvas = SpriteGenerator.generateEffectSprites();
                        break;
                    default:
                        // Create a basic fallback
                        generatedCanvas = document.createElement('canvas');
                        const ctx = generatedCanvas.getContext('2d');
                        generatedCanvas.width = spriteData.width || 256;
                        generatedCanvas.height = spriteData.height || 256;
                        
                        ctx.fillStyle = spriteData.fallbackColor || '#FF00FF';
                        ctx.fillRect(0, 0, generatedCanvas.width, generatedCanvas.height);
                        break;
                }
                
                this.spriteSheets.set(name, {
                    image: generatedCanvas,
                    sprites: spriteData,
                    width: generatedCanvas.width,
                    height: generatedCanvas.height
                });
                this.loadedCount++;
                resolve(generatedCanvas);
            };
            img.src = imagePath;
        });

        this.loadingPromises.set(name, promise);
        this.totalCount++;
        return promise;
    }

    createFallbackSprites(ctx, width, height, spriteData) {
        // Create simple colored rectangles as fallback sprites
        const colors = {
            player: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'],
            enemies: ['#8B4513', '#228B22', '#FF4500', '#800080'],
            powerups: ['#FFD700', '#FF69B4', '#00FFFF', '#32CD32'],
            blocks: ['#D2691E', '#A0522D', '#8B4513', '#654321'],
            effects: ['#FFFFFF', '#C0C0C0', '#87CEEB', '#FFB6C1']
        };

        // Fill with different colors for variety
        const colorSet = colors[spriteData.type] || colors.player;
        for (let i = 0; i < colorSet.length; i++) {
            const x = (i % 8) * 32;
            const y = Math.floor(i / 8) * 32;
            
            ctx.fillStyle = colorSet[i % colorSet.length];
            ctx.fillRect(x, y, 32, 32);
            
            // Add simple details
            ctx.fillStyle = '#000000';
            ctx.fillRect(x + 2, y + 2, 28, 28);
            ctx.fillStyle = colorSet[i % colorSet.length];
            ctx.fillRect(x + 4, y + 4, 24, 24);
        }
    }

    // Get a sprite from a loaded sprite sheet
    getSprite(sheetName, spriteName) {
        const sheet = this.spriteSheets.get(sheetName);
        if (!sheet) {
            console.warn(`Sprite sheet not found: ${sheetName}`);
            return null;
        }

        const spriteData = sheet.sprites[spriteName];
        if (!spriteData) {
            console.warn(`Sprite not found: ${spriteName} in ${sheetName}`);
            return null;
        }

        return {
            image: sheet.image,
            ...spriteData
        };
    }

    // Draw a sprite to a canvas context
    drawSprite(ctx, sheetName, spriteName, x, y, width = null, height = null, flipX = false, flipY = false) {
        const sprite = this.getSprite(sheetName, spriteName);
        if (!sprite) {
            // Fallback to colored rectangle
            this.drawFallbackSprite(ctx, spriteName, x, y, width || 32, height || 32);
            return;
        }

        const drawWidth = width || sprite.width;
        const drawHeight = height || sprite.height;

        ctx.save();
        
        if (flipX || flipY) {
            ctx.translate(x + drawWidth/2, y + drawHeight/2);
            ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
            ctx.translate(-drawWidth/2, -drawHeight/2);
            x = 0;
            y = 0;
        }

        ctx.drawImage(
            sprite.image,
            sprite.x, sprite.y, sprite.width, sprite.height,
            x, y, drawWidth, drawHeight
        );
        
        ctx.restore();
    }

    drawFallbackSprite(ctx, spriteName, x, y, width, height) {
        // Simple colored rectangle fallback
        const colors = {
            'mario_small': '#FF0000',
            'mario_big': '#FF0000',
            'mario_fire': '#FF6600',
            'mario_ice': '#87CEEB',
            'goomba': '#8B4513',
            'koopa_green': '#228B22',
            'koopa_red': '#FF4500',
            'piranha': '#00AA00',
            'buzzy': '#444444',
            'spiny': '#AA0000',
            'boo': '#FFFFFF',
            'mushroom': '#FF0000',
            'fireflower': '#FF6600',
            'iceflower': '#87CEEB',
            'star': '#FFD700',
            'oneup': '#00FF00',
            'coin': '#FFD700',
            'block_brick': '#CD853F',
            'block_question': '#FFD700',
            'block_invisible': 'rgba(0,0,0,0.1)',
            'pipe': '#00AA00',
            'ground': '#8B4513',
            'platform': '#228B22'
        };

        ctx.fillStyle = colors[spriteName] || '#FF00FF';
        ctx.fillRect(x, y, width, height);
        
        // Add simple border
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);
    }

    // Load all sprite sheets
    async loadAllSprites() {
        const spriteSheets = [
            {
                name: 'mario',
                path: 'assets/sprites/mario.png',
                data: this.getMarioSpriteData()
            },
            {
                name: 'enemies',
                path: 'assets/sprites/enemies.png',
                data: this.getEnemySpriteData()
            },
            {
                name: 'powerups',
                path: 'assets/sprites/powerups.png',
                data: this.getPowerupSpriteData()
            },
            {
                name: 'blocks',
                path: 'assets/sprites/blocks.png',
                data: this.getBlockSpriteData()
            },
            {
                name: 'effects',
                path: 'assets/sprites/effects.png',
                data: this.getEffectSpriteData()
            },
            {
                name: 'tiles',
                path: 'assets/sprites/tiles.png',
                data: this.getTileSpriteData()
            }
        ];

        const promises = spriteSheets.map(sheet => 
            this.loadSpriteSheet(sheet.name, sheet.path, sheet.data)
        );

        await Promise.all(promises);
        console.log(`Loaded ${this.loadedCount} sprite sheets`);
    }

    getMarioSpriteData() {
        return {
            type: 'player',
            width: 256,
            height: 256,
            fallbackColor: '#FF0000',
            // Small Mario
            mario_small_idle: { x: 0, y: 0, width: 16, height: 16 },
            mario_small_walk1: { x: 16, y: 0, width: 16, height: 16 },
            mario_small_walk2: { x: 32, y: 0, width: 16, height: 16 },
            mario_small_walk3: { x: 48, y: 0, width: 16, height: 16 },
            mario_small_jump: { x: 64, y: 0, width: 16, height: 16 },
            mario_small_crouch: { x: 80, y: 0, width: 16, height: 16 },
            
            // Big Mario
            mario_big_idle: { x: 0, y: 32, width: 16, height: 32 },
            mario_big_walk1: { x: 16, y: 32, width: 16, height: 32 },
            mario_big_walk2: { x: 32, y: 32, width: 16, height: 32 },
            mario_big_walk3: { x: 48, y: 32, width: 16, height: 32 },
            mario_big_jump: { x: 64, y: 32, width: 16, height: 32 },
            mario_big_crouch: { x: 80, y: 32, width: 16, height: 32 },
            
            // Fire Mario
            mario_fire_idle: { x: 0, y: 64, width: 16, height: 32 },
            mario_fire_walk1: { x: 16, y: 64, width: 16, height: 32 },
            mario_fire_walk2: { x: 32, y: 64, width: 16, height: 32 },
            mario_fire_walk3: { x: 48, y: 64, width: 16, height: 32 },
            mario_fire_jump: { x: 64, y: 64, width: 16, height: 32 },
            mario_fire_crouch: { x: 80, y: 64, width: 16, height: 32 },
            mario_fire_shoot: { x: 96, y: 64, width: 16, height: 32 },
            
            // Ice Mario
            mario_ice_idle: { x: 0, y: 96, width: 16, height: 32 },
            mario_ice_walk1: { x: 16, y: 96, width: 16, height: 32 },
            mario_ice_walk2: { x: 32, y: 96, width: 16, height: 32 },
            mario_ice_walk3: { x: 48, y: 96, width: 16, height: 32 },
            mario_ice_jump: { x: 64, y: 96, width: 16, height: 32 },
            mario_ice_crouch: { x: 80, y: 96, width: 16, height: 32 },
            mario_ice_shoot: { x: 96, y: 96, width: 16, height: 32 }
        };
    }

    getEnemySpriteData() {
        return {
            type: 'enemies',
            width: 256,
            height: 256,
            fallbackColor: '#8B4513',
            // Goomba
            goomba_walk1: { x: 0, y: 0, width: 16, height: 16 },
            goomba_walk2: { x: 16, y: 0, width: 16, height: 16 },
            goomba_squashed: { x: 32, y: 0, width: 16, height: 8 },
            
            // Koopa
            koopa_walk1: { x: 0, y: 32, width: 16, height: 24 },
            koopa_walk2: { x: 16, y: 32, width: 16, height: 24 },
            koopa_shell: { x: 32, y: 32, width: 16, height: 16 },
            koopa_shell_spin1: { x: 48, y: 32, width: 16, height: 16 },
            koopa_shell_spin2: { x: 64, y: 32, width: 16, height: 16 },
            
            // Piranha Plant
            piranha_closed: { x: 0, y: 64, width: 16, height: 24 },
            piranha_open: { x: 16, y: 64, width: 16, height: 24 },
            piranha_chomp1: { x: 32, y: 64, width: 16, height: 24 },
            piranha_chomp2: { x: 48, y: 64, width: 16, height: 24 },
            
            // Buzzy Beetle
            buzzy_walk1: { x: 0, y: 96, width: 16, height: 16 },
            buzzy_walk2: { x: 16, y: 96, width: 16, height: 16 },
            buzzy_shell: { x: 32, y: 96, width: 16, height: 12 },
            buzzy_shell_spin1: { x: 48, y: 96, width: 16, height: 12 },
            buzzy_shell_spin2: { x: 64, y: 96, width: 16, height: 12 },
            
            // Spiny
            spiny_walk1: { x: 0, y: 128, width: 16, height: 16 },
            spiny_walk2: { x: 16, y: 128, width: 16, height: 16 },
            spiny_defensive: { x: 32, y: 128, width: 16, height: 16 },
            
            // Boo
            boo_normal1: { x: 0, y: 160, width: 16, height: 16 },
            boo_normal2: { x: 16, y: 160, width: 16, height: 16 },
            boo_shy: { x: 32, y: 160, width: 16, height: 16 },
            boo_chase1: { x: 48, y: 160, width: 16, height: 16 },
            boo_chase2: { x: 64, y: 160, width: 16, height: 16 }
        };
    }

    getPowerupSpriteData() {
        return {
            type: 'powerups',
            width: 256,
            height: 256,
            fallbackColor: '#FFD700',
            // Mushroom
            mushroom: { x: 0, y: 0, width: 16, height: 16 },
            
            // Fire Flower
            fireflower1: { x: 0, y: 32, width: 16, height: 16 },
            fireflower2: { x: 16, y: 32, width: 16, height: 16 },
            fireflower3: { x: 32, y: 32, width: 16, height: 16 },
            fireflower4: { x: 48, y: 32, width: 16, height: 16 },
            
            // Ice Flower
            iceflower1: { x: 0, y: 64, width: 16, height: 16 },
            iceflower2: { x: 16, y: 64, width: 16, height: 16 },
            iceflower3: { x: 32, y: 64, width: 16, height: 16 },
            iceflower4: { x: 48, y: 64, width: 16, height: 16 },
            
            // Star
            star1: { x: 0, y: 96, width: 16, height: 16 },
            star2: { x: 16, y: 96, width: 16, height: 16 },
            star3: { x: 32, y: 96, width: 16, height: 16 },
            star4: { x: 48, y: 96, width: 16, height: 16 },
            
            // 1-Up Mushroom
            oneup: { x: 0, y: 128, width: 16, height: 16 },
            
            // Coin
            coin1: { x: 0, y: 160, width: 8, height: 14 },
            coin2: { x: 8, y: 160, width: 8, height: 14 },
            coin3: { x: 16, y: 160, width: 8, height: 14 },
            coin4: { x: 24, y: 160, width: 8, height: 14 },
            
            // Projectiles
            fireball1: { x: 0, y: 192, width: 8, height: 8 },
            fireball2: { x: 8, y: 192, width: 8, height: 8 },
            fireball3: { x: 16, y: 192, width: 8, height: 8 },
            fireball4: { x: 24, y: 192, width: 8, height: 8 },
            
            iceball1: { x: 32, y: 192, width: 8, height: 8 },
            iceball2: { x: 40, y: 192, width: 8, height: 8 },
            iceball3: { x: 48, y: 192, width: 8, height: 8 },
            iceball4: { x: 56, y: 192, width: 8, height: 8 }
        };
    }

    getBlockSpriteData() {
        return {
            type: 'blocks',
            width: 256,
            height: 256,
            fallbackColor: '#CD853F',
            // Question Block
            question_block1: { x: 0, y: 0, width: 16, height: 16 },
            question_block2: { x: 16, y: 0, width: 16, height: 16 },
            question_block3: { x: 32, y: 0, width: 16, height: 16 },
            question_block_empty: { x: 48, y: 0, width: 16, height: 16 },
            
            // Brick Block
            brick_block: { x: 0, y: 32, width: 16, height: 16 },
            brick_block_crack1: { x: 16, y: 32, width: 16, height: 16 },
            brick_block_crack2: { x: 32, y: 32, width: 16, height: 16 },
            
            // Invisible Block
            invisible_block: { x: 0, y: 64, width: 16, height: 16 },
            
            // Pipe
            pipe_top_left: { x: 0, y: 96, width: 16, height: 16 },
            pipe_top_right: { x: 16, y: 96, width: 16, height: 16 },
            pipe_body_left: { x: 0, y: 112, width: 16, height: 16 },
            pipe_body_right: { x: 16, y: 112, width: 16, height: 16 }
        };
    }

    getEffectSpriteData() {
        return {
            type: 'effects',
            width: 128,
            height: 128,
            fallbackColor: '#FFFFFF',
            // Particle effects
            spark1: { x: 0, y: 0, width: 4, height: 4 },
            spark2: { x: 4, y: 0, width: 4, height: 4 },
            spark3: { x: 8, y: 0, width: 4, height: 4 },
            
            // Explosion frames
            explosion1: { x: 0, y: 16, width: 16, height: 16 },
            explosion2: { x: 16, y: 16, width: 16, height: 16 },
            explosion3: { x: 32, y: 16, width: 16, height: 16 },
            explosion4: { x: 48, y: 16, width: 16, height: 16 },
            
            // Ice crystals
            ice_crystal1: { x: 0, y: 32, width: 8, height: 8 },
            ice_crystal2: { x: 8, y: 32, width: 8, height: 8 },
            ice_crystal3: { x: 16, y: 32, width: 8, height: 8 },
            
            // Star sparkles
            star_sparkle1: { x: 0, y: 48, width: 6, height: 6 },
            star_sparkle2: { x: 6, y: 48, width: 6, height: 6 },
            star_sparkle3: { x: 12, y: 48, width: 6, height: 6 }
        };
    }

    getTileSpriteData() {
        return {
            type: 'blocks',
            width: 256,
            height: 256,
            fallbackColor: '#8B4513',
            // Ground tiles
            ground_top: { x: 0, y: 0, width: 16, height: 16 },
            ground_middle: { x: 16, y: 0, width: 16, height: 16 },
            ground_bottom: { x: 32, y: 0, width: 16, height: 16 },
            
            // Platform tiles
            platform_left: { x: 0, y: 32, width: 16, height: 16 },
            platform_middle: { x: 16, y: 32, width: 16, height: 16 },
            platform_right: { x: 32, y: 32, width: 16, height: 16 },
            
            // Special tiles
            ice_tile: { x: 0, y: 64, width: 16, height: 16 },
            lava_tile1: { x: 0, y: 96, width: 16, height: 16 },
            lava_tile2: { x: 16, y: 96, width: 16, height: 16 },
            water_tile1: { x: 0, y: 128, width: 16, height: 16 },
            water_tile2: { x: 16, y: 128, width: 16, height: 16 }
        };
    }

    getLoadingProgress() {
        return {
            loaded: this.loadedCount,
            total: this.totalCount,
            percentage: this.totalCount > 0 ? (this.loadedCount / this.totalCount) * 100 : 0
        };
    }

    isFullyLoaded() {
        return this.loadedCount >= this.totalCount && this.totalCount > 0;
    }

    // Helper method to get sprite names for animations
    getAnimationFrames(sheetName, baseName, frameCount) {
        const frames = [];
        for (let i = 1; i <= frameCount; i++) {
            frames.push(`${baseName}${i}`);
        }
        return frames;
    }

    // Dispose of resources
    dispose() {
        this.sprites.clear();
        this.spriteSheets.clear();
        this.loadingPromises.clear();
    }
}