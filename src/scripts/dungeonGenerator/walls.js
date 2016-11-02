class Walls {
    constructor(rooms, tunnels) {
        // console.log('go', rooms, tunnels);
        const walls = [];

        for (let i = 0; i < rooms.length; i++) {
            if (rooms[i].isMain || rooms[i].isAttached) {
                const roomPerimeter = this.createRoomPerimeterWall(rooms[i]);
                Array.prototype.push.apply(walls, roomPerimeter);
            }
        }

        for (let i = 0; i < tunnels.length; i += 4) {
            const tunnelWalls = this.createTunnelWall(
                Math.min(tunnels[i], tunnels[i + 2]),
                Math.min(tunnels[i + 1], tunnels[i + 3]),
                Math.max(tunnels[i], tunnels[i + 2]),
                Math.max(tunnels[i + 1], tunnels[i + 3])
            );
            Array.prototype.push.apply(walls, tunnelWalls);
        }

        this.walls = walls;
    }

    createRoomPerimeterWall(room) {
        const x1 = room.x - room.w / 2; // todo: +/- 1's
        const x2 = room.x + room.w / 2;
        const y1 = room.y - room.h / 2;
        const y2 = room.y + room.h / 2;

        const roomPerimeter = [
            x1, y1, x1, y2,
            x1, y2, x2, y2,
            x2, y2, x2, y1,
            x2, y1, x1, y1
        ];
        return roomPerimeter;
    }

    createTunnelWall(ax, ay, bx, by) {
        // sorting and -1 / +1 for handling L-shapes
        const isHorizontal = Math.abs(ax - bx) > Math.abs(ay - by);
        let tunnelWalls;
        if (isHorizontal) {
            tunnelWalls = [ax - 1, ay - 1, bx + 1, ay - 1, ax - 1, ay + 1, bx + 1, ay + 1];
        } else {
            tunnelWalls = [ax - 1, ay - 1, ax - 1, by + 1, ax + 1, ay - 1, ax + 1, by + 1];
        }

        return tunnelWalls;
    }

    removeTunnelWallIntersections(tunnels) {
        const walls = this.walls;
        let startWallsLength = 0;
        let newWallsAmount = walls.length - startWallsLength;

        while (newWallsAmount > 0) {
            console.log('going inside');
            startWallsLength = walls.length;
            for (let i = 0; i < tunnels.length; i += 4) {
                for (let j = 0; j < walls.length; j += 4) {
                    const pieces = this.processWallWall(
                        Math.min(tunnels[i], tunnels[i + 2]),
                        Math.min(tunnels[i + 1], tunnels[i + 3]),
                        Math.max(tunnels[i], tunnels[i + 2]),
                        Math.max(tunnels[i + 1], tunnels[i + 3]),
                        Math.min(walls[j], walls[j + 2]),
                        Math.min(walls[j + 1], walls[j + 3]),
                        Math.max(walls[j], walls[j + 2]),
                        Math.max(walls[j + 1], walls[j + 3])
                    );
                    if (pieces.B) {
                        walls[j] = pieces.B[0];
                        walls[j + 1] = pieces.B[1];
                        walls[j + 2] = pieces.B[2];
                        walls[j + 3] = pieces.B[3];
                        if (pieces.C) {
                            walls.push(pieces.C[0]);
                            walls.push(pieces.C[1]);
                            walls.push(pieces.C[2]);
                            walls.push(pieces.C[3]);
                        }
                    } else if (pieces.C) {
                        walls[j] = pieces.C[0];
                        walls[j + 1] = pieces.C[1];
                        walls[j + 2] = pieces.C[2];
                        walls[j + 3] = pieces.C[3];
                    } else { // neither B nor C
                        walls[j] = 10000 + i;
                        walls[j + 1] = 10000 + i;
                        walls[j + 2] = 10000 + i + 1;
                        walls[j + 3] = 10000 + i + 1;
                    }
                }
            }
            newWallsAmount = walls.length - startWallsLength;
        }
    }

    removeRoomWallIntersections(rooms) {
        const innerPerimeters = [];
        for (let i = 0; i < rooms.length; i++) {
            if (rooms[i].isMain || rooms[i].isAttached) {
                const x1 = rooms[i].x - rooms[i].w / 2 + 1;
                const x2 = rooms[i].x + rooms[i].w / 2 - 1;
                const y1 = rooms[i].y - rooms[i].h / 2 + 1;
                const y2 = rooms[i].y + rooms[i].h / 2 - 1;
                innerPerimeters.push(
                    x1, y1, x1, y2,
                    x1, y2, x2, y2,
                    x2, y2, x2, y1,
                    x2, y1, x1, y1
                );
            }
        }
        this.removeTunnelWallIntersections(innerPerimeters);
    }

    removeWallWallIntersections() {
        const walls = this.walls;
        let startWallsLength = 0;
        let newWallsAmount = walls.length - startWallsLength;

        while (newWallsAmount > 0) {
            console.log('going inside', walls.length);
            startWallsLength = walls.length;
            for (let i = 0; i < walls.length; i += 4) {
                for (let j = 0; j < i; j += 4) {
                    const pieces = this.processWallWall(
                        Math.min(walls[j], walls[j + 2]),
                        Math.min(walls[j + 1], walls[j + 3]),
                        Math.max(walls[j], walls[j + 2]),
                        Math.max(walls[j + 1], walls[j + 3]),
                        Math.min(walls[i], walls[i + 2]),
                        Math.min(walls[i + 1], walls[i + 3]),
                        Math.max(walls[i], walls[i + 2]),
                        Math.max(walls[i + 1], walls[i + 3])
                    );
                    if (pieces.B) {
                        walls[i] = pieces.B[0];
                        walls[i + 1] = pieces.B[1];
                        walls[i + 2] = pieces.B[2];
                        walls[i + 3] = pieces.B[3];
                        if (pieces.C) {
                            walls.push(pieces.C[0]);
                            walls.push(pieces.C[1]);
                            walls.push(pieces.C[2]);
                            walls.push(pieces.C[3]);
                        }
                    } else if (pieces.C) {
                        walls[i] = pieces.C[0];
                        walls[i + 1] = pieces.C[1];
                        walls[i + 2] = pieces.C[2];
                        walls[i + 3] = pieces.C[3];
                    } else { // neither B nor C
                        // console.log(pieces);
                        walls[i] = 10000 + 4 * i;
                        walls[i + 1] = 10000 + 4 * i;
                        walls[i + 2] = 10000 + 4 * i + 1;
                        walls[i + 3] = 10000 + 4 * i + 1;
                    }
                }
            }


            newWallsAmount = walls.length - startWallsLength;
        }

    }

    processWallWall(ax1, ay1, ax2, ay2, bx1, by1, bx2, by2) {
        // let A = [ax1, ay1, ax2, ay2]; // never changes and not needed
        let B = [bx1, by1, bx2, by2]; // could turn into 0, 1 or 2 pieces
        let C = null;
        if (((ax1 <= bx2 && ax1 >= bx1) || (ax2 <= bx2 && ax2 >= bx1) || (bx1 <= ax2 && bx1 >= ax1) || (bx2 <= ax2 && bx2 >= ax1)) &&
        ((ay2 <= by2 && ay2 >= by1) || (ay1 <= by2 && ay1 >= by1) || (by2 <= ay2 && by2 >= ay1) || (by1 <= ay2 && by1 >= ay1))) { // segments intersect

        // const isVertical1 = ay2 - ay1 > ax2 - ax1;
            const isVertical2 = Math.abs(by2 - by1) > Math.abs(bx2 - bx1);
            B = null;
            if (!isVertical2) { // horizontal b breaks

                if (bx1 < ax1) {
                    B = [bx1, by1, ax1 - 1, by1];
                    if (ax1 - 1 < bx1) console.error('rly');
                }
                if (bx2 > ax2) {
                    C = [ax2 + 1, by2, bx2, by2];
                    if (ax1 + 1 > bx2) console.error('rly');
                }
            }
            if (isVertical2) { // vertical b breaks
                B = null;
                if (by1 < ay1) {
                    B = [bx1, by1, bx1, ay1 - 1];
                    if (ay1 - 1 < by1) console.error('rly');
                }
                if (by2 > ay2) {
                    C = [bx2, ay2 + 1, bx2, by2];
                    if (ay2 + 1 > by2) console.error('rly');
                }
            }
            // if (B && C) debugger;
        }

        return {B, C}; // hope no one will ever see it. I just want to look at result.
    }
}

export default Walls;
