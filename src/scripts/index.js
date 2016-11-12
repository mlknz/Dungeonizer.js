if (module.hot) {
    module.hot.accept();
}

const webgldetection = require('./webgldetection');

import DungeonVisualizer from './dungeonVisualizer';
import AppUi from './app-ui.js';

class App {
    constructor() {

        if (!webgldetection()) {
            document.body.innerHTML = 'Unable to initialize WebGL. Your browser may not support it.';
            return;
        }

        const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});

        if (renderer.extensions.get('ANGLE_instanced_arrays') === false) {
            document.body.innerHTML = 'Unable to get ANGLE_instanced_arrays WebGL extension. Your browser may not support it.';
            return;
        }

        const canvas = renderer.domElement;
        canvas.className = 'canvas';
        const root = document.getElementById('root');
        root.appendChild(canvas);
        root.style.backgroundColor = 'red';

        const dungeonVisualizer = new DungeonVisualizer(renderer);

        const appUi = new AppUi(dungeonVisualizer);
        appUi.resetDungeon();

        const gl = renderer.getContext();
        const devicePixelRatio = window.devicePixelRatio || 1;
        function resize() {
            const width = Math.floor(canvas.clientWidth * devicePixelRatio);
            const height = Math.floor(canvas.clientHeight * devicePixelRatio);

            if (canvas.width !== width || canvas.height !== height) {
                appUi.resize(width, height);

                canvas.width = width;
                canvas.height = height;

                dungeonVisualizer.resize(width, height);
            }
            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

        }

        const clock = new THREE.Clock();
        function animate() {
            resize();
            dungeonVisualizer.update(clock.getDelta());
            requestAnimationFrame(animate);
        }

        animate();
    }
}

window.app = new App();
