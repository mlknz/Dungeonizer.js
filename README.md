# Dungeonizer.js

Dungeon generation + visualization in javascript / webgl.  
[Live version here.](https://mlknz.github.io/Dungeonizer.js/)

![alt tag](https://cloud.githubusercontent.com/assets/12106426/20242290/7e4718ba-a93a-11e6-95db-c66f7b64eb7e.gif)

The general idea is borrowed from [this blog article on gamasutra](http://www.gamasutra.com/blogs/AAdonaac/20150903/252889/Procedural_Dungeon_Generation_Algorithm.php).

Project builds into 2 scripts: dungeonizer.js and dungeonVisualiser.js.

**Details:**

1. Whole dungeon is on integer grid.
2. Seeded random is used, so you could reconstruct dungeon from id.


**Algorithm (briefly):**

1. Room sizes are generated.
2. Rooms are placed without collision (placing rooms one by one. Moving room in random direction until there are no collisions, after that doing a round trying to place room closer).
3. Main rooms are chosen and placed into dungeon (room is main if its width and height is more than certain threshold).
4. [Delanay triangulation](https://en.wikipedia.org/wiki/Delaunay_triangulation) is formed from main rooms centers.
5. Forming [minimal spanning tree](https://en.wikipedia.org/wiki/Minimum_spanning_tree) from triangulation + leaving some extra edges.
6. Rooms which are connected in graph are connected with tunnels.
7. Rooms which are intersected by tunnels are attached to dungeon.
8. Tunnels are splited, so there are no tunnels over rooms.
9. Walls generation is completed, walls-walls, walls-tunnels intersections are resolved.


**Dungeon generator usage:**
- include `dungeonizer.js` to your HTML (could be found at [dist/scripts](https://github.com/mlknz/Dungeonizer.js/tree/master/dist/scripts)).
- `var dungeon = window.dungeonizer.generateDungeon(params, withWalls, isDebug)` or `var dungeon = window.dungeonizer.generateDungeonById(dungeonId, withWalls, isDebug)`.
- `params` is expected to be an object with following structure: `{ seed: 'your seed string', dungeonSize: Number > 0, roomSizeDistribution: 'normal' || 'uniform', roomSizeMean: Number > 0, roomSizeDeviation: Number > 0, mainRoomThreshold: Number > 0, connectivity: Number <= 1, density: Number <= 1}`.
- *all parameters are optional* and defaults could be found at [src/scripts/config.js](https://github.com/mlknz/Dungeonizer.js/blob/master/src/scripts/config.js).
- `withWalls` determines whether walls are generated and returned.
- `isDebug` determines whether additional information is returned.
- `dungeonId` is a string composed from params, look the structure in [src/scripts/app-ui](https://github.com/mlknz/Dungeonizer.js/blob/master/src/scripts/app-ui.js) `generateNewDungeonId()` method.
- returned `dungeon` will be an object with following structure: `{rooms: [{x, y, w, h, size, x1, x2, y1, y2}, ...], tunnels: [tun1_x1, tun1_y1, tun1_x2, tun1_y2, tun2_x1, ...]}`.
- if `withWalls` is set, dungeon object will contain `walls` property with same structure as tunnels.
- if `isDebug` is set, dungeon object will contain `trashRooms` property with same structure as rooms and `delaunayTriangles`, 
`mstLines`, `leftAliveLines` properties with arrays of lines coordinates (`[line1_x1, line1_y1, line1_x2, line1_y2, line2_x1, ...]`).


**To launch the project locally:**

0. Install Node.js v5 or higher.
1. Clone project to your hard drive.
2. Run "npm install" in project root directory.
4. Run "gulp watch" to launch dev server.
5. Look in terminal what port is used and navigate to http://localhost:${port} (default is http://localhost:9000).
6. To update build run gulp build.
