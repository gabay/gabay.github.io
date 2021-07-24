
// Global variables
var canvas = document.querySelector("#scene");
var ctx = canvas.getContext("2d");
var particles = [];
var mouse = {x:-999, y:-999};
var radius = 1;


var colors = ["#468966","#FFF0A5", "#FFB03B","#B64926", "#8E2800"];     // Original
var colors = ["#0f0f0f","#3c3c3c", "#696969", "#969696", "#c3c3c3"];    // Grayscale

var copy = document.querySelector("#copy");

var ww = canvas.width = window.innerWidth;
var wh = canvas.height = window.innerHeight;

// Particle functionality

class Particle {
    constructor(x, y) {
        this.dest = {x: x, y: y};
        this.x = Math.random() * ww;
        this.y = Math.random() * wh;
        this.r = Math.random() * 5 + 2;
        this.vx = (Math.random() - 0.5) * 20;
        this.vy = (Math.random() - 0.5) * 20;
        this.accX = 0;
        this.accY = 0;
        this.friction = 0.95 + Math.random() * 0.03;

        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    render() {
        this.accelerate()

        this.draw();
    }

    accelerate() {
        if (distance(this.x, this.y, mouse.x, mouse.y) < (radius * 70)) {
            this.accX = (this.x - mouse.x) / 100;
            this.accY = (this.y - mouse.y) / 100;
        } else {
            this.accX = (this.dest.x - this.x) / 1000;
            this.accY = (this.dest.y - this.y) / 1000;
        }

        this.vx = (this.vx + this.accX) * this.friction;
        this.vy = (this.vy + this.accY) * this.friction;

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

    ctx.font = "bold "+(ww/10)+"px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(copy.value, ww/2, wh/2);

    var data  = ctx.getImageData(0, 0, ww, wh).data;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "screen";

    particles = [];
    for(var i=0;i<ww;i+=Math.round(ww/150)){
    for(var j=0;j<wh;j+=Math.round(ww/150)){
        if(data[ ((i + j*ww)*4) + 3] > 150){
        particles.push(new Particle(i,j));
        }
    }
    }
}

function onMouseClick() {
    radius = (radius + 1) % 5;
}

function render(a) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < particles.length; i++) {
        particles[i].render();
    }
    requestAnimationFrame(render);
};

// Initialization

copy.addEventListener("keyup", initScene);
window.addEventListener("resize", initScene);
canvas.addEventListener("mousemove", onMouseMove);
canvas.addEventListener("touchmove", onTouchMove);
window.addEventListener("click", onMouseClick);
window.addEventListener("touchend", onTouchEnd);

initScene();
requestAnimationFrame(render);
