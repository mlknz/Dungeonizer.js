window.THREE = THREE;
require('three/examples/js/controls/OrbitControls.js');

class Controls {
    constructor(camera, domElement) {
        this.orbitControls = new THREE.OrbitControls(camera, domElement);
        this.orbitControls.enableDamping = true;
    }

    update() {
        this.orbitControls.update();
    }

    dispose() {
        this.orbitControls.dispose();
    }
}

export default Controls;
