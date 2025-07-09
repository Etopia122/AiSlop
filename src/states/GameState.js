class GameState {
    constructor(engine) {
        this.engine = engine;
        this.active = false;
        this.initialized = false;
    }

    // Called when entering this state
    enter() {
        this.active = true;
        if (!this.initialized) {
            this.initialize();
            this.initialized = true;
        }
        this.onEnter();
    }

    // Called when leaving this state
    exit() {
        this.active = false;
        this.onExit();
    }

    // Initialize the state (called once)
    initialize() {
        // Override in subclasses
    }

    // Called every time the state is entered
    onEnter() {
        // Override in subclasses
    }

    // Called every time the state is exited
    onExit() {
        // Override in subclasses
    }

    // Update the state
    update(deltaTime) {
        if (!this.active) return;
        // Override in subclasses
    }

    // Render the state
    render(ctx) {
        if (!this.active) return;
        // Override in subclasses
    }

    // Handle input
    handleInput(input) {
        // Override in subclasses
    }

    // Utility methods
    centerText(ctx, text, x, y, font = '16px monospace', color = '#FFFFFF') {
        ctx.save();
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.fillText(text, x, y);
        ctx.restore();
    }

    drawBackground(ctx, color = '#5C94FC') {
        ctx.save();
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.restore();
    }

    drawButton(ctx, text, x, y, width, height, selected = false) {
        ctx.save();
        
        // Button background
        ctx.fillStyle = selected ? '#FFD700' : '#FFFFFF';
        ctx.fillRect(x, y, width, height);
        
        // Button border
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        
        // Button text
        ctx.fillStyle = selected ? '#000000' : '#000000';
        ctx.font = '16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(text, x + width / 2, y + height / 2 + 6);
        
        ctx.restore();
    }

    // Common transition effects
    fadeIn(ctx, progress, color = '#000000') {
        const alpha = 1 - progress;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.restore();
    }

    fadeOut(ctx, progress, color = '#000000') {
        const alpha = progress;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.restore();
    }

    // Helper to check if point is in rectangle
    isPointInRect(x, y, rectX, rectY, rectWidth, rectHeight) {
        return x >= rectX && x <= rectX + rectWidth &&
               y >= rectY && y <= rectY + rectHeight;
    }
}