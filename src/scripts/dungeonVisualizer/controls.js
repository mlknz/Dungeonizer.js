window.THREE = THREE;

import config from '../config.js';
require('three/examples/js/controls/OrbitControls.js');
require('three/examples/js/controls/PointerLockControls');

const disableWalkerEvent = new Event('disableWalker');

class Controls {
    constructor(camera, domElement, scene) {
        const self = this;

        this.camera = camera;
        this.domElement = domElement;
        this.scene = scene;
        this.walkerEnabled = false;

        this.orbitControls = new THREE.OrbitControls(camera, domElement);
        this.orbitControls.enableDamping = true;
        this.orbitControls.minDistance = 1;
        this.orbitControls.maxDistance = 1000;
        this.orbitControls.rotateSpeed = 0.25;

        this.walkerControls = new THREE.PointerLockControls(camera, domElement);
        this._controlsObject = this.walkerControls.getObject();
        this._controlsObject.name = 'pointerLockObject';
        this.scene.add(this._controlsObject);

        this.camera.position.fromArray(config.camera.cameraPos);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        this.camera.updateProjectionMatrix();

        this.navMesh = new THREE.Group();
        this._tA = new THREE.Vector3();
        this._tB = new THREE.Vector3();
        this._tC = new THREE.Vector3();

        const walkerVars = {
            height: 1.6,
            moveForward: false,
            moveLeft: false,
            moveBackward: false,
            moveRight: false,
            speedModifier: 1,
            shiftSpeedModifier: 2,
            jump: false,
            isJumping: false,
            moveForwardBackMultiplier: 1,
            moveLeftRightMultiplier: 0.9,
            mobileRotateHorizontalMult: 2,
            mobileRotateVerticalMult: 1.6,
            velocity: new THREE.Vector3(0, 0, 0),
            raycaster: new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 10),
            walkingSpeed: 65,
            jumpStrength: 8,
            gravity: 30
        };
        this.walkerVars = walkerVars;

        this._onKeyDown = function(e) {
            switch (e.keyCode) {
            case 38: // up
            case 87: // w
                walkerVars.moveForward = true;
                break;
            case 37: // left
            case 65: // a
                walkerVars.moveLeft = true;
                break;
            case 40: // down
            case 83: // s
                walkerVars.moveBackward = true;
                break;
            case 39: // right
            case 68: // d
                walkerVars.moveRight = true;
                break;
            case 16: // shift
                walkerVars.speedModifier = walkerVars.shiftSpeedModifier;
                break;
            case 32: // space
                walkerVars.jump = true;
                break;
            default:
            }
        };

        this._onKeyUp = function(e) {
            switch (e.keyCode) {
            case 38: // up
            case 87: // w
                walkerVars.moveForward = false;
                break;
            case 37: // left
            case 65: // a
                walkerVars.moveLeft = false;
                break;
            case 40: // down
            case 83: // s
                walkerVars.moveBackward = false;
                break;
            case 39: // right
            case 68: // d
                walkerVars.moveRight = false;
                break;
            case 16: // shift
                walkerVars.speedModifier = 1;
                break;
            case 32: // space
                walkerVars.jump = false;
                break;
            default:
            }
        };

