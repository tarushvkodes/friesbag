class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.controls = new Controls(this.canvas);
        
        // Game state
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gameRunning = false;
        this.highScore = parseInt(localStorage.getItem('highScore')) || 0;
        
        // Game objects
        this.bag = {
            x: 0,
            y: 0,
            width: 100,
            height: 80,
            speed: 5
        };
        
        this.fries = [];
        this.baseSpawnInterval = 2000;
        this.fryRateMultiplier = 1;
        this.lastSpawnTime = 0;
        
        // Initialize
        this.setupFryRateControl();
        this.setupCanvas();
        this.setupEventListeners();
        this.showMenu();
        // Add resize listener
        window.addEventListener('resize', () => this.handleResize());
    }

    setupCanvas() {
        this.updateCanvasSize();
        this.bag.x = this.canvas.width / 2 - this.bag.width / 2;
        this.bag.y = this.canvas.height - this.bag.height - 10;
    }

    updateCanvasSize() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        // Adjust bag size for smaller screens
        if (window.innerWidth <= 480) {
            this.bag.width = 80;
            this.bag.height = 64;
        } else {
            this.bag.width = 100;
            this.bag.height = 80;
        }
    }

    handleResize() {
        this.updateCanvasSize();
        // Update bag position to maintain relative position
        this.bag.x = Math.min(this.bag.x, this.canvas.width - this.bag.width);
        this.bag.y = this.canvas.height - this.bag.height - 10;
    }

    setupEventListeners() {
        document.getElementById('start-button').addEventListener('click', () => this.startGame());
        document.getElementById('restart-button').addEventListener('click', () => this.startGame());
    }

    setupFryRateControl() {
        const slider = document.getElementById('fryRateSlider');
        slider.addEventListener('input', (e) => {
            this.fryRateMultiplier = parseFloat(e.target.value);
        });
    }

    showMenu() {
        document.getElementById('menu-screen').classList.remove('hidden');
        document.getElementById('game-screen').classList.add('hidden');
        document.getElementById('game-over-screen').classList.add('hidden');
        document.getElementById('high-score').textContent = this.highScore;
    }

    startGame() {
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.fries = [];
        this.gameRunning = true;
        this.baseSpawnInterval = 2000;
        this.fryRateMultiplier = parseFloat(document.getElementById('fryRateSlider').value);
        
        document.getElementById('menu-screen').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('hidden');
        document.getElementById('game-over-screen').classList.add('hidden');
        
        this.updateHUD();
        this.gameLoop();
    }

    spawnFry() {
        const fry = {
            x: Math.random() * (this.canvas.width - 20),
            y: -20,
            width: window.innerWidth <= 480 ? 15 : 20,
            height: window.innerWidth <= 480 ? 30 : 40,
            speed: (2 + (this.level * 0.5)) * this.fryRateMultiplier,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.1
        };
        this.fries.push(fry);
    }

    updateHUD() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('level').textContent = this.level;
    }

    drawBag() {
        this.ctx.save();
        // Add shadow
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowOffsetY = 5;
        
        // Draw bag with rounded corners
        this.ctx.fillStyle = '#8B4513';
        this.ctx.beginPath();
        this.roundRect(this.bag.x, this.bag.y, this.bag.width, this.bag.height, 10);
        this.ctx.fill();
        this.ctx.restore();
    }

    roundRect(x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x + r, y);
        this.ctx.arcTo(x + w, y, x + w, y + h, r);
        this.ctx.arcTo(x + w, y + h, x, y + h, r);
        this.ctx.arcTo(x, y + h, x, y, r);
        this.ctx.arcTo(x, y, x + w, y, r);
        this.ctx.closePath();
    }

    drawFries() {
        this.ctx.save();
        this.fries.forEach(fry => {
            // Add glow effect
            this.ctx.shadowColor = 'rgba(255, 215, 0, 0.3)';
            this.ctx.shadowBlur = 15;
            
            // Draw fry with gradient
            const gradient = this.ctx.createLinearGradient(fry.x, fry.y, fry.x + fry.width, fry.y + fry.height);
            gradient.addColorStop(0, '#FFD700');
            gradient.addColorStop(1, '#FFA500');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.roundRect(fry.x, fry.y, fry.width, fry.height, 5);
            this.ctx.fill();
        });
        this.ctx.restore();
    }

    updateBag() {
        const input = this.controls.getInput();
        
        if (input.leftPressed) {
            this.bag.x -= this.bag.speed;
        }
        if (input.rightPressed) {
            this.bag.x += this.bag.speed;
        }
        
        // Mouse control
        if (input.mouseX) {
            this.bag.x = input.mouseX - this.bag.width / 2;
        }
        
        // Keep bag within canvas bounds
        this.bag.x = Math.max(0, Math.min(this.canvas.width - this.bag.width, this.bag.x));
    }

    updateFries() {
        for (let i = this.fries.length - 1; i >= 0; i--) {
            const fry = this.fries[i];
            fry.y += fry.speed;
            fry.rotation += fry.rotationSpeed;
            
            // Add slight horizontal movement
            fry.x += Math.sin(Date.now() / 1000 + i) * 0.5;

            // Check collision with bag
            if (this.checkCollision(fry, this.bag)) {
                this.fries.splice(i, 1);
                this.score += 10;
                if (this.score % 100 === 0) {
                    this.level++;
                }
                this.updateHUD();
                continue;
            }

            // Check if fry hit the ground
            if (fry.y > this.canvas.height) {
                this.fries.splice(i, 1);
                this.lives--;
                this.updateHUD();
                if (this.lives <= 0) {
                    this.gameOver();
                }
            }
        }
    }

    checkCollision(fry, bag) {
        return fry.x < bag.x + bag.width &&
               fry.x + fry.width > bag.x &&
               fry.y < bag.y + bag.height &&
               fry.y + fry.height > bag.y;
    }

    gameOver() {
        this.gameRunning = false;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore);
        }
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('end-high-score').textContent = this.highScore;
        document.getElementById('game-screen').classList.add('hidden');
        document.getElementById('game-over-screen').classList.remove('hidden');
    }

    update() {
        const currentTime = Date.now();
        if (currentTime - this.lastSpawnTime > this.baseSpawnInterval / this.fryRateMultiplier) {
            this.spawnFry();
            this.lastSpawnTime = currentTime;
            this.baseSpawnInterval = Math.max(500, 2000 - (this.level * 100));
        }

        this.updateBag();
        this.updateFries();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBag();
        this.drawFries();
    }

    gameLoop() {
        if (!this.gameRunning) return;

        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new Game();
});