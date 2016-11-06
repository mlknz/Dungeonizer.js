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

// under assumption x1 <= x2 and y1 <= y2 for tunnels
export function resolveAlignedRectanglesSegmentsIntersections(dungeonRooms, tunnels) {
    let room;
    let t = null;
    let len = tunnels.length;

    for (let j = 0; j < len; j += 4) {
        for (let i = 0; i < dungeonRooms.length; i++) {
            room = dungeonRooms[i];

            const isHorizontal = tunnels[j + 2] - tunnels[j] > 0;

            if (pointInsideRectangle(tunnels[j], tunnels[j + 1], room.x1, room.y1, room.x2, room.y2)) {
                if (isHorizontal) {
                    tunnels[j] = room.x2;
                } else {
                    tunnels[j + 1] = room.y2;
                }
            } else if (pointInsideRectangle(tunnels[j + 2], tunnels[j + 3], room.x1, room.y1, room.x2, room.y2)) {
                if (isHorizontal) {
                    tunnels[j + 2] = room.x1;
                } else {
                    tunnels[j + 3] = room.y1;
                }
            } else if (alignedSegmentRectangleCol(tunnels[j], tunnels[j + 1], tunnels[j + 2], tunnels[j + 3],
            room.x1, room.y1, room.x2, room.y2)) {
                if (isHorizontal) {
                    t = tunnels[j + 2];
                    tunnels[j + 2] = room.x1;
                    tunnels.push(room.x2, tunnels[j + 1], t, tunnels[j + 3]);
                    len += 4;
                } else {
                    t = tunnels[j + 3];
                    tunnels[j + 3] = room.y1;
                    tunnels.push(tunnels[j], room.y2, tunnels[j + 2], t);
                    len += 4;
                }
            }
        }
    }
}

// normal distribution in [-3, 3]
export function getBoxMullerGaussianNoise() {
    const u = Math.random();
    const v = Math.random();
    return Math.max(Math.min(Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v), 3), -3);
}
