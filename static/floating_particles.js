
// Global variables
var canvas = document.querySelector("#scene");
var ctx = canvas.getContext("2d");
var particles = [];
var mouse = {x:-999, y:-999};
var radius = 100;


var colors = ["#468966","#FFF0A5", "#FFB03B","#B64926", "#8E2800"];     // Original
var colors = ["#3c3c3c", "#696969", "#969696", "#c3c3c3"];    // Grayscale

var ww = canvas.width = window.innerWidth;
var wh = canvas.height = window.innerHeight;

const PARTICLE_DISTANCE = 50;
const MIN_RADIUS = 5, MAX_RADIUS = 15;
const INITIAL_SPEED = 20;
const RANDOM_ACCELERATION = 1;
const DRAG = 0.005;

// Particle functionality

class Particle {
    constructor(x, y) {
        this.origin = {x: x, y: y};
        this.x = random(0, ww);
        this.y = random(0, wh);;
        this.r = random(MIN_RADIUS, MAX_RADIUS);
        this.vx = random(-INITIAL_SPEED, INITIAL_SPEED);
        this.vy = random(-INITIAL_SPEED, INITIAL_SPEED);
        this.accX = 0;
        this.accY = 0;

        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    render() {
        this.accelerate()

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

        this.vx = (this.vx + this.accX) * (1 - (DRAG * this.r));
        this.vy = (this.vy + this.accY) * (1 - (DRAG * this.r));

        this.x += this.vx;
        this.y += this.vy;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, Math.PI * 2, false);
        ctx.fill();
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
    console.log(e);
    mouse.x = e.offsetX;
    mouse.y = e.offsetY;
}

function onPointerMove(e) {
    console.log(e);
    mouse.x = e.offsetX;
    mouse.y = e.offsetY;
}

function onPointerUp(e) {
    console.log(e);
    mouse.x = -999;
    mouse.y = -999;
}

function onClick() {
    radius = (radius + 100) % 500;
}

function initScene(){
    ww = canvas.width = window.innerWidth;
    wh = canvas.height = window.innerHeight;
    console.log("Width: " + ww);
    console.log("Height: " + wh);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles = [];
    for(var i=0; i<ww; i+=PARTICLE_DISTANCE) {
        for(var j=0; j<wh; j+=PARTICLE_DISTANCE) {
            particles.push(new Particle(i,j));
        }
    }
}

function render(a) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < particles.length; i++) {
        particles[i].render();
    }
    requestAnimationFrame(render);
};

// Initialization

window.addEventListener("resize", initScene);

canvas.addEventListener("pointerdown", onPointerDown);
canvas.addEventListener("pointermove", onPointerMove);
canvas.addEventListener("pointerup", onPointerUp);
canvas.addEventListener("click", onClick);

initScene();
requestAnimationFrame(render);
