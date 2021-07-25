
// Global variables
var canvas = document.querySelector("#scene");
var ctx = canvas.getContext("2d");
var particles = [];
var mouse = {x:-999, y:-999};
var radius = 100;
var particleDistance = 50;


var colors = ["#468966","#FFF0A5", "#FFB03B","#B64926", "#8E2800"];     // Original
var colors = ["#3c3c3c", "#696969", "#969696", "#c3c3c3"];    // Grayscale

var ww = canvas.width = window.innerWidth;
var wh = canvas.height = window.innerHeight;

// Particle functionality

class Particle {
    constructor(x, y) {
        this.origin = {x: x, y: y};
        this.x = x + random(-ww / 2, ww / 2);
        this.y = y + random(-wh / 2, wh / 2);;
        this.r = random(5, 15);
        this.vx = random(-20, 20);
        this.vy = random(-20, 20);
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

        this.vx = clamp(this.vx + this.accX + random(-2, 2), -2, 2);
        this.vy = clamp(this.vy + this.accY + random(-2, 2), -2, 2);

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

function onMouseMove(e){
    mouse.x = e.offsetX;
    mouse.y = e.offsetY;
}

function onTouchMove(e){
    if(e.touches.length > 0 ){
        mouse.x = e.touches[0].offsetX;
        mouse.y = e.touches[0].offsetY;
    }
}

function onTouchEnd(e){
    mouse.x = -999;
    mouse.y = -999;
}

function initScene(){
    ww = canvas.width = window.innerWidth;
    wh = canvas.height = window.innerHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles = [];
    for(var i=0; i<ww; i+=particleDistance) {
        for(var j=0; j<wh; j+=particleDistance) {
            particles.push(new Particle(i,j));
        }
    }
}

function onMouseClick() {
    radius = (radius + 100) % 500;
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
canvas.addEventListener("mousemove", onMouseMove);
canvas.addEventListener("touchmove", onTouchMove);
window.addEventListener("click", onMouseClick);
window.addEventListener("touchend", onTouchEnd);

initScene();
requestAnimationFrame(render);
