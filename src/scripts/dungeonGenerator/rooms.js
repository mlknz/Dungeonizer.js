import {rectanglesTouched, getBoxMullerGaussianNoise} from './math/mathUtils.js';

class Rooms {
      constructor(dungeonSize, roomSizeDistribution, roomSizeMean, roomSizeDeviation, mainRoomThreshold, density) {
          this.roomSizeDistribution = roomSizeDistribution;
          this.roomSizeMean = roomSizeMean;
          this.roomSizeDeviation = roomSizeDeviation;
          this.mainRoomThreshold = mainRoomThreshold;
          this.density = density;
          this.maxRoomRoundStepsAmount = 30;

          this.minRoomSize = roomSizeMean * (1 - roomSizeDeviation);
          this.maxRoomSize = roomSizeMean * (1 + roomSizeDeviation);
          this.rooms = [];
          this.roomsAmount = dungeonSize * 5 + Math.floor(Math.random() * dungeonSize);
      }

      getDistributionPoint() {
          switch (this.roomSizeDistribution) {
          default:
          case 'normal':
              return getBoxMullerGaussianNoise() * (this.maxRoomSize - this.minRoomSize) / 6 + this.roomSizeMean;
          case 'uniform':
              return this.minRoomSize + Math.floor(Math.random() * (this.maxRoomSize - this.minRoomSize));
          }
      }

      generateRoomSizes() {
          let w, h, size;
          for (let i = 0; i < this.roomsAmount; i++) {
              w = Math.round(this.getDistributionPoint());
              h = Math.round(this.getDistributionPoint());
              size = w * h;
              this.rooms.push({x: w / 2, y: h / 2, w, h, size, x1: 0, x2: w, y1: 0, y2: h, isMain: false});
          }
      }

      integerizeRoomPlacement(room) {
          room.x1 = Math.floor(-room.w / 2 + room.x);
          room.x2 = room.x1 + room.w;
          room.y1 = Math.floor(-room.h / 2 + room.y);
          room.y2 = room.y1 + room.h;
          room.x = (room.x1 + room.x2) / 2;
          room.y = (room.y1 + room.y2) / 2;
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
                  this.integerizeRoomPlacement(rooms[i]);

                  let collidedByAny = false;
                  for (let j = 0; j < i; j++) {
                      if (rectanglesTouched(rooms[j], rooms[i])) {
                          collidedByAny = true;
                          break;
                      }
                  }

                  if (!collidedByAny) {
                      // make a round trying to place room closer to center
                      let d = Math.sqrt(posX * posX + posY * posY);
                      let curAngle = roomAngle;
                      let curPosX, curPosY;

                      const maxStepsAmount = Math.min(d, this.maxRoomRoundStepsAmount);
                      const angleStep = 1 / maxStepsAmount + (1 - this.density) * (2 * Math.PI - 1 / maxStepsAmount);

                      while (curAngle - roomAngle < Math.PI * 2) {
                          curAngle += angleStep;

                          for (let ii = d; ii > 0; ii--) {
                              curPosX = ii * Math.cos(curAngle);
                              curPosY = ii * Math.sin(curAngle);
                              collidedByAny = false;
                              for (let j = 0; j < i; j++) {
                                  rooms[i].x = curPosX;
                                  rooms[i].y = curPosY;
                                  this.integerizeRoomPlacement(rooms[i]);

                                  if (rectanglesTouched(rooms[j], rooms[i])) {
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

              this.integerizeRoomPlacement(rooms[i]);
          }
      }

      chooseMainRooms(rooms) {
          const mainVerts = [];
          const threshold = this.roomSizeMean * this.mainRoomThreshold;

          let mainRoomsAmount = 0;
          for (let i = rooms.length - 1; i >= 0; i--) {
              if (rooms[i].w > threshold && rooms[i].h > threshold) {
                  rooms[i].isMain = true;
                  mainVerts.push([rooms[i].x, rooms[i].y, i]);
                  mainRoomsAmount++;
              }
          }

          return mainVerts;
      }

}

export default Rooms;
