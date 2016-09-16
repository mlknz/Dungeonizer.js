if (module.hot) {
    module.hot.accept();
}

class App {
    constructor() {
        // const config = require('./config');
        // if (!config.webglEnabled) { do smth }
        // if (renderer.extensions.get('ANGLE_instanced_arrays') === false) {
        //     // todo: message to user
        //     return;
        // }
        const renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setClearColor(0x111111, 1.0);
        const dungeonVisualizer = window.dungeonizer.visualize(renderer);
        var gl = renderer.getContext();
        renderer.setSize(600, 400);
        document.body.appendChild(gl.canvas);
        // renderer.setSize(500, 500);
        function resize() {
            var width = gl.canvas.clientWidth;
            var height = gl.canvas.clientHeight;

            if (gl.canvas.width !== width || gl.canvas.height !== height) {

                gl.canvas.width = width;
                gl.canvas.height = height;

                dungeonVisualizer.resize(width, height);
                gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
            }
        }
        dungeonVisualizer.resize(600, 400);
        function animate() {

            requestAnimationFrame(animate);

            resize();
            dungeonVisualizer.update();

        }

        animate();
    }
}

window.app = new App();
