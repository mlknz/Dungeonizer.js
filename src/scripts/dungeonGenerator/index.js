if (module.hot) {
    module.hot.accept();
}
import config from '../config.js';
import Rooms from './rooms.js';
import Tunnels from './tunnels.js';
import Walls from './walls.js';
import {processTriangulation, generateMST} from './math/graphUtils.js';
import {resolveAlignedRectanglesSegmentsIntersections} from './math/mathUtils.js';
const Delaunay = require('./math/delaunay.js');
const seedRandom = require('seedrandom');

const generateDungeonImpl = function({
    seed,
    dungeonSize,
    roomSizeDistribution,
    roomSizeMean,
    roomSizeDeviation,
    mainRoomThreshold,
    connectivity,
    density}, withWalls, isDebug) {

    seedRandom(seed, { global: true }); // replaces Math.random with seeded random

    const rooms = new Rooms(dungeonSize, roomSizeDistribution, roomSizeMean, roomSizeDeviation, mainRoomThreshold, density);
    rooms.generateRoomSizes();
    rooms.placeRooms();
    const mainRoomsCenters = rooms.chooseMainRooms();

    const delTriangles = Delaunay.triangulate(mainRoomsCenters);
    const triangulation = processTriangulation(mainRoomsCenters, delTriangles);

    const leaveExtraEdgeOneFrom = Math.pow(100, 1 - Math.max(Math.min(connectivity, 1), 0));
    const minSpanningTree = generateMST(triangulation.edges, triangulation.gVerts, leaveExtraEdgeOneFrom);

    const tunnels = new Tunnels(rooms.dungeonRooms, minSpanningTree.edges, minSpanningTree.leftAlive, mainRoomsCenters, withWalls);
    rooms.attachIntersectedByTunnels(tunnels.tunnels, isDebug);

    // not cutting walls in this pass because of L-shape walls case complexity
    resolveAlignedRectanglesSegmentsIntersections(rooms.dungeonRooms, tunnels.tunnels);

    const dungeon = {
        rooms: rooms.dungeonRooms,
        tunnels: tunnels.tunnels
    };

    if (withWalls) {
        const walls = new Walls(rooms.dungeonRooms, tunnels.walls1.concat(tunnels.walls2));
        resolveAlignedRectanglesSegmentsIntersections(rooms.dungeonRooms, walls.walls);
        walls.removeTunnelWallIntersections(tunnels.tunnels);
        walls.removeWallWallIntersections();
        walls.removeZeroLengthWalls();

        dungeon.walls = walls.walls;
    }

    if (isDebug) {
        dungeon.trashRooms = rooms.rooms;
        dungeon.delaunayTriangles = triangulation.triangulationLines;
        dungeon.mstLines = tunnels.mstLines;
        dungeon.leftAliveLines = tunnels.leftAliveLines;
    } else {
        rooms.rooms.length = 0;
        triangulation.triangulationLines.length = 0;
        tunnels.mstLines.length = 0;
        tunnels.leftAliveLines.length = 0;
    }

    return dungeon;
};

const mergeParamsWithDefaults = function(params) {
    const corrected = {};

    corrected.connectivity = isNaN(params.connectivity) ? config.dungeonParams.connectivity : params.connectivity;
    corrected.density = isNaN(params.density) ? config.dungeonParams.density : params.density;
    corrected.dungeonSize = isNaN(params.dungeonSize) ? config.dungeonParams.dungeonSize : params.dungeonSize;

    corrected.mainRoomThreshold = isNaN(params.mainRoomThreshold) ? config.dungeonParams.mainRoomThreshold : params.mainRoomThreshold;
    corrected.roomSizeDeviation = isNaN(params.roomSizeDeviation) ? config.dungeonParams.roomSizeDeviation : params.roomSizeDeviation;
    corrected.roomSizeDistribution = isNaN(params.roomSizeDistribution) ? config.dungeonParams.roomSizeDistribution : params.roomSizeDistribution;
    corrected.roomSizeMean = isNaN(params.roomSizeMean) ? config.dungeonParams.roomSizeMean : params.roomSizeMean;

    corrected.seed = params.seed || (Math.random() + 1).toString(36).substring(7, 16);

    return corrected;
};

window.dungeonizer = window.dungeonizer || {};

window.dungeonizer.generateDungeon = function(params, withWalls, isDebug) {
    console.log(params);
    const correctedParams = mergeParamsWithDefaults(params);
    console.log('Dungeon params:', correctedParams);
    return generateDungeonImpl(correctedParams, withWalls, isDebug);
};

window.dungeonizer.generateDungeonById = function(dungeonId, withWalls, isDebug) {
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
    }, withWalls, isDebug);
};
