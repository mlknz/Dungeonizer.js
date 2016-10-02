class AppUi {
    constructor(dungeonVisualizer) {
        this.dungeonVisualizer = dungeonVisualizer;

        this.dungeonParams = {
            roomSizeDistribution: 'normal',
            dungeonSize: 13,
            roomSizeMean: 9,
            roomSizeDeviation: 0.5,
            connectivity: 0.55,
            fromDungeonId: false,
            dungeonId: ''
        };

        const gui = new dat.GUI();
        gui.add(this.dungeonParams, 'roomSizeDistribution', { normal: 'normal', uniform: 'uniform' });
        gui.add(this.dungeonParams, 'dungeonSize').min(1).max(120).step(1);
        gui.add(this.dungeonParams, 'roomSizeMean').min(5).max(30).step(1);
        gui.add(this.dungeonParams, 'roomSizeDeviation').min(0.1).max(0.9).step(0.05);
        gui.add(this.dungeonParams, 'connectivity').min(0).max(1).step(0.01);
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
        this.dungeonParams.connectivity;
        return dungeonId;
    }

    resetDungeon() {
        const dungeonId = this.dungeonParams.fromDungeonId ? this.dungeonParams.dungeonId : this.generateNewDungeonId();
        this.dungeonParams.dungeonId = dungeonId;

        const dungeon = window.dungeonizer.generateDungeonById(dungeonId, true);
        this.dungeonVisualizer.makeDungeonVisual(dungeon, dungeonId);
    }
}

export default AppUi;
