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

const INITIAL_BALL_X = WORLD_WIDTH/2;
const INITIAL_BALL_Y = WORLD_WIDTH/2;
const BALL_RADIUS = SQUARE_WIDTH/2;
const BALL_COLOUR = "#FF0000";
const BALL_FRICTION = 0.8;
const VELOCITY_SCALE = 3.5;

var ballCoords = vec2d(INITIAL_BALL_X, INITIAL_BALL_Y);
var ballVelocity = vec2d(0.0, 0.0);

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');

var pixelsPerUnitLength = 0;
var unitLengthsPerPixel = 0;

var clickPosition = null;
var hasClicked = false;

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
    return vec2d(event.clientX - rect.left, event.clientY - rect.top);
}

function storeClickPosition(event) {
    clickPosition = getClickPosition(event);
    hasClicked = true;
}

function releaseClick(event) {
    if (hasClicked && clickPosition !== null) {
        var velocityChange = scaleVec(VELOCITY_SCALE,
            subVec(pixelVecToWorldVec(clickPosition),
                   pixelVecToWorldVec(getClickPosition(event))));
        ballVelocity = addVecs(ballVelocity, velocityChange);
    }
    hasClicked = false;
    clickPosition = null;
}

function updateGameState() {
    ballCoords = toIntegerVec(
        addVecs(ballCoords,
                // Velocity is m/s, but only DT milliseconds have
                // passed, so need to scale it appropriately.
                scaleVec(DT/1000.0, ballVelocity)));
    /*
    if (ballCoords.x < 0) {
        ballCoords.x = 0;
    }
    if (ballCoords.x >= WORLD_WIDTH) {
        ballCoords.x = WORLD_WIDTH - 1;
    }
    if (ballCoords.y < 0) {
        ballCoords.y = 0;
    }
    if (ballCoords.y >= WORLD_HEIGHT) {
        ballCoords.y = WORLD_HEIGHT - 1;
    }
    */
    applyFriction();
}

function applyFriction() {
    ballVelocity = scaleVec(BALL_FRICTION, ballVelocity);
}

function render() {
    // This changes dynamically based on the current
    // size of the canvas, which can change based on
    // the user resizing the window.
    pixelsPerUnitLength = canvas.width/WORLD_WIDTH;
    unitLengthsPerPixel = WORLD_WIDTH/canvas.width;
    drawBackground();
    drawBoard();
    drawBall(ballCoords.x, ballCoords.y, BALL_RADIUS, BALL_COLOUR);
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

function pixelVecToWorldVec(pv) {
    return vec2d(toUnitLengths(pv.x), yToUnitLengths(pv.y));
}


function drawBackground() {
    ctx.fillStyle = BACKGROUND_COLOUR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawBoard() {
    fillSquares(WHITE_COLOUR, 0);
    fillSquares(BLACK_COLOUR, 1);
}

function drawBall(x, y, radius, colour) {
    ctx.beginPath()
    ctx.arc(toPixels(x), yToPixels(y), toPixels(radius), 0, 2*Math.PI, false);
    ctx.fillStyle = colour;
    ctx.fill()
}

function fillSquares(colour, initialX) {
    // Considering top left square to have board coordinates (0, 0).
    // Need to convert this to "world" coordinates.
    ctx.fillStyle = colour;
    var xCoord = initialX;
    var yCoord = 0;
    const firstSquareCenter = BOARD_OFFSET + SQUARE_WIDTH/2
    while (yCoord < BOARD_SQUARES) {
        drawRectangle(BOARD_OFFSET + SQUARE_WIDTH/2 + xCoord*SQUARE_WIDTH,
                      BOARD_OFFSET + SQUARE_WIDTH/2 + yCoord*SQUARE_WIDTH,
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
    //console.log("drawing rectangle at x=" + String(toPixels(x)) + " and y=" + String(yToPixels(y)));
    ctx.fillRect(toPixels(x), yToPixels(y), toPixels(width), toPixels(height));
}
