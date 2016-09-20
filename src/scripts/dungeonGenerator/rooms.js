import {rectanglesCollided} from './math/mathUtils.js';

class Rooms {
      constructor(dungeonSize) {
          this.minRoomSize = 4;
          this.maxRoomSize = 14;
          this.rooms = [];
          this.roomsAmount = dungeonSize * 5 + Math.floor(Math.random() * 10);
      }

      generateRoomSizes() {
          let w, h, size;
          const minRoomSize = this.minRoomSize;
          const maxRoomSize = this.maxRoomSize;
          for (let i = 0; i < this.roomsAmount; i++) {
              w = minRoomSize + Math.floor(Math.random() * (maxRoomSize - minRoomSize)); // todo: use nice distribution
              h = minRoomSize + Math.floor(Math.random() * (maxRoomSize - minRoomSize)); // Math.floor(w * midRoomAspect * (Math.random() + 0.5));
              size = w * h;
              this.rooms.push({x: 0, y: 0, w, h, size, x1: -w / 2, x2: w / 2, y1: -h / 2, y2: h / 2, isMain: 0});
          }
      }

      placeRooms() {
          const rooms = this.rooms;
          const roomsAmount = this.roomsAmount;
          const maxRoomSize = this.maxRoomSize;
          const maxR = roomsAmount * maxRoomSize * 2;
          for (let i = 1; i < roomsAmount; i++) {
              const roomAngle = Math.random() * 2 * Math.PI;

              let posX = 0;
              let posY = 0;
              const dirX = Math.cos(roomAngle);
              const dirY = Math.sin(roomAngle);

              for (let k = 0; k < maxR; k++) {

                  posX += dirX;
                  posY += dirY;

                  rooms[i].x = posX;
                  rooms[i].y = posY;

                  let collidedByAny = false;
                  for (let j = 0; j < i; j++) {
                      if (rectanglesCollided(rooms[j], rooms[i])) {
                          collidedByAny = true;
                          break;
                      }
                  }

                  if (!collidedByAny) {
                      // make a round trying to place closer to center
                      let d = Math.sqrt(posX * posX + posY * posY);
                      let curAngle = roomAngle;
                      let curPosX, curPosY;

                      while (curAngle - roomAngle < Math.PI * 2) {
                          // curAngle += 1 / d;
                          curAngle += Math.PI / 2; // todo: that is "density" param

                          for (let ii = d; ii > 0; ii--) {
                              curPosX = ii * Math.cos(curAngle);
                              curPosY = ii * Math.sin(curAngle);
                              collidedByAny = false;
                              for (let j = 0; j < i; j++) {
                                  rooms[i].x = curPosX;
                                  rooms[i].y = curPosY;
                                  if (rectanglesCollided(rooms[j], rooms[i])) {
                                      collidedByAny = true;
                                      break;
                                  }
                              }
                              if (!collidedByAny) {
                                  d = ii;
                                  posX = curPosX;
                                  posY = curPosY;
                              }
                          }

                      }

                      rooms[i].x = posX;
                      rooms[i].y = posY;
                      break;
                  }
              }

              rooms[i].x1 = -rooms[i].w / 2 + rooms[i].x;
              rooms[i].x2 = rooms[i].w / 2 + rooms[i].x;
              rooms[i].y1 = -rooms[i].h / 2 + rooms[i].y;
              rooms[i].y2 = rooms[i].h / 2 + rooms[i].y;
          }
      }

      chooseMainRooms(rooms) {
          const mainVerts = [];
          const threshold = this.maxRoomSize * 0.75;
          for (let i = 0; i < rooms.length; i++) {
              if (/* rooms[i].w > threshold && rooms[i].h > threshold*/ rooms[i].size > threshold * threshold) {
                  rooms[i].isMain = 1; // todo: param reassign :(
                  mainVerts.push([rooms[i].x, rooms[i].y, i]);
              }
          }
          return mainVerts;
      }

}

export default Rooms;
