import {alignedSegmentRectangleCol, pointInsideRectangle} from './math/mathUtils.js';

class Tunnels {
    constructor(dungeonRooms, edges, leftAlive, mainVerts, withWalls) {
        this.withWalls = withWalls;

        this.tunnels = [];
        this.walls1 = [];
        this.walls2 = [];

        this.mstLines = [];
        this.leftAliveLines = [];

        let tunnelData;
        for (let i = 0; i < edges.length; i++) {
            this.mstLines.push(mainVerts[edges[i].a][0], mainVerts[edges[i].a][1], mainVerts[edges[i].b][0], mainVerts[edges[i].b][1]);
            tunnelData = this.generateTunnel(dungeonRooms[mainVerts[edges[i].a][2]], dungeonRooms[mainVerts[edges[i].b][2]]);
            Array.prototype.push.apply(this.tunnels, tunnelData.tunnel);

            if (this.withWalls) {
                Array.prototype.push.apply(this.walls1, tunnelData.walls1);
                Array.prototype.push.apply(this.walls2, tunnelData.walls2);
            }
        }

        for (let i = 0; i < leftAlive.length; i++) {
            this.leftAliveLines.push(mainVerts[leftAlive[i].a][0], mainVerts[leftAlive[i].a][1], mainVerts[leftAlive[i].b][0], mainVerts[leftAlive[i].b][1]);
            tunnelData = this.generateTunnel(dungeonRooms[mainVerts[leftAlive[i].a][2]], dungeonRooms[mainVerts[leftAlive[i].b][2]]);
            Array.prototype.push.apply(this.tunnels, tunnelData.tunnel);

            if (this.withWalls) {
                Array.prototype.push.apply(this.walls1, tunnelData.walls1);
                Array.prototype.push.apply(this.walls2, tunnelData.walls2);
            }
        }
    }

    generateTunnel(roomA, roomB) {
        let tunnel = [];
        let walls1 = [];
        let walls2 = [];

        const withWalls = this.withWalls;

        const dx = roomA.x - roomB.x;
        const dy = roomA.y - roomB.y;
        const overlapX = (roomA.w + roomB.w) / 2 - Math.abs(dx);
        const overlapY = (roomA.h + roomB.h) / 2 - Math.abs(dy);

        const rightRoom = dx > 0 ? roomA : roomB;
        const leftRoom = dx > 0 ? roomB : roomA;
        const upRoom = dy > 0 ? roomA : roomB;
        const downRoom = dy > 0 ? roomB : roomA;

        if (overlapX > 0) {

            const x = rightRoom.x1 + Math.floor((Math.random() * 0.6 + 0.3) * overlapX);
            tunnel = [x, downRoom.y2, x, upRoom.y1];
            if (withWalls) {
                walls1 = [x - 1, downRoom.y2, x - 1, upRoom.y1];
                walls2 = [x + 1, downRoom.y2, x + 1, upRoom.y1];
            }

        } else if (overlapY > 0) {

            const y = upRoom.y1 + Math.floor((Math.random() * 0.6 + 0.3) * overlapY);
            tunnel = [leftRoom.x2, y, rightRoom.x1, y];
            if (withWalls) {
                walls1 = [leftRoom.x2, y - 1, rightRoom.x1, y - 1];
                walls2 = [leftRoom.x2, y + 1, rightRoom.x1, y + 1];
            }

        } else { // L-shape

            const xRange = Math.floor((0.15 + Math.random() * 0.5) * roomA.w);
            const x1 = roomA.x1 + xRange;
            const x2 = dx > 0 ? roomB.x2 : roomB.x1;
            const yRange = Math.floor((0.15 + Math.random() * 0.5) * roomB.h);
            const y1 = dy > 0 ? roomA.y1 : roomA.y2;
            const y2 = roomB.y1 + yRange;

            const yMin = Math.min(y1, y2);
            let yMax = Math.max(y1, y2);
            const xMin = Math.min(x1, x2);
            const xMax = Math.max(x1, x2);
            if (dy < 0) {
                yMax += 1; // magic
            }
            tunnel = [
                x1, yMin, x1, yMax,
                xMin, y2, xMax, y2
            ];

            if (withWalls) {
                let yLeftMin = yMin,
                    yLeftMax = yMax,
                    yRightMin = yMin,
                    yRightMax = yMax,
                    xDownMin = xMin,
                    xDownMax = xMax,
                    xUpMin = xMin,
                    xUpMax = xMax;

                if (dy < 0) { // with current camera pos (-20, 70, 0) x is inverted
                    if (dx < 0) { // |▔
                        yLeftMax += 1;
                        yRightMax -= 2;
                        xDownMin += 1;
                    } else { // ▔|
                        yLeftMax -= 2;
                        yRightMax += 1;
                        xUpMax += 1;
                    }
                } else {
                    if (dx < 0) { // |_
                        yLeftMin -= 1;
                        yRightMin += 2;
                        xUpMin += 1;
                    } else { // _|
                        yLeftMin += 2;
                        yRightMin -= 1;
                        xDownMax += 1;
                    }
                }
                walls1 = [
                    x1 - 1, yLeftMin, x1 - 1, yLeftMax,
                    xDownMin, y2 - 1, xDownMax, y2 - 1
                ];
                walls2 = [
                    x1 + 1, yRightMin, x1 + 1, yRightMax,
                    xUpMin, y2 + 1, xUpMax, y2 + 1
                ];
            }
        }
        return {tunnel, walls1, walls2};
    }

    // under assumption x1 <= x2 and y1 <= y2 for tunnels
    // not cutting walls in this pass because of L-shape walls case complexity
    cutTunnels(dungeonRooms) {
        const tunnels = this.tunnels;
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

}

export default Tunnels;
