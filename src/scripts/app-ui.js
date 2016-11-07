import config from './config.js';

// todo: add link to source
// todo: close dat.gui on mobiles (and more flixible dat.gui size)
class AppUi {
    constructor(dungeonVisualizer) {
        this.dungeonVisualizer = dungeonVisualizer;
        this.dungeon = null;

        this.dungeonParams = config.dungeonParams;

        const gui = new dat.GUI({width: 400}); // eslint-disable-line
        gui.add(this.dungeonParams, 'dungeonSize').min(1).max(120).step(1);
        const roomsFolder = gui.addFolder('Rooms');
        roomsFolder.add(this.dungeonParams, 'roomSizeDistribution', { normal: 'normal', uniform: 'uniform' });
        roomsFolder.add(this.dungeonParams, 'roomSizeMean').min(5).max(30).step(1);
        roomsFolder.add(this.dungeonParams, 'roomSizeDeviation').min(0.1).max(0.9).step(0.01);
        roomsFolder.add(this.dungeonParams, 'mainRoomThreshold').min(1).max(1.33).step(0.01);
        // roomsFolder.open();
        gui.add(this.dungeonParams, 'connectivity').min(0).max(1).step(0.01);
        gui.add(this.dungeonParams, 'density').min(0).max(1).step(0.01);
        gui.add(config.generationMode, 'withWalls').onChange(() => { this.resetDungeon(true); });
        gui.add(config.generationMode, 'isDebug').onChange(() => { this.resetDungeon(true); });
        gui.add(this.dungeonParams, 'fromDungeonId');
        gui.add(this.dungeonParams, 'dungeonId').onChange().listen();

        const exportButton = { ExportToFile: () => {
            this.exportDungeon(this.dungeon, this.dungeonParams.dungeonId);
        } };
        gui.add(exportButton, 'ExportToFile');

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

    resetDungeon(forceFromId) {
        const dungeonId = (forceFromId || this.dungeonParams.fromDungeonId) ? this.dungeonParams.dungeonId : this.generateNewDungeonId();
        this.dungeonParams.dungeonId = dungeonId;

        const dungeon = window.dungeonizer.generateDungeonById(
            dungeonId,
            config.generationMode.withWalls,
            config.generationMode.isDebug
        );
        this.dungeon = dungeon;

        this.dungeonVisualizer.makeDungeonVisual(this.dungeon, this.dungeonParams.dungeonId);
    }

    exportDungeon(dungeon, dungeonId) {
        const dataToWrite = JSON.stringify({
            dungeonId,
            dungeon
        }, null, 4);

        window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
        window.requestFileSystem(window.TEMPORARY, 1024 * 1024, (fs) => {
            fs.root.getFile('dungeon_' + dungeonId + '.bin', {create: true}, (fileEntry) => {
                fileEntry.createWriter((fileWriter) => {
                    const blob = new Blob([dataToWrite]);
                    fileWriter.addEventListener('writeend', () => { location.href = fileEntry.toURL(); }, false);
                    fileWriter.write(blob);
                }, () => {});
            }, () => {});
        }, () => {});
    }
}

export default AppUi;
