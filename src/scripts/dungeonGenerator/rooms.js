import {rectanglesCollided, getBoxMullerGaussianNoise} from './math/mathUtils.js';

class Rooms {
      constructor(dungeonSize, roomSizeDistribution, roomSizeMean, roomSizeDeviation, mainRoomThreshold, density) {
          this.roomSizeDistribution = roomSizeDistribution;
          this.roomSizeMean = roomSizeMean;
          this.roomSizeDeviation = roomSizeDeviation;
          this.mainRoomThreshold = mainRoomThreshold;
          this.density = density;

          this.minRoomSize = roomSizeMean * (1 - roomSizeDeviation);
          this.maxRoomSize = roomSizeMean * (1 + roomSizeDeviation);
          this.rooms = [];
          this.roomsAmount = dungeonSize * 5 + Math.floor(Math.random() * dungeonSize);
      }

      getDistributionPoint() {
          switch (this.roomSizeDistribution) {
          default:
          case 'normal':
              return getBoxMullerGaussianNoise() * (this.maxRoomSize - this.minRoomSize) / 6 + this.roomSizeMean + 0.5;
          case 'uniform':
              return this.minRoomSize + Math.floor(Math.random() * (this.maxRoomSize - this.minRoomSize));
          }
      }

      generateRoomSizes() {
          let w, h, size;
          for (let i = 0; i < this.roomsAmount; i++) {
              w = this.getDistributionPoint();
              h = this.getDistributionPoint();
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
                      // make a round trying to place room closer to center
                      let d = Math.sqrt(posX * posX + posY * posY);
                      let curAngle = roomAngle;
                      let curPosX, curPosY;

                      const angleStep = 1 / d + (1 - this.density) * (2 * Math.PI - 1 / d);

                      while (curAngle - roomAngle < Math.PI * 2) {
                          curAngle += angleStep;

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
          const threshold = this.roomSizeMean * this.mainRoomThreshold;

          let mainRoomsAmount = 0;
          for (let i = rooms.length - 1; i >= 0; i--) {
              if (rooms[i].w > threshold && rooms[i].h > threshold) {
                  rooms[i].isMain = 1;
                  mainVerts.push([rooms[i].x, rooms[i].y, i]);
                  mainRoomsAmount++;
              }
          }

          return mainVerts;
      }

}

export default Rooms;
