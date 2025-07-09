class FireFlower extends PowerUp {
    constructor(x, y, engine) {
        super(x, y, 32, 32, engine);
        
        this.type = 'fire_flower';
        this.addTag('fire_flower');
        this.scoreValue = 1000;
        this.speed = 0; // Fire flowers don't move
        
        this.setupAnimations();
    }

    setupAnimations() {
        this.addAnimation('idle', [
            { x: 32, y: 256, width: 32, height: 32 },
            { x: 64, y: 256, width: 32, height: 32 },
            { x: 96, y: 256, width: 32, height: 32 },
            { x: 128, y: 256, width: 32, height: 32 }
        ], 0.2, true);
        
        this.playAnimation('idle');
    }

    updateMovement(deltaTime) {
        // Fire flowers don't move horizontally
        this.velocity.x = 0;
        
        // Still do bounce effect
        this.bounceTimer += deltaTime;
        this.bounceHeight = Math.sin(this.bounceTimer * this.bounceSpeed) * 2;
    }

    applyEffect(player) {
        player.powerUp('fire');
    }

    getEffectColor() {
        return '#FF4500'; // Orange-red color for fire flower
    }

    getDebugColor() {
        return '#FF4500';
    }
}