class Controls {
    constructor(canvas) {
        this.canvas = canvas;
        this.mouseX = 0;
        this.leftPressed = false;
        this.rightPressed = false;

        // Mouse movement
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));

        // Touch controls
        this.canvas.addEventListener('touchstart', (e) => this.handleTouch(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.handleTouch(e), { passive: false });
        this.canvas.addEventListener('touchend', () => this.handleTouchEnd());

        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
    }

    handleTouch(e) {
        e.preventDefault(); // Prevent scrolling
        if (e.touches.length > 0) {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.touches[0].clientX - rect.left;
        }
    }

    handleTouchEnd() {
        // Reset position when touch ends
        this.mouseX = null;
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

    getInput() {
        return {
            mouseX: this.mouseX,
            leftPressed: this.leftPressed,
            rightPressed: this.rightPressed
        };
    }
}