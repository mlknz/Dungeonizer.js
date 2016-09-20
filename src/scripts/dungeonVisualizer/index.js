if (module.hot) {
    module.hot.accept();
}

import Controls from './controls.js';

import Floors from './prefabs/floors.js';
import Tunnels from './prefabs/tunnels.js';
import Lines from './prefabs/lines.js';

window.dungeonizer = window.dungeonizer || {};
window.dungeonizer.visualize = function(renderer) {

    renderer.setClearColor(0x334422, 1.0);

    const gl = renderer.getContext();
    let aspectRatio = gl.canvas.clientWidth / gl.canvas.clientHeight;

    const camera = new THREE.PerspectiveCamera(60, aspectRatio, 1, 10000);
    camera.position.z = 76;
    camera.position.y = 70;
    camera.position.x = 62;
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    camera.updateProjectionMatrix();

    const dungeon = window.dungeonizer.generateDungeon({seed: 1, debugData: true});

    const scene = new THREE.Scene();

    const floorsMesh = new Floors(dungeon.floors);
    scene.add(floorsMesh);

    const tunnelsMesh = new Tunnels(dungeon.tunnels);
    scene.add(tunnelsMesh);

    const trianglesMesh = new Lines(dungeon.triangles, 0x0000ff);
    scene.add(trianglesMesh);

    const leftAliveMesh = new Lines(dungeon.leftAliveLines, 0x00ff00);
    scene.add(leftAliveMesh);

    const light = new THREE.AmbientLight(0x202020);
    scene.add(light);

    const dirLight = new THREE.DirectionalLight(0xaaaaaa);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const controls = new Controls(camera, renderer.domElement);

    return {
        scene,
        update() {
            // const time = (new Date()).getTime();
            controls.update();
            renderer.render(scene, camera);
        },
        resize(width, height) {
            aspectRatio = width / height;
            if (camera.aspect !== aspectRatio) {
                camera.aspect = aspectRatio;
                camera.updateProjectionMatrix();
            }
        },
        dispose() {
            controls.dispose();
        }
    };
};
