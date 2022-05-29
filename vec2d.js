function vec2d(x, y) {
    return {x: x, y: y};
}

function vecX(v) {
    return v.x;
}

function vecY(v) {
    return v.y;
}

function addVecs(v1, v2) {
    return vec2d(v1.x+v2.x, v1.y+v2.y);
}

function scaleVec(a, v) {
    return vec2d(a*v.x, a*v.y);
}

function subVec(v1, v2) {
    return vec2d(v1.x-v2.x, v1.y-v2.y);
}

function toIntegerVec(v) {
    return vec2d(Math.round(v.x), Math.round(v.y));
}
