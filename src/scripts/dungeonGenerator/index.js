if (module.hot) {
    module.hot.accept();
}

const Delaunay = require('./delaunay.js');
import Rooms from './rooms.js';
import Tunnels from './tunnels.js';
import Connections from './connections.js';

// todo: random seed
// todo: minimum red rooms amount
// todo: maximum red rooms amount
// todo: >3 green on one tunnel -> offset and generetae pipe to it
// todo: if one red room is very far from others -> add red room in between
window.dungeonizer = window.dungeonizer || {};
window.dungeonizer.generateDungeon = function({seed}) {
    // const seed = 1;
    // const dungeonSize = 13;
    // const midRoomAspect = 1;

    const rooms = new Rooms();
    const mainVerts = rooms.chooseMainRooms();

    const delTriangles = Delaunay.triangulate(mainVerts);

    const connections = new Connections(mainVerts, delTriangles);

    const tunnels = new Tunnels(rooms.rooms, connections.edges, connections.leftAlive, mainVerts);

    return {
        floors: rooms.rooms,
        fullDelaunayTriangles: connections.triangulationLines,
        triangles: tunnels.mstLines,
        leftAliveLines: tunnels.leftAliveLines,
        tunnels: tunnels.tunnels
    };
};
