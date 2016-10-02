class AppUi {
    constructor(dungeonVisualizer) {
        this.dungeonVisualizer = dungeonVisualizer;

        this.dungeonParams = {
            chooseMethod: 0,
            dungeonSize: 13,
            connectivity: 0.55,
            fromDungeonId: false,
            dungeonId: ''
        };

        const myFunc = (val) => {
            console.log(val);
        };
        const gui = new dat.GUI();
        gui.add(this.dungeonParams, 'chooseMethod', { textFieldName1: 0, textFieldName2: 1 }).onChange(myFunc).listen();
        gui.add(this.dungeonParams, 'dungeonSize').min(1).max(120).step(1);
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
        const dungeonId = seed + ',' + this.dungeonParams.dungeonSize + ',' + this.dungeonParams.connectivity;
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
