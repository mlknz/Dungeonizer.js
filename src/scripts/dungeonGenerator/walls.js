class Walls {
    constructor(rooms, tunnels) {
        // console.log('go', rooms, tunnels);
        const walls = [];

        for (let i = 0; i < rooms.length; i++) {
            if (rooms[i].isMain || rooms[i].isAttached) {
                const roomPerimeter = this.createRoomPerimeterWall(rooms[i]);
                Array.prototype.push.apply(walls, roomPerimeter);
            }
        }
        for (let i = 0; i < tunnels.length; i += 4) {
            const tunnelWalls = this.createTunnelWall(tunnels[i], tunnels[i + 1], tunnels[i + 2], tunnels[i + 3]);
            Array.prototype.push.apply(walls, tunnelWalls);
        }

        return walls;
    }

    createRoomPerimeterWall(room) {
        const x1 = room.x - room.w / 2;
        const x2 = room.x + room.w / 2;
        const y1 = room.y - room.h / 2;
        const y2 = room.y + room.h / 2;

        const roomPerimeter = [
            x1, y1, x1, y2,
            x1, y2, x2, y2,
            x2, y2, x2, y1,
            x2, y1, x1, y1
        ];
        return roomPerimeter;
    }

    createTunnelWall(ax, ay, bx, by) {
        const isHorizontal = Math.abs(ax - bx) > Math.abs(ay - by);
        const tunnelWalls = isHorizontal ? [ax, ay - 1, bx, ay - 1, ax, ay + 1, bx, ay + 1] :
            [ax - 1, ay, ax - 1, by, ax + 1, ay, ax + 1, by];

        return tunnelWalls;
    }
}

export default Walls;
