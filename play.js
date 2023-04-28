// Initialize variables
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var width = canvas.width = window.innerWidth;
var height = canvas.height = window.innerHeight;
var groundHeight = 50;
var score = 0;
var highScore = 0;
var gameOver = false;
var gameSpeed = 8;
var speedIncreaseInterval = 2000;
var speedIncreaseAmount = 0.5;
var speedIncreaseTimeout;
var cactusInterval = 100;
var cactusIntervalTimeout;
var cacti = [];
var jumpSound = new Audio('jump.mp3');
var hitSound = new Audio('hit.mp3');

// Initialize dino
var dino = {
	x: 50,
	y: height - groundHeight - 50,
	width: 50,
	height: 50,
	speed: 0,
	jumping: false,
	jumpSpeed: 15,
	maxJumpHeight: 150,
	draw: function() {
		ctx.fillStyle = '#666';
		ctx.fillRect(this.x, this.y, this.width, this.height);
	},
	jump: function() {
		if (!this.jumping) {
			jumpSound.currentTime = 0;
			jumpSound.play();
			this.jumping = true;
			this.speed = -this.jumpSpeed;
		}
	},
	update: function() {
		this.y += this.speed;
		this.speed += gravity;
		if (this.y > height - groundHeight - this.height) {
			this.y = height - groundHeight - this.height;
			this.jumping = false;
		}
	}
};

// Initialize cactus
var cactus = {
	width: 50,
	height: 50,
	speed: gameSpeed,
	draw: function() {
		ctx.fillStyle = '#c33';
		ctx.fillRect(this.x, this.y, this.width, this.height);
	},
	update: function() {
		this.x -= this.speed;
		if (this.x < -this.width) {
			this.remove();
		}
	},
	remove: function() {
		cacti.splice(cacti.indexOf(this), 1);
	},
	checkCollision: function() {
		if (dino.x + dino.width > this.x &&
			dino.x < this.x + this.width &&
			dino.y + dino.height > this.y) {
			gameOver = true;
			hitSound.currentTime = 0;
			hitSound.play();
			if (score > highScore) {
				highScore = score;
				localStorage.setItem('highScore', highScore);
			}
			clearTimeout(speedIncreaseTimeout);
			clearTimeout(cactusIntervalTimeout);
		}
	}
};

// Set up event listeners
document.addEventListener('keydown', function(event) {
	if (event.keyCode === 32 || event.keyCode === 38) {
		dino.jump();
	}
});

// Set up game loop
function loop() {
	if (!gameOver) {
		ctx.clearRect(0, 0, width, height);
		
		// Update score
		score++;
		if (score % speedIncreaseInterval === 0) {
			gameSpeed += speedIncreaseAmount;
			speedIncreaseTimeout = setTimeout(function() {
				speedIncreaseAmount += 0.1;
			}, speedIncreaseInterval);
			clearTimeout(cactusIntervalTimeout);
			cactusInterval -= 5;
			if (cactusInterval < 20) {
				cactusInterval = 20;
			}
			cactusIntervalTimeout = setTimeout(function() {
				createCactus();
			}, cactusInterval);
		}
		
		// Update dino
		dino.update();
		dino.draw();
		
		// Update cacti
		for (var i = 0; i < cacti.length; i++) {
			cacti[i].update();
			cacti[i].draw();
			cacti[i].checkCollision();
		}
		
		// Draw ground
		ctx.fillStyle = '#999';
		ctx.fillRect(0, height - groundHeight, width, groundHeight);
		
		// Draw score andhigh score
		ctx.fillStyle = '#000';
		ctx.font = '24px Arial';
		ctx.fillText('Score: ' + score, width - 150, 30);
		ctx.fillText('High Score: ' + highScore, 20, 30);
		
		// Call loop function again on next frame
		requestAnimationFrame(loop);
	} else {
		// Game over
		ctx.clearRect(0, 0, width, height);
		ctx.fillStyle = '#000';
		ctx.font = '48px Arial';
		ctx.fillText('Game Over!', width / 2 - 150, height / 2 - 24);
		ctx.font = '24px Arial';
		ctx.fillText('Press space to play again', width / 2 - 150, height / 2 + 24);
		
		// Listen for spacebar key press to restart game
		document.addEventListener('keydown', function(event) {
			if (event.keyCode === 32) {
				location.reload();
			}
		});
	}
}

// Create cactus
function createCactus() {
	var newCactus = Object.create(cactus);
	newCactus.x = width;
	newCactus.y = height - groundHeight - newCactus.height;
	cacti.push(newCactus);
	setTimeout(function() {
		createCactus();
	}, cactusInterval);
}

// Initialize game
var gravity = 0.8;
if (localStorage.getItem('highScore')) {
	highScore = localStorage.getItem('highScore');
}
createCactus();
loop();
