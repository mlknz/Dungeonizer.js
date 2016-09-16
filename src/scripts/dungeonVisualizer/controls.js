window.THREE = THREE;
require('three/examples/js/controls/OrbitControls.js');

class Controls {
    constructor(camera, domElement) {
        const oc = new THREE.OrbitControls(camera, domElement);
        console.log(oc);
    }
}

export default Controls;
