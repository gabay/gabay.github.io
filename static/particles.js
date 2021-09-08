
// Global variables

var canvas = document.querySelector("#scene");
var ctx = canvas.getContext("2d");

var INPUTS = {
    count: document.querySelector("#count"),
    minSize: document.querySelector("#min-size"),
    maxSize: document.querySelector("#max-size"),
    rotation: document.querySelector("#rotation"),
    normalAcceleration: document.querySelector("#normal-acceleration"),
    mouseAcceleration: document.querySelector("#mouse-acceleration"),
    randomAcceleration: document.querySelector("#random-acceleration"),
    drag: document.querySelector("#drag"),
    movingParticlesCount: document.querySelector("#moving-particles-count"),
    movingParticlesStartX: document.querySelector("#moving-particles-start-x"),
    movingParticlesStartY: document.querySelector("#moving-particles-start-y"),
    movingParticlesEndX: document.querySelector("#moving-particles-end-x"),
    movingParticlesEndY: document.querySelector("#moving-particles-end-y"),
    mouseRadiusChangeByMove: document.querySelector("#mouse-radius-change-by-move"),
    mouseRadiusChangeByClick: document.querySelector("#mouse-radius-change-by-click"),
    mouseRadiusDecay: document.querySelector("#mouse-radius-decay"),
    mouseMaxRadius: document.querySelector("#mouse-max-radius")
}
var shapeCircleInput = document.querySelector("#shape-circle");
var shapeLineInput = document.querySelector("#shape-line");
var resetInput = document.querySelector("#reset");

var particles = [];
var movingParticles = [];
var mouse = {x:0, y:0, radius:0};
var mouseMovements = [];
var image = new Image();

// var colors = ["#468966","#FFF0A5", "#FFB03B","#B64926", "#8E2800"];     // Original
var colors = ["#3c3c3c", "#696969", "#969696", "#c3c3c3"];    // Grayscale

var ww = canvas.width = window.innerWidth;
var wh = canvas.height = window.innerHeight;

var CONF = {};
var SHAPE = "line";

// Util functionality

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

function normal(x, y) {
    return distance(0, 0, x, y);
}

function direction(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const n = normal(dx, dy);
    return {x: dx / n, y: dy / n};
}

// Particle functionality

