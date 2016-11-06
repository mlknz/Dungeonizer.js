
const config = {
    generationMode: {
        withWalls: true,
        isDebug: false
    },
    dungeonParams: {
        roomSizeDistribution: 'normal',
        dungeonSize: 15,
        roomSizeMean: 9,
        roomSizeDeviation: 0.75,
        mainRoomThreshold: 1.1,
        connectivity: 0.55,
        density: 0.3,
        fromDungeonId: false,
        dungeonId: ''
    },
    visParams: {
        floorHeight: 1,
        mainFloorColor: [0.4, 0.1, 0.1],
        attachedFloorColor: [0.1, 0.4, 0.04],
        trashFloorColor: [0.3, 0.3, 0.3],
        trashFloorY: -0.9,

        tunnelHeight: 1,
        tunnelDebugHeight: 1.2,
        tunnelColor: [0.4, 0.1, 0.1],
        tunnelDebugColor: [0.7, 0.7, 0.7],

        wallHeight: 4,
        wallColor: [0.6, 0.6, 0.6]
    }
};

export default config;
