let ind = 0;

class Lines {
    constructor(triangles, color) {
        const trianglesRoot = new THREE.Object3D();
        trianglesRoot.name = 'lines_container_' + ind;
        ind++;
        const lineMaterial = new THREE.LineBasicMaterial({color});

        for (let i = 0; i < triangles.length; i += 4) {
            const lineGeometry = new THREE.Geometry();
            lineGeometry.vertices.push(
                new THREE.Vector3(triangles[i], 1, triangles[i + 1]),
                new THREE.Vector3(triangles[i + 2], 1, triangles[i + 3])
            );
            const lineMesh = new THREE.Line(lineGeometry, lineMaterial);
            trianglesRoot.add(lineMesh);
        }
        return trianglesRoot;
    }
}

export default Lines;
