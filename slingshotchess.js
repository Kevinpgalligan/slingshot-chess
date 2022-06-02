const TIMESTEPS_PER_SECOND = 30;
const MILLIS_BETWEEN_TIMESTEPS = 1000/TIMESTEPS_PER_SECOND;
const MAX_RENDER_SKIPS = 5;
const DT = MILLIS_BETWEEN_TIMESTEPS;

const SQUARE_WIDTH = 100;
const BOARD_SQUARES = 8;
const BOUNDARY_WIDTH = 100
const BOUNDARY_AND_BOARD_WIDTH = 2*BOUNDARY_WIDTH + BOARD_SQUARES*SQUARE_WIDTH;
const BOARD_OFFSET = BOUNDARY_WIDTH;
const WORLD_WIDTH = BOUNDARY_AND_BOARD_WIDTH

const BACKGROUND_COLOUR = "#000055";
const WHITE_COLOUR = "#F0D9B5";
const BLACK_COLOUR = "#B58863";

const FRICTION_COEFFICIENT = 0.8;
const VELOCITY_SCALE = 3.5;

class Ball {
    constructor(x, y, radius, colour, weight) {
        this.coords = vec2d(x, y);
        this.velocity = vec2d(0.0, 0.0);
        this.radius = radius;
        this.colour = colour;
        this.weight = weight;
    }
}

function ballsIntersect(b1, b2) {
    return euclideanDistance(b1.coords, b2.coords) < b1.radius + b2.radius;
}

function ballContains(ball, coords) {
    return euclideanDistance(ball.coords, coords) < ball.radius;
}

var balls = [
    new Ball(WORLD_WIDTH/2, WORLD_WIDTH/2, SQUARE_WIDTH/4, "#FF0000", 1),
    new Ball(WORLD_WIDTH/2 + SQUARE_WIDTH, WORLD_WIDTH/2, SQUARE_WIDTH/5, "#00FF00", 1)
];

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');

var pixelsPerUnitLength = 0;
var unitLengthsPerPixel = 0;

var clickPosition = null;
var targetBall = null;

function init() {
    window.addEventListener('mousedown', function(e) {
        storeClickPosition(e);
    });
    window.addEventListener('mouseup', function(e) {
        releaseClick(e);
    });
}

async function runMainLoop() {
    // Main game loop!
    // https://dewitters.com/dewitters-gameloop/
    var nextTimestep = Date.now();
    while (true) {
        var loops = 0;
        while (Date.now() > nextTimestep && loops < MAX_RENDER_SKIPS) {
            updateGameState();
            nextTimestep += MILLIS_BETWEEN_TIMESTEPS;
            loops += 1;
        }
        render();
        window.requestAnimationFrame(time => {});
        await sleep(Math.max(0, nextTimestep - Date.now()));
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getClickPosition(event) {
    const rect = canvas.getBoundingClientRect()
    return vec2d(toUnitLengths(event.clientX - rect.left),
                 yToUnitLengths(event.clientY - rect.top));
}

function storeClickPosition(event) {
    var potentialClickPosition = getClickPosition(event);
    for (ball of balls) {
        if (ballContains(ball, potentialClickPosition)) {
            targetBall = ball;
            clickPosition = potentialClickPosition;
            break;
        }
    }
}

function releaseClick(event) {
    if (targetBall !== null && clickPosition !== null) {
        var velocityChange = scaleVec(VELOCITY_SCALE,
            subVec(clickPosition, getClickPosition(event)));
        targetBall.velocity = addVecs(targetBall.velocity, velocityChange);
    }
    targetBall = null;
    clickPosition = null;
}

function updateGameState() {
    var movingBalls = [];
    balls.forEach(ball => {
        if (!isZeroVec(ball.velocity)) {
            movingBalls.push(ball);
        }
        // Move the balls to their new positions.
        ball.coords = addVecs(
            ball.coords,
            // Velocity is m/s, but only DT milliseconds have
            // passed, so need to scale it appropriately.
            scaleVec(DT/1000.0, ball.velocity));
        // Apply friction to the balls: their velocity reduces
        // after the movement.
        // (Probably need to scale this by DT, check what
        //  the units of friction are).
        ball.velocity = scaleVec(FRICTION_COEFFICIENT*ball.weight,
                                 ball.velocity);
    });

    // Check for collisions.
    movingBalls.forEach(ball => {
        balls.forEach(otherBall => {
            if (ball !== otherBall && ballsIntersect(ball, otherBall)) {
                // Take component of ball's velocity towards
                // other ball, split it evenly beteen them.
                // Eventually need to take account of proper
                // collision physics (weight, inelastic collision).
                var componentVelocity = projectOnto(ball.velocity,
                                                    subVec(otherBall.coords,
                                                           ball.coords));
                otherBall.velocity = addVecs(otherBall.velocity, componentVelocity);
                ball.velocity = addVecs(ball.velocity, scaleVec(-1, componentVelocity));
            }
        });
    });
}

function render() {
    // This can change as the user resizes the window.
    canvas.width = Math.min(window.innerHeight, window.innerWidth);
    canvas.height = canvas.width;
    pixelsPerUnitLength = canvas.width/WORLD_WIDTH;
    unitLengthsPerPixel = WORLD_WIDTH/canvas.width;
    drawBackground();
    drawBoard();
    balls.forEach(drawBall);
}

function toPixels(length) {
    return Math.ceil(length * pixelsPerUnitLength);
}

function yToPixels(y) {
    /* There needs to be a separate function for converting a y coordinate
       to the matching pixel coordinate, since the positive y direction of
       the canvas points down, while the "world" y axis points up. */
    return canvas.height - 1 - toPixels(y)
}

function toUnitLengths(pixels) {
    return unitLengthsPerPixel * pixels;
}

function yToUnitLengths(y) {
    return toUnitLengths(canvas.height-1-y);
}

function drawBackground() {
    ctx.fillStyle = BACKGROUND_COLOUR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawBoard() {
    fillSquares(WHITE_COLOUR, 1);
    fillSquares(BLACK_COLOUR, 0);
}

function drawBall(ball) {
    ctx.beginPath()
    ctx.arc(toPixels(ball.coords.x), yToPixels(ball.coords.y),
            toPixels(ball.radius), 0, 2*Math.PI, false);
    ctx.fillStyle = ball.colour;
    ctx.fill()
}

function fillSquares(colour, initialX) {
    // Considering bottom left square to have board coordinates (0, 0).
    // Need to convert this to "world" coordinates.
    ctx.fillStyle = colour;
    var xCoord = initialX;
    var yCoord = 0;
    while (yCoord < BOARD_SQUARES) {
        drawRectangle(BOARD_OFFSET + xCoord*SQUARE_WIDTH,
                      BOARD_OFFSET + (yCoord+1)*SQUARE_WIDTH,
                      SQUARE_WIDTH,
                      SQUARE_WIDTH);
        xCoord += 2;
        if (xCoord >= BOARD_SQUARES) {
            if (xCoord == BOARD_SQUARES) {
                xCoord = 1;
            }
            else {
                xCoord = 0;
            }
            yCoord += 1;
        }
    }
}

function drawRectangle(x, y, width, height) {
    ctx.fillRect(toPixels(x), yToPixels(y), toPixels(width), toPixels(height));
}
