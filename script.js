const start=document.getElementById('startButton');
const restart=document.getElementById('restartButton');
restart.style.display='none';
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const collisionCanvas = document.getElementById('collisionCanvas');
const collisionCtx = collisionCanvas.getContext('2d');
collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;

let reload=new Audio('reload.wav');
let backgroundmusic=new Audio('bg.mp3');
backgroundmusic.loop=true;
backgroundmusic.play();
let funsound=new Audio('collect.ogg');
let gameoverSound=new Audio('gameover.flac');

let timeToNextRaven = 0;
let ravenInterval = 300;
let lastTime = 0;
let score = 0;
ctx.font = '50px Impact';

let gameover = false;

let ravens = [];

class Raven {
    constructor() {
        this.spriteWidth = 271;
        this.spriteHeight = 194;
        this.sizeModifier = Math.random() * 0.8 + 0.6;
        this.width = this.spriteWidth * this.sizeModifier;
        this.height = this.spriteHeight * this.sizeModifier;
        this.x = canvas.width;
        this.y = Math.random() * (canvas.height - this.height);
        this.directionX = Math.random() * 5 + 3;
        this.directionY = Math.random() * 5 - 2.5;
        this.markedForDeletion = false;
        this.image = new Image();
        this.image.src = 'raven.png';
        this.frame = 0;
        this.maxFrame = 4;
        this.timeSinceFlap = 0;
        this.flapInterval = Math.random() * 50 + 50;
        this.randomColors = [Math.floor(Math.random() * 255, Math.random() * 255, Math.random() * 255)];
        this.color = 'rgb(' + this.randomColors[0] + ',' + this.randomColors[1] + ',' + this.randomColors[2] + ')';
    };
    update(deltatime) {
        if (this.y < 0 || this.y > canvas.height - this.height) {
            this.directionY = this.directionY * -1;
        }
        this.x -= this.directionX;
        this.y += this.directionY;
        if (this.x < 0 - this.width) {
            this.markedForDeletion = true;
        }
        this.timeSinceFlap += deltatime;
        if (this.timeSinceFlap > this.flapInterval) {
            if (this.frame >= this.maxFrame) {
                this.frame = 0;
            } else {
                this.frame++;
                this.timeSinceFlap = 0;
            }
        }
        if (this.x < 0 - this.width) gameover = true;
    }
    draw() {
        collisionCtx.fillStyle = this.color;
        collisionCtx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
    }
};

let explosions = [];
class Explosion {
    constructor(x, y, size) {
        this.image = new Image();
        this.image.src = 'boom.png';
        this.spriteWidth = 200;
        this.spriteHeight = 179;
        this.size = size;
        this.x = x;
        this.y = y;
        this.frame = 0;
        this.sound = new Audio();
        this.sound.src = 'fire.mp3';
        this.timeSinceLastFrame = 0;
        this.frameInterval = 200;
        this.markedForDeletion = false;
    }
    update(deltatime) {
        if (this.frame === 0) {
            this.sound.play();
        }
        this.timeSinceLastFrame += deltatime;
        if (this.timeSinceLastFrame > this.frameInterval) {
            this.frame++;
            this.timeSinceLastFrame = 0;
            if (this.frame === 5) {
                this.markedForDeletion = true;
            }
        }
    }
    draw() {
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y - this.size / 4, this.size, this.size);
    }
}
function drawScore() {
    ctx.fillStyle = 'black';
    ctx.fillText('Score: ' + score, 50, 75);
    ctx.fillStyle = 'white';
    ctx.fillText('Score: ' + score, 55, 80);
}
function drawGameOver() {
    ctx.textAlign = 'center';
    ctx.fillStyle = 'black';
    ctx.fillText('GAME OVER, your score is: ' + score, canvas.width / 2, canvas.height / 2);
    ctx.fillStyle = 'white';
    ctx.fillText('GAME OVER, your score is: ' + score, canvas.width / 2 + 5, canvas.height / 2 + 5);

}
window.addEventListener('click', function (e) {
    const detectPixelColor = ctx.getImageData(e.x, e.y, 1, 1);
    const pixelColor = detectPixelColor.data;
    ravens.forEach(object => {
        if (object.x < e.x && e.x < object.x + object.width && object.y < e.y && e.y < object.y + object.height) {
            if (pixelColor[3] > 250) {
                //collision detected
                object.markedForDeletion = true;
                score++;
                if(score%5===0){
                    reload.play();
                };
                explosions.push(new Explosion(object.x, object.y, object.width));
            }
        }
    });
});

function animate(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    collisionCtx.clearRect(0, 0, canvas.width, canvas.height);

    let deltatime = timestamp - lastTime;
    lastTime = timestamp;
    timeToNextRaven += deltatime;
    if (timeToNextRaven > ravenInterval) {
        ravens.push(new Raven());
        timeToNextRaven = 0;
        ravens.sort(function (a, b) {
            return a.width - b.width;
        });
        ravenInterval = Math.random() * 2000 + 1000;
    }
    drawScore();
    [...ravens, ...explosions].forEach(object => object.update(deltatime));
    [...ravens, ...explosions].forEach(object => object.draw());
    ravens = ravens.filter(object => !object.markedForDeletion);
    explosions = explosions.filter(object => !object.markedForDeletion);


    if (!gameover) requestAnimationFrame(animate);
    else drawGameOver();
}

// animate(0);
start.addEventListener('click', () => {
    startGame();
});

function startGame() {
    start.style.display = 'none';
    funsound.play();

    animate(0);
}
function restartGame() {
    funsound.play();
    startGame();
}

function drawGameOver() {
    gameoverSound.play();
    ctx.textAlign = 'center';
    ctx.fillStyle = 'black';
    ctx.fillText('GAME OVER, your score is: ' + score, canvas.width / 2, canvas.height / 2);
    ctx.fillStyle = 'white';
    ctx.fillText('GAME OVER, your score is: ' + score, canvas.width / 2 + 5, canvas.height / 2 + 5);
    restart.style.display = 'block';
}

restart.addEventListener('click', () => {
    location.reload();
});

