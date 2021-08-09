
// Global variables
var canvas = document.querySelector("#scene");
var ctx = canvas.getContext("2d");
var minSizeInput = document.querySelector("#min-size");
var maxSizeInput = document.querySelector("#max-size");
var spacingInput = document.querySelector("#spacing");
var rotationInput = document.querySelector("#rotation");
var accelerationInput = document.querySelector("#acceleration");
var dragInput = document.querySelector("#drag");
var shapeCircleInput = document.querySelector("#shape-circle");
var shapeLineInput = document.querySelector("#shape-line");
var resetInput = document.querySelector("#reset");

var particles = [];
var mouse = {x:0, y:0, radius:0};
var image = new Image();

var colors = ["#468966","#FFF0A5", "#FFB03B","#B64926", "#8E2800"];     // Original
var colors = ["#3c3c3c", "#696969", "#969696", "#c3c3c3"];    // Grayscale

var ww = canvas.width = window.innerWidth;
var wh = canvas.height = window.innerHeight;

var PARTICLE_DISTANCE = Number(spacingInput.value);
var MIN_SIZE = Number(minSizeInput.value), MAX_SIZE = Number(maxSizeInput.value);
var RANDOM_ROTATION = Number(rotationInput.value) * 2 * Math.PI / 360;
var INITIAL_SPEED = 1;
var RANDOM_ACCELERATION = Number(accelerationInput.value);
var DRAG = Number(dragInput.value);
var SHAPE = "circle";
var MOUSE_MOVE_RADIUS_CHANGE = 5;
var MOUSE_IDLE_RADIUS_CHANGE = -2;
var MOUSE_MAX_RADIUS = 250;

// Particle functionality

