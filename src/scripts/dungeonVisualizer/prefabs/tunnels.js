import tunnelsVert from './shaders/tunnels.vert';
import tunnelsFrag from './shaders/tunnels.frag';

class Tunnels {
    // under assumption x1 <= x2 and y1 <= y2 for tunnels
    constructor(tunnels, {isDebug, config}, h) {
        const offsets = [];
        const scales = [];
        const tHeight = isDebug ? config.tunnelDebugHeight : config.tunnelHeight;
        let isHorizontal, x, y, xS, yS;

        for (let i = 0; i < tunnels.length; i += 4) {
            isHorizontal = tunnels[i + 2] - tunnels[i] > tunnels[i + 3] - tunnels[i + 1];

            x = isHorizontal ? (tunnels[i] + tunnels[i + 2]) / 2 : (tunnels[i] + 0.5);
            xS = isHorizontal ? tunnels[i + 2] - tunnels[i] : 1;

            y = isHorizontal ? (tunnels[i + 1] + 0.5) : (tunnels[i + 1] + tunnels[i + 3]) / 2;
            yS = isHorizontal ? 1 : tunnels[i + 3] - tunnels[i + 1];

            if ((tunnels[i + 2] - tunnels[i] > 0.5) || (tunnels[i + 3] - tunnels[i + 1] > 0.5)) { // todo: handle empty pieces
                offsets.push(x, 0, y);
                scales.push(xS, h ? h : tHeight, yS);
            }
        }

        const cubeGeom = new THREE.BoxBufferGeometry(1, 1, 1);
        const geom = new THREE.InstancedBufferGeometry();

        geom.addAttribute('position', cubeGeom.attributes.position);
        geom.addAttribute('normal', cubeGeom.attributes.normal);
        geom.setIndex(cubeGeom.index);
        geom.addAttribute('offset', new THREE.InstancedBufferAttribute(new Float32Array(offsets), 3, 1));
        geom.addAttribute('scale', new THREE.InstancedBufferAttribute(new Float32Array(scales), 3, 1));

        const uniforms = THREE.UniformsUtils.clone(THREE.UniformsLib.lights);
        uniforms.color = {value: new THREE.Color(isDebug ? config.tunnelDebugColor : config.tunnelColor)};
        if (h) uniforms.color = {value: new THREE.Color(0x888888)};

        const floorsMaterial = new THREE.RawShaderMaterial({
            uniforms,
            vertexShader: tunnelsVert,
            fragmentShader: tunnelsFrag,
            side: THREE.FrontSide,
            transparent: false,
            lights: true
        });

        return new THREE.Mesh(geom, floorsMaterial);
    }
}

export default Tunnels;
