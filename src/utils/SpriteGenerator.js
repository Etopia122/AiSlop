// Sprite Generator - Creates procedural pixel art sprites
class SpriteGenerator {
    static generateMarioSprites() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Disable smoothing for pixel art
        ctx.imageSmoothingEnabled = false;
        
        // Small Mario sprites
        this.drawSmallMario(ctx, 0, 0, '#FF0000', '#0000FF', '#FFFF00'); // Idle
        this.drawSmallMario(ctx, 16, 0, '#FF0000', '#0000FF', '#FFFF00', true); // Walk 1
        this.drawSmallMario(ctx, 32, 0, '#FF0000', '#0000FF', '#FFFF00', false, true); // Walk 2
        this.drawSmallMario(ctx, 48, 0, '#FF0000', '#0000FF', '#FFFF00', true, true); // Walk 3
        this.drawSmallMario(ctx, 64, 0, '#FF0000', '#0000FF', '#FFFF00', false, false, true); // Jump
        this.drawSmallMario(ctx, 80, 0, '#FF0000', '#0000FF', '#FFFF00', false, false, false, true); // Crouch
        
        // Big Mario sprites
        this.drawBigMario(ctx, 0, 32, '#FF0000', '#0000FF', '#FFFF00'); // Idle
        this.drawBigMario(ctx, 16, 32, '#FF0000', '#0000FF', '#FFFF00', true); // Walk 1
        this.drawBigMario(ctx, 32, 32, '#FF0000', '#0000FF', '#FFFF00', false, true); // Walk 2
        this.drawBigMario(ctx, 48, 32, '#FF0000', '#0000FF', '#FFFF00', true, true); // Walk 3
        this.drawBigMario(ctx, 64, 32, '#FF0000', '#0000FF', '#FFFF00', false, false, true); // Jump
        this.drawBigMario(ctx, 80, 32, '#FF0000', '#0000FF', '#FFFF00', false, false, false, true); // Crouch
        
        // Fire Mario sprites
        this.drawBigMario(ctx, 0, 64, '#FFFFFF', '#FF6600', '#FFFF00'); // Idle
        this.drawBigMario(ctx, 16, 64, '#FFFFFF', '#FF6600', '#FFFF00', true); // Walk 1
        this.drawBigMario(ctx, 32, 64, '#FFFFFF', '#FF6600', '#FFFF00', false, true); // Walk 2
        this.drawBigMario(ctx, 48, 64, '#FFFFFF', '#FF6600', '#FFFF00', true, true); // Walk 3
        this.drawBigMario(ctx, 64, 64, '#FFFFFF', '#FF6600', '#FFFF00', false, false, true); // Jump
        this.drawBigMario(ctx, 80, 64, '#FFFFFF', '#FF6600', '#FFFF00', false, false, false, true); // Crouch
        
        // Ice Mario sprites
        this.drawBigMario(ctx, 0, 96, '#FFFFFF', '#87CEEB', '#FFFF00'); // Idle
        this.drawBigMario(ctx, 16, 96, '#FFFFFF', '#87CEEB', '#FFFF00', true); // Walk 1
        this.drawBigMario(ctx, 32, 96, '#FFFFFF', '#87CEEB', '#FFFF00', false, true); // Walk 2
        this.drawBigMario(ctx, 48, 96, '#FFFFFF', '#87CEEB', '#FFFF00', true, true); // Walk 3
        this.drawBigMario(ctx, 64, 96, '#FFFFFF', '#87CEEB', '#FFFF00', false, false, true); // Jump
        this.drawBigMario(ctx, 80, 96, '#FFFFFF', '#87CEEB', '#FFFF00', false, false, false, true); // Crouch
        
