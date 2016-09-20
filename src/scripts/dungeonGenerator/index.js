if (module.hot) {
    module.hot.accept();
}

import Rooms from './rooms.js';
import Tunnels from './tunnels.js';

import {processTriangulation, generateMST} from './math/graphUtils.js';
const Delaunay = require('./math/delaunay.js');


// todo: random seed
// todo: minimum red rooms amount (room sizes distribution)
// todo: maximum red rooms amount (room sizes distribution)
// todo: >3 green on one tunnel -> offset and generetae pipe to it
// todo: if one red room is very far from others -> add red room in between
window.dungeonizer = window.dungeonizer || {};
window.dungeonizer.generateDungeon = function({seed, debugData}) {
    // const seed = 1;
    const dungeonSize = 13;
    // const midRoomAspect = 1;

    const rooms = new Rooms(dungeonSize);
    rooms.generateRoomSizes();
    rooms.placeRooms();
    const mainRoomsCenters = rooms.chooseMainRooms(rooms.rooms);

    const delTriangles = Delaunay.triangulate(mainRoomsCenters);
    const triangulation = processTriangulation(mainRoomsCenters, delTriangles);

    const leaveExtraEdgeOneFrom = 9;
    const minSpanningTree = generateMST(triangulation.edges, triangulation.gVerts, leaveExtraEdgeOneFrom);

    const tunnels = new Tunnels(rooms.rooms, minSpanningTree.edges, minSpanningTree.leftAlive, mainRoomsCenters);

    return {
        floors: rooms.rooms,
        fullDelaunayTriangles: triangulation.triangulationLines,
        triangles: tunnels.mstLines,
        leftAliveLines: tunnels.leftAliveLines,
        tunnels: tunnels.tunnels
    };
};
