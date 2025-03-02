class Controls {
    constructor(canvas) {
        this.canvas = canvas;
        this.mouseX = canvas.width / 2;  // Initialize to center
        this.lastMouseX = this.mouseX;   // Track last position
        this.leftPressed = false;
        this.rightPressed = false;
        this.autoplayEnabled = false;
        this.targetX = canvas.width / 2;

        // Mouse movement
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));

        // Touch controls
        this.canvas.addEventListener('touchstart', (e) => this.handleTouch(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.handleTouch(e), { passive: false });
        this.canvas.addEventListener('touchend', () => this.handleTouchEnd());

        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Autoplay toggle
        const autoplayButton = document.getElementById('autoplay-button');
        if (autoplayButton) {
            autoplayButton.addEventListener('click', () => this.toggleAutoplay(autoplayButton));
        }
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.lastMouseX = this.mouseX;
    }

    handleTouch(e) {
        e.preventDefault(); // Prevent scrolling
        if (e.touches.length > 0) {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.touches[0].clientX - rect.left;
            this.lastMouseX = this.mouseX;
        }
    }

    handleTouchEnd() {
        // Keep the last known position instead of setting to null
        this.mouseX = this.lastMouseX;
    }

    handleKeyDown(e) {
        if (e.key === 'ArrowLeft' || e.key === 'a') {
            this.leftPressed = true;
        }
        if (e.key === 'ArrowRight' || e.key === 'd') {
            this.rightPressed = true;
        }
    }

    handleKeyUp(e) {
        if (e.key === 'ArrowLeft' || e.key === 'a') {
            this.leftPressed = false;
        }
        if (e.key === 'ArrowRight' || e.key === 'd') {
            this.rightPressed = false;
        }
    }

    toggleAutoplay(button) {
        this.autoplayEnabled = !this.autoplayEnabled;
        button.textContent = `Autoplay: ${this.autoplayEnabled ? 'On' : 'Off'}`;
    }

    updateTargetForAutoplay(fries, bagWidth, canvasWidth) {
        if (!this.autoplayEnabled || fries.length === 0) return;
        
        // Find the closest fry to the bottom of the screen
        let closestFry = null;
        let maxY = -Infinity;
        
        for (const fry of fries) {
            if (fry.y > maxY) {
                maxY = fry.y;
                closestFry = fry;
            }
        }
        
        if (closestFry) {
            // Target the center of the fry
            this.targetX = closestFry.x + (closestFry.width / 2) - (bagWidth / 2);
            // Keep the target within canvas bounds
            this.targetX = Math.max(0, Math.min(canvasWidth - bagWidth, this.targetX));
        }
    }

    getInput() {
        if (!this.autoplayEnabled) {
            return {
                mouseX: this.mouseX,
                leftPressed: this.leftPressed,
                rightPressed: this.rightPressed,
                autoplayEnabled: false
            };
        }
        
        return {
            mouseX: this.targetX,
            leftPressed: false,
            rightPressed: false,
            autoplayEnabled: true
        };
    }
}