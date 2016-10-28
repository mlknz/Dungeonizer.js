import {alignedSegmentRectangleCol, pointInsideRectangle} from './math/mathUtils.js';

class Tunnels {
    constructor(rooms, edges, leftAlive, mainVerts) {
        let tunnel;
        const tunnels = [];
        const mstLines = [];

        for (let i = 0; i < edges.length; i++) {
            mstLines.push(mainVerts[edges[i].a][0], mainVerts[edges[i].a][1], mainVerts[edges[i].b][0], mainVerts[edges[i].b][1]);
            tunnel = this.generateTunnel(rooms[mainVerts[edges[i].a][2]], rooms[mainVerts[edges[i].b][2]]);
            Array.prototype.push.apply(tunnels, tunnel);
        }
        const leftAliveLines = [];
        for (let i = 0; i < leftAlive.length; i++) {
            leftAliveLines.push(mainVerts[leftAlive[i].a][0], mainVerts[leftAlive[i].a][1], mainVerts[leftAlive[i].b][0], mainVerts[leftAlive[i].b][1]);
            tunnel = this.generateTunnel(rooms[mainVerts[leftAlive[i].a][2]], rooms[mainVerts[leftAlive[i].b][2]]);
            Array.prototype.push.apply(tunnels, tunnel);
        }

        this.attachRoomsCutTunnels(rooms, tunnels);

        return {
            tunnels,
            mstLines,
            leftAliveLines
        };
    }

    generateTunnel(roomA, roomB) {
        let tunnel = [];

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
            tunnel = [x, upRoom.y1, x, downRoom.y2];

        } else if (overlapY > 0) {

            const y = upRoom.y1 + Math.floor((Math.random() * 0.6 + 0.3) * overlapY);
            tunnel = [rightRoom.x1, y, leftRoom.x2, y];

        } else {

            const y1 = dy > 0 ? roomA.y1 : roomA.y2;
            const xRange = Math.floor((0.15 + Math.random() * 0.5) * roomA.w);
            const x1 = dx > 0 ? roomA.x1 + xRange : roomA.x2 - xRange;

            const x2 = dx > 0 ? roomB.x2 : roomB.x1;
            const yRange = Math.floor((0.15 + Math.random() * 0.5) * roomB.h);
            const y2 = dy < 0 ? roomB.y1 + yRange : roomB.y2 - yRange;

            tunnel = [x1, y1, x1, y2, x1, y2, x2, y2];
        }
        return tunnel;
    }

    attachRoomsCutTunnels(rooms, tunnels) {
        let room;
        let t;
        for (let i = 0; i < rooms.length; i++) {
            room = rooms[i];
            for (let j = 0; j < tunnels.length; j = j + 4) {
                if (!room.isMain) {
                    if (alignedSegmentRectangleCol(tunnels[j], tunnels[j + 1], tunnels[j + 2], tunnels[j + 3],
                    room.x1, room.y1, room.x2, room.y2)) {
                        room.isAttached = true;
                    }
                }
            }

            for (let j = 0; j < tunnels.length; j += 4) {
                const dx = tunnels[j + 2] - tunnels[j];
                const dy = tunnels[j + 3] - tunnels[j + 1];
                const leftRight = dx < 0;
                const rightLeft = dx > 0;
                const downUp = dy < 0;
                const upDown = dy > 0;

                if (room.isMain || room.isAttached) {
                    if (pointInsideRectangle(tunnels[j], tunnels[j + 1], room.x1, room.y1, room.x2, room.y2)) {
                        if (leftRight) {
                            tunnels[j] = room.x1;
                        } else if (rightLeft) {
                            tunnels[j] = room.x2;
                        } else if (downUp) {
                            tunnels[j + 1] = room.y1;
                        } else {
                            tunnels[j + 1] = room.y2;
                        }
                    }
                    if (pointInsideRectangle(tunnels[j + 2], tunnels[j + 3], room.x1, room.y1, room.x2, room.y2)) {
                        if (rightLeft) {
                            tunnels[j + 2] = room.x1;
                        } else if (leftRight) {
                            tunnels[j + 2] = room.x2;
                        } else if (upDown) {
                            tunnels[j + 3] = room.y1;
                        } else {
                            tunnels[j + 3] = room.y2;
                        }
                    }

                    if (alignedSegmentRectangleCol(tunnels[j], tunnels[j + 1], tunnels[j + 2], tunnels[j + 3],
                    room.x1, room.y1, room.x2, room.y2)) {
                        if (rightLeft) {
                            t = tunnels[j + 2];
                            tunnels[j + 2] = room.x1;
                            tunnels.push(room.x2, tunnels[j + 1], t, tunnels[j + 3]);
                        } else if (leftRight) {
                            t = tunnels[j];
                            tunnels[j] = room.x1;
                            tunnels.push(room.x2, tunnels[j + 1], t, tunnels[j + 3]);
                        } else if (upDown) {
                            t = tunnels[j + 3];
                            tunnels[j + 3] = room.y1;
                            tunnels.push(tunnels[j], room.y2, tunnels[j + 2], t);
                        } else {
                            t = tunnels[j + 1];
                            tunnels[j + 1] = room.y1;
                            tunnels.push(tunnels[j], room.y2, tunnels[j + 2], t);
                        }
                    }
                }
            }
        }
    }
}

export default Tunnels;
