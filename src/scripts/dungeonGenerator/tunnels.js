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
        const dx1 = roomA.x1 - roomB.x1;
        const dy1 = roomA.y1 - roomB.y1;
        const overlapX = (roomA.w + roomB.w) / 2 - Math.abs(dx);
        const overlapY = (roomA.h + roomB.h) / 2 - Math.abs(dy);

        const rightRoom = dx > 0 || (dx === 0 && dx1 > 0) ? roomA : roomB;
        const leftRoom = dx > 0 ? roomB : roomA;
        const upRoom = dy > 0 || (dy === 0 && dy1 > 0) ? roomA : roomB;
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
}

export default Tunnels;
