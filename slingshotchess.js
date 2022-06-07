const DEBUG_DRAW_COLLISION_CIRCLES = false;

const TIMESTEPS_PER_SECOND = 30;
const MILLIS_BETWEEN_TIMESTEPS = 1000/TIMESTEPS_PER_SECOND;
const MAX_RENDER_SKIPS = 5;
const DT = MILLIS_BETWEEN_TIMESTEPS/1000.0;

const SQUARE_WIDTH = 100;
const BOARD_SQUARES = 8;
const BOUNDARY_WIDTH = 100
const BOUNDARY_AND_BOARD_WIDTH = 2*BOUNDARY_WIDTH + BOARD_SQUARES*SQUARE_WIDTH;
const BOARD_OFFSET = BOUNDARY_WIDTH;
const WORLD_WIDTH = BOUNDARY_AND_BOARD_WIDTH

const BACKGROUND_COLOUR = "#000055";
const WHITE_COLOUR = "#F0D9B5";
const BLACK_COLOUR = "#B58863";

const FRICTION_COEFFICIENT = 0.6;
const VELOCITY_SCALE = 0.666;
const VELOCITY_FLOOR = 0.01;

// How to wait for images to finish loading:
// https://stackoverflow.com/questions/37854355/wait-for-image-loading-to-complete-in-javascript
// https://stackoverflow.com/questions/6902334/how-to-let-javascript-wait-until-certain-event-happens
// And how to draw:
// https://stackoverflow.com/questions/57502210/how-to-draw-a-svg-on-canvas-using-javascript
// https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Using_images
// How to convert SVG to base64:
// https://dirask.com/posts/Bash-convert-svg-to-base64-data-url-DnKqAp
const whitePawnImg = new Image();
whitePawnImg.src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NSIgaGVpZ2h0PSI0NSI+PHBhdGggZD0iTTIyLjUgOWMtMi4yMSAwLTQgMS43OS00IDQgMCAuODkuMjkgMS43MS43OCAyLjM4QzE3LjMzIDE2LjUgMTYgMTguNTkgMTYgMjFjMCAyLjAzLjk0IDMuODQgMi40MSA1LjAzLTMgMS4wNi03LjQxIDUuNTUtNy40MSAxMy40N2gyM2MwLTcuOTItNC40MS0xMi40MS03LjQxLTEzLjQ3IDEuNDctMS4xOSAyLjQxLTMgMi40MS01LjAzIDAtMi40MS0xLjMzLTQuNS0zLjI4LTUuNjIuNDktLjY3Ljc4LTEuNDkuNzgtMi4zOCAwLTIuMjEtMS43OS00LTQtNHoiIGZpbGw9IiNmZmYiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==";
const blackPawnImg = new Image();
blackPawnImg.src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NSIgaGVpZ2h0PSI0NSI+PHBhdGggZD0iTTIyLjUgOWMtMi4yMSAwLTQgMS43OS00IDQgMCAuODkuMjkgMS43MS43OCAyLjM4QzE3LjMzIDE2LjUgMTYgMTguNTkgMTYgMjFjMCAyLjAzLjk0IDMuODQgMi40MSA1LjAzLTMgMS4wNi03LjQxIDUuNTUtNy40MSAxMy40N2gyM2MwLTcuOTItNC40MS0xMi40MS03LjQxLTEzLjQ3IDEuNDctMS4xOSAyLjQxLTMgMi40MS01LjAzIDAtMi40MS0xLjMzLTQuNS0zLjI4LTUuNjIuNDktLjY3Ljc4LTEuNDkuNzgtMi4zOCAwLTIuMjEtMS43OS00LTQtNHoiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==";

waitForImage(whitePawnImg);
waitForImage(blackPawnImg);

async function waitForImage(img) {
    await getPromise(img);
}

function getPromise(img) {
    return new Promise(resolve => {
        const listener = () => {
            img.removeEventListener("load", listener);
            resolve();
        }
        img.addEventListener("load", listener);
    });
}

class Piece {
    constructor(x, y, radius, colour, mass, img) {
        this.coords = vec2d(x, y);
        this.velocity = vec2d(0.0, 0.0);
        this.radius = radius;
        this.colour = colour;
        this.mass = mass;
        this.img = img
    }
}

function piecesIntersect(b1, b2) {
    return euclideanDistance(b1.coords, b2.coords) < b1.radius + b2.radius;
}

function pieceContains(piece, coords) {
    return euclideanDistance(piece.coords, coords) < piece.radius;
}

var pieces = [
    new Piece(WORLD_WIDTH/2, WORLD_WIDTH/2, SQUARE_WIDTH/4, "#FF0000", 1, whitePawnImg),
    new Piece(WORLD_WIDTH/2 + SQUARE_WIDTH, WORLD_WIDTH/2, SQUARE_WIDTH/5, "#00FF00", 3, blackPawnImg)
];

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');

