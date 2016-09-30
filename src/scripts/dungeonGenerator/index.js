if (module.hot) {
    module.hot.accept();
}

import Rooms from './rooms.js';
import Tunnels from './tunnels.js';

import {processTriangulation, generateMST} from './math/graphUtils.js';
const Delaunay = require('./math/delaunay.js');
const seedrandom = require('seedrandom');

// todo: minimum red rooms amount (room sizes distribution)
// todo: maximum red rooms amount (room sizes distribution)
// todo: >3 green on one tunnel -> offset and generetae pipe to it
// todo: if one red room is very far from others -> add red room in between
window.dungeonizer = window.dungeonizer || {};
const generateDungeonImpl = function({seed, dungeonSize, connectivity, debugData}) {

    // const midRoomAspect = 1;
    seedrandom(seed, { global: true });

    const rooms = new Rooms(dungeonSize);
    rooms.generateRoomSizes();
    rooms.placeRooms();
    const mainRoomsCenters = rooms.chooseMainRooms(rooms.rooms);

    const delTriangles = Delaunay.triangulate(mainRoomsCenters);
    const triangulation = processTriangulation(mainRoomsCenters, delTriangles);

    const leaveExtraEdgeOneFrom = Math.pow(100, 1 - Math.max(Math.min(connectivity, 1), 0));
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

window.dungeonizer.generateDungeon = function(params) {
    console.log('Dungeon params are:', params);
    // todo: check params validity
    return generateDungeonImpl(params);
};

window.dungeonizer.generateDungeonById = function(dungeonId, debugData) {
    console.log('DungeonID is:', dungeonId);
    const params = dungeonId.split(',');
    // todo: check params validity
    return generateDungeonImpl({
        seed: params[0],
        dungeonSize: params[1],
        connectivity: params[2],
        debugData
    });
};
