if (module.hot) {
    module.hot.accept();
}

import Controls from './controls.js';

import Floors from './prefabs/floors.js';
import Tunnels from './prefabs/tunnels.js';
import Lines from './prefabs/lines.js';

import config from '../config.js';

const clearScene = function(scene) {
    scene.children.forEach(obj => {
        if (obj.name.includes('Dungeon')) scene.remove(obj);
    });
};

const createDungeonMesh = function(dungeon, dungeonId) {
    const root = new THREE.Object3D();
    root.name = 'Dungeon_' + dungeonId;

    const isDebug = dungeon.mstLines && dungeon.leftAliveLines && dungeon.delaunayTriangles && dungeon.trashRooms;

    const roomsMesh = new Floors(dungeon.rooms, {isTrashFloors: false, config: config.visParams});
    roomsMesh.frustumCulled = false;
    root.add(roomsMesh);

    const tunnelsMesh = new Tunnels(dungeon.tunnels, {isDebug, config: config.visParams});
    tunnelsMesh.frustumCulled = false;
    root.add(tunnelsMesh);

    if (dungeon.walls) {
        const wallsMesh = new Tunnels(dungeon.walls, {isDebug, config: config.visParams}, 6);
        wallsMesh.frustumCulled = false;
        root.add(wallsMesh);
    }

    if (isDebug) {
        const triangulationLinesMesh = new Lines(dungeon.delaunayTriangles, 0x888888);
        root.add(triangulationLinesMesh);

        const mstLinesMesh = new Lines(dungeon.mstLines, 0x0000ff);
        root.add(mstLinesMesh);

        const leftAliveLinesMesh = new Lines(dungeon.leftAliveLines, 0xff0000);
        root.add(leftAliveLinesMesh);

        const trashRoomsMesh = new Floors(dungeon.trashRooms, {isTrashFloors: true, config: config.visParams});
        trashRoomsMesh.frustumCulled = false;
        root.add(trashRoomsMesh);
    }

    return root;
};

window.dungeonizer = window.dungeonizer || {};
window.dungeonizer.initVisualizer = function(renderer) {

    renderer.setClearColor(0x111111, false);
    renderer.setPixelRatio(window.devicePixelRatio || 1);

    const gl = renderer.getContext();
    let aspectRatio = gl.canvas.clientWidth / gl.canvas.clientHeight;

    const camera = new THREE.PerspectiveCamera(60, aspectRatio, 0.1, 2000);
    camera.position.z = -40;
    camera.position.y = 80;
    camera.position.x = 0;
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
            const dungeonShape = createDungeonMesh(dungeon, dungeonId);
            scene.add(dungeonShape);
        }
    };
};
