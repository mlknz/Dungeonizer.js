if (module.hot) {
    module.hot.accept();
}

// import Controls from './controls.js';

var Config = {};
window.THREE = THREE;
require('three/examples/js/controls/OrbitControls.js');

import floorsVert from './shaders/floors.vert';
import floorsFrag from './shaders/floors.frag';

var floorHeight = 1;
var tunnelHeight = 1.7;
var tunnelWidth = 1.2;
var cubeGeom = new THREE.BoxBufferGeometry(1, 1, 1);

function generateFloorsMesh(floors) {
    var offsets = [];
    var scales = [];
    var metaInfo = [];

    for (var i = 0; i < floors.length; i++) {
        offsets.push((floors[i].x1 + floors[i].x2) / 2, 0/*i*1.5*/, (floors[i].y1 + floors[i].y2) / 2);
        scales.push(floors[i].x2 - floors[i].x1, floorHeight, floors[i].y2 - floors[i].y1);
        metaInfo.push(floors[i].isMain);
    }
    var geom = new THREE.InstancedBufferGeometry();

    geom.addAttribute('position', cubeGeom.attributes.position);
    geom.addAttribute('normal', cubeGeom.attributes.normal);
    geom.setIndex(cubeGeom.index);
    geom.addAttribute('offset', new THREE.InstancedBufferAttribute(new Float32Array(offsets), 3, 1));
    geom.addAttribute('scale', new THREE.InstancedBufferAttribute(new Float32Array(scales), 3, 1));
    geom.addAttribute('metaInfo', new THREE.InstancedBufferAttribute(new Float32Array(metaInfo), 1, 1));

    var uniforms = THREE.UniformsUtils.clone(THREE.UniformsLib.lights);

    var floorsMaterial = new THREE.RawShaderMaterial({
        uniforms: uniforms,
        vertexShader: floorsVert,
        fragmentShader: floorsFrag,
        side: THREE.DoubleSide,
        transparent: false,
        lights: true
    });

    return new THREE.Mesh(geom, floorsMaterial);
}

function generateTunnelsMesh(tunnels) {
    var offsets = [];
    var scales = [];
    var metaInfo = [];
    var x1, x2, y1, y2, isHorizontal;
    for (var i = 0; i < tunnels.length; i += 4) {
        x1 = tunnels[i];
        y1 = tunnels[i + 1];
        x2 = tunnels[i + 2];
        y2 = tunnels[i + 3];

        offsets.push((x1 + x2) / 2, 0, (y1 + y2) / 2);
        isHorizontal = Math.abs(x2 - x1) > Math.abs(y2 - y1);
        scales.push(
            isHorizontal ? Math.abs(x2 - x1) + tunnelWidth / 2 : tunnelWidth,
            tunnelHeight,
            isHorizontal ? tunnelWidth : Math.abs(y2 - y1) + tunnelWidth / 2
        );
        metaInfo.push(-1);
    }
    var geom = new THREE.InstancedBufferGeometry();

    geom.addAttribute('position', cubeGeom.attributes.position);
    geom.addAttribute('normal', cubeGeom.attributes.normal);
    geom.setIndex(cubeGeom.index);
    geom.addAttribute('offset', new THREE.InstancedBufferAttribute(new Float32Array(offsets), 3, 1));
    geom.addAttribute('scale', new THREE.InstancedBufferAttribute(new Float32Array(scales), 3, 1));
    geom.addAttribute('metaInfo', new THREE.InstancedBufferAttribute(new Float32Array(metaInfo), 1, 1));

    var uniforms = THREE.UniformsUtils.clone(THREE.UniformsLib.lights);

    var floorsMaterial = new THREE.RawShaderMaterial({
        uniforms: uniforms,
        vertexShader: floorsVert,
        fragmentShader: floorsFrag,
        side: THREE.DoubleSide,
        transparent: false,
        lights: true
    });

    return new THREE.Mesh(geom, floorsMaterial);
}

function generateTrianglesMesh(triangles, color) {
    var trianglesRoot = new THREE.Object3D();
    var lineMaterial = new THREE.LineBasicMaterial({
        color: color
    });

    for (var i = 0; i < triangles.length; i += 4) {
        var lineGeometry = new THREE.Geometry();
        lineGeometry.vertices.push(
            new THREE.Vector3(triangles[i], 1, triangles[i + 1]),
            new THREE.Vector3(triangles[i + 2], 1, triangles[i + 3])
        );
        var lineMesh = new THREE.Line(lineGeometry, lineMaterial);
        trianglesRoot.add(lineMesh);
    }
    return trianglesRoot;
}

window.dungeonizer = window.dungeonizer || {};
window.dungeonizer.visualize = function(renderer) {

    renderer.setClearColor(0x334422, 1.0);
    renderer.clear();

    var gl = renderer.getContext();
    Config.renderer = renderer;
    Config.aspectRatio = gl.canvas.clientWidth / gl.canvas.clientHeight;

    var camera = new THREE.PerspectiveCamera(60, Config.aspectRatio, 1, 10000);
    camera.position.z = 76;
    camera.position.y = 70;
    camera.position.x = 62;
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    camera.updateProjectionMatrix();

    var dungeon = window.dungeonizer.generateDungeon();

    var scene = new THREE.Scene();

    var floorsMesh = generateFloorsMesh(dungeon.floors);
    scene.add(floorsMesh);

    var tunnelsMesh = generateTunnelsMesh(dungeon.tunnels);
    scene.add(tunnelsMesh);

    var trianglesMesh = generateTrianglesMesh(dungeon.triangles, 0x0000ff);
    scene.add(trianglesMesh);

    var leftAliveMesh = generateTrianglesMesh(dungeon.leftAliveLines, 0x00ff00);
    scene.add(leftAliveMesh);

    var light = new THREE.AmbientLight(0x202020);
    scene.add(light);

    var dirLight = new THREE.DirectionalLight(0xaaaaaa);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    var orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;

    return {
        scene: scene,
        update: function() {
            Config.time = (new Date()).getTime();
            orbitControls.update();
            renderer.render(scene, camera);
        },
        resize: function(width, height) {
            Config.aspectRatio = width / height;
            if (camera.aspect !== Config.aspectRatio) {
                camera.aspect = Config.aspectRatio;
                camera.updateProjectionMatrix();
            }
        },
        dispose: function() {
            orbitControls.dispose();
        }
    };
};
