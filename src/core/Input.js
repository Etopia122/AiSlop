class Input {
    constructor() {
        this.keys = {};
        this.keysDown = {};
        this.keysUp = {};
        this.touchInput = null;
        
        // Key mappings
        this.keyMap = {
            'ArrowLeft': 'left',
            'ArrowRight': 'right',
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            'Space': 'jump',
            'KeyR': 'restart',
            'KeyZ': 'run',
            'KeyX': 'fire',
            'KeyC': 'crouch',
            'Enter': 'start',
            'Escape': 'pause'
        };
        
        this.setupEventListeners();
        this.initializeTouchInput();
    }

    setupEventListeners() {
        const gameKeys = [
            'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
            'Space', 'KeyZ', 'KeyX', 'KeyC', 'Enter', 'Escape'
        ];
        document.addEventListener('keydown', (e) => {
            if (gameKeys.includes(e.code)) e.preventDefault();
            const key = this.keyMap[e.code] || e.code;
            
            if (!this.keys[key]) {
                this.keysDown[key] = true;
            }
            
            this.keys[key] = true;
        });

        document.addEventListener('keyup', (e) => {
            if (gameKeys.includes(e.code)) e.preventDefault();
            const key = this.keyMap[e.code] || e.code;
            
            this.keys[key] = false;
            this.keysUp[key] = true;
        });
    }

    initializeTouchInput() {
        // Load TouchInput class dynamically if available
        if (typeof TouchInput !== 'undefined') {
            this.touchInput = new TouchInput();
        }
    }

    // Check if key is currently pressed
    isPressed(key) {
        const keyPressed = this.keys[key] || false;
        const touchPressed = this.touchInput ? this.touchInput.isPressed(key) : false;
        return keyPressed || touchPressed;
    }

    // Check if key was just pressed this frame
    wasPressed(key) {
        const keyPressed = this.keysDown[key] || false;
        const touchPressed = this.touchInput ? this.touchInput.wasPressed(key) : false;
        return keyPressed || touchPressed;
    }

    // Check if key was just released this frame
    wasReleased(key) {
        const keyReleased = this.keysUp[key] || false;
        const touchReleased = this.touchInput ? this.touchInput.wasReleased(key) : false;
        return keyReleased || touchReleased;
    }

    // Get horizontal input (-1 left, 0 none, 1 right)
    getHorizontalInput() {
        let input = 0;
        if (this.isPressed('left') || this.isPressed('ArrowLeft')) input -= 1;
        if (this.isPressed('right') || this.isPressed('ArrowRight')) input += 1;
        return input;
    }

    // Get vertical input (-1 up, 0 none, 1 down)
    getVerticalInput() {
        let input = 0;
        if (this.isPressed('up') || this.isPressed('ArrowUp')) input -= 1;
        if (this.isPressed('down') || this.isPressed('ArrowDown')) input += 1;
        return input;
    }

    // Mario-specific input helpers
    isJumpPressed() {
        return this.isPressed('jump') || this.isPressed('Space');
    }

    isJumpJustPressed() {
        return this.wasPressed('jump') || this.wasPressed('Space');
    }

    isRunPressed() {
        return this.isPressed('run') || this.isPressed('KeyZ');
    }

    isFirePressed() {
        return this.isPressed('fire') || this.isPressed('KeyX');
    }

    isFireJustPressed() {
        return this.wasPressed('fire') || this.wasPressed('KeyX');
    }

    isCrouchPressed() {
        return this.isPressed('crouch') || this.isPressed('ArrowDown');
    }

    isRestartPressed() {
        return this.wasPressed('restart') || this.wasPressed('KeyR');
    }

    isStartPressed() {
        return this.wasPressed('start') || this.wasPressed('Enter');
    }

    isPausePressed() {
        return this.wasPressed('pause') || this.wasPressed('Escape');
    }

    // Touch-specific helpers
    isMobileDevice() {
        return this.touchInput ? this.touchInput.isEnabled : false;
    }

    isMovingLeft() {
        return this.touchInput ? this.touchInput.isMovingLeft() : this.isPressed('ArrowLeft');
    }

    isMovingRight() {
        return this.touchInput ? this.touchInput.isMovingRight() : this.isPressed('ArrowRight');
    }

    isJumping() {
        return this.touchInput ? this.touchInput.isJumping() : this.isPressed('Space');
    }

    isRunning() {
        return this.touchInput ? this.touchInput.isRunning() : this.isPressed('KeyZ');
    }

    isShootingFireball() {
        return this.touchInput ? this.touchInput.isShootingFireball() : this.isPressed('KeyX');
    }

    setFireballButtonVisible(visible) {
        if (this.touchInput) {
            this.touchInput.setFireballButtonVisible(visible);
        }
    }

    showTouchControls() {
        if (this.touchInput) {
            this.touchInput.show();
        }
    }

    hideTouchControls() {
        if (this.touchInput) {
            this.touchInput.hide();
        }
    }

    // Clear the frame-specific input states
    update() {
        this.keysDown = {};
        this.keysUp = {};
        
        // Update touch input
        if (this.touchInput) {
            this.touchInput.update();
        }
    }

    // Get input as a direction vector
    getInputVector() {
        return new Vector2(this.getHorizontalInput(), this.getVerticalInput());
    }

    // Check for any input
    hasAnyInput() {
        return Object.values(this.keys).some(pressed => pressed);
    }

    // Reset all input states
    reset() {
        this.keys = {};
        this.keysDown = {};
        this.keysUp = {};
    }

    // Add custom key mapping
    addKeyMapping(keyCode, action) {
        this.keyMap[keyCode] = action;
    }

    // Remove key mapping
    removeKeyMapping(keyCode) {
        delete this.keyMap[keyCode];
    }

    // Clean up touch controls
    destroy() {
        if (this.touchInput) {
            this.touchInput.destroy();
            this.touchInput = null;
        }
    }
}