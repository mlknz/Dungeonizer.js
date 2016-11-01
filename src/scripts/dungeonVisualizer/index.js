if (module.hot) {
    module.hot.accept();
}

import Controls from './controls.js';

import Floors from './prefabs/floors.js';
import Tunnels from './prefabs/tunnels.js';
import Lines from './prefabs/lines.js';


const clearScene = function(scene) {
    scene.children.forEach(obj => {
        if (obj.name.includes('Dungeon')) scene.remove(obj);
    });
};

const createDungeonShape = function(dungeon, dungeonId) {
    const root = new THREE.Object3D();
    root.name = 'Dungeon_' + dungeonId;

    const roomsMesh = new Floors(dungeon.rooms);
    roomsMesh.frustumCulled = false;
    root.add(roomsMesh);

    const tunnelsMesh = new Tunnels(dungeon.tunnels);
    tunnelsMesh.frustumCulled = false;
    root.add(tunnelsMesh);

    const wallsMesh = new Tunnels(dungeon.walls);
    wallsMesh.frustumCulled = false;
    root.add(wallsMesh);

    const mstLinesMesh = new Lines(dungeon.mstLines, 0x0000ff);
    // root.add(mstLinesMesh);

    const leftAliveLinesMesh = new Lines(dungeon.leftAliveLines, 0x00ff00);
    // root.add(leftAliveLinesMesh);

    return root;
};

window.dungeonizer = window.dungeonizer || {};
window.dungeonizer.initVisualizer = function(renderer) {

    renderer.setClearColor(0x334422, 1.0);

    const gl = renderer.getContext();
    let aspectRatio = gl.canvas.clientWidth / gl.canvas.clientHeight;

    const camera = new THREE.PerspectiveCamera(60, aspectRatio, 0.1, 2000);
    camera.position.z = 76;
    camera.position.y = 70;
    camera.position.x = 62;
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    camera.updateProjectionMatrix();

    const controls = new Controls(camera, renderer.domElement);

    const scene = new THREE.Scene();

    const light = new THREE.AmbientLight(0x202020);
    scene.add(light);

    const dirLight = new THREE.DirectionalLight(0x707070);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);
    const dirLight2 = new THREE.DirectionalLight(0x707070);
    dirLight2.position.set(-30, 20, 10);
    scene.add(dirLight2);

    return {
        scene,
        update() {
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
            clearScene(scene);
        },
        makeDungeonVisual(dungeon, dungeonId) {
            clearScene(scene);
            const dungeonShape = createDungeonShape(dungeon, dungeonId);
            scene.add(dungeonShape);
        }
    };
};
