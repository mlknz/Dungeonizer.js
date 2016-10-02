if (module.hot) {
    module.hot.accept();
}

import Rooms from './rooms.js';
import Tunnels from './tunnels.js';
import {processTriangulation, generateMST} from './math/graphUtils.js';

const Delaunay = require('./math/delaunay.js');
const seedRandom = require('seedrandom');


// todo: dungeon/rooms aspect ratio
// todo: >3 green on one tunnel -> offset and generetae pipe to it
// todo: if one red room is very far from others -> add red room in between (?)
window.dungeonizer = window.dungeonizer || {};
const generateDungeonImpl = function({
    seed,
    dungeonSize,
    roomSizeDistribution,
    roomSizeMean,
    roomSizeDeviation,
    mainRoomThreshold,
    minMainRoomsAmount,
    maxMainRoomsRate,
    connectivity,
    debugData}) {

    seedRandom(seed, { global: true });

    const rooms = new Rooms(dungeonSize, roomSizeDistribution, roomSizeMean, roomSizeDeviation, mainRoomThreshold, minMainRoomsAmount, maxMainRoomsRate);
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
    console.log('Dungeon params:', params);
    // todo: check params validity (+default config)
    return generateDungeonImpl(params);
};

// todo: query string params?
window.dungeonizer.generateDungeonById = function(dungeonId, debugData) {
    console.log('DungeonId:', dungeonId);
    const params = dungeonId.split(',');
    // todo: check params validity (+default config)
    return generateDungeonImpl({
        seed: params[0],
        dungeonSize: parseInt(params[1], 10),
        roomSizeDistribution: params[2],
        roomSizeMean: parseInt(params[3], 10),
        roomSizeDeviation: parseFloat(params[4]),
        mainRoomThreshold: parseFloat(params[5]),
        minMainRoomsAmount: parseInt(params[6], 10),
        maxMainRoomsRate: parseFloat(params[7]),
        connectivity: parseFloat(params[8]),
        debugData
    });
};
