if (module.hot) {
    module.hot.accept();
}

const webgldetection = require('./webgldetection');
import AppUi from './app-ui.js';

class App {
    constructor() {

        if (!webgldetection()) {
            document.body.innerHTML = 'Unable to initialize WebGL. Your browser may not support it.';
            return;
        }

        const renderer = new THREE.WebGLRenderer({antialias: true});

        if (renderer.extensions.get('ANGLE_instanced_arrays') === false) {
            document.body.innerHTML = 'Unable to get ANGLE_instanced_arrays WebGL extension. Your browser may not support it.';
            return;
        }

        const canvas = renderer.domElement;
        canvas.className = 'canvas';
        const root = document.getElementById('root');
        root.appendChild(canvas);

        const dungeonVisualizer = window.dungeonizer.initVisualizer(renderer);

        const resetDungeon = (dungeonId) => {
            const dungeon = window.dungeonizer.generateDungeonById(dungeonId, true);
            dungeonVisualizer.makeDungeonVisual(dungeon, dungeonId);
        };

        const appUi = new AppUi(resetDungeon);
        appUi.resetDungeon((Math.random() + 1).toString(36).substring(7, 16) + ',13,0.55');

        const gl = renderer.getContext();
        function resize() {
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            if (canvas.width !== width || canvas.height !== height) {
                canvas.width = width;
                canvas.height = height;

                dungeonVisualizer.resize(width, height);
                gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
            }
        }

        function animate() {
            resize();
            dungeonVisualizer.update();
            requestAnimationFrame(animate);
        }

        animate();
    }
}

window.app = new App();
