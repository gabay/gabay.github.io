
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
var mouse = {x:-999, y:-999};
var radius = 100;


var colors = ["#468966","#FFF0A5", "#FFB03B","#B64926", "#8E2800"];     // Original
var colors = ["#3c3c3c", "#696969", "#969696", "#c3c3c3"];    // Grayscale

var ww = canvas.width = window.innerWidth;
var wh = canvas.height = window.innerHeight;

var PARTICLE_DISTANCE = 50;
var MIN_SIZE = 5, MAX_SIZE = 15;
var RANDOM_ROTATION = (2 * Math.PI) / 60;
var INITIAL_SPEED = 20;
var RANDOM_ACCELERATION = 1;
var DRAG = 0.005;
var SHAPE = "circle";

// Particle functionality

class Particle {
    constructor(x, y) {
        this.origin = {x: x, y: y};
        this.x = random(0, ww);
        this.y = random(0, wh);;
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
        if (distance(this.x, this.y, mouse.x, mouse.y) < radius) {
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
}

function onPointerUp(e) {
    mouse.x = -999;
    mouse.y = -999;
}

function onClick() {
    radius = (radius + 100) % 500;
}

function initScene() {
    ww = canvas.width = window.innerWidth;
    wh = canvas.height = window.innerHeight;

    PARTICLE_DISTANCE = Number(spacingInput.value);
    MIN_SIZE = Number(minSizeInput.value);
    MAX_SIZE = Number(maxSizeInput.value);
    RANDOM_ROTATION = Number(rotationInput.value) * 2 * Math.PI / 360;
    RANDOM_ACCELERATION = Number(accelerationInput.value);
    DRAG = Number(dragInput.value);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles = [];
    for(var i=0; i<ww; i+=PARTICLE_DISTANCE) {
        for(var j=0; j<wh; j+=PARTICLE_DISTANCE) {
            particles.push(new Particle(i,j));
        }
    }
}

function render(a) {
    requestAnimationFrame(render);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < particles.length; i++) {
        particles[i].render();
    }
};

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
requestAnimationFrame(render);
