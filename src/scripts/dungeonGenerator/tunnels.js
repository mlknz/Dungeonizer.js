import {alignedSegmentRectangleCol, pointInsideRectangle} from './math/mathUtils.js';

class Tunnels {
    constructor(rooms, edges, leftAlive, mainVerts) {
        let tunnel;
        this.tunnels = [];
        this.mstLines = [];

        for (let i = 0; i < edges.length; i++) {
            this.mstLines.push(mainVerts[edges[i].a][0], mainVerts[edges[i].a][1], mainVerts[edges[i].b][0], mainVerts[edges[i].b][1]);
            tunnel = this.generateTunnel(rooms[mainVerts[edges[i].a][2]], rooms[mainVerts[edges[i].b][2]]);
            Array.prototype.push.apply(this.tunnels, tunnel);
        }
        this.leftAliveLines = [];
        for (let i = 0; i < leftAlive.length; i++) {
            this.leftAliveLines.push(mainVerts[leftAlive[i].a][0], mainVerts[leftAlive[i].a][1], mainVerts[leftAlive[i].b][0], mainVerts[leftAlive[i].b][1]);
            tunnel = this.generateTunnel(rooms[mainVerts[leftAlive[i].a][2]], rooms[mainVerts[leftAlive[i].b][2]]);
            Array.prototype.push.apply(this.tunnels, tunnel);
        }
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
            tunnel = [x, downRoom.y2, x, upRoom.y1];
            if (downRoom.y2 > upRoom.y1) console.log('hm');

        } else if (overlapY > 0) {

            const y = upRoom.y1 + Math.floor((Math.random() * 0.6 + 0.3) * overlapY);
            tunnel = [leftRoom.x2, y, rightRoom.x1, y];
            if (leftRoom.x2 > rightRoom.x1) console.log('hm');

        } else {

            const y1 = dy > 0 ? roomA.y1 : roomA.y2;
            const xRange = Math.floor((0.15 + Math.random() * 0.5) * roomA.w);
            const x1 = dx > 0 ? roomA.x1 + xRange : roomA.x2 - xRange;

            const x2 = dx > 0 ? roomB.x2 : roomB.x1;
            const yRange = Math.floor((0.15 + Math.random() * 0.5) * roomB.h);
            const y2 = dy < 0 ? roomB.y1 + yRange : roomB.y2 - yRange;

            tunnel = [
                x1, Math.min(y1, y2), x1, Math.max(y1, y2),
                Math.min(x1, x2), y2, Math.max(x1, x2), y2
            ];
        }
        return tunnel;
    }

    // under assumption x1 <= x2 and y1 <= y2 for tunnels
    cutTunnels(rooms, tunnels) {
        let room;
        let t;
        for (let i = 0; i < rooms.length; i++) {
            room = rooms[i];
            for (let j = 0; j < tunnels.length; j += 4) {
                const isHorizontal = tunnels[j + 2] - tunnels[j] > 0;

                if (room.isMain || room.isAttached) {
                    if (pointInsideRectangle(tunnels[j], tunnels[j + 1], room.x1, room.y1, room.x2, room.y2)) {
                        if (isHorizontal) {
                            tunnels[j] = room.x2;
                        } else {
                            tunnels[j + 1] = room.y2;
                        }
                    }
                    if (pointInsideRectangle(tunnels[j + 2], tunnels[j + 3], room.x1, room.y1, room.x2, room.y2)) {
                        if (isHorizontal) {
                            tunnels[j + 2] = room.x1;
                        } else {
                            tunnels[j + 3] = room.y1;
                        }
                    }

                    if (alignedSegmentRectangleCol(tunnels[j], tunnels[j + 1], tunnels[j + 2], tunnels[j + 3],
                    room.x1, room.y1, room.x2, room.y2)) {
                        if (isHorizontal) {
                            t = tunnels[j + 2];
                            tunnels[j + 2] = room.x1;
                            tunnels.push(room.x2, tunnels[j + 1], t, tunnels[j + 3]);
                        } else {
                            t = tunnels[j + 3];
                            tunnels[j + 3] = room.y1;
                            tunnels.push(tunnels[j], room.y2, tunnels[j + 2], t);
                        }
                    }
                }
            }
        }
    }

}

export default Tunnels;
