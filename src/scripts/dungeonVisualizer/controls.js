window.THREE = THREE;
require('three/examples/js/controls/OrbitControls.js');

class Controls {
    constructor(camera, domElement) {
        this.orbitControls = new THREE.OrbitControls(camera, domElement);
        this.orbitControls.enableDamping = true;
        this.orbitControls.rotateSpeed = 0.25;
    }

    update() {
        this.orbitControls.update();
    }

    dispose() {
        this.orbitControls.dispose();
    }
}

export default Controls;