class Particle {
    constructor(x, y) {
        this.origin = {x: x, y: y};
        this.x = x; //random(0, ww);
        this.y = y; //random(0, wh);;
        this.size = random(MIN_SIZE, MAX_SIZE);
        this.rotation = random(0, 2 * Math.PI);
        this.vx = random(-INITIAL_SPEED, INITIAL_SPEED);
        this.vy = random(-INITIAL_SPEED, INITIAL_SPEED);
        this.accX = 0;
        this.accY = 0;

        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    render() {
        this.accelerate();

        this.draw();
    }

    accelerate() {
        if (distance(this.x, this.y, mouse.x, mouse.y) < mouse.radius) {
            this.accX = (this.x - mouse.x) / 100;
            this.accY = (this.y - mouse.y) / 100;
        } else {
            this.accX = (this.origin.x - this.x) / 1000;
            this.accY = (this.origin.y - this.y) / 1000;
        }
        this.accX += random(-RANDOM_ACCELERATION, RANDOM_ACCELERATION);
        this.accY += random(-RANDOM_ACCELERATION, RANDOM_ACCELERATION);

        this.vx = (this.vx + this.accX) * (1 - (DRAG * this.size));
        this.vy = (this.vy + this.accY) * (1 - (DRAG * this.size));

        this.x += this.vx;
        this.y += this.vy;

        this.rotation += random(-RANDOM_ROTATION, RANDOM_ROTATION);
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        if (SHAPE == "circle") {
            ctx.arc(this.x, this.y, this.size, Math.PI * 2, false);
            ctx.fill();
        } else if (SHAPE == "line") {
            let offsetX = this.size * Math.cos(this.rotation);
            let offsetY = this.size * Math.sin(this.rotation);
            ctx.moveTo(this.x - offsetX, this.y - offsetY);
            ctx.lineTo(this.x + offsetX, this.y + offsetY);
            ctx.stroke();
        } else {
            alert("Unknown shape: " + SHAPE)
        }

    }
}

function clamp(val, min, max) {
    if (val < min) { return min; }
    if (val > max) { return max; }
    return val;
}
function random(min, max) {
    return min + (Math.random() * (max - min));
}

function distance(ax, ay, bx, by) {
    dx = ax - bx;
    dy = ay - by;
    return Math.sqrt(dx * dx + dy * dy);
}

function onPointerDown(e) {
    mouse.x = e.offsetX;
    mouse.y = e.offsetY;
}

function onPointerMove(e) {
    mouse.x = e.offsetX;
    mouse.y = e.offsetY;
    mouse.radius = clamp(mouse.radius + MOUSE_MOVE_RADIUS_CHANGE, 0, MOUSE_MAX_RADIUS);
}

function onPointerUp(e) {
    mouse.radius = 0;
}

function onClick() {
    mouse.radius = clamp(mouse.radius + MOUSE_MOVE_RADIUS_CHANGE, 0, MOUSE_MAX_RADIUS);
}

function initScene() {
    ww = canvas.width = window.innerWidth * 0.95;
    // wh = canvas.height = window.innerHeight * 0.9;

    PARTICLE_DISTANCE = Number(spacingInput.value);
    MIN_SIZE = Number(minSizeInput.value);
    MAX_SIZE = Number(maxSizeInput.value);
    RANDOM_ROTATION = Number(rotationInput.value) * 2 * Math.PI / 360;
    RANDOM_ACCELERATION = Number(accelerationInput.value);
    DRAG = Number(dragInput.value);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles = [];
    initImageAndParticles();
}

function initImageAndParticles() {
    if (ww <= 800) {
        image.src = "/static/image/avira_mobile.png"
    } else {
        image.src = "/static/image/avira_desktop.png"
    }
    image.onload = (e) => initParticles();
}
function initParticles() {
    renderImage();
    const imageData = ctx.getImageData(0, 0, ww, wh);
    const data  = imageData.data;
    ctx.clearRect(0, 0, ww, wh);

    particles = [];
    for(var y=0; y<imageData.height; y+=3) {
        for(var x=0; x<imageData.width; x+=3) {
            const pos = ((y * imageData.width) + x) * 4;
            const r = data[pos], g = data[pos + 1], b = data[pos + 2], a = data[pos + 3];
            const intensity = r + g + b / 3;
            if(intensity < 200) {
                particles.push(new Particle(x, y));
            }
        }
    }
}

function updateLoop() {
    requestAnimationFrame(updateLoop);
    update();
    render();
}

function update() {
    mouse.radius = clamp(mouse.radius + MOUSE_IDLE_RADIUS_CHANGE, 0, MOUSE_MAX_RADIUS);
}

function render() {
    clear();
    renderImage();
    renderParticles();
    renderTexts();
}

function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function renderImage() {
    ctx.drawImage(image, 0, 0, ww, wh);
}

function renderParticles() {
    for (var i = 0; i < particles.length; i++) {
        particles[i].render();
    }
}

function renderTexts() {
    ctx.fillStyle = "black";
    ctx.font = "bold 15px sans-serif";
    ctx.textAlign = "left";
    renderNumberOfParticlesText();
    renderFPSText();
}

function renderNumberOfParticlesText() {
    ctx.fillText("Particles: " + particles.length, 10, 15);
}

function renderFPSText() {
    var fps = calculateFPS();
    ctx.fillText("FPS:" + fps.toPrecision(3), 10, 30);
}

var lastCallTime = 0;
function calculateFPS() {
    var previousTime = lastCallTime;
    var currentTime = lastCallTime = performance.now();
    if (previousTime === undefined || previousTime >= currentTime) {
        return 0;
    }
    // fps = 1000ms / time to render frame (in ms)
    return 1000 / (currentTime - previousTime);
}

// function renderGradient() {
//     const gradient = ctx.createLinearGradient(0, 0, ww, 0);
//     gradient.addColorStop(0, 'white');
//     gradient.addColorStop(1, 'black');
//     ctx.fillStyle = gradient;
//     ctx.fillRect(0, 0, ww, wh);
// }

function setShapeCircle() {
    SHAPE = "circle";
    initScene();
}

function setShapeLine() {
    SHAPE = "line";
    initScene();
}

// Initialization

window.addEventListener("resize", initScene);
minSizeInput.addEventListener("keyup", initScene);
maxSizeInput.addEventListener("keyup", initScene);
spacingInput.addEventListener("keyup", initScene);
rotationInput.addEventListener("keyup", initScene);
accelerationInput.addEventListener("keyup", initScene);
dragInput.addEventListener("keyup", initScene);
shapeCircleInput.addEventListener("click", setShapeCircle);
shapeLineInput.addEventListener("click", setShapeLine);
resetInput.addEventListener("click", function() {setTimeout(initScene, 1);});

canvas.addEventListener("pointerdown", onPointerDown);
canvas.addEventListener("pointermove", onPointerMove);
canvas.addEventListener("pointerup", onPointerUp);
canvas.addEventListener("click", onClick);

initScene();
requestAnimationFrame(updateLoop);
