/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.PointerLockControls = function(camera, domElement) {
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

        let dx = 0;
        let dy = 0;
        if (scope.mouseLastPos.x || scope.mouseLastPos.y) {
            dx = event.clientX - scope.mouseLastPos.x;
            dy = event.clientY - scope.mouseLastPos.y;
            scope.mouseLastPos.x = event.clientX;
            scope.mouseLastPos.y = event.clientY;
        }

        const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || dx;
        const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || dy;

        yawObject.rotation.y -= movementX * 0.002;
        pitchObject.rotation.x -= movementY * 0.002;

        pitchObject.rotation.x = Math.max(- PI_2, Math.min(PI_2, pitchObject.rotation.x));
    };

    // in case you need such controls on touch device
    /* const onTouchMove = function(event) {

        if (scope.enabled === false) return;
        console.log('doing it touch');
        const newX = event.changedTouches[0].clientX;
        const newY = event.changedTouches[0].clientY;

        const movementX = newX - scope.touchLastPos.x || 0;
        const movementY = newY - scope.touchLastPos.y || 0;

        scope.touchLastPos.x = newX;
        scope.touchLastPos.y = newY;

        yawObject.rotation.y -= movementX * 0.002;
        pitchObject.rotation.x -= movementY * 0.002;

        pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, pitchObject.rotation.x));
    }; */

    this.dispose = function() {
        document.removeEventListener('mousemove', onMouseMove, false);
        // this.domElement.removeEventListener('touchmove', onTouchMove, false); // in case you need such controls on touch device
    };

    document.addEventListener('mousemove', onMouseMove, false);
    // this.domElement.addEventListener('touchmove', onTouchMove, false); // in case you need such controls on touch device

    this.enabled = false;
    this.touchId = null;
    this.touchLastPos = {x: null, y: null};
    this.mouseLastPos = {x: null, y: null};

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
