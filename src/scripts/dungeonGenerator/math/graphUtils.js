import {dSq} from './mathUtils.js';

export function processTriangulation(mainVerts, delTriangles) {

    const triangulationLines = [];
    const edges = [];
    const gVerts = [];
    let ind0, ind1, ind2;
    let f01, f02, f12;
    for (let i = 0; i < delTriangles.length - 1; i += 3) {
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
        for (let j = 0; j < gVerts[ind0].length; j++) {
            if (gVerts[ind0][j] === ind1) f01 = true;
            if (gVerts[ind0][j] === ind2) f02 = true;
        }
        for (let j = 0; j < gVerts[ind1].length; j++) {
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

    return {
        edges,
        gVerts,
        triangulationLines
    };
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

export function generateMST(allEdges, gVerts, leaveExtraEdgeOneFrom) {
    const edges = allEdges.slice(); // todo: deep copy there maybe?
    edges.sort((a, b) => { return a.dSq - b.dSq; });

    let hasSecondConnection;
    let a, b, tPos;

    let leavingAlive = 0;
    const leftAlive = [];
    for (let i = edges.length - 1; i >= 0; i--) {
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
            if (leavingAlive < -leaveExtraEdgeOneFrom + 2) leavingAlive = 1;
        }
    }

    return {
        edges,
        leftAlive
    };
}
