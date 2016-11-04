export function rectanglesTouched(a, b) {
    if (a.x - a.w / 2 <= b.x + b.w / 2 && a.x + a.w / 2 >= b.x - b.w / 2 &&
        a.y + a.h / 2 >= b.y - b.h / 2 && a.y - a.h / 2 <= b.y + b.h / 2) return true;
    return false;
}

export function alignedSegmentRectangleCol(sx1, sy1, sx2, sy2, x1, y1, x2, y2) {
    if (sx1 >= Math.min(x1, x2) && sx1 < Math.max(x1, x2)) {
        if (
            (y1 > Math.min(sy1, sy2) && y1 < Math.max(sy1, sy2)) || ((y2 > Math.min(sy1, sy2) && y2 < Math.max(sy1, sy2)))) {
            return true;
        }
    } else if (sy1 >= Math.min(y1, y2) && sy1 < Math.max(y1, y2)) {
        if ((x1 > Math.min(sx1, sx2) && x1 < Math.max(sx1, sx2)) || ((x2 > Math.min(sx1, sx2) && x2 < Math.max(sx1, sx2)))) {
            return true;
        }
    }
    return false;
}

export function pointInsideRectangle(px, py, x1, y1, x2, y2) {
    return px >= x1 && px < x2 && py >= y1 && py < y2; // todo: think about this off by one (+=0.5 when drawing tunnels)
}

export function dSq(a, b) {
    return (a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]);
}

// normal distribution in [-3, 3]
export function getBoxMullerGaussianNoise() {
    const u = Math.random();
    const v = Math.random();
    return Math.max(Math.min(Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v), 3), -3);
}