        const element = document.body;
        this._pointerlockchange = function() {
            if (document.pointerLockElement === element ||
            document.mozPointerLockElement === element ||
            document.webkitPointerLockElement === element) {
                // self.pointerLockControlsEnabled = true;
                // self.walkerControls.enabled = true;
            } else {
                self.pointerLockControlsEnabled = false;
                self.walkerControls.enabled = false;
                self.disableWalker();
            }
        };
        this._pointerlockerror = function() {
            element.innerHTML = 'PointerLock Error';
        };
        this._requestPointerLock = function() {
            element.requestPointerLock = element.requestPointerLock
            || element.mozRequestPointerLock || element.webkitRequestPointerLock;
            element.requestPointerLock();
        };
    }

    update(delta) {
        if (this.pointerLockControlsEnabled) {
            const v = this.walkerVars;
            const cObj = this._controlsObject;

            let raycastedObj;

            v.raycaster.ray.origin.copy(cObj.position);

            let intersections = [];
            intersections = v.raycaster.intersectObjects(this.navMesh.children, false);

            const isOnObject = intersections.length > 0;

            v.velocity.x -= v.velocity.x * 10.0 * delta;
            v.velocity.z -= v.velocity.z * 10.0 * delta;
            v.velocity.y -= v.gravity * delta;

            if (v.moveForward) v.velocity.z -= v.walkingSpeed * v.speedModifier * v.moveForwardBackMultiplier * delta;
            if (v.moveBackward) v.velocity.z += v.walkingSpeed * v.speedModifier * v.moveForwardBackMultiplier * delta;
            if (v.moveLeft) v.velocity.x -= v.walkingSpeed * v.speedModifier * v.moveLeftRightMultiplier * delta;
            if (v.moveRight) v.velocity.x += v.walkingSpeed * v.speedModifier * v.moveLeftRightMultiplier * delta;
            if (v.jump && !v.isJumping) {
                v.velocity.y = v.jumpStrength;
                v.isJumping = true;
            }

            if (isOnObject) {
                raycastedObj = intersections[0];
                if (raycastedObj.distance < v.height) {
                    cObj.position.y = intersections[0].point.y + v.height;
                    v.velocity.y = 0;
                    v.isJumping = false;
                }
            }

            cObj.translateY(v.velocity.y * delta);

            const prevPos = cObj.position.clone();
            cObj.translateX(v.velocity.x * delta);
            cObj.translateZ(v.velocity.z * delta);

            v.raycaster.ray.origin.copy(cObj.position);
            intersections = [];
            intersections = v.raycaster.intersectObjects(this.navMesh.children, false);

            const willBeOnObject = intersections.length > 0;

            if (isOnObject && !willBeOnObject) {
                const newP = cObj.position.clone();

                const posArr = raycastedObj.object.geometry.attributes.position.array;
                this._tA.fromArray(posArr, raycastedObj.face.a * 3).applyMatrix4(raycastedObj.object.matrixWorld);
                this._tB.fromArray(posArr, raycastedObj.face.b * 3).applyMatrix4(raycastedObj.object.matrixWorld);
                this._tC.fromArray(posArr, raycastedObj.face.c * 3).applyMatrix4(raycastedObj.object.matrixWorld);

                const triCenter = new THREE.Vector3(0).add(this._tA).add(this._tB).add(this._tC).divideScalar(3);
                let intersection = this._linesIntersectsXZ(this._tA, this._tB, prevPos, newP);
                if (!intersection.intersect) {
                    intersection = this._linesIntersectsXZ(this._tB, this._tC, prevPos, newP);
                    if (!intersection.intersect) {
                        intersection = this._linesIntersectsXZ(this._tA, this._tC, prevPos, newP);
                    }
                }

                if (intersection.intersect) {
                    const A = intersection.A;
                    const B = intersection.B;

                    const a = new THREE.Vector3().subVectors(B, A);

                    const proj = new THREE.Vector3().subVectors(cObj.position, A).projectOnVector(a);

                    proj.add(A);

                    proj.add(new THREE.Vector3().subVectors(triCenter, proj).divideScalar(1000));

                    proj.y = prevPos.y;

                    cObj.position.copy(proj);
                } else {
                    cObj.position.copy(prevPos);
                }

                // TODO: should work without it (but it doesn't)
                v.raycaster.ray.origin.copy(cObj.position);
                intersections = [];
                intersections = v.raycaster.intersectObjects(this.navMesh.children, false);
                if (intersections.length < 1) cObj.position.copy(prevPos);
            }
        } else {
            this.orbitControls.update();
        }
    }

    _linesIntersectsXZ(A, B, C, D) {
        const s1 = new THREE.Vector2(B.x - A.x, B.z - A.z);
        const s2 = new THREE.Vector2(D.x - C.x, D.z - C.z);

        const s = (-s1.y * (A.x - C.x) + s1.x * (A.z - C.z)) / (-s2.x * s1.y + s1.x * s2.y);
        const t = (s2.x * (A.z - C.z) - s2.y * (A.x - C.x)) / (-s2.x * s1.y + s1.x * s2.y);

        const doIntersect = s >= 0 && s <= 1 && t >= 0 && t <= 1;
        return {intersect: doIntersect, A, B};
    }

    enableWalker(dungeon) {
        this.createNavMesh(dungeon.rooms, dungeon.tunnels);
        const spawnRoomInd = Math.floor(Math.random() * dungeon.rooms.length);

        this.camera.position.set(0, 0, 0);
        this.camera.rotation.set(0, 0, 0);
        this.camera.near = config.camera.walkerNear;
        this.camera.far = config.camera.walkerFar;
        this.camera.updateProjectionMatrix();

        this._controlsObject.position.fromArray([dungeon.rooms[spawnRoomInd].x, 6, dungeon.rooms[spawnRoomInd].y]); // Binding Point
        this._controlsObject.rotation.y = 0; // Rotates Yaw Object
        this._controlsObject.children[0].rotation.x = 0; // Rotates Pitch Object

        this._addKeyboardListeners();
        this._preparePointerLock();
        this.orbitControls.enabled = false;
        this.pointerLockControlsEnabled = true;
        this.walkerControls.enabled = true;
    }

    // scale manipulation in purpose of not letting camera to get into walls. L-shapes case though
    createNavMesh(rooms, tunnels) {
        const navMesh = this.navMesh;
        const cubeGeom = new THREE.BoxBufferGeometry(1, 1, 1);
        let tunnel, isHorizontal, x, y, xS, yS;

        for (let i = 0; i < rooms.length; i++) {
            const room = new THREE.Mesh(cubeGeom);
            room.scale.set(rooms[i].w - 0.04, config.visParams.floorHeight, rooms[i].h - 0.04);
            room.position.set(rooms[i].x, 0, rooms[i].y);
            navMesh.add(room);
        }

        for (let i = 0; i < tunnels.length; i += 4) {
            tunnel = new THREE.Mesh(cubeGeom);
            isHorizontal = tunnels[i + 2] - tunnels[i] > tunnels[i + 3] - tunnels[i + 1];
            x = isHorizontal ? (tunnels[i] + tunnels[i + 2]) / 2 : (tunnels[i] + 0.5);
            xS = isHorizontal ? tunnels[i + 2] - tunnels[i] - 0.04 : 1 - 0.04;

            y = isHorizontal ? (tunnels[i + 1] + 0.5) : (tunnels[i + 1] + tunnels[i + 3]) / 2;
            yS = isHorizontal ? 1 - 0.04 : tunnels[i + 3] - tunnels[i + 1] - 0.04;

            tunnel.scale.set(xS, config.visParams.tunnelHeight, yS);
            tunnel.position.set(x, 0, y);
            navMesh.add(tunnel);
        }

        navMesh.updateMatrixWorld(true);
    }

    _addKeyboardListeners() {
        document.addEventListener('keydown', this._onKeyDown, false);
        document.addEventListener('keyup', this._onKeyUp, false);
    }

    _removeKeyboardListeners() {
        document.removeEventListener('keydown', this._onKeyDown, false);
        document.removeEventListener('keyup', this._onKeyUp, false);
    }

    clearNavMesh() {
        for (let i = this.navMesh.children.length - 1; i >= 0; i--) {
            this.navMesh.children[i].geometry.dispose();
            this.navMesh.remove(this.navMesh.children[i]);
        }
    }

    disableWalker() {
        this.camera.position.fromArray(config.camera.cameraPos);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        this.camera.near = config.camera.near;
        this.camera.far = config.camera.far;
        this.camera.updateProjectionMatrix();

        this._removeKeyboardListeners();
        this._removePointerLock();
        this.pointerLockControlsEnabled = false;
        this.orbitControls.enabled = true;

        this._controlsObject.position.set(0, 0, 0); // Resets Binding Point offset
        this._controlsObject.rotation.y = 0; // Resets Yaw Object
        this._controlsObject.children[0].rotation.x = 0; // Resets Pitch Object

        this.clearNavMesh();
        document.dispatchEvent(disableWalkerEvent);
    }

    _checkForPointerLock() {
        return 'pointerLockElement' in document ||
             'mozPointerLockElement' in document ||
             'webkitPointerLockElement' in document;
    }

    _preparePointerLock() {
        const element = document.body;
        const havePointerLock = this._checkForPointerLock();
        if (havePointerLock) {
            document.addEventListener('pointerlockchange', this._pointerlockchange, false);
            document.addEventListener('mozpointerlockchange', this._pointerlockchange, false);
            document.addEventListener('webkitpointerlockchange', this._pointerlockchange, false);

            document.addEventListener('pointerlockerror', this._pointerlockerror, false);
            document.addEventListener('mozpointerlockerror', this._pointerlockerror, false);
            document.addEventListener('webkitpointerlockerror', this._pointerlockerror, false);

            this._requestPointerLock();
        } else {
            element.innerHTML = 'Bad browser; No pointer lock';
        }
    }

    _removePointerLock() {
        document.removeEventListener('pointerlockchange', this._pointerlockchange, false);
        document.removeEventListener('mozpointerlockchange', this._pointerlockchange, false);
        document.removeEventListener('webkitpointerlockchange', this._pointerlockchange, false);

        document.removeEventListener('pointerlockerror', this._pointerlockerror, false);
        document.removeEventListener('mozpointerlockerror', this._pointerlockerror, false);
        document.removeEventListener('webkitpointerlockerror', this._pointerlockerror, false);

        this.domElement.removeEventListener('click', this._requestPointerLock, false);
    }

    dispose() {
        this.orbitControls.dispose();
        this.walkerControls.dispose();
    }
}

export default Controls;
