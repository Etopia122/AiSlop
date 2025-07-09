class GameOverState extends GameState {
    constructor(engine) {
        super(engine);
        this.selectedOption = 0;
        this.menuOptions = ['RETRY', 'MAIN MENU'];
        this.animationTime = 0;
        this.gameOverY = -100;
        this.gameOverTargetY = 150;
        this.showOptions = false;
        this.finalScore = 0;
        this.particles = [];
    }

    initialize() {
        this.createParticles();
    }

    onEnter() {
        this.selectedOption = 0;
        this.animationTime = 0;
        this.gameOverY = -100;
        this.showOptions = false;
        this.finalScore = this.engine.score;
        
        // Play game over sound
        if (this.engine.audio) {
            this.engine.audio.playPlayerDeathSound();
        }
        
        // Show options after delay
        setTimeout(() => {
            this.showOptions = true;
        }, 2000);
    }

    onExit() {
        // Clean up
        this.particles = [];
    }

    createParticles() {
        this.particles = [];
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: Math.random() * this.engine.width,
                y: Math.random() * this.engine.height,
                vx: (Math.random() - 0.5) * 50,
                vy: (Math.random() - 0.5) * 50,
                size: Math.random() * 3 + 1,
                life: Math.random() * 2 + 1,
                maxLife: Math.random() * 2 + 1,
                color: Math.random() > 0.5 ? '#FF0000' : '#FF6600'
            });
        }
    }

    update(deltaTime) {
        super.update(deltaTime);
        
        // Update animation
        this.animationTime += deltaTime;
        
        // Update game over text position
        if (this.gameOverY < this.gameOverTargetY) {
            this.gameOverY += 200 * deltaTime;
            if (this.gameOverY > this.gameOverTargetY) {
                this.gameOverY = this.gameOverTargetY;
            }
        }
        
        // Update particles
        this.updateParticles(deltaTime);
        
        // Handle input
        if (this.showOptions) {
            this.handleInput();
        }
    }

    updateParticles(deltaTime) {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx * deltaTime;
            particle.y += particle.vy * deltaTime;
            particle.life -= deltaTime;
            
            // Wrap around screen
            if (particle.x < 0) particle.x = this.engine.width;
            if (particle.x > this.engine.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.engine.height;
            if (particle.y > this.engine.height) particle.y = 0;
            
            return particle.life > 0;
        });
        
        // Add new particles
        while (this.particles.length < 50) {
            this.particles.push({
                x: Math.random() * this.engine.width,
                y: Math.random() * this.engine.height,
                vx: (Math.random() - 0.5) * 50,
                vy: (Math.random() - 0.5) * 50,
                size: Math.random() * 3 + 1,
                life: Math.random() * 2 + 1,
                maxLife: Math.random() * 2 + 1,
                color: Math.random() > 0.5 ? '#FF0000' : '#FF6600'
            });
        }
    }

    handleInput() {
        const input = this.engine.input;
        
        // Navigate menu
        if (input.wasPressed('up')) {
            this.selectedOption = (this.selectedOption - 1 + this.menuOptions.length) % this.menuOptions.length;
            this.playNavigationSound();
        }
        
        if (input.wasPressed('down')) {
            this.selectedOption = (this.selectedOption + 1) % this.menuOptions.length;
            this.playNavigationSound();
        }
        
        // Select option
        if (input.isStartPressed() || input.isJumpJustPressed()) {
            this.selectOption();
        }
    }

    selectOption() {
        switch (this.selectedOption) {
            case 0: // RETRY
                this.engine.changeState('play');
                break;
            case 1: // MAIN MENU
                this.engine.changeState('menu');
                break;
        }
        
        this.playSelectSound();
    }

    playNavigationSound() {
        if (this.engine.audio) {
            this.engine.audio.createBeep(440, 0.1, 'sine');
        }
    }

    playSelectSound() {
        if (this.engine.audio) {
            this.engine.audio.createBeep(880, 0.2, 'sine');
        }
    }

    render(ctx) {
        super.render(ctx);
        
        // Draw dark background
        this.drawBackground(ctx, '#000033');
        
        // Draw particles
        this.drawParticles(ctx);
        
        // Draw game over text
        this.drawGameOverText(ctx);
        
        // Draw final score
        this.drawFinalScore(ctx);
        
        // Draw menu options
        if (this.showOptions) {
            this.drawMenuOptions(ctx);
        }
        
        // Draw hint
        this.drawHint(ctx);
    }

    drawParticles(ctx) {
        ctx.save();
        
        this.particles.forEach(particle => {
            const alpha = particle.life / particle.maxLife;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.restore();
    }

    drawGameOverText(ctx) {
        const centerX = this.engine.width / 2;
        const textY = this.gameOverY;
        
        ctx.save();
        
        // Shadow
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;
        
        // Main text
        ctx.font = 'bold 64px monospace';
        ctx.fillStyle = '#FF0000';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', centerX, textY);
        
        // Subtitle
        ctx.font = '24px monospace';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('Better luck next time!', centerX, textY + 60);
        
        ctx.restore();
    }

    drawFinalScore(ctx) {
        const centerX = this.engine.width / 2;
        const scoreY = this.gameOverY + 120;
        
        ctx.save();
        
        // Score background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(centerX - 150, scoreY - 30, 300, 60);
        
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.strokeRect(centerX - 150, scoreY - 30, 300, 60);
        
        // Score text
        ctx.font = 'bold 32px monospace';
        ctx.fillStyle = '#FFD700';
        ctx.textAlign = 'center';
        ctx.fillText(`FINAL SCORE: ${this.finalScore.toString().padStart(6, '0')}`, centerX, scoreY + 10);
        
        ctx.restore();
    }

    drawMenuOptions(ctx) {
        const centerX = this.engine.width / 2;
        const startY = 350;
        const spacing = 50;
        
        ctx.save();
        
        this.menuOptions.forEach((option, index) => {
            const y = startY + index * spacing;
            const isSelected = index === this.selectedOption;
            
            // Button background
            if (isSelected) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.fillRect(centerX - 100, y - 20, 200, 40);
                
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 2;
                ctx.strokeRect(centerX - 100, y - 20, 200, 40);
            }
            
            // Button text
            ctx.font = isSelected ? 'bold 24px monospace' : '20px monospace';
            ctx.fillStyle = isSelected ? '#FFFFFF' : '#CCCCCC';
            ctx.textAlign = 'center';
            ctx.fillText(option, centerX, y + 5);
            
            // Selection indicator
            if (isSelected) {
                const indicatorX = centerX - 120;
                const bounce = Math.sin(this.animationTime * 4) * 3;
                
                ctx.fillStyle = '#FFFFFF';
                ctx.fillText('>', indicatorX, y + 5 + bounce);
                ctx.fillText('<', centerX + 120, y + 5 + bounce);
            }
        });
        
        ctx.restore();
    }

    drawHint(ctx) {
        if (!this.showOptions) return;
        
        ctx.save();
        ctx.font = '14px monospace';
        ctx.fillStyle = '#AAAAAA';
        ctx.textAlign = 'center';
        ctx.fillText('Use ARROW KEYS to navigate, SPACE/ENTER to select', 
                    this.engine.width / 2, this.engine.height - 30);
        ctx.restore();
    }
}