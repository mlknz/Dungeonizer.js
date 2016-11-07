import tunnelsVert from './shaders/tunnels.vert';
import tunnelsFrag from './shaders/tunnels.frag';

import floorsVert from './shaders/floors.vert';
import floorsFrag from './shaders/floors.frag';

class Tunnels {
    // under assumption x1 <= x2 and y1 <= y2 for tunnels
    constructor(tunnels, {isDebug, config, isWall}) {
        const offsets = [];
        const scales = [];
        const colors = [];

        const c = isWall ? config.wallColor : isDebug ? config.tunnelDebugColor : config.floorTunnelColor;
        const h = isWall ? config.wallHeight : isDebug ? config.tunnelDebugHeight : config.tunnelHeight;
        const hOffset = isWall ? h / 2 - 0.5 : 0;

        let isHorizontal, x, y, xS, yS;

        for (let i = 0; i < tunnels.length; i += 4) {
            isHorizontal = tunnels[i + 2] - tunnels[i] > tunnels[i + 3] - tunnels[i + 1];

            x = isHorizontal ? (tunnels[i] + tunnels[i + 2]) / 2 : (tunnels[i] + 0.5);
            xS = isHorizontal ? tunnels[i + 2] - tunnels[i] : 1;

            y = isHorizontal ? (tunnels[i + 1] + 0.5) : (tunnels[i + 1] + tunnels[i + 3]) / 2;
            yS = isHorizontal ? 1 : tunnels[i + 3] - tunnels[i + 1];

            offsets.push(x, hOffset, y);
            scales.push(xS, h, yS);
            const debugWallColor = [
                Math.abs(Math.sin(157.21355 * x)),
                Math.abs(Math.sin(157.21355 * x * y)) / 3,
                Math.abs(Math.sin(157.21355 * y))
            ];
            colors.push.apply(colors, (isWall && isDebug) ? debugWallColor : c);
        }

        const cubeGeom = new THREE.BoxBufferGeometry(1, 1, 1);
        const geom = new THREE.InstancedBufferGeometry();
        if (isWall || isDebug) {
            for (let i = 0; i < cubeGeom.attributes.position.array.length / 3; i++) {
                if (cubeGeom.attributes.position.array[i * 3 + 1] < 0) cubeGeom.attributes.uv.array[i * 2 + 1] = 0;
                else cubeGeom.attributes.uv.array[i * 2 + 1] = 1;
            }
        }

        geom.addAttribute('position', cubeGeom.attributes.position);
        geom.addAttribute('normal', cubeGeom.attributes.normal);
        geom.addAttribute('uv', cubeGeom.attributes.uv);
        geom.setIndex(cubeGeom.index);
        geom.addAttribute('offset', new THREE.InstancedBufferAttribute(new Float32Array(offsets), 3, 1));
        geom.addAttribute('scale', new THREE.InstancedBufferAttribute(new Float32Array(scales), 3, 1));
        geom.addAttribute('color', new THREE.InstancedBufferAttribute(new Float32Array(colors), 3, 1));

        const uniforms = THREE.UniformsUtils.clone(THREE.UniformsLib.lights);
        uniforms.isDebug = {value: isDebug ? 1 : 0};

        const tunnelsMaterial = new THREE.RawShaderMaterial({
            uniforms,
            vertexShader: (isWall || isDebug) ? tunnelsVert : floorsVert,
            fragmentShader: (isWall || isDebug) ? tunnelsFrag : floorsFrag,
            side: THREE.FrontSide,
            transparent: false,
            lights: true
        });
        const tunnelsMesh = new THREE.Mesh(geom, tunnelsMaterial);
        tunnelsMesh.name = (isWall ? 'walls_isDebug:' : 'tunnels_isDebug') + isDebug;

        return tunnelsMesh;
    }
}

export default Tunnels;
