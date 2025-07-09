class Mushroom extends PowerUp {
    constructor(x, y, engine) {
        super(x, y, 32, 32, engine);
        
        this.type = 'mushroom';
        this.addTag('mushroom');
        this.scoreValue = 1000;
        this.speed = 60;
        
        this.setupAnimations();
    }

    setupAnimations() {
        this.addAnimation('idle', [
            { x: 0, y: 256, width: 32, height: 32 }
        ], 0.1, true);
        
        this.playAnimation('idle');
    }

    applyEffect(player) {
        player.powerUp('big');
    }

    getEffectColor() {
        return '#FF6B6B'; // Red color for mushroom
    }

    getDebugColor() {
        return '#FF6B6B';
    }
}