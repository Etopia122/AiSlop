class MenuState extends GameState {
    constructor(engine) {
        super(engine);
        this.selectedOption = 0;
        this.menuOptions = ['START GAME', 'SETTINGS', 'CREDITS'];
        this.titleAnimation = 0;
        this.starField = [];
        this.logoY = 0;
        this.logoTargetY = 150;
        this.logoSpeed = 2;
    }

    initialize() {
        this.createStarField();
        this.logoY = -100;
    }

    onEnter() {
        this.selectedOption = 0;
        this.logoY = -100;
        
        // Start menu music
        // this.engine.audio.playMusic('menu');
    }

    onExit() {
        // Stop menu music
        // this.engine.audio.stopMusic();
    }

    createStarField() {
        this.starField = [];
        for (let i = 0; i < 100; i++) {
            this.starField.push({
                x: Math.random() * this.engine.width,
                y: Math.random() * this.engine.height,
                size: Math.random() * 2 + 1,
                speed: Math.random() * 20 + 10,
                brightness: Math.random() * 0.8 + 0.2
            });
        }
    }

    update(deltaTime) {
        super.update(deltaTime);
        
        // Update title animation
        this.titleAnimation += deltaTime * 2;
        
        // Update logo position
        if (this.logoY < this.logoTargetY) {
            this.logoY += this.logoSpeed * deltaTime * 60;
            if (this.logoY > this.logoTargetY) {
                this.logoY = this.logoTargetY;
            }
        }
        
        // Update star field
        this.updateStarField(deltaTime);
        
        // Handle input
        this.handleInput();
    }

    updateStarField(deltaTime) {
        this.starField.forEach(star => {
            star.y += star.speed * deltaTime;
            
            // Wrap around
            if (star.y > this.engine.height) {
                star.y = -star.size;
                star.x = Math.random() * this.engine.width;
            }
        });
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
            case 0: // START GAME
                this.engine.changeState('play');
                break;
            case 1: // SETTINGS
                this.showSettings();
                break;
            case 2: // CREDITS
                this.showCredits();
                break;
        }
        
        this.playSelectSound();
    }

    showSettings() {
        // TODO: Implement settings menu
        console.log('Settings menu not implemented yet');
    }

    showCredits() {
        // TODO: Implement credits screen
        console.log('Credits screen not implemented yet');
    }

    playNavigationSound() {
        // Play menu navigation sound
        if (this.engine.audio) {
            this.engine.audio.createBeep(440, 0.1, 'sine');
        }
    }

    playSelectSound() {
        // Play menu select sound
        if (this.engine.audio) {
            this.engine.audio.createBeep(880, 0.2, 'sine');
        }
    }

    render(ctx) {
        super.render(ctx);
        
        // Draw star field background
        this.drawStarField(ctx);
        
        // Draw gradient background
        this.drawGradientBackground(ctx);
        
        // Draw title
        this.drawTitle(ctx);
        
        // Draw menu options
        this.drawMenuOptions(ctx);
        
        // Draw version info
        this.drawVersionInfo(ctx);
        
        // Draw controls hint
        this.drawControlsHint(ctx);
    }

    drawStarField(ctx) {
        ctx.save();
        this.starField.forEach(star => {
            ctx.globalAlpha = star.brightness;
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }

    drawGradientBackground(ctx) {
        const gradient = ctx.createLinearGradient(0, 0, 0, this.engine.height);
        gradient.addColorStop(0, 'rgba(0, 0, 50, 0.8)');
        gradient.addColorStop(1, 'rgba(0, 0, 100, 0.3)');
        
        ctx.save();
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.engine.width, this.engine.height);
        ctx.restore();
    }

    drawTitle(ctx) {
        const centerX = this.engine.width / 2;
        const titleY = this.logoY;
        
        // Main title
        ctx.save();
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        
        // Title animation
        const bounce = Math.sin(this.titleAnimation) * 5;
        
        // Draw title with rainbow effect
        const titleText = 'MARIO BROS';
        ctx.font = 'bold 48px monospace';
        ctx.textAlign = 'center';
        
        // Rainbow colors
        const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];
        
        for (let i = 0; i < titleText.length; i++) {
            const char = titleText[i];
            const colorIndex = (i + Math.floor(this.titleAnimation * 2)) % colors.length;
            const charX = centerX - (titleText.length * 24) / 2 + i * 24;
            const charY = titleY + bounce + Math.sin(this.titleAnimation + i * 0.5) * 3;
            
            ctx.fillStyle = colors[colorIndex];
            ctx.fillText(char, charX, charY);
        }
        
        // Subtitle
        ctx.font = '20px monospace';
        ctx.fillStyle = '#FFD700';
        ctx.fillText('PLATFORMER ENGINE', centerX, titleY + 60);
        
        ctx.restore();
    }

    drawMenuOptions(ctx) {
        const centerX = this.engine.width / 2;
        const startY = 300;
        const spacing = 50;
        
        ctx.save();
        
        this.menuOptions.forEach((option, index) => {
            const y = startY + index * spacing;
            const isSelected = index === this.selectedOption;
            
            // Button background
            if (isSelected) {
                ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
                ctx.fillRect(centerX - 120, y - 20, 240, 40);
                
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 2;
                ctx.strokeRect(centerX - 120, y - 20, 240, 40);
            }
            
            // Button text
            ctx.font = isSelected ? 'bold 24px monospace' : '20px monospace';
            ctx.fillStyle = isSelected ? '#FFD700' : '#FFFFFF';
            ctx.textAlign = 'center';
            ctx.fillText(option, centerX, y + 5);
            
            // Selection indicator
            if (isSelected) {
                const indicatorX = centerX - 140;
                const bounce = Math.sin(this.titleAnimation * 4) * 3;
                
                ctx.fillStyle = '#FFD700';
                ctx.fillText('>', indicatorX, y + 5 + bounce);
                ctx.fillText('<', centerX + 140, y + 5 + bounce);
            }
        });
        
        ctx.restore();
    }

    drawVersionInfo(ctx) {
        ctx.save();
        ctx.font = '12px monospace';
        ctx.fillStyle = '#AAAAAA';
        ctx.textAlign = 'left';
        ctx.fillText('Version 1.0.0', 10, this.engine.height - 10);
        ctx.restore();
    }

    drawControlsHint(ctx) {
        ctx.save();
        ctx.font = '14px monospace';
        ctx.fillStyle = '#CCCCCC';
        ctx.textAlign = 'center';
        ctx.fillText('Use ARROW KEYS to navigate, SPACE/ENTER to select', 
                    this.engine.width / 2, this.engine.height - 30);
        ctx.restore();
    }
}