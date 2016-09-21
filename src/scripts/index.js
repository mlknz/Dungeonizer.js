if (module.hot) {
    module.hot.accept();
}

const webgldetection = require('./webgldetection');

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

        const resetDungeon = (seed) => {
            const dungeon = window.dungeonizer.generateDungeon({
                seed,
                dungeonSize: 13,
                connectivity: 0.55,
                debugData: true
            });
            dungeonVisualizer.makeDungeonVisual(dungeon, seed);
        };
        resetDungeon((Math.random() + 1).toString(36).substring(7, 16));

        const button = document.createElement('BUTTON');
        const t = document.createTextNode('Generate');
        button.appendChild(t);
        button.style.height = '60px';
        button.style.width = '150px';
        button.style.position = 'absolute';
        button.style.bottom = '0';

        const input = document.createElement('input');
        input.type = 'text';
        input.style.height = '20px';
        input.style.width = '100px';
        input.style.position = 'absolute';
        input.style.bottom = '60px';

        button.onclick = () => {
            const seed = input.value || (Math.random() + 1).toString(36).substring(7, 16);
            resetDungeon(seed);
        };
        root.appendChild(button);
        root.appendChild(input);

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
