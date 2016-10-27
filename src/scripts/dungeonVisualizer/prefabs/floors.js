import floorsVert from './shaders/floors.vert';
import floorsFrag from './shaders/floors.frag';

const floorHeight = 1;

class Floors {
    constructor(floors) {
        const offsets = [];
        const scales = [];
        const metaInfo = [];

        for (let i = 0; i < floors.length; i++) {
            if (floors[i].isMain || floors[i].isAttached) {
                offsets.push((floors[i].x1 + floors[i].x2) / 2, 0/* i*1.5*/, (floors[i].y1 + floors[i].y2) / 2);
                scales.push(floors[i].x2 - floors[i].x1, floorHeight, floors[i].y2 - floors[i].y1);
                metaInfo.push(floors[i].isMain ? 1 : floors[i].isAttached ? 2 : 0);
            }
        }

        const cubeGeom = new THREE.BoxBufferGeometry(1, 1, 1);
        const geom = new THREE.InstancedBufferGeometry();

        geom.addAttribute('position', cubeGeom.attributes.position);
        geom.addAttribute('normal', cubeGeom.attributes.normal);
        geom.setIndex(cubeGeom.index);
        geom.addAttribute('offset', new THREE.InstancedBufferAttribute(new Float32Array(offsets), 3, 1));
        geom.addAttribute('scale', new THREE.InstancedBufferAttribute(new Float32Array(scales), 3, 1));
        geom.addAttribute('metaInfo', new THREE.InstancedBufferAttribute(new Float32Array(metaInfo), 1, 1));

        const uniforms = THREE.UniformsUtils.clone(THREE.UniformsLib.lights);

        const floorsMaterial = new THREE.RawShaderMaterial({
            uniforms,
            vertexShader: floorsVert,
            fragmentShader: floorsFrag,
            side: THREE.DoubleSide,
            transparent: false,
            lights: true
        });

        return new THREE.Mesh(geom, floorsMaterial);
    }
}

export default Floors;