class Particle {
    constructor(x, y, destX, destY) {
        this.dest = {x: destX || x, y: destY || y};
        this.x = x;
        this.y = y;
        this.size = random(CONF.particle.minSize, CONF.particle.maxSize);
        this.rotation = random(0, 2 * Math.PI);
        this.vx = 0;
        this.vy = 0;
        this.accX = 0;
        this.accY = 0;

        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update(elapsed) {
        this.accelerate(elapsed);
    }

    accelerate(elapsed) {
        if (false) { //distance(this.x, this.y, mouse.x, mouse.y) < mouse.radius) {
            this.accX = (this.x - mouse.x) * CONF.particle.mouseAcceleration * elapsed;
            this.accY = (this.y - mouse.y) * CONF.particle.mouseAcceleration * elapsed;
        } else {
            this.accX = (this.dest.x - this.x) * CONF.particle.normalAcceleration * elapsed;
            this.accY = (this.dest.y - this.y) * CONF.particle.normalAcceleration * elapsed;
        }
        for (var mouseMovement of mouseMovements) {
            mouseMovement.accelerateParticleIfNeeded(this, elapsed);
        }

        this.accX += random(-CONF.particle.randomAcceleration * elapsed, CONF.particle.randomAcceleration * elapsed);
        this.accY += random(-CONF.particle.randomAcceleration * elapsed, CONF.particle.randomAcceleration * elapsed);

        this.vx = (this.vx + this.accX) * (1 - CONF.particle.drag) * elapsed;
        this.vy = (this.vy + this.accY) * (1 - CONF.particle.drag) * elapsed;

        this.x += this.vx;
        this.y += this.vy;

        this.rotation += random(-CONF.particle.rotation * elapsed,
             CONF.particle.rotation * elapsed);
    }

    draw() {
        ctx.beginPath();
        if (SHAPE == "circle") {
            ctx.fillStyle = this.color;
            ctx.arc(this.x, this.y, this.size, Math.PI * 2, false);
            ctx.fill();
        } else if (SHAPE == "line") {
            ctx.strokeStyle = this.color;
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

// Mouse Movement

class MouseMovement {
    constructor(x1, y1, x2, y2, maxAge) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.age = 0;
        this.maxAge = maxAge;
        this.distance = distance(x1, y1, x2, y2);
        this.direction = direction(x1, y1, x2, y2);
        this.radius = 0;
        this.force = 0;
        this.active = true;
    }

    update(elapsed) {
        this.age += elapsed;

        const ageFraction = this.age / this.maxAge;
        const multiplier = 2 * Math.min(ageFraction, 1 - ageFraction);
        this.radius = this.distance * CONF.movement.rangeFraction * multiplier;
        this.force = CONF.movement.force * multiplier;
        this.active = this.age < this.maxAge;
    }

    distanceFromParticle(particle) {
        const d1 = distance(this.x1, this.y1, particle.x, particle.y);
        const d2 = distance(this.x2, this.y2, particle.x, particle.y);
        return d1 + d2 - this.distance;
    }

    accelerateParticleIfNeeded(particle, elapsed) {
        if (this.distanceFromParticle(particle) > this.radius) { return; }

        particle.accX += this.force * elapsed * this.direction.x;
        particle.accY += this.force * elapsed * this.direction.y;
    }
}

// Renderer

class Renderer {
    constructor(startCallback, updateCallback) {
        this.startFunction = () => this.start();
        this.updateFunction = (timestamp) => this.update(timestamp);

        this.startCallback = startCallback;
        this.updateCallback = updateCallback;
        this.animationFrameID = undefined;
        this.previousTimestamp = performance.now();
    }

    start() {
        if (this.animationFrameID != undefined) {
            cancelAnimationFrame(this.animationFrameID);
            this.animationFrameID = undefined;
        }

        this.startCallback();
        this.requestAnimationFrame();
    }

    update(timestamp) {
        this.requestAnimationFrame();

        const elapsed = (timestamp - this.previousTimestamp) / 1000;
        this.previousTimestamp = timestamp;

        if (elapsed > 1) {
            console.log("WARNING: update step greater than 1 second, not updating. " + elapsed);
            return;
        }

        this.updateCallback(elapsed);
    }

    requestAnimationFrame() {
        this.animationFrameID = requestAnimationFrame(this.updateFunction);
    }
}

// Setup

function setup() {
    ww = canvas.width = window.innerWidth - 20;
    // wh = canvas.height = window.innerHeight * 0.9;

    CONF = {
        particle: {
            count: Number(INPUTS.count.value),
            minSize: Number(INPUTS.minSize.value),
            maxSize: Number(INPUTS.maxSize.value),
            rotation: Number(INPUTS.rotation.value) * 2 * Math.PI / 360,
            normalAcceleration: Number(INPUTS.normalAcceleration.value),
            mouseAcceleration: Number(INPUTS.mouseAcceleration.value),
            randomAcceleration: Number(INPUTS.randomAcceleration.value),
            drag: Number(INPUTS.drag.value),
            shape: SHAPE
        },
        movingParticles: {
            count: Number(INPUTS.movingParticlesCount.value),
            start: {x: Number(INPUTS.movingParticlesStartX.value),
                    y: Number(INPUTS.movingParticlesStartY.value)},
            end: {x: Number(INPUTS.movingParticlesEndX.value),
                y: Number(INPUTS.movingParticlesEndY.value)}
        },
        mouse: {
            radiusChangeByMove: Number(INPUTS.mouseRadiusChangeByMove.value),
            radiusChangeByClick: Number(INPUTS.mouseRadiusChangeByClick.value),
            radiusDecay: Number(INPUTS.mouseRadiusDecay.value),
            maxRadius: Number(INPUTS.mouseMaxRadius.value),
        },
        movement: {
            time: 2,
            rangeFraction: 1,
            force: 10000,
            maxMovements: 50
        }
    };
    console.log("Configuration:");
    console.log(CONF);

    setupImageAndParticles();
}

function setupImageAndParticles() {
    if (ww <= 800) {
        image.src = "/static/image/avira_mobile.png"
    } else {
        image.src = "/static/image/avira_desktop.png"
    }
    // canvas.style.backgroundImage = "url(" + image.src + ")";
    // canvas.style.backgroundRepeat = "no-repeat";
    // canvas.style.backgroundSize = "100% 100%";
    image.onload = (e) => setupParticles();
}

function setupParticles() {
    const imageData = getImageData();
    const pixelIntensity = getPixelIntensityArray(imageData);

    particles = [];
    while(particles.length < CONF.particle.count) {
        x = Math.floor(random(0, imageData.width));
        y = Math.floor(random(0, imageData.height));
        if(pixelIntensity[y][x] < random(0, 128)) {
            particles.push(new Particle(x, y));
        }
    }

    const mp = CONF.movingParticles;
    movingParticles = [];
    for (var i=0; i < mp.count; i++) {
        const prog = i / mp.count;
        const x = (mp.start.x * ww * (1 - prog)) + (mp.end.x * ww * prog);
        const y = (mp.start.y * wh * (1 - prog)) + (mp.end.y * wh * prog);
        movingParticles.push(new Particle(x, y, mp.end.x * ww, mp.end.y * wh));
    }
}

function getImageData() {
    clear();
    ctx.drawImage(image, 0, 0, ww, wh);
    const imageData = ctx.getImageData(0, 0, ww, wh);
    clear();
    return imageData;
}

function getPixelIntensityArray(imageData) {
    pixelIntensity = [];
    for(var y = 0; y < imageData.height; y++) {
        var pixelIntensityRow = [];
        for(var x = 0; x < imageData.width; x++) {
            pixelIntensityRow.push(getPixelIntensity(imageData, x, y));
        }
        pixelIntensity.push(pixelIntensityRow);
    }
    return pixelIntensity;
}

function getPixelIntensity(imageData, x, y) {
    const data = imageData.data;
    const pos = ((y * imageData.width) + x) * 4;
    const r = data[pos], g = data[pos + 1], b = data[pos + 2], a = data[pos + 3];
    const intensity = (r + g + b) / 3;
    return intensity;
}

// Update

function updateAndDraw(elapsed) {
    update(elapsed);
    draw();
}

function update(elapsed) {
    updateMouseRadius(elapsed);
    updateParticles(elapsed);
    updateMovingParticles(elapsed);
    updateMouseMovements(elapsed);
    updateTexts(elapsed);
}

function updateMouseRadius(elapsed) {
    const change = CONF.mouse.radiusDecay * elapsed;
    mouse.radius = clamp(mouse.radius + change, 0, CONF.mouse.maxRadius);
}

function updateParticles(elapsed) {
    for (particle of particles) {
        particle.update(elapsed);
    }
}

function updateMovingParticles(elapsed) {
    const mp = CONF.movingParticles;

    for(var i = 0; i < movingParticles.length; i++) {
        const particle = movingParticles[i];
        if (particle.x - particle.dest.x < 1 && particle.y - particle.dest.y < 1) {
            movingParticles[i] = new Particle(mp.start.x * ww, mp.start.y * wh, mp.end.x * ww, mp.end.y * wh);
        }
    }

    for(particle of movingParticles) {
        particle.update(elapsed);
    }
}

function updateMouseMovements(elapsed) {
    var newMouseMovements = []
    for (mouseMovement of mouseMovements) {
        mouseMovement.update(elapsed);
        if (mouseMovement.active) {
            newMouseMovements.push(mouseMovement);
        }
    }

    mouseMovements = newMouseMovements;
}

function updateTexts(elapsed) {
    calculateFPS(elapsed);
}

// Draw

function draw() {
    clear();
    drawParticles();
    drawMovingParticles();
    drawTexts();
}

function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawParticles() {
    for (particle of particles) {
        particle.draw();
    }
}

function drawMovingParticles() {
    for (particle of movingParticles) {
        particle.draw();
    }
}

function drawTexts() {
    ctx.fillStyle = "black";
    ctx.font = "bold 15px sans-serif";
    ctx.textAlign = "left";
    drawNumberOfParticlesText();
    drawFPSText();
}

function drawNumberOfParticlesText() {
    ctx.fillText("Particles: " + particles.length, 10, 15);
}

function drawFPSText() {
    ctx.fillText("FPS: " + fps.toPrecision(2), 10, 30);
}

var fps = 0;
var elapses = 0;
var elapsesTime = 0;
function calculateFPS(elapsed) {
    if (elapsed <= 0) {
        return fps;
    }

    elapses += 1;
    elapsesTime += elapsed;

    if (elapsesTime > 0.5) {
        fps = elapses / elapsesTime;
        elapses = 0;
        elapsesTime = 0;
    }

    return fps;
}

// Event functionality

function setShapeCircleAndstart() {
    SHAPE = "circle";
    renderer.start();
}

function setShapeLineAndStart() {
    SHAPE = "line";
    renderer.start();
}

function onPointerEnter(e) {
    if (e.pointerType !==  "mouse") { return; }

    mouse.x = e.offsetX;
    mouse.y = e.offsetY;
}

function onPointerLeave(e) {
    if (e.pointerType !==  "mouse") { return; }

    mouse.x = mouse.y = 0;
}

function onPointerMove(e) {
    if (e.pointerType !==  "mouse") { return; }

    mouseMovements.push(
        new MouseMovement(mouse.x, mouse.y, e.offsetX, e.offsetY, CONF.movement.time)
    );
    if (mouseMovements.length > CONF.movement.maxMovements) {
        mouseMovements.shift();
    }

    mouse.x = e.offsetX;
    mouse.y = e.offsetY;
    mouse.radius = clamp(mouse.radius + CONF.mouse.radiusChangeByMove, 0, CONF.mouse.maxRadius);
}

function onPointerDown(e) {}

function onPointerUp(e) {}

function onClick(e) {
    mouse.radius = clamp(mouse.radius + CONF.mouse.radiusChangeByClick, 0, CONF.mouse.maxRadius);
}

// Initialization

const renderer = new Renderer(setup, updateAndDraw);

window.addEventListener("resize", renderer.startFunction);
for (input in INPUTS) {
    INPUTS[input].addEventListener("keyup", renderer.startFunction);
}
shapeCircleInput.addEventListener("click", setShapeCircleAndstart);
shapeLineInput.addEventListener("click", setShapeLineAndStart);
resetInput.addEventListener("click", (e) => setTimeout(renderer.startFunction, 1));

canvas.addEventListener("pointerenter", onPointerEnter);
canvas.addEventListener("pointerleave", onPointerLeave);
canvas.addEventListener("pointermove", onPointerMove);
canvas.addEventListener("pointerdown", onPointerDown);
canvas.addEventListener("pointerup", onPointerUp);
canvas.addEventListener("click", onClick);

renderer.start();
