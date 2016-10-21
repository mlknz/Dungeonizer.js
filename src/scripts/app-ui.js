class AppUi {
    constructor(dungeonVisualizer) {
        this.dungeonVisualizer = dungeonVisualizer;

        this.dungeonParams = {
            roomSizeDistribution: 'normal',
            dungeonSize: 15,
            roomSizeMean: 9,
            roomSizeDeviation: 0.75,
            mainRoomThreshold: 1.17,
            connectivity: 0.55,
            density: 0.5,
            fromDungeonId: false,
            dungeonId: ''
        };

        const gui = new dat.GUI({width: 400});
        gui.add(this.dungeonParams, 'dungeonSize').min(1).max(120).step(1);
        const roomsFolder = gui.addFolder('Rooms');
        roomsFolder.add(this.dungeonParams, 'roomSizeDistribution', { normal: 'normal', uniform: 'uniform' });
        roomsFolder.add(this.dungeonParams, 'roomSizeMean').min(5).max(30).step(1);
        roomsFolder.add(this.dungeonParams, 'roomSizeDeviation').min(0.1).max(0.9).step(0.05);
        roomsFolder.add(this.dungeonParams, 'mainRoomThreshold').min(1).max(1.3).step(0.01);
        roomsFolder.open();
        gui.add(this.dungeonParams, 'connectivity').min(0).max(1).step(0.01);
        gui.add(this.dungeonParams, 'density').min(0).max(1).step(0.01);
        gui.add(this.dungeonParams, 'fromDungeonId');
        gui.add(this.dungeonParams, 'dungeonId').onChange().listen();

        const generateButton = { Generate: () => {
            this.resetDungeon();
        } };

        gui.add(generateButton, 'Generate');

    }

    generateNewDungeonId() {
        const seed = (Math.random() + 1).toString(36).substring(7, 16);
        const dungeonId = seed + ',' +
        this.dungeonParams.dungeonSize + ',' +
        this.dungeonParams.roomSizeDistribution + ',' +
        this.dungeonParams.roomSizeMean + ',' +
        this.dungeonParams.roomSizeDeviation + ',' +
        this.dungeonParams.mainRoomThreshold + ',' +
        this.dungeonParams.connectivity + ',' +
        this.dungeonParams.density;
        return dungeonId;
    }

    resetDungeon() {
        const dungeonId = this.dungeonParams.fromDungeonId ? this.dungeonParams.dungeonId : this.generateNewDungeonId();
        this.dungeonParams.dungeonId = dungeonId;

        const dungeon = window.dungeonizer.generateDungeonById(dungeonId);
        this.dungeonVisualizer.makeDungeonVisual(dungeon, dungeonId);
    }
}

export default AppUi;
