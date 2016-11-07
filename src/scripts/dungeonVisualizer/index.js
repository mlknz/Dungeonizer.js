import Controls from './controls.js';

import Floors from './prefabs/floors.js';
import Tunnels from './prefabs/tunnels.js';
import Lines from './prefabs/lines.js';

import config from '../config.js';

class DungeonVisualizer {
    constructor(renderer) {
        renderer.setClearColor(0x111111, false);
        renderer.setPixelRatio(window.devicePixelRatio || 1);

        const gl = renderer.getContext();
        const aspectRatio = gl.canvas.clientWidth / gl.canvas.clientHeight;

        const camera = new THREE.PerspectiveCamera(60, aspectRatio, 0.1, 2000);
        camera.position.z = -90;
        camera.position.y = 110;
        camera.position.x = 50;
        camera.lookAt(new THREE.Vector3(0, 0, 0));
        camera.updateProjectionMatrix();

        this.controls = new Controls(camera, renderer.domElement);

        const scene = new THREE.Scene();

        const light = new THREE.AmbientLight(0x202020);
        scene.add(light);

        const dirLight = new THREE.DirectionalLight(0x707070);
        dirLight.position.set(10, 20, 10);
        scene.add(dirLight);
        const dirLight2 = new THREE.DirectionalLight(0x707070);
        dirLight2.position.set(-30, 20, 10);
        scene.add(dirLight2);

        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
    }

    update() {
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    resize(width, height) {
        const aspectRatio = width / height;
        if (this.camera.aspect !== aspectRatio) {
            this.camera.aspect = aspectRatio;
            this.camera.updateProjectionMatrix();
        }
    }

    dispose() {
        this.controls.dispose();
        this.clearScene(this.scene);
    }

    makeDungeonVisual(dungeon, dungeonId) {
        this.clearScene(this.scene);
        const dungeonShape = this.createDungeonMesh(dungeon, dungeonId);
        this.scene.add(dungeonShape);
    }

    clearScene(s) {
        s.children.forEach(obj => {
            if (obj.name.includes('Dungeon')) {
                obj.children.forEach(child => {
                    // child.material.uuid += Math.random();
                    // child.uuid += Math.random();
                    // child.material.dispose();
                    child.material.dispose();
                    child.geometry.dispose();
                    // child.name = '';
                    child.parent.remove(child);
                    // child = null;
                });
                obj.parent.remove(obj);
            }
        });
    }

    createDungeonMesh(dungeon, dungeonId) {
        const isDebug = Boolean(dungeon.mstLines && dungeon.leftAliveLines && dungeon.delaunayTriangles && dungeon.trashRooms);
        const withWalls = Boolean(dungeon.walls);

        const root = new THREE.Object3D();
        root.name = 'Dungeon_' + dungeonId + isDebug + withWalls;

        const roomsMesh = new Floors(dungeon.rooms, {isDebug, isTrashFloors: false, config: config.visParams});
        roomsMesh.frustumCulled = false;
        root.add(roomsMesh);
        roomsMesh.uuid += isDebug + withWalls;
        roomsMesh.name += isDebug + withWalls;

        const tunnelsMesh = new Tunnels(dungeon.tunnels, {isDebug, config: config.visParams});
        tunnelsMesh.frustumCulled = false;
        root.add(tunnelsMesh);

        if (withWalls) {
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

            const trashRoomsMesh = new Floors(dungeon.trashRooms, {isDebug, isTrashFloors: true, config: config.visParams});
            trashRoomsMesh.frustumCulled = false;
            root.add(trashRoomsMesh);
        }

        return root;
    }
}

export default DungeonVisualizer;
