import config from './config.js';

const device = require('device.js')();

class AppUi {
    constructor(dungeonVisualizer) {
        this.dungeonVisualizer = dungeonVisualizer;
        this.dungeon = null;

        this.dungeonParams = config.dungeonParams;
        this.isDesktop = device.desktop();

        this.buttonsContainer = document.getElementById('buttonsRoot');
        this.mobileExitButton = document.getElementById('exitWalkerMobile');

        const gui = new dat.GUI({width: this.isDesktop ? 400 : 300}); // eslint-disable-line
        this.gui = gui;
        gui.add(this.dungeonParams, 'dungeonSize').min(1).max(100).step(1).name('Dungeon Size');

        const roomsFolder = gui.addFolder('Rooms');
        roomsFolder.add(this.dungeonParams, 'roomSizeDistribution', { normal: 'normal', uniform: 'uniform' });
        roomsFolder.add(this.dungeonParams, 'roomSizeMean').min(5).max(30).step(1);
        roomsFolder.add(this.dungeonParams, 'roomSizeDeviation').min(0.1).max(0.9).step(0.01);
        roomsFolder.add(this.dungeonParams, 'mainRoomThreshold').min(1).max(1.33).step(0.01);

        gui.add(this.dungeonParams, 'connectivity').min(0).max(1).step(0.01).name('Connectivity');
        gui.add(this.dungeonParams, 'density').min(0).max(1).step(0.01).name('Density');
        gui.add(config.generationMode, 'withWalls').name('Draw Walls').onChange(() => { this.resetDungeon(true); });
        gui.add(config.generationMode, 'isDebug').name('Debug Mode').onChange(() => { this.resetDungeon(true); });
        gui.add(this.dungeonParams, 'fromDungeonId').name('From Dungeon ID');
        gui.add(this.dungeonParams, 'dungeonId').name('Dungeon ID').onChange().listen();

        const exportButton = { exportToFile: () => {
            this.exportDungeon(this.dungeon, this.dungeonParams.dungeonId);
        } };
        gui.add(exportButton, 'exportToFile').name('Export to File');

        const redirect = { jumpToSource: () => {
            window.open(config.global.repoUrl, '_blank');
        } };

        gui.add(redirect, 'jumpToSource').name('Go to Source Code');

        if (!device.desktop()) gui.close();

        const generateButton = document.getElementById('generateButton');
        generateButton.addEventListener('click', () => {this.resetDungeon();});

        const walkerButton = document.getElementById('walkerButton');
        walkerButton.addEventListener('click', () => {this.enableWalker();});

        this.mobileExitButton.addEventListener('click', () => {
            this.dungeonVisualizer.controls.disableWalker();
        });

        this.buttonsRoot = document.getElementById('buttonsRoot');
        document.addEventListener('disableWalker', () => {
            this.buttonsRoot.style.display = '';
            this.mobileExitButton.style.display = 'none';
            if (device.desktop()) gui.open();
        });
    }

    resize(w, h) {
        if (!this.isDesktop && this.buttonsContainer) {
            if (w > h) {
                this.buttonsContainer.style.width = '50%';
                this.buttonsContainer.style.right = '25%';
            } else {
                this.buttonsContainer.style.width = '100%';
                this.buttonsContainer.style.right = '0';
            }
        }
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

    enableWalker() {
        this.dungeonVisualizer.controls.enableWalker(this.dungeon, this.isDesktop);
        if (!this.isDesktop) {
            this.mobileExitButton.style.display = 'table';
        }
        this.gui.close();
        this.buttonsRoot.style.display = 'none';
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
