import floorsVert from './shaders/floors.vert';
import floorsFrag from './shaders/floors.frag';

class Floors {
    constructor(floors, {isDebug, isTrashFloors, config}) {
        const offsets = [];
        const scales = [];
        const colors = [];

        const mainFloorColor = isDebug ? config.mainFloorDebugColor : config.floorTunnelColor;
        const attachedFloorColor = config.attachedFloorDebugColor;
        const trashFloorColor = config.trashFloorDebugColor;
        const floorY = isTrashFloors ? config.trashFloorY : 0;

        for (let i = 0; i < floors.length; i++) {
            offsets.push(floors[i].x, floorY, floors[i].y);
            scales.push(floors[i].w, config.floorHeight, floors[i].h);
            colors.push.apply(colors, isTrashFloors ? trashFloorColor :
                floors[i].isAttached ? attachedFloorColor : mainFloorColor);
        }

        const cubeGeom = new THREE.BoxBufferGeometry(1, 1, 1);
        const geom = new THREE.InstancedBufferGeometry();

        geom.addAttribute('position', cubeGeom.attributes.position);
        geom.addAttribute('normal', cubeGeom.attributes.normal);
        geom.addAttribute('uv', cubeGeom.attributes.uv);
        geom.setIndex(cubeGeom.index);
        geom.addAttribute('offset', new THREE.InstancedBufferAttribute(new Float32Array(offsets), 3, 1));
        geom.addAttribute('scale', new THREE.InstancedBufferAttribute(new Float32Array(scales), 3, 1));
        geom.addAttribute('color', new THREE.InstancedBufferAttribute(new Float32Array(colors), 3, 1));

        const uniforms = THREE.UniformsUtils.clone(THREE.UniformsLib.lights);
        uniforms.opacity = {value: isTrashFloors ? 0.5 : 1};
        uniforms.isDebug = {value: isDebug ? 1 : 0};

        const floorsMaterial = new THREE.RawShaderMaterial({
            uniforms,
            vertexShader: floorsVert,
            fragmentShader: floorsFrag,
            side: THREE.FrontSide,
            transparent: isTrashFloors ? true : false,
            lights: true
        });

        const floorsMesh = new THREE.Mesh(geom, floorsMaterial);
        floorsMesh.name = 'floors_isTrash:' + isTrashFloors + '_isDebug:' + isDebug;
        return floorsMesh;
    }
}

export default Floors;