        return canvas;
    }
    
    static drawSmallMario(ctx, x, y, hatColor, shirtColor, skinColor, walking = false, walkFrame2 = false, jumping = false, crouching = false) {
        // Head (5x5)
        ctx.fillStyle = skinColor;
        ctx.fillRect(x + 5, y + 1, 6, 5);
        
        // Hat (6x3)
        ctx.fillStyle = hatColor;
        ctx.fillRect(x + 4, y + 0, 8, 3);
        
        // Shirt (6x4)
        ctx.fillStyle = shirtColor;
        ctx.fillRect(x + 4, y + 6, 8, 4);
        
        // Overalls
        ctx.fillStyle = '#0000AA';
        ctx.fillRect(x + 5, y + 10, 6, 4);
        
        // Legs
        ctx.fillStyle = '#8B4513';
        if (walking && walkFrame2) {
            ctx.fillRect(x + 3, y + 14, 3, 2);
            ctx.fillRect(x + 10, y + 14, 3, 2);
        } else {
            ctx.fillRect(x + 6, y + 14, 2, 2);
            ctx.fillRect(x + 8, y + 14, 2, 2);
        }
    }
    
    static drawBigMario(ctx, x, y, hatColor, shirtColor, skinColor, walking = false, walkFrame2 = false, jumping = false, crouching = false) {
        // Head (6x6)
        ctx.fillStyle = skinColor;
        ctx.fillRect(x + 5, y + 1, 6, 6);
        
        // Hat (8x4)
        ctx.fillStyle = hatColor;
        ctx.fillRect(x + 4, y + 0, 8, 4);
        
        // Shirt (8x8)
        ctx.fillStyle = shirtColor;
        ctx.fillRect(x + 4, y + 7, 8, 8);
        
        // Overalls
        ctx.fillStyle = '#0000AA';
        ctx.fillRect(x + 5, y + 15, 6, 8);
        
        // Legs
        ctx.fillStyle = '#8B4513';
        if (crouching) {
            ctx.fillRect(x + 4, y + 23, 8, 6);
        } else if (walking && walkFrame2) {
            ctx.fillRect(x + 3, y + 23, 3, 6);
            ctx.fillRect(x + 10, y + 23, 3, 6);
        } else {
            ctx.fillRect(x + 6, y + 23, 2, 6);
            ctx.fillRect(x + 8, y + 23, 2, 6);
        }
    }
    
    static generateEnemySprites() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        ctx.imageSmoothingEnabled = false;
        
        // Goomba sprites
        this.drawGoomba(ctx, 0, 0, false);
        this.drawGoomba(ctx, 16, 0, true);
        this.drawGoombaDead(ctx, 32, 0);
        
        // Koopa sprites
        this.drawKoopa(ctx, 0, 32, '#228B22', false);
        this.drawKoopa(ctx, 16, 32, '#228B22', true);
        this.drawKoopaShell(ctx, 32, 32, '#228B22');
        this.drawKoopaShell(ctx, 48, 32, '#228B22', true);
        this.drawKoopaShell(ctx, 64, 32, '#228B22', false, true);
        
        // Piranha Plant sprites
        this.drawPiranhaPlant(ctx, 0, 64, false);
        this.drawPiranhaPlant(ctx, 16, 64, true);
        this.drawPiranhaPlant(ctx, 32, 64, false, true);
        this.drawPiranhaPlant(ctx, 48, 64, true, true);
        
        // Buzzy Beetle sprites
        this.drawBuzzy(ctx, 0, 96, false);
        this.drawBuzzy(ctx, 16, 96, true);
        this.drawBuzzyShell(ctx, 32, 96);
        this.drawBuzzyShell(ctx, 48, 96, true);
        this.drawBuzzyShell(ctx, 64, 96, false, true);
        
        // Spiny sprites
        this.drawSpiny(ctx, 0, 128, false);
        this.drawSpiny(ctx, 16, 128, true);
        this.drawSpiny(ctx, 32, 128, false, true);
        
        // Boo sprites
        this.drawBoo(ctx, 0, 160, 'normal');
        this.drawBoo(ctx, 16, 160, 'normal');
        this.drawBoo(ctx, 32, 160, 'shy');
        this.drawBoo(ctx, 48, 160, 'chase');
        this.drawBoo(ctx, 64, 160, 'chase');
        
        return canvas;
    }
    
    static drawGoomba(ctx, x, y, walking) {
        // Body
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x + 2, y + 4, 12, 8);
        
        // Head
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x + 1, y + 0, 14, 8);
        
        // Eyes
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 3, y + 2, 2, 2);
        ctx.fillRect(x + 11, y + 2, 2, 2);
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 4, y + 2, 1, 2);
        ctx.fillRect(x + 11, y + 2, 1, 2);
        
        // Feet
        ctx.fillStyle = '#8B4513';
        if (walking) {
            ctx.fillRect(x + 0, y + 12, 4, 4);
            ctx.fillRect(x + 12, y + 12, 4, 4);
        } else {
            ctx.fillRect(x + 2, y + 12, 4, 4);
            ctx.fillRect(x + 10, y + 12, 4, 4);
        }
    }
    
    static drawGoombaDead(ctx, x, y) {
        // Squashed body
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x + 0, y + 12, 16, 4);
        
        // Eyes
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 3, y + 13, 2, 1);
        ctx.fillRect(x + 11, y + 13, 2, 1);
    }
    
    static drawKoopa(ctx, x, y, shellColor, walking) {
        // Shell
        ctx.fillStyle = shellColor;
        ctx.fillRect(x + 2, y + 2, 12, 10);
        
        // Head
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(x + 4, y + 0, 8, 6);
        
        // Eyes
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 5, y + 1, 1, 1);
        ctx.fillRect(x + 10, y + 1, 1, 1);
        
        // Legs
        ctx.fillStyle = '#FFFF00';
        if (walking) {
            ctx.fillRect(x + 1, y + 12, 3, 6);
            ctx.fillRect(x + 12, y + 12, 3, 6);
        } else {
            ctx.fillRect(x + 3, y + 12, 3, 6);
            ctx.fillRect(x + 10, y + 12, 3, 6);
        }
    }
    
    static drawKoopaShell(ctx, x, y, color, spinning = false, alt = false) {
        // Shell body
        ctx.fillStyle = color;
        ctx.fillRect(x + 2, y + 4, 12, 8);
        
        // Shell pattern
        ctx.fillStyle = spinning || alt ? '#FFFFFF' : '#FFFF00';
        ctx.fillRect(x + 4, y + 6, 8, 4);
        
        if (spinning) {
            // Motion lines
            ctx.fillStyle = '#FFFF00';
            ctx.fillRect(x + 0, y + 8, 2, 1);
            ctx.fillRect(x + 14, y + 8, 2, 1);
        }
    }
    
    static drawPiranhaPlant(ctx, x, y, open, chomping = false) {
        // Stem
        ctx.fillStyle = '#00AA00';
        ctx.fillRect(x + 6, y + 12, 4, 12);
        
        // Head
        ctx.fillStyle = '#AA0000';
        if (open || chomping) {
            ctx.fillRect(x + 2, y + 0, 12, 8);
            ctx.fillRect(x + 4, y + 8, 8, 4);
            
            // Teeth
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(x + 4, y + 2, 2, 2);
            ctx.fillRect(x + 10, y + 2, 2, 2);
            ctx.fillRect(x + 6, y + 8, 2, 2);
            ctx.fillRect(x + 8, y + 8, 2, 2);
        } else {
            ctx.fillRect(x + 4, y + 0, 8, 8);
        }
        
        // Spots
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 6, y + 2, 2, 2);
        ctx.fillRect(x + 8, y + 4, 2, 2);
    }
    
    static drawBuzzy(ctx, x, y, walking) {
        // Shell
        ctx.fillStyle = '#444444';
        ctx.fillRect(x + 2, y + 2, 12, 10);
        
        // Head
        ctx.fillStyle = '#666666';
        ctx.fillRect(x + 4, y + 0, 8, 6);
        
        // Eyes
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(x + 5, y + 1, 1, 1);
        ctx.fillRect(x + 10, y + 1, 1, 1);
        
        // Legs
        ctx.fillStyle = '#666666';
        if (walking) {
            ctx.fillRect(x + 1, y + 12, 3, 4);
            ctx.fillRect(x + 12, y + 12, 3, 4);
        } else {
            ctx.fillRect(x + 3, y + 12, 3, 4);
            ctx.fillRect(x + 10, y + 12, 3, 4);
        }
    }
    
    static drawBuzzyShell(ctx, x, y, spinning = false, alt = false) {
        // Shell body
        ctx.fillStyle = '#444444';
        ctx.fillRect(x + 2, y + 6, 12, 6);
        
        // Shell highlights
        ctx.fillStyle = '#666666';
        ctx.fillRect(x + 4, y + 7, 8, 2);
        
        if (spinning) {
            // Sparks
            ctx.fillStyle = '#FFAA00';
            ctx.fillRect(x + 0, y + 9, 1, 1);
            ctx.fillRect(x + 15, y + 9, 1, 1);
        }
    }
    
    static drawSpiny(ctx, x, y, walking, defensive = false) {
        // Body
        ctx.fillStyle = '#AA0000';
        ctx.fillRect(x + 2, y + 4, 12, 8);
        
        // Spikes
        ctx.fillStyle = '#FFFF00';
        if (defensive) {
            ctx.fillRect(x + 1, y + 2, 2, 2);
            ctx.fillRect(x + 7, y + 0, 2, 2);
            ctx.fillRect(x + 13, y + 2, 2, 2);
            ctx.fillRect(x + 0, y + 8, 2, 2);
            ctx.fillRect(x + 14, y + 8, 2, 2);
        } else {
            ctx.fillRect(x + 3, y + 2, 2, 2);
            ctx.fillRect(x + 11, y + 2, 2, 2);
            ctx.fillRect(x + 7, y + 0, 2, 2);
        }
        
        // Eyes
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 5, y + 6, 1, 1);
        ctx.fillRect(x + 10, y + 6, 1, 1);
        
        // Feet
        ctx.fillStyle = '#AA0000';
        if (walking) {
            ctx.fillRect(x + 1, y + 12, 3, 4);
            ctx.fillRect(x + 12, y + 12, 3, 4);
        } else {
            ctx.fillRect(x + 3, y + 12, 3, 4);
            ctx.fillRect(x + 10, y + 12, 3, 4);
        }
    }
    
    static drawBoo(ctx, x, y, state) {
        // Body
        ctx.fillStyle = state === 'shy' ? '#DDDDDD' : '#FFFFFF';
        ctx.fillRect(x + 2, y + 2, 12, 10);
        ctx.fillRect(x + 3, y + 12, 10, 2);
        ctx.fillRect(x + 4, y + 14, 8, 1);
        
        // Eyes
        if (state === 'shy') {
            // Shy eyes (closed)
            ctx.fillStyle = '#000000';
            ctx.fillRect(x + 5, y + 5, 2, 1);
            ctx.fillRect(x + 9, y + 5, 2, 1);
        } else {
            // Normal eyes
            ctx.fillStyle = '#000000';
            ctx.fillRect(x + 5, y + 4, 2, 3);
            ctx.fillRect(x + 9, y + 4, 2, 3);
            
            if (state === 'chase') {
                // Angry expression
                ctx.fillStyle = '#FF0000';
                ctx.fillRect(x + 5, y + 4, 1, 1);
                ctx.fillRect(x + 10, y + 4, 1, 1);
            }
        }
        
        // Mouth
        if (state !== 'shy') {
            ctx.fillStyle = '#000000';
            ctx.fillRect(x + 7, y + 8, 2, 1);
        }
    }
    
    static generatePowerupSprites() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        ctx.imageSmoothingEnabled = false;
        
        // Mushroom
        this.drawMushroom(ctx, 0, 0);
        
        // Fire Flower
        this.drawFireFlower(ctx, 0, 32, 1);
        this.drawFireFlower(ctx, 16, 32, 2);
        this.drawFireFlower(ctx, 32, 32, 3);
        this.drawFireFlower(ctx, 48, 32, 4);
        
        // Ice Flower
        this.drawIceFlower(ctx, 0, 64, 1);
        this.drawIceFlower(ctx, 16, 64, 2);
        this.drawIceFlower(ctx, 32, 64, 3);
        this.drawIceFlower(ctx, 48, 64, 4);
        
        // Star
        this.drawStar(ctx, 0, 96, 1);
        this.drawStar(ctx, 16, 96, 2);
        this.drawStar(ctx, 32, 96, 3);
        this.drawStar(ctx, 48, 96, 4);
        
        // 1-Up Mushroom
        this.drawOneUpMushroom(ctx, 0, 128);
        
        // Coins
        this.drawCoin(ctx, 0, 160, 1);
        this.drawCoin(ctx, 8, 160, 2);
        this.drawCoin(ctx, 16, 160, 3);
        this.drawCoin(ctx, 24, 160, 4);
        
        // Projectiles
        this.drawFireball(ctx, 0, 192, 1);
        this.drawFireball(ctx, 8, 192, 2);
        this.drawFireball(ctx, 16, 192, 3);
        this.drawFireball(ctx, 24, 192, 4);
        
        this.drawIceball(ctx, 32, 192, 1);
        this.drawIceball(ctx, 40, 192, 2);
        this.drawIceball(ctx, 48, 192, 3);
        this.drawIceball(ctx, 56, 192, 4);
        
        return canvas;
    }
    
    static drawMushroom(ctx, x, y) {
        // Cap
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(x + 2, y + 0, 12, 8);
        
        // Dots
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 4, y + 2, 2, 2);
        ctx.fillRect(x + 10, y + 2, 2, 2);
        ctx.fillRect(x + 7, y + 5, 2, 2);
        
        // Stem
        ctx.fillStyle = '#FFDDAA';
        ctx.fillRect(x + 6, y + 8, 4, 8);
    }
    
    static drawFireFlower(ctx, x, y, frame) {
        // Stem
        ctx.fillStyle = '#00AA00';
        ctx.fillRect(x + 6, y + 8, 4, 8);
        
        // Petals
        const colors = ['#FF6600', '#FFAA00', '#FF6600', '#FFAA00'];
        ctx.fillStyle = colors[(frame - 1) % colors.length];
        
        // Flower head
        ctx.fillRect(x + 4, y + 2, 8, 6);
        ctx.fillRect(x + 2, y + 4, 4, 2);
        ctx.fillRect(x + 10, y + 4, 4, 2);
        
        // Center
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(x + 6, y + 4, 4, 2);
    }
    
    static drawIceFlower(ctx, x, y, frame) {
        // Stem
        ctx.fillStyle = '#00AA00';
        ctx.fillRect(x + 6, y + 8, 4, 8);
        
        // Petals
        const colors = ['#87CEEB', '#B0E0E6', '#87CEEB', '#B0E0E6'];
        ctx.fillStyle = colors[(frame - 1) % colors.length];
        
        // Flower head
        ctx.fillRect(x + 4, y + 2, 8, 6);
        ctx.fillRect(x + 2, y + 4, 4, 2);
        ctx.fillRect(x + 10, y + 4, 4, 2);
        
        // Center
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 6, y + 4, 4, 2);
    }
    
    static drawStar(ctx, x, y, frame) {
        // Star shape
        const colors = ['#FFD700', '#FFFF00', '#FFD700', '#FFFF00'];
        ctx.fillStyle = colors[(frame - 1) % colors.length];
        
        // Center
        ctx.fillRect(x + 6, y + 4, 4, 8);
        ctx.fillRect(x + 4, y + 6, 8, 4);
        
        // Points
        ctx.fillRect(x + 7, y + 0, 2, 4);
        ctx.fillRect(x + 7, y + 12, 2, 4);
        ctx.fillRect(x + 0, y + 7, 4, 2);
        ctx.fillRect(x + 12, y + 7, 4, 2);
        
        // Diagonal points
        ctx.fillRect(x + 2, y + 2, 2, 2);
        ctx.fillRect(x + 12, y + 2, 2, 2);
        ctx.fillRect(x + 2, y + 12, 2, 2);
        ctx.fillRect(x + 12, y + 12, 2, 2);
    }
    
    static drawOneUpMushroom(ctx, x, y) {
        // Cap
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(x + 2, y + 0, 12, 8);
        
        // Dots
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 4, y + 2, 2, 2);
        ctx.fillRect(x + 10, y + 2, 2, 2);
        ctx.fillRect(x + 7, y + 5, 2, 2);
        
        // Stem
        ctx.fillStyle = '#FFDDAA';
        ctx.fillRect(x + 6, y + 8, 4, 8);
    }
    
    static drawCoin(ctx, x, y, frame) {
        const widths = [8, 6, 4, 6];
        const width = widths[(frame - 1) % widths.length];
        const offset = (8 - width) / 2;
        
        // Coin
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x + offset, y + 1, width, 12);
        
        // Highlight
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(x + offset, y + 1, Math.max(1, width - 2), 2);
    }
    
    static drawFireball(ctx, x, y, frame) {
        // Fireball
        const colors = ['#FF6600', '#FFAA00', '#FF0000', '#FFAA00'];
        ctx.fillStyle = colors[(frame - 1) % colors.length];
        ctx.fillRect(x + 1, y + 1, 6, 6);
        
        // Core
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(x + 3, y + 3, 2, 2);
    }
    
    static drawIceball(ctx, x, y, frame) {
        // Iceball
        const colors = ['#87CEEB', '#B0E0E6', '#FFFFFF', '#B0E0E6'];
        ctx.fillStyle = colors[(frame - 1) % colors.length];
        ctx.fillRect(x + 1, y + 1, 6, 6);
        
        // Core
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 3, y + 3, 2, 2);
    }
    
    static generateBlockSprites() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        ctx.imageSmoothingEnabled = false;
        
        // Question blocks
        this.drawQuestionBlock(ctx, 0, 0, 1);
        this.drawQuestionBlock(ctx, 16, 0, 2);
        this.drawQuestionBlock(ctx, 32, 0, 3);
        this.drawQuestionBlockEmpty(ctx, 48, 0);
        
        // Brick blocks
        this.drawBrickBlock(ctx, 0, 32);
        this.drawBrickBlock(ctx, 16, 32, 1); // Cracked
        this.drawBrickBlock(ctx, 32, 32, 2); // More cracked
        
        // Invisible block
        this.drawInvisibleBlock(ctx, 0, 64);
        
        // Pipe parts
        this.drawPipe(ctx, 0, 96, 'top_left');
        this.drawPipe(ctx, 16, 96, 'top_right');
        this.drawPipe(ctx, 0, 112, 'body_left');
        this.drawPipe(ctx, 16, 112, 'body_right');
        
        return canvas;
    }
    
    static drawQuestionBlock(ctx, x, y, frame) {
        // Block background
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x + 0, y + 0, 16, 16);
        
        // Question mark
        const alpha = 0.5 + Math.sin(frame * 0.5) * 0.5;
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        
        // Question mark shape
        ctx.fillRect(x + 5, y + 2, 6, 2);
        ctx.fillRect(x + 9, y + 4, 2, 4);
        ctx.fillRect(x + 5, y + 8, 6, 2);
        ctx.fillRect(x + 7, y + 12, 2, 2);
        
        // Border
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 0, y + 0, 16, 1); // Top
        ctx.fillRect(x + 0, y + 15, 16, 1); // Bottom
        ctx.fillRect(x + 0, y + 0, 1, 16); // Left
        ctx.fillRect(x + 15, y + 0, 1, 16); // Right
    }
    
    static drawQuestionBlockEmpty(ctx, x, y) {
        // Block background (darker)
        ctx.fillStyle = '#996600';
        ctx.fillRect(x + 0, y + 0, 16, 16);
        
        // Border
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 0, y + 0, 16, 1);
        ctx.fillRect(x + 0, y + 15, 16, 1);
        ctx.fillRect(x + 0, y + 0, 1, 16);
        ctx.fillRect(x + 15, y + 0, 1, 16);
    }
    
    static drawBrickBlock(ctx, x, y, crackLevel = 0) {
        // Block background
        ctx.fillStyle = '#CD853F';
        ctx.fillRect(x + 0, y + 0, 16, 16);
        
        // Brick pattern
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x + 0, y + 4, 8, 1);
        ctx.fillRect(x + 8, y + 4, 8, 1);
        ctx.fillRect(x + 4, y + 8, 8, 1);
        ctx.fillRect(x + 0, y + 12, 4, 1);
        ctx.fillRect(x + 12, y + 12, 4, 1);
        
        // Cracks
        if (crackLevel > 0) {
            ctx.fillStyle = '#654321';
            ctx.fillRect(x + 2, y + 2, 1, 6);
            ctx.fillRect(x + 6, y + 3, 4, 1);
            
            if (crackLevel > 1) {
                ctx.fillRect(x + 10, y + 6, 1, 4);
                ctx.fillRect(x + 8, y + 10, 3, 1);
            }
        }
        
        // Border
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 0, y + 0, 16, 1);
        ctx.fillRect(x + 0, y + 15, 16, 1);
        ctx.fillRect(x + 0, y + 0, 1, 16);
        ctx.fillRect(x + 15, y + 0, 1, 16);
    }
    
    static drawInvisibleBlock(ctx, x, y) {
        // Very faint outline
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(x + 0, y + 0, 16, 16);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(x + 0, y + 0, 16, 1);
        ctx.fillRect(x + 0, y + 15, 16, 1);
        ctx.fillRect(x + 0, y + 0, 1, 16);
        ctx.fillRect(x + 15, y + 0, 1, 16);
    }
    
    static drawPipe(ctx, x, y, type) {
        // Base color
        ctx.fillStyle = '#00AA00';
        ctx.fillRect(x + 0, y + 0, 16, 16);
        
        // Highlights
        ctx.fillStyle = '#00FF00';
        if (type.includes('top')) {
            ctx.fillRect(x + 2, y + 0, 12, 4);
        }
        if (type.includes('left')) {
            ctx.fillRect(x + 0, y + 0, 4, 16);
        }
        if (type.includes('right')) {
            ctx.fillRect(x + 12, y + 0, 4, 16);
        }
        
        // Shadows
        ctx.fillStyle = '#006600';
        if (type.includes('body')) {
            ctx.fillRect(x + 8, y + 0, 1, 16);
        }
        
        // Border
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 0, y + 0, 16, 1);
        ctx.fillRect(x + 0, y + 15, 16, 1);
        ctx.fillRect(x + 0, y + 0, 1, 16);
        ctx.fillRect(x + 15, y + 0, 1, 16);
    }
    
    static generateTileSprites() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        ctx.imageSmoothingEnabled = false;
        
        // Ground tiles
        this.drawGroundTile(ctx, 0, 0, 'top');
        this.drawGroundTile(ctx, 16, 0, 'middle');
        this.drawGroundTile(ctx, 32, 0, 'bottom');
        
        // Platform tiles
        this.drawPlatformTile(ctx, 0, 32, 'left');
        this.drawPlatformTile(ctx, 16, 32, 'middle');
        this.drawPlatformTile(ctx, 32, 32, 'right');
        
        // Special tiles
        this.drawIceTile(ctx, 0, 64);
        this.drawLavaTile(ctx, 0, 96, 1);
        this.drawLavaTile(ctx, 16, 96, 2);
        this.drawWaterTile(ctx, 0, 128, 1);
        this.drawWaterTile(ctx, 16, 128, 2);
        
        return canvas;
    }
    
    static drawGroundTile(ctx, x, y, type) {
        // Base ground color
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x + 0, y + 0, 16, 16);
        
        if (type === 'top') {
            // Grass on top
            ctx.fillStyle = '#228B22';
            ctx.fillRect(x + 0, y + 0, 16, 4);
            
            // Grass blades
            ctx.fillStyle = '#32CD32';
            ctx.fillRect(x + 2, y + 0, 1, 2);
            ctx.fillRect(x + 6, y + 0, 1, 3);
            ctx.fillRect(x + 10, y + 0, 1, 2);
            ctx.fillRect(x + 14, y + 0, 1, 3);
        }
        
        // Dirt pattern
        ctx.fillStyle = '#654321';
        ctx.fillRect(x + 3, y + 6, 2, 2);
        ctx.fillRect(x + 8, y + 8, 1, 1);
        ctx.fillRect(x + 12, y + 10, 2, 1);
    }
    
    static drawPlatformTile(ctx, x, y, type) {
        // Platform color
        ctx.fillStyle = '#228B22';
        ctx.fillRect(x + 0, y + 0, 16, 16);
        
        // Highlights
        ctx.fillStyle = '#32CD32';
        ctx.fillRect(x + 0, y + 0, 16, 4);
        
        // Side edges
        if (type === 'left') {
            ctx.fillStyle = '#006400';
            ctx.fillRect(x + 0, y + 0, 2, 16);
        } else if (type === 'right') {
            ctx.fillStyle = '#006400';
            ctx.fillRect(x + 14, y + 0, 2, 16);
        }
    }
    
    static drawIceTile(ctx, x, y) {
        // Ice color
        ctx.fillStyle = '#B0E0E6';
        ctx.fillRect(x + 0, y + 0, 16, 16);
        
        // Ice crystals
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 2, y + 2, 3, 1);
        ctx.fillRect(x + 3, y + 3, 1, 3);
        ctx.fillRect(x + 8, y + 6, 2, 1);
        ctx.fillRect(x + 9, y + 7, 1, 2);
        ctx.fillRect(x + 12, y + 10, 3, 1);
        ctx.fillRect(x + 13, y + 11, 1, 2);
    }
    
    static drawLavaTile(ctx, x, y, frame) {
        // Lava colors
        const colors = ['#FF4500', '#FF6600'];
        ctx.fillStyle = colors[(frame - 1) % colors.length];
        ctx.fillRect(x + 0, y + 0, 16, 16);
        
        // Bubbles
        ctx.fillStyle = '#FFAA00';
        if (frame === 1) {
            ctx.fillRect(x + 3, y + 4, 2, 2);
            ctx.fillRect(x + 10, y + 8, 3, 3);
        } else {
            ctx.fillRect(x + 6, y + 2, 2, 2);
            ctx.fillRect(x + 12, y + 12, 2, 2);
        }
    }
    
    static drawWaterTile(ctx, x, y, frame) {
        // Water colors
        const colors = ['#1E90FF', '#4169E1'];
        ctx.fillStyle = colors[(frame - 1) % colors.length];
        ctx.fillRect(x + 0, y + 0, 16, 16);
        
        // Waves
        ctx.fillStyle = '#87CEEB';
        if (frame === 1) {
            ctx.fillRect(x + 0, y + 3, 16, 1);
            ctx.fillRect(x + 0, y + 8, 16, 1);
            ctx.fillRect(x + 0, y + 13, 16, 1);
        } else {
            ctx.fillRect(x + 0, y + 5, 16, 1);
            ctx.fillRect(x + 0, y + 10, 16, 1);
        }
    }
    
    static generateEffectSprites() {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        
        ctx.imageSmoothingEnabled = false;
        
        // Spark effects
        this.drawSpark(ctx, 0, 0, 1);
        this.drawSpark(ctx, 4, 0, 2);
        this.drawSpark(ctx, 8, 0, 3);
        
        // Explosion frames
        this.drawExplosion(ctx, 0, 16, 1);
        this.drawExplosion(ctx, 16, 16, 2);
        this.drawExplosion(ctx, 32, 16, 3);
        this.drawExplosion(ctx, 48, 16, 4);
        
        return canvas;
    }
    
    static drawSpark(ctx, x, y, frame) {
        const colors = ['#FFFF00', '#FFAA00', '#FF6600'];
        ctx.fillStyle = colors[(frame - 1) % colors.length];
        ctx.fillRect(x + 1, y + 1, 2, 2);
    }
    
    static drawExplosion(ctx, x, y, frame) {
        const size = frame * 2;
        const offset = (16 - size) / 2;
        
        // Explosion colors
        const colors = ['#FFFF00', '#FF6600', '#FF0000', '#AA0000'];
        ctx.fillStyle = colors[frame - 1];
        ctx.fillRect(x + offset, y + offset, size, size);
        
        // Add some randomness
        if (frame > 1) {
            ctx.fillStyle = '#FFAA00';
            ctx.fillRect(x + offset + 1, y + offset + 1, size - 2, size - 2);
        }
    }
}