import Controls from './controls.js';

import Floors from './prefabs/floors.js';
import Tunnels from './prefabs/tunnels.js';
import Lines from './prefabs/lines.js';

import config from '../config.js';

class DungeonVisualizer {
    constructor(renderer) {
        this.renderer = renderer;
        this.renderer.setClearColor(0x000000, false);
        this.renderer.setPixelRatio(window.devicePixelRatio || 1);

        const gl = this.renderer.getContext();
        const aspectRatio = gl.canvas.clientWidth / gl.canvas.clientHeight;

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(60, aspectRatio, config.camera.near, config.camera.far);
        this.controls = new Controls(this.camera, this.renderer.domElement, this.scene);
        this.controls.resetCameraOrbit();

        const dirLight = new THREE.DirectionalLight(0x707070);
        dirLight.position.set(10, 20, 10);
        this.scene.add(dirLight);
        const dirLight2 = new THREE.DirectionalLight(0x707070);
        dirLight2.position.set(-30, 20, 10);
        this.scene.add(dirLight2);
    }

    createDungeonMesh(dungeon, dungeonId) {
        const isDebug = Boolean(dungeon.mstLines && dungeon.leftAliveLines && dungeon.delaunayTriangles && dungeon.trashRooms);
        const withWalls = Boolean(dungeon.walls);

        const root = new THREE.Object3D();
        root.name = 'Dungeon_' + dungeonId;

        const roomsMesh = new Floors(dungeon.rooms, {isDebug, isTrashFloors: false, config: config.visParams});
        roomsMesh.frustumCulled = false;
        root.add(roomsMesh);

        const tunnelsMesh = new Tunnels(dungeon.tunnels, {isDebug, config: config.visParams});
        tunnelsMesh.frustumCulled = false;
        root.add(tunnelsMesh);

        if (withWalls) {
            const wallsMesh = new Tunnels(dungeon.walls, {isDebug, config: config.visParams, isWall: true});
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

    update(dt) {
        this.controls.update(dt);
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
        this.clearScene();
    }

    makeDungeonVisual(dungeon, dungeonId) {
        this.clearScene();
        const dungeonShape = this.createDungeonMesh(dungeon, dungeonId);
        this.scene.add(dungeonShape);
    }

    clearScene() {
        for (let i = this.scene.children.length - 1; i >= 0; i--) {
            const obj = this.scene.children[i];
            if (obj.name.includes('Dungeon')) {
                for (let j = obj.children.length - 1; j >= 0; j--) {
                    const child = obj.children[j];
                    if (child instanceof THREE.Mesh) {
                        child.material.dispose();
                        child.geometry.dispose();
                    } else {
                        for (let k = child.children.length - 1; k >= 0; k--) {
                            const line = child.children[k];
                            line.material.dispose();
                            line.geometry.dispose();
                            line.parent.remove(line);
                        }
                    }
                    child.parent.remove(child);
                }

                obj.parent.remove(obj);
            }
        }
    }
}

export default DungeonVisualizer;
