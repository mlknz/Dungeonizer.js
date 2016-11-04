const config = {
    dungeonParams: {
        roomSizeDistribution: 'normal',
        dungeonSize: 15,
        roomSizeMean: 9,
        roomSizeDeviation: 0.75,
        mainRoomThreshold: 1.1,
        connectivity: 0.55,
        density: 0.3,
        fromDungeonId: false,
        dungeonId: '',
        withWalls: true,
        isDebug: false
    },
    visParams: {
        floorHeight: 1,
        mainFloorColor: [0.6, 0, 0],
        attachedFloorColor: [0.2, 0.5, 0.1],
        trashFloorColor: [0.3, 0.3, 0.3],
        trashFloorY: -0.9
    }
};

export default config;
