class AppUi {
    constructor(resetDungeon) {
        this.resetDungeon = resetDungeon;

        const myVars = {
            chooseMethod: 0,
            dungeonSize: 13,
            connectivity: 0.55,
            fromDungeonId: false,
            dungeonId: '______'
        };

        const myFunc = (val) => {
            console.log(val);
        };
        const gui = new dat.GUI();
        gui.add(myVars, 'chooseMethod', { textFieldName1: 0, textFieldName2: 1 }).onChange(myFunc).listen();
        gui.add(myVars, 'dungeonSize').min(1).max(50).step(1);
        gui.add(myVars, 'connectivity').min(0).max(1).step(0.01);
        gui.add(myVars, 'fromDungeonId');
        gui.add(myVars, 'dungeonId');

        const generateButton = { Generate: () => {
            const seed = /* input.value || */ (Math.random() + 1).toString(36).substring(7, 16);
            resetDungeon(seed + ',' + myVars.dungeonSize + ',' + myVars.connectivity);
        } };

        gui.add(generateButton, 'Generate');

    }
}

export default AppUi;
