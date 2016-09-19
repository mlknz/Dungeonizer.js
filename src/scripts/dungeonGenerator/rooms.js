class Rooms {
      constructor() {
          const dungeonSize = 13;
          this.minSize = 4;
          this.maxSize = 14;
          this.rooms = [];
          this.roomsAmount = dungeonSize * 5 + Math.floor(Math.random() * 10);

          this.generateRoomSizes();
          this.placeRooms();
      }

      generateRoomSizes() {
          let w, h, size;
          const minSize = this.minSize;
          const maxSize = this.maxSize;
          for (let i = 0; i < this.roomsAmount; i++) {
              w = minSize + Math.floor(Math.random() * (maxSize - minSize)); // todo: use nice distribution
              h = minSize + Math.floor(Math.random() * (maxSize - minSize)); // Math.floor(w * midRoomAspect * (Math.random() + 0.5));
              size = w * h;
              this.rooms.push({x: 0, y: 0, w, h, size, x1: -w / 2, x2: w / 2, y1: -h / 2, y2: h / 2, isMain: 0});
          }
      }

      isCollided(a, b) {
          if (a.x - a.w / 2 < b.x + b.w / 2 && a.x + a.w / 2 > b.x - b.w / 2 &&
              a.y + a.h / 2 > b.y - b.h / 2 && a.y - a.h / 2 < b.y + b.h / 2) return true;
          return false;
      }

      placeRooms() {
          const rooms = this.rooms;
          const roomsAmount = this.roomsAmount;
          const maxSize = this.maxSize;
          const maxR = roomsAmount * maxSize * 2;
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
                      if (this.isCollided(rooms[j], rooms[i])) {
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
                          curAngle += Math.PI / 2;

                          for (let ii = d; ii > 0; ii--) {
                              curPosX = ii * Math.cos(curAngle);
                              curPosY = ii * Math.sin(curAngle);
                              collidedByAny = false;
                              for (let j = 0; j < i; j++) {
                                  rooms[i].x = curPosX;
                                  rooms[i].y = curPosY;
                                  if (this.isCollided(rooms[j], rooms[i])) {
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

      chooseMainRooms() {
          const mainVerts = [];
          const rooms = this.rooms;
          const threshold = this.maxSize * 0.75;
          for (let i = 0; i < rooms.length; i++) {
              if (/* rooms[i].w > threshold && rooms[i].h > threshold*/ rooms[i].size > threshold * threshold) {
                  rooms[i].isMain = 1;
                  mainVerts.push([rooms[i].x, rooms[i].y, i]);
              }
          }
          return mainVerts;
      }

}

export default Rooms;
