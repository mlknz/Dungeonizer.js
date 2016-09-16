if (module.hot) {
    module.hot.accept();
}

const Delaunay = require('./delaunay.js');

function isCollided(a, b) {
    if (a.x - a.w / 2 < b.x + b.w / 2 && a.x + a.w / 2 > b.x - b.w / 2 &&
        a.y + a.h / 2 > b.y - b.h / 2 && a.y - a.h / 2 < b.y + b.h / 2) return true;

    return false;
}

function segmentRectangleCol(sx1, sy1, sx2, sy2, rx1, ry1, rx2, ry2) {
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

function dSq(a, b) {
    return (a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]);
}

function diveSearch(v, b, gVerts, visited) {
    visited.push(v);
    let wasThere = false;
    let found = false;

    for (let i = 0; i < gVerts[v].length; i++) {
        for (let k = 0; k < visited.length; k++) {
            if (gVerts[v][i] === b) {
                found = true;
                break;
            }
            if (visited[k] === gVerts[v][i]) {
                wasThere = true;
                break;
            }
        }

        if (!wasThere && !found) found = found || diveSearch(gVerts[v][i], b, gVerts, visited);
    }
    return found;
}

function hasTwoConnections(a, b, gVerts) {
    const visited = [a];
    let found = false;
    for (let j = 0; j < gVerts[a].length; j++) {
        if (gVerts[a][j] !== b) {
            found = found || diveSearch(gVerts[a][j], b, gVerts, visited);
        }
    }
    return found;
}

