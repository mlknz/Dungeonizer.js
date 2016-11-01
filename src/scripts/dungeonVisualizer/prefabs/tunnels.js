import floorsVert from './shaders/floors.vert';
import floorsFrag from './shaders/floors.frag';

const tunnelHeight = 1.7;
const tunnelWidth = 1.2;

class Tunnels {
    constructor(tunnels, colorFlag) {
        const offsets = [];
        const scales = [];
        const metaInfo = [];
        let x1, x2, y1, y2, isHorizontal;
        for (let i = 0; i < tunnels.length; i += 4) {
            x1 = tunnels[i];
            y1 = tunnels[i + 1];
            x2 = tunnels[i + 2];
            y2 = tunnels[i + 3];

            offsets.push((x1 + x2) / 2, 0, (y1 + y2) / 2);
            isHorizontal = Math.abs(x2 - x1) > Math.abs(y2 - y1);
            scales.push(
                isHorizontal ? Math.abs(x2 - x1) + tunnelWidth / 2 : tunnelWidth,
                colorFlag ? 5 : tunnelHeight,
                isHorizontal ? tunnelWidth : Math.abs(y2 - y1) + tunnelWidth / 2
            );
            metaInfo.push(-1);
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
        uniforms.overwriteColor = {value: new THREE.Vector3(-10)};

        const floorsMaterial = new THREE.RawShaderMaterial({
            uniforms,
            vertexShader: floorsVert,
            fragmentShader: floorsFrag,
            side: THREE.DoubleSide,
            transparent: false,
            lights: true
        });

        if (colorFlag) floorsMaterial.uniforms.overwriteColor.value.x = 20;

        return new THREE.Mesh(geom, floorsMaterial);
    }
}

export default Tunnels;
