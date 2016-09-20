import {alignedSegmentRectangleCol} from './math/mathUtils.js';

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

        let room;
        for (let i = 0; i < rooms.length; i++) {
            room = rooms[i];
            if (room.isMain < 1) {
                for (let j = 0; j < tunnels.length; j = j + 4) {
                    if (alignedSegmentRectangleCol(tunnels[j], tunnels[j + 1], tunnels[j + 2], tunnels[j + 3],
                    room.x1, room.y1, room.x2, room.y2) !== false) {
                        room.isMain = 2;
                        break;
                    }
                }
            }
        }

        return {
            tunnels,
            mstLines,
            leftAliveLines
        };
    }

    generateTunnel(roomA, roomB) {
        // room: x, y, w, h
        let tunnel = [];
        const dx = roomA.x - roomB.x;
        const dy = roomA.y - roomB.y;
        const overlapX = (roomA.w + roomB.w) / 2 - Math.abs(dx);
        const overlapY = (roomA.h + roomB.h) / 2 - Math.abs(dy);

        if (overlapX > 0) {

            let x = roomA.x < roomB.x ? roomA.x + roomA.w / 2 : roomB.x + roomB.w / 2;
            x -= (Math.random() * 0.6 + 0.2) * overlapX;

            tunnel = dy < 0 ? [x, roomA.y + roomA.h / 2, x, roomB.y - roomB.h / 2] :
                [x, roomA.y - roomA.h / 2, x, roomB.y + roomB.h / 2];

        } else if (overlapY > 0) {

            let y = roomA.y < roomB.y ? roomA.y + roomA.h / 2 : roomB.y + roomB.h / 2;
            y -= (Math.random() * 0.6 + 0.2) * overlapY;
            tunnel = dx < 0 ? [roomA.x + roomA.w / 2, y, roomB.x - roomB.w / 2, y] :
                [roomA.x - roomA.w / 2, y, roomB.x + roomB.w / 2, y];

        } else {

            const y1 = dy < 0 ? roomA.y + roomA.h / 2 : roomA.y - roomA.h / 2;
            const x1 = roomA.x + (Math.random() - 0.5) * roomA.w * 0.8;

            const x2 = dx < 0 ? roomB.x - roomB.w / 2 : roomB.x + roomB.w / 2;
            const y2 = roomB.y + (Math.random() - 0.5) * roomB.h * 0.8;

            tunnel = [x1, y1, x1, y2, x1, y2, x2, y2];
        }
        return tunnel;
    }
}

export default Tunnels;
