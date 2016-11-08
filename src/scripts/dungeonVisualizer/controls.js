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

        this.orbitControls.enabled = false;

        this.walkerControls = new THREE.PointerLockControls(camera, domElement);
        this._controlsObject = this.walkerControls.getObject();
        this._controlsObject.position.set(0, 0, 0);
        scene.add(this._controlsObject);
        // this.walkerControls.enabled = true;

        this.navMesh = new THREE.Object3D();

        const walkerVars = {
            height: 1.6,
            moveForward: false,
            moveLeft: false,
            moveBackward: false,
            moveRight: false,
            moveForwardBackMultiplier: 1,
            moveLeftRightMultiplier: 1,
            mobileRotateHorizontalMult: 2,
            mobileRotateVerticalMult: 1.6,
            velocity: new THREE.Vector3(0, 0, 0),
            raycaster: new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 10),
            walkingSpeed: 35
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
            default:
            }
        };

        const element = document.body;
        this._pointerlockchange = function() {
            if (document.pointerLockElement === element ||
            document.mozPointerLockElement === element ||
            document.webkitPointerLockElement === element) {
                self.pointerLockControlsEnabled = true;
                self.walkerControls.enabled = true;
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

    update() {
        this.orbitControls.update();
    }

    enableWalker(dungeon) {
        console.log(dungeon);
        this.createNavMesh(dungeon.rooms, dungeon.tunnels);

        this._controlsObject.position.fromArray([20, 20, 20]); // Binding Point
        this._controlsObject.rotation.y = config.controls.pointerLockEntryYaw; // Rotates Yaw Object
        this._controlsObject.children[0].rotation.x = config.controls.pointerLockEntryPitch; // Rotates Pitch Object

        this._addKeyboardListeners();
        this._preparePointerLock();
        this.pointerLockControlsEnabled = true;
    }

    createNavMesh(rooms, tunnels) {

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
            this.navMesh.children[i].material.dispose();
            this.navMesh.children[i].geometry.dispose();
            this.navMesh.remove(this.navMesh.children[i]);
        }
    }

    disableWalker() {
        this.camera.position.fromArray(config.controls.cameraPos);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        this.camera.updateProjectionMatrix();

        this._removeKeyboardListeners();
        this._removePointerLock();
        this.pointerLockControlsEnabled = false;

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
    }
}

export default Controls;
