const TIMESTEPS_PER_SECOND = 30;
const MILLIS_BETWEEN_TIMESTEPS = 1000/TIMESTEPS_PER_SECOND;
const MAX_RENDER_SKIPS = 5;
const DT = MILLIS_BETWEEN_TIMESTEPS;

const SQUARE_WIDTH = 60;
const BOARD_SQUARES = 8;
const WIDTH = BOARD_SQUARES * SQUARE_WIDTH;
const HEIGHT = BOARD_SQUARES * SQUARE_WIDTH;

const WHITE_COLOUR = "#F0D9B5";
const BLACK_COLOUR = "#B58863";

const INITIAL_BALL_X = 50;
const INITIAL_BALL_Y = 50;
const BALL_RADIUS = 10;
const BALL_COLOUR = "#FF0000";
const BALL_FRICTION = 0.8;
const VELOCITY_SCALE = 3.5;

var ballCoords = vec2d(INITIAL_BALL_X, INITIAL_BALL_Y);
var ballVelocity = vec2d(0.0, 0.0);

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');

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
        var velocityChange = scaleVec(VELOCITY_SCALE, subVec(clickPosition, getClickPosition(event)));
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
    if (ballCoords.x < 0) {
        ballCoords.x = 0;
    }
    if (ballCoords.x >= WIDTH) {
        ballCoords.x = WIDTH - 1;
    }
    if (ballCoords.y < 0) {
        ballCoords.y = 0;
    }
    if (ballCoords.y >= HEIGHT) {
        ballCoords.y = HEIGHT - 1;
    }
    applyFriction();
}

function applyFriction() {
    ballVelocity = scaleVec(BALL_FRICTION, ballVelocity);
}

function render() {
    drawBoard();
    drawBall();
    /*
    var img = new Image();
    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        drawPixelated();
    }
    img.src = URL.createObjectURL(selectedFile);
    */
}

function drawBoard() {
    fillSquares(WHITE_COLOUR, 0);
    fillSquares(BLACK_COLOUR, 1);
}

function drawBall() {
    ctx.beginPath()
    ctx.arc(ballCoords.x, ballCoords.y, BALL_RADIUS, 0, 2 * Math.PI, false)
    ctx.fillStyle = BALL_COLOUR;
    ctx.fill()
}

function fillSquares(colour, initialX) {
    ctx.fillStyle = colour;
    var xCoord = initialX;
    var yCoord = 0;
    while (yCoord < BOARD_SQUARES) {
        ctx.fillRect(xCoord*SQUARE_WIDTH, yCoord*SQUARE_WIDTH,
                     SQUARE_WIDTH, SQUARE_WIDTH);
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
