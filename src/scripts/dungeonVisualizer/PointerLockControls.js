/**
 * @author mrdoob / http://mrdoob.com/
 */

const THREE = require('three');

THREE.PointerLockControls = function(camera, domElement, isDesktop) {
    const scope = this;

    scope.domElement = (domElement !== undefined) ? domElement : document;

    camera.rotation.set(0, 0, 0);

    const pitchObject = new THREE.Object3D();
    pitchObject.add(camera);

    const yawObject = new THREE.Object3D();
    yawObject.position.y = 10;
    yawObject.add(pitchObject);

    const PI_2 = Math.PI / 2;

    const onMouseMove = function(event) {

        if (scope.enabled === false) return;
        event.preventDefault();

        const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

        yawObject.rotation.y -= movementX * 0.002;
        pitchObject.rotation.x -= movementY * 0.002;

        pitchObject.rotation.x = Math.max(- PI_2, Math.min(PI_2, pitchObject.rotation.x));
    };

    const onTouchMove = function(event) {

        if (scope.enabled === false) return;

        const newX = event.changedTouches[0].clientX;
        const newY = event.changedTouches[0].clientY;

        const movementX = newX - scope.touchLastPos.x || 0;
        const movementY = newY - scope.touchLastPos.y || 0;

        scope.touchLastPos.x = newX;
        scope.touchLastPos.y = newY;

        yawObject.rotation.y -= movementX * 0.002;
        pitchObject.rotation.x -= movementY * 0.002;

        pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, pitchObject.rotation.x));
    };

    this.dispose = function() {
        document.removeEventListener('mousemove', onMouseMove, false);
        if (isDesktop) document.removeEventListener('touchmove', onTouchMove, false);
    };

    document.addEventListener('mousemove', onMouseMove, false);
    if (isDesktop) document.addEventListener('touchmove', onTouchMove, false);

    this.enabled = false;
    this.touchId = null;
    this.touchLastPos = {x: null, y: null};

    this.getObject = function() {
        return yawObject;
    };

    this.getDirection = (function() {
        // assumes the camera itself is not rotated

        const direction = new THREE.Vector3(0, 0, -1);
        const rotation = new THREE.Euler(0, 0, 0, 'YXZ');

        return function(v) {
            rotation.set(pitchObject.rotation.x, yawObject.rotation.y, 0);

            v.copy(direction).applyEuler(rotation);

            return v;
        };
    }());
};
