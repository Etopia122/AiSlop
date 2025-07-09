class Input {
    constructor() {
        this.keys = {};
        this.keysDown = {};
        this.keysUp = {};
        
        // Key mappings
        this.keyMap = {
            'ArrowLeft': 'left',
            'ArrowRight': 'right',
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            ' ': 'jump',
            'Space': 'jump',
            'KeyR': 'restart',
            'KeyZ': 'run',
            'KeyX': 'fire',
            'KeyC': 'crouch',
            'Enter': 'start',
            'Escape': 'pause'
        };
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            e.preventDefault();
            const key = this.keyMap[e.code] || e.code;
            
            if (!this.keys[key]) {
                this.keysDown[key] = true;
            }
            
            this.keys[key] = true;
        });

        document.addEventListener('keyup', (e) => {
            e.preventDefault();
            const key = this.keyMap[e.code] || e.code;
            
            this.keys[key] = false;
            this.keysUp[key] = true;
        });
        
        // Prevent arrow keys from scrolling the page
        document.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
                e.preventDefault();
            }
        });
    }

    // Check if key is currently pressed
    isPressed(key) {
        return this.keys[key] || false;
    }

    // Check if key was just pressed this frame
    wasPressed(key) {
        return this.keysDown[key] || false;
    }

    // Check if key was just released this frame
    wasReleased(key) {
        return this.keysUp[key] || false;
    }

    // Get horizontal input (-1 left, 0 none, 1 right)
    getHorizontalInput() {
        let input = 0;
        if (this.isPressed('left')) input -= 1;
        if (this.isPressed('right')) input += 1;
        return input;
    }

    // Get vertical input (-1 up, 0 none, 1 down)
    getVerticalInput() {
        let input = 0;
        if (this.isPressed('up')) input -= 1;
        if (this.isPressed('down')) input += 1;
        return input;
    }

    // Mario-specific input helpers
    isJumpPressed() {
        return this.isPressed('jump');
    }

    isJumpJustPressed() {
        return this.wasPressed('jump');
    }

    isRunPressed() {
        return this.isPressed('run');
    }

    isFirePressed() {
        return this.isPressed('fire');
    }

    isFireJustPressed() {
        return this.wasPressed('fire');
    }

    isCrouchPressed() {
        return this.isPressed('crouch');
    }

    isRestartPressed() {
        return this.wasPressed('restart');
    }

    isStartPressed() {
        return this.wasPressed('start');
    }

    isPausePressed() {
        return this.wasPressed('pause');
    }

    // Clear the frame-specific input states
    update() {
        this.keysDown = {};
        this.keysUp = {};
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
}