function generateTunnel(roomA, roomB) {
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

// todo: random seed
// todo: minimum red rooms amount
// todo: maximum red rooms amount
// todo: >3 green on one tunnel -> offset and generetae pipe to it
// todo: if one red room is very far from others -> add red room in between
window.dungeonizer = window.dungeonizer || {};
window.dungeonizer.generateDungeon = function() {
    // const seed = 1;
    const dungeonSize = 13;
    // const midRoomAspect = 1;
    const roomsAmount = dungeonSize * 5 + Math.floor(Math.random() * 10);

    const minSize = 4;
    const maxSize = 14;

    const rooms = [];
    let i, j, k, ii;

    // generate sizes
    let w, h, size;
    for (i = 0; i < roomsAmount; i++) {
        w = minSize + Math.floor(Math.random() * (maxSize - minSize)); // todo: use nice distribution
        h = minSize + Math.floor(Math.random() * (maxSize - minSize)); // Math.floor(w * midRoomAspect * (Math.random() + 0.5));
        size = w * h;
        rooms.push({x: 0, y: 0, w, h, size, x1: -w / 2, x2: w / 2, y1: -h / 2, y2: h / 2, isMain: 0});
    }

    // place rooms
    const maxR = roomsAmount * maxSize * 2;
    for (i = 1; i < roomsAmount; i++) {
        const roomAngle = Math.random() * 2 * Math.PI;

        let posX = 0;
        let posY = 0;
        const dirX = Math.cos(roomAngle);
        const dirY = Math.sin(roomAngle);

        for (k = 0; k < maxR; k++) {

            posX += dirX;
            posY += dirY;

            rooms[i].x = posX;
            rooms[i].y = posY;

            let collidedByAny = false;
            for (j = 0; j < i; j++) {
                if (isCollided(rooms[j], rooms[i])) {
                    collidedByAny = true;
                    break;
                }
            }


            if (!collidedByAny) {
                // make a round trying to place closer to center
                let d = Math.sqrt(posX * posX + posY * posY);
                let curAngle = roomAngle;
                let curPosX, curPosY;

                while (curAngle - roomAngle < Math.PI * 2) {
                    // curAngle += 1 / d;
                    curAngle += Math.PI / 2;

                    for (ii = d; ii > 0; ii--) {
                        curPosX = ii * Math.cos(curAngle);
                        curPosY = ii * Math.sin(curAngle);
                        collidedByAny = false;
                        for (j = 0; j < i; j++) {
                            rooms[i].x = curPosX;
                            rooms[i].y = curPosY;
                            if (isCollided(rooms[j], rooms[i])) {
                                collidedByAny = true;
                                break;
                            }
                        }
                        if (!collidedByAny) {
                            d = ii;
                            posX = curPosX;
                            posY = curPosY;
                        }
                    }

                }

                rooms[i].x = posX;
                rooms[i].y = posY;
                break;
            }
        }

        rooms[i].x1 = -rooms[i].w / 2 + rooms[i].x;
        rooms[i].x2 = rooms[i].w / 2 + rooms[i].x;
        rooms[i].y1 = -rooms[i].h / 2 + rooms[i].y;
        rooms[i].y2 = rooms[i].h / 2 + rooms[i].y;
    }

    // choose main rooms
    const mainVerts = [];
    const threshold = maxSize * 0.75;
    for (i = 0; i < rooms.length; i++) {
        if (/* rooms[i].w > threshold && rooms[i].h > threshold*/ rooms[i].size > threshold * threshold) {
            rooms[i].isMain = 1;
            mainVerts.push([rooms[i].x, rooms[i].y, i]);
        }
    }

    // /
    const delTriangles = Delaunay.triangulate(mainVerts);

    const triangulationLines = [];
    const edges = [];
    const gVerts = [];
    let ind0, ind1, ind2;
    let f01, f02, f12;
    for (i = 0; i < delTriangles.length - 1; i += 3) {
        ind0 = delTriangles[i];
        ind1 = delTriangles[i + 1];
        ind2 = delTriangles[i + 2];

        triangulationLines.push(
            mainVerts[ind0][0], mainVerts[ind0][1], mainVerts[ind1][0], mainVerts[ind1][1],
            mainVerts[ind0][0], mainVerts[ind0][1], mainVerts[ind2][0], mainVerts[ind2][1],
            mainVerts[ind1][0], mainVerts[ind1][1], mainVerts[ind2][0], mainVerts[ind2][1]
        );

        if (!gVerts[ind0]) gVerts[ind0] = [];
        if (!gVerts[ind1]) gVerts[ind1] = [];
        if (!gVerts[ind2]) gVerts[ind2] = [];

        f01 = false;
        f02 = false;
        for (j = 0; j < gVerts[ind0].length; j++) {
            if (gVerts[ind0][j] === ind1) f01 = true;
            if (gVerts[ind0][j] === ind2) f02 = true;
        }
        for (j = 0; j < gVerts[ind1].length; j++) {
            if (gVerts[ind1][j] === ind2) f12 = true;
        }

        if (!f01) {
            gVerts[ind0].push(ind1);
            gVerts[ind1].push(ind0);
            edges.push({a: ind0, b: ind1, dSq: dSq(mainVerts[ind0], mainVerts[ind1])});
        }

        if (!f02) {
            gVerts[ind0].push(ind2);
            gVerts[ind2].push(ind0);
            edges.push({a: ind0, b: ind2, dSq: dSq(mainVerts[ind0], mainVerts[ind2])});
        }

        if (!f12) {
            gVerts[ind1].push(ind2);
            gVerts[ind2].push(ind1);
            edges.push({a: ind1, b: ind2, dSq: dSq(mainVerts[ind1], mainVerts[ind2])});
        }


    }

    // form minimum spanning tree (+extra leftAlive edges)
    edges.sort((a, b) => { return a.dSq - b.dSq; });

    let hasSecondConnection;
    let a, b, tPos;
    const leaveEdgeAliveOneFrom = 9;
    let leavingAlive = 0;
    const leftAlive = [];
    for (i = edges.length - 1; i >= 0; i--) {
        hasSecondConnection = false;
        a = edges[i].a;
        b = edges[i].b;

        hasSecondConnection = hasTwoConnections(a, b, gVerts);
        if (hasSecondConnection) {
            if (leavingAlive > 0) {
                leftAlive.push({a, b});
            }
            tPos = gVerts[a].indexOf(b);
            gVerts[a].splice(tPos, 1);
            tPos = gVerts[b].indexOf(a);
            gVerts[b].splice(tPos, 1);
            edges.splice(i, 1);

            leavingAlive--;
            if (leavingAlive < -leaveEdgeAliveOneFrom + 2) leavingAlive = 1;
        }
    }

    // tunnels & debug edge lines
    let tunnel;
    const tunnels = [];
    const mstLines = [];
    for (i = 0; i < edges.length; i++) {
        mstLines.push(mainVerts[edges[i].a][0], mainVerts[edges[i].a][1], mainVerts[edges[i].b][0], mainVerts[edges[i].b][1]);
        tunnel = generateTunnel(rooms[mainVerts[edges[i].a][2]], rooms[mainVerts[edges[i].b][2]]);
        Array.prototype.push.apply(tunnels, tunnel);
    }
    const leftAliveLines = [];
    for (i = 0; i < leftAlive.length; i++) {
        leftAliveLines.push(mainVerts[leftAlive[i].a][0], mainVerts[leftAlive[i].a][1], mainVerts[leftAlive[i].b][0], mainVerts[leftAlive[i].b][1]);
        tunnel = generateTunnel(rooms[mainVerts[leftAlive[i].a][2]], rooms[mainVerts[leftAlive[i].b][2]]);
        Array.prototype.push.apply(tunnels, tunnel);
    }

    let room;
    for (i = 0; i < rooms.length; i++) {
        room = rooms[i];
        if (room.isMain < 1) {
            for (j = 0; j < tunnels.length; j = j + 4) {
                if (segmentRectangleCol(tunnels[j], tunnels[j + 1], tunnels[j + 2], tunnels[j + 3],
                room.x1, room.y1, room.x2, room.y2) !== false) {
                    room.isMain = 2;
                    break;
                }
            }
        }
    }

    return {
        floors: rooms,
        fullDelaunayTriangles: triangulationLines,
        triangles: mstLines,
        leftAliveLines,
        tunnels
    };
};
