
const config = {
    global: {
        repoUrl: 'https://github.com/mlknz/Dungeonizer.js'
    },
    generationMode: {
        withWalls: true,
        isDebug: false
    },
    dungeonParams: {
        roomSizeDistribution: 'normal',
        dungeonSize: 10,
        roomSizeMean: 9,
        roomSizeDeviation: 0.75,
        mainRoomThreshold: 1.1,
        connectivity: 0.7,
        density: 0.6,
        fromDungeonId: false,
        dungeonId: ''
    },
    controls: {
        cameraPos: [-90, 110, 50]
    },
    visParams: {
        floorHeight: 1,
        tunnelHeight: 1,
        wallHeight: 4,
        floorTunnelColor: [1, 1, 1],
        wallColor: [0.6, 0.6, 0.6],

        mainFloorDebugColor: [0.6, 0.1, 0.1],
        attachedFloorDebugColor: [0.1, 0.4, 0.04],
        trashFloorDebugColor: [0.3, 0.3, 0.3],
        trashFloorY: -0.9,

        tunnelDebugHeight: 1.2,
        tunnelDebugColor: [0.7, 0.7, 0.7]
    }
};

export default config;
