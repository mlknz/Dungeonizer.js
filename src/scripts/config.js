
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
        mainFloorColor: [0.5, 0, 0],
        attachedFloorColor: [0.1, 0.4, 0.04],
        trashFloorColor: [0.3, 0.3, 0.3],
        trashFloorY: -0.9,

        tunnelHeight: 1.7,
        tunnelDebugHeight: 1.4,
        tunnelColor: 0x772222,
        tunnelDebugColor: 0xaaaaaa
    }
};

export default config;
