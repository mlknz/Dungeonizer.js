if (module.hot) {
    module.hot.accept();
}

import Rooms from './rooms.js';
import Tunnels from './tunnels.js';
import {processTriangulation, generateMST} from './math/graphUtils.js';

const Delaunay = require('./math/delaunay.js');
const seedRandom = require('seedrandom');

// todo: >2 green rooms on one tunnel -> offset and generate tunnel to it (?)
const generateDungeonImpl = function({
    seed,
    dungeonSize,
    roomSizeDistribution,
    roomSizeMean,
    roomSizeDeviation,
    mainRoomThreshold,
    connectivity,
    density}) {

    seedRandom(seed, { global: true }); // replaces Math.random with seeded random

    const rooms = new Rooms(dungeonSize, roomSizeDistribution, roomSizeMean, roomSizeDeviation, mainRoomThreshold, density);
    rooms.generateRoomSizes();
    rooms.placeRooms();
    const mainRoomsCenters = rooms.chooseMainRooms(rooms.rooms);

    const delTriangles = Delaunay.triangulate(mainRoomsCenters);
    const triangulation = processTriangulation(mainRoomsCenters, delTriangles);

    const leaveExtraEdgeOneFrom = Math.pow(100, 1 - Math.max(Math.min(connectivity, 1), 0));
    const minSpanningTree = generateMST(triangulation.edges, triangulation.gVerts, leaveExtraEdgeOneFrom);

    const tunnels = new Tunnels(rooms.rooms, minSpanningTree.edges, minSpanningTree.leftAlive, mainRoomsCenters);
    rooms.attachIntersectedRooms(rooms.rooms, tunnels.tunnels);
    tunnels.cutTunnels(rooms.rooms, tunnels.tunnels);

    return {
        rooms: rooms.rooms,
        delaunayTriangles: triangulation.triangulationLines,
        mstLines: tunnels.mstLines,
        leftAliveLines: tunnels.leftAliveLines,
        tunnels: tunnels.tunnels
    };
};

window.dungeonizer = window.dungeonizer || {};

window.dungeonizer.generateDungeon = function(params) {
    console.log('Dungeon params:', params);
    // todo: check params validity (+default config)
    return generateDungeonImpl(params);
};

// todo: query string params?
window.dungeonizer.generateDungeonById = function(dungeonId) {
    console.log('DungeonId:', dungeonId);
    const params = dungeonId.split(',');
    return window.dungeonizer.generateDungeon({
        seed: params[0],
        dungeonSize: parseInt(params[1], 10),
        roomSizeDistribution: params[2],
        roomSizeMean: parseInt(params[3], 10),
        roomSizeDeviation: parseFloat(params[4]),
        mainRoomThreshold: parseFloat(params[5]),
        connectivity: parseFloat(params[6]),
        density: parseFloat(params[7])
    });
};