var pixelsPerUnitLength = 0;
var unitLengthsPerPixel = 0;

var clickPosition = null;
var targetPiece = null;

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
    for (piece of pieces) {
        if (pieceContains(piece, potentialClickPosition)) {
            targetPiece = piece;
            clickPosition = potentialClickPosition;
            break;
        }
    }
}

function releaseClick(event) {
    if (targetPiece !== null && clickPosition !== null) {
        var velocityChange = scaleVec(VELOCITY_SCALE,
            subVec(clickPosition, getClickPosition(event)));
        targetPiece.velocity = addVec(targetPiece.velocity, velocityChange);
    }
    targetPiece = null;
    clickPosition = null;
}

function updateGameState() {
    var newCoords = [];
    pieces.forEach(piece => {
        if (isZeroVec(piece.velocity)) {
            newCoords.push(piece.coords);
        } else {
            newCoords.push(
                addVec(
                    piece.coords,
                    scaleVec(DT, piece.velocity)));
            piece.velocity = applyFriction(piece.velocity, piece.mass);
        }
    });

    // Check for collisions between the pieces at their
    // new positions. If a piece is in a collision, freeze
    // it in its current position.
    // Warning: doesn't handle multi-piece collisions.
    var shouldFreeze = Array(newCoords.length).fill(false);
    for (var i = 0; i < newCoords.length; i += 1) {
        for (var j = i+1; j < newCoords.length; j += 1) {
            // Pieces collide! Freeze 'em. And update their
            // velocities.
            if (euclideanDistance(newCoords[i], newCoords[j]) < pieces[i].radius + pieces[j].radius) {
                shouldFreeze[i] = true;
                shouldFreeze[j] = true;
                // The component of piece i's velocity in the direction
                // of piece j is transferred to j. And vice versa.
                exchangeVelocity(pieces[i], pieces[j]);
            }
        }
    }

    for (var i = 0; i < newCoords.length; i += 1) {
        if (!shouldFreeze[i]) {
            pieces[i].coords = newCoords[i];
        }
    }
}

function applyFriction(velocity, mass) {
    // Not incorporating mass just yet.
    var newVelocity  = subVec(velocity, scaleVec(DT*(1-FRICTION_COEFFICIENT), velocity));
    // Just so pieces aren't stuck at a very very small velocity that
    // will never go to zero.
    if (vecLength(newVelocity) < VELOCITY_FLOOR) {
        return vec2d(0, 0);
    }
    return newVelocity;
}

function exchangeVelocity(piece, otherPiece) {
    var c1 = piece.coords;
    var c2 = otherPiece.coords;
    var m1 = piece.mass;
    var m2 = otherPiece.mass;
    // Velocity along the line from piece to otherPiece.
    var d = direction(c1, c2);
    // Projections onto the direction vector.
    var p1 = projectOnto(piece.velocity, d);
    var p2 = projectOnto(otherPiece.velocity, d);
    // Finally, the velocity along that direction vector. Positive direction
    // is wherever the direction vector is pointing.
    var u1 = Math.sign(dotProduct(p1, d)) * vecLength(p1);
    var u2 = Math.sign(dotProduct(p2, d)) * vecLength(p2);

    // New velocities along the direction vector!
    var output = computeOutputVelocities(u1, u2, m1, m2);

    // First remove the old velocity along the direction vector, then
    // add the new velocity along that direction.
    piece.velocity = addVec(subVec(piece.velocity, p1), scaleVec(output.v1, d));
    otherPiece.velocity = addVec(subVec(otherPiece.velocity, p2), scaleVec(output.v2, d));
}

function computeOutputVelocities(u1, u2, m1, m2) {
    // See: https://en.wikipedia.org/wiki/Elastic_collision
    return {v1: (m1-m2)/(m1+m2)*u1 + 2*m2/(m1+m2)*u2,
            v2: 2*m1/(m1+m2)*u1 + (m2-m1)/(m1+m2)*u2};
}

function render() {
    // This can change as the user resizes the window.
    canvas.width = Math.min(window.innerHeight, window.innerWidth);
    canvas.height = canvas.width;
    pixelsPerUnitLength = canvas.width/WORLD_WIDTH;
    unitLengthsPerPixel = WORLD_WIDTH/canvas.width;
    drawBackground();
    drawBoard();
    pieces.forEach(drawPiece);
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

function drawPiece(piece) {
    const xPixels = toPixels(piece.coords.x);
    const yPixels = yToPixels(piece.coords.y)
    ctx.drawImage(piece.img, xPixels, yPixels);
    if (DEBUG_DRAW_COLLISION_CIRCLES) {
        ctx.beginPath()
        ctx.arc(xPixels, yPixels, toPixels(piece.radius), 0, 2*Math.PI, false);
        ctx.fillStyle = piece.colour;
        ctx.fill()
    }
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
