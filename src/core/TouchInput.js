// Touch Input System for Mobile Controls
// Handles virtual buttons and touch gestures

class TouchInput {
    constructor() {
        this.touches = new Map();
        this.virtualButtons = new Map();
        this.isEnabled = this.isMobileDevice();
        
        // Virtual button states
        this.buttonStates = {
            left: false,
            right: false,
            jump: false,
            run: false,
            fireball: false,
            pause: false
        };
        
        this.previousButtonStates = { ...this.buttonStates };
        
        // Touch sensitivity
        this.deadZone = 20;
        this.swipeThreshold = 50;
        
        this.init();
    }
    
    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    }
    
    init() {
        if (!this.isEnabled) return;
        
        this.createVirtualControls();
        this.setupEventListeners();
    }
    
    createVirtualControls() {
        // Create touch controls container
        this.controlsContainer = document.createElement('div');
        this.controlsContainer.id = 'touch-controls';
        this.controlsContainer.innerHTML = `
            <div class="dpad-container">
                <div class="dpad">
                    <div class="dpad-button dpad-up" data-action="up">▲</div>
                    <div class="dpad-center">
                        <div class="dpad-button dpad-left" data-action="left">◀</div>
                        <div class="dpad-button dpad-right" data-action="right">▶</div>
                    </div>
                    <div class="dpad-button dpad-down" data-action="down">▼</div>
                </div>
            </div>
            
            <div class="action-buttons">
                <div class="action-button jump-button" data-action="jump">
                    <span class="button-label">JUMP</span>
                </div>
                <div class="action-button run-button" data-action="run">
                    <span class="button-label">RUN</span>
                </div>
                <div class="action-button fireball-button" data-action="fireball">
                    <span class="button-label">🔥</span>
                </div>
            </div>
            
            <div class="utility-buttons">
                <div class="utility-button pause-button" data-action="pause">
                    <span class="button-label">⏸️</span>
                </div>
                <div class="utility-button debug-button" data-action="debug">
                    <span class="button-label">🐛</span>
                </div>
            </div>
        `;
        
        // Add CSS styles
        this.addTouchControlsCSS();
        
        // Add to page
        document.body.appendChild(this.controlsContainer);
        
        // Register virtual buttons
        this.registerVirtualButtons();
    }
    
    addTouchControlsCSS() {
        if (document.getElementById('touch-controls-css')) return;
        
        const style = document.createElement('style');
        style.id = 'touch-controls-css';
        style.textContent = `
            #touch-controls {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                pointer-events: none;
                z-index: 1000;
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                padding: 20px;
                box-sizing: border-box;
            }
            
            .dpad-container {
                pointer-events: all;
                user-select: none;
                -webkit-user-select: none;
                -webkit-touch-callout: none;
            }
            
            .dpad {
                display: grid;
                grid-template-rows: 60px 60px 60px;
                grid-template-columns: 60px 60px 60px;
                gap: 5px;
                opacity: 0.7;
            }
            
            .dpad-center {
                display: flex;
                align-items: center;
                justify-content: space-between;
                grid-column: 1 / 4;
            }
            
            .dpad-button {
                width: 60px;
                height: 60px;
                background: linear-gradient(145deg, #666, #333);
                border: 2px solid #888;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 24px;
                font-weight: bold;
                box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                transition: all 0.1s ease;
                cursor: pointer;
            }
            
            .dpad-up {
                grid-column: 2;
                grid-row: 1;
            }
            
            .dpad-down {
                grid-column: 2;
                grid-row: 3;
            }
            
            .dpad-left {
                margin-right: 10px;
            }
            
            .dpad-right {
                margin-left: 10px;
            }
            
            .dpad-button.active {
                background: linear-gradient(145deg, #888, #555);
                transform: scale(0.95);
                box-shadow: 0 2px 4px rgba(0,0,0,0.4);
            }
            
            .action-buttons {
                display: flex;
                flex-direction: column;
                gap: 15px;
                pointer-events: all;
                user-select: none;
                -webkit-user-select: none;
                -webkit-touch-callout: none;
            }
            
            .action-button {
                width: 80px;
                height: 80px;
                background: linear-gradient(145deg, #4CAF50, #2E7D32);
                border: 3px solid #66BB6A;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                box-shadow: 0 6px 12px rgba(0,0,0,0.3);
                transition: all 0.1s ease;
                cursor: pointer;
                opacity: 0.8;
            }
            
            .run-button {
                background: linear-gradient(145deg, #FF9800, #E65100);
                border-color: #FFB74D;
            }
            
            .fireball-button {
                background: linear-gradient(145deg, #F44336, #C62828);
                border-color: #EF5350;
                font-size: 24px;
            }
            
            .action-button.active {
                transform: scale(0.9);
                box-shadow: 0 3px 6px rgba(0,0,0,0.4);
            }
            
            .button-label {
                font-size: 12px;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
            }
            
            .fireball-button .button-label {
                font-size: 24px;
            }
            
            .utility-buttons {
                position: absolute;
                top: 20px;
                right: 20px;
                display: flex;
                gap: 10px;
                pointer-events: all;
            }
            
            .utility-button {
                width: 50px;
                height: 50px;
                background: linear-gradient(145deg, #607D8B, #37474F);
                border: 2px solid #78909C;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 20px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                transition: all 0.1s ease;
                cursor: pointer;
                opacity: 0.7;
            }
            
            .utility-button.active {
                transform: scale(0.9);
                background: linear-gradient(145deg, #78909C, #455A64);
            }
            
            /* Responsive adjustments */
            @media (max-width: 768px) {
                #touch-controls {
                    padding: 10px;
                }
                
                .dpad-button {
                    width: 50px;
                    height: 50px;
                    font-size: 20px;
                }
                
                .action-button {
                    width: 70px;
                    height: 70px;
                }
                
                .button-label {
                    font-size: 10px;
                }
                
                .fireball-button .button-label {
                    font-size: 20px;
                }
            }
            
            @media (max-width: 480px) {
                .dpad-button {
                    width: 45px;
                    height: 45px;
                    font-size: 18px;
                }
                
                .action-button {
                    width: 60px;
                    height: 60px;
                }
                
                .utility-button {
                    width: 40px;
                    height: 40px;
                    font-size: 16px;
                }
            }
            
            /* Hide on desktop */
            @media (min-width: 1024px) {
                #touch-controls {
                    display: none;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    registerVirtualButtons() {
        const buttons = this.controlsContainer.querySelectorAll('[data-action]');
        
        buttons.forEach(button => {
            const action = button.dataset.action;
            
            this.virtualButtons.set(button, {
                action: action,
                element: button,
                isPressed: false
            });
        });
    }
    
    setupEventListeners() {
        // Touch events for virtual buttons
        this.controlsContainer.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        this.controlsContainer.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        this.controlsContainer.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        this.controlsContainer.addEventListener('touchcancel', (e) => this.handleTouchEnd(e), { passive: false });
        
        // Prevent context menu on long press
        this.controlsContainer.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Prevent default touch behaviors
        document.addEventListener('touchstart', (e) => {
            if (e.target.closest('#touch-controls')) {
                e.preventDefault();
            }
        }, { passive: false });
        
        document.addEventListener('touchmove', (e) => {
            if (e.target.closest('#touch-controls')) {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    handleTouchStart(e) {
        e.preventDefault();
        
        for (const touch of e.changedTouches) {
            const element = document.elementFromPoint(touch.clientX, touch.clientY);
            const button = this.findVirtualButton(element);
            
            if (button) {
                button.isPressed = true;
                button.element.classList.add('active');
                this.updateButtonState(button.action, true);
                
                // Store touch ID for this button
                this.touches.set(touch.identifier, button);
            }
        }
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        
        for (const touch of e.changedTouches) {
            const button = this.touches.get(touch.identifier);
            if (button) {
                const element = document.elementFromPoint(touch.clientX, touch.clientY);
                const newButton = this.findVirtualButton(element);
                
                // Check if still touching the same button
                if (newButton !== button) {
                    // Release old button
                    button.isPressed = false;
                    button.element.classList.remove('active');
                    this.updateButtonState(button.action, false);
                    
                    if (newButton) {
                        // Press new button
                        newButton.isPressed = true;
                        newButton.element.classList.add('active');
                        this.updateButtonState(newButton.action, true);
                        this.touches.set(touch.identifier, newButton);
                    } else {
                        this.touches.delete(touch.identifier);
                    }
                }
            }
        }
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
        
        for (const touch of e.changedTouches) {
            const button = this.touches.get(touch.identifier);
            if (button) {
                button.isPressed = false;
                button.element.classList.remove('active');
                this.updateButtonState(button.action, false);
                this.touches.delete(touch.identifier);
            }
        }
    }
    
    findVirtualButton(element) {
        for (const [buttonElement, buttonData] of this.virtualButtons) {
            if (buttonElement === element || buttonElement.contains(element)) {
                return buttonData;
            }
        }
        return null;
    }
    
    updateButtonState(action, pressed) {
        switch (action) {
            case 'left':
                this.buttonStates.left = pressed;
                break;
            case 'right':
                this.buttonStates.right = pressed;
                break;
            case 'up':
            case 'jump':
                this.buttonStates.jump = pressed;
                break;
            case 'down':
                // Handle crouch if needed
                break;
            case 'run':
                this.buttonStates.run = pressed;
                break;
            case 'fireball':
                this.buttonStates.fireball = pressed;
                break;
            case 'pause':
                if (pressed) this.buttonStates.pause = true;
                break;
            case 'debug':
                if (pressed) {
                    // Toggle debug mode
                    if (window.debugGame) {
                        window.debugGame();
                    }
                }
                break;
        }
    }
    
    update() {
        if (!this.isEnabled) return;
        
        // Update previous states
        this.previousButtonStates = { ...this.buttonStates };
        
        // Reset one-time buttons
        this.buttonStates.pause = false;
    }
    
    // Interface matching the keyboard input system
    isPressed(action) {
        switch (action) {
            case 'ArrowLeft':
            case 'KeyA':
                return this.buttonStates.left;
            case 'ArrowRight':
            case 'KeyD':
                return this.buttonStates.right;
            case 'Space':
                return this.buttonStates.jump;
            case 'KeyZ':
                return this.buttonStates.run;
            case 'KeyX':
                return this.buttonStates.fireball;
            case 'Escape':
                return this.buttonStates.pause;
            default:
                return false;
        }
    }
    
    wasPressed(action) {
        const current = this.isPressed(action);
        const previous = this.getPreviousState(action);
        return current && !previous;
    }
    
    wasReleased(action) {
        const current = this.isPressed(action);
        const previous = this.getPreviousState(action);
        return !current && previous;
    }
    
    getPreviousState(action) {
        switch (action) {
            case 'ArrowLeft':
            case 'KeyA':
                return this.previousButtonStates.left;
            case 'ArrowRight':
            case 'KeyD':
                return this.previousButtonStates.right;
            case 'Space':
                return this.previousButtonStates.jump;
            case 'KeyZ':
                return this.previousButtonStates.run;
            case 'KeyX':
                return this.previousButtonStates.fireball;
            case 'Escape':
                return this.previousButtonStates.pause;
            default:
                return false;
        }
    }
    
    isMovingLeft() {
        return this.buttonStates.left;
    }
    
    isMovingRight() {
        return this.buttonStates.right;
    }
    
    isJumping() {
        return this.buttonStates.jump;
    }
    
    isRunning() {
        return this.buttonStates.run;
    }
    
    isShootingFireball() {
        return this.buttonStates.fireball;
    }
    
    isRestartPressed() {
        return false; // Restart not implemented on mobile
    }
    
    destroy() {
        if (this.controlsContainer && this.controlsContainer.parentNode) {
            this.controlsContainer.parentNode.removeChild(this.controlsContainer);
        }
        
        const css = document.getElementById('touch-controls-css');
        if (css && css.parentNode) {
            css.parentNode.removeChild(css);
        }
    }
    
    show() {
        if (this.controlsContainer) {
            this.controlsContainer.style.display = 'flex';
        }
    }
    
    hide() {
        if (this.controlsContainer) {
            this.controlsContainer.style.display = 'none';
        }
    }
    
    setFireballButtonVisible(visible) {
        const fireballButton = this.controlsContainer?.querySelector('.fireball-button');
        if (fireballButton) {
            fireballButton.style.display = visible ? 'flex' : 'none';
        }
    }
}