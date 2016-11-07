class Walls {
    constructor(dungeonRooms, walls) {
        this.walls = [];
        this.dungeonRooms = dungeonRooms;

        this.createRoomWalls();
        Array.prototype.push.apply(this.walls, walls);
    }

    createRoomWalls() {
        const rooms = this.dungeonRooms;
        let roomPerimeter = null;
        for (let i = 0; i < rooms.length; i++) {
            roomPerimeter = this.createRoomPerimeterWall(rooms[i]);
            Array.prototype.push.apply(this.walls, roomPerimeter);
        }
    }

    createRoomPerimeterWall(room) {
        const x1 = room.x - room.w / 2 - 1;
        const x2 = room.x + room.w / 2;
        const y1 = room.y - room.h / 2 - 1;
        const y2 = room.y + room.h / 2;

        const roomPerimeter = [
            x1, y1 + 1, x1, y2,
            x1, y2, x2, y2,
            x2, y1, x2, y2 + 1,
            x1, y1, x2, y1
        ];
        return roomPerimeter;
    }

    removeWallWallIntersections() {
        this.removeSegmentsIntersections(this.walls, true);
    }

    removeTunnelWallIntersections(tunnels) {
        this.removeSegmentsIntersections(tunnels, false);
    }

    // under assumption x1 <= x2 and y1 <= y2 for tunnels
    removeSegmentsIntersections(tunnels, isWalls) {
        const walls = this.walls;
        let startWallsLength = 0;
        let newWallsAmount = walls.length - startWallsLength;

        while (newWallsAmount > 0) {
            startWallsLength = walls.length;
            for (let j = 0; j < walls.length; j += 4) {
                for (let i = 0; i < (isWalls ? j : tunnels.length); i += 4) {
                    const pieces = this.resolveSegmentSegment(
                        tunnels[i], tunnels[i + 1], tunnels[i + 2], tunnels[i + 3],
                        walls[j], walls[j + 1], walls[j + 2], walls[j + 3]
                    );
                    if (pieces.length < 4) { // empty walls will be removed in removeZeroLengthWalls()
                        walls[j] = 0;
                        walls[j + 1] = 0;
                        walls[j + 2] = 0;
                        walls[j + 3] = 0;
                    } else {
                        walls[j] = pieces[0];
                        walls[j + 1] = pieces[1];
                        walls[j + 2] = pieces[2];
                        walls[j + 3] = pieces[3];

                        if (pieces.length > 4) {
                            walls.push(pieces[4]);
                            walls.push(pieces[5]);
                            walls.push(pieces[6]);
                            walls.push(pieces[7]);
                        }
                    }
                }
            }
            newWallsAmount = walls.length - startWallsLength;
        }
    }

    // first segment always remains unchanged, second could and will break into 0, 1 or 2 pieces
    resolveSegmentSegment(ax1, ay1, ax2, ay2, bx1, by1, bx2, by2) {
        const result = [];
        const isHorizontal1 = ax2 - ax1 > ay2 - ay1;
        const isHorizontal2 = bx2 - bx1 > by2 - by1;

        if (isHorizontal1 && isHorizontal2 &&
            by1 === ay1 &&
            ((ax1 <= bx2 && ax1 >= bx1) || (ax2 <= bx2 && ax2 >= bx1) || (bx1 <= ax2 && bx1 >= ax1) || (bx2 <= ax2 && bx2 >= ax1))) {

            if (bx1 < ax1) result.push(bx1, by1, ax1, by1);
            if (bx2 > ax2) result.push(ax2, by2, bx2, by2);

        } else if (!isHorizontal1 && isHorizontal2 &&
            by1 >= ay1 && by1 < ay2 &&
            ((ax1 <= bx2 && ax1 >= bx1) || (ax2 <= bx2 && ax2 >= bx1) || (bx1 <= ax2 && bx1 >= ax1) || (bx2 <= ax2 && bx2 >= ax1))) {

            if (bx1 < ax1) result.push(bx1, by1, ax1, by1);
            if (bx2 > ax2) result.push(ax2 + 1, by2, bx2, by2);

        } else if (!isHorizontal1 && !isHorizontal2 &&
        ax1 === bx2 &&
        ((by1 <= ay2 && by1 >= ay1) || (by2 <= ay2 && by2 >= ay1) || (ay1 <= by2 && ay1 >= by1) || (ay2 <= by2 && ay2 >= by1))) {

            if (by1 < ay1) result.push(bx1, by1, bx1, ay1);
            if (by2 > ay2) result.push(bx2, ay2, bx2, by2);

        } else if (isHorizontal1 && !isHorizontal2 &&
        bx1 >= ax1 && bx1 < ax2 &&
        ((ay2 <= by2 && ay2 >= by1) || (ay1 <= by2 && ay1 >= by1) || (by2 <= ay2 && by2 >= ay1) || (by1 <= ay2 && by1 >= ay1))) {

            if (by1 < ay1) result.push(bx1, by1, bx1, ay1);
            if (by2 > ay2) result.push(bx2, ay2 + 1, bx2, by2);

        } else { // segments do not intersect
            result.push(bx1, by1, bx2, by2);
        }

        return result;
    }

    removeZeroLengthWalls() {
        const walls = this.walls;
        for (let i = walls.length - 4; i >= 0; i -= 4) {
            if (walls[i + 2] - walls[i] < 0.5 && walls[i + 3] - walls[i + 1] < 0.5) walls.splice(i, 4);
        }
    }
}

export default Walls;
