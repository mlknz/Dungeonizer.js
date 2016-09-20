export function rectanglesCollided(a, b) {
    if (a.x - a.w / 2 < b.x + b.w / 2 && a.x + a.w / 2 > b.x - b.w / 2 &&
        a.y + a.h / 2 > b.y - b.h / 2 && a.y - a.h / 2 < b.y + b.h / 2) return true;
    return false;
}

export function alignedSegmentRectangleCol(sx1, sy1, sx2, sy2, rx1, ry1, rx2, ry2) {
    if (sx1 > Math.min(rx1, rx2) && sx1 < Math.max(rx1, rx2)) {
        if (
            (ry1 > Math.min(sy1, sy2) && ry1 < Math.max(sy1, sy2)) || ((ry2 > Math.min(sy1, sy2) && ry2 < Math.max(sy1, sy2)))) {
            return true;
        }
    } else if (sy1 > Math.min(ry1, ry2) && sy1 < Math.max(ry1, ry2)) {
        if ((rx1 > Math.min(sx1, sx2) && rx1 < Math.max(sx1, sx2)) || ((rx2 > Math.min(sx1, sx2) && rx2 < Math.max(sx1, sx2)))) {
            return true;
        }
    }
    return false;
}
