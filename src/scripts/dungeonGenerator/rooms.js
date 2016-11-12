import {rectanglesTouched, getBoxMullerGaussianNoise, alignedSegmentRectangleCol} from './math/mathUtils.js';

class Rooms {
      constructor(dungeonSize, roomSizeDistribution, roomSizeMean, roomSizeDeviation, mainRoomThreshold, density) {
          this.rooms = [];
          this.dungeonRooms = [];

          this.roomSizeDistribution = roomSizeDistribution;
          this.roomSizeMean = roomSizeMean;
          this.roomSizeDeviation = roomSizeDeviation;
          this.mainRoomThreshold = mainRoomThreshold;
          this.density = density;
          this.maxRoomRoundStepsAmount = 30;

          this.minRoomSize = roomSizeMean * (1 - roomSizeDeviation);
          this.maxRoomSize = roomSizeMean * (1 + roomSizeDeviation);
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
              this.rooms.push({x: w / 2, y: h / 2, w, h, size, x1: 0, x2: w, y1: 0, y2: h});
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

          const radialStep = 0.1 + Math.max(1 - this.density, 0) * maxRoomSize * 0.9;
          const maxR = roomsAmount * maxRoomSize * 2;

          for (let i = 1; i < roomsAmount; i++) {
              const roomAngle = Math.random() * 2 * Math.PI;

              let posX = 0;
              let posY = 0;
              const dirX = Math.cos(roomAngle) * radialStep;
              const dirY = Math.sin(roomAngle) * radialStep;

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

                      const maxStepsAmount = Math.min(d, this.maxRoomRoundStepsAmount);
                      const angleStep = 1 / maxStepsAmount + (1 - this.density) * (2 * Math.PI - 1 / maxStepsAmount);

                      while (curAngle - roomAngle < Math.PI * 2) {
                          curAngle += angleStep;

                          for (let ii = d; ii > 0; ii -= radialStep) {
                              rooms[i].x = ii * Math.cos(curAngle);
                              rooms[i].y = ii * Math.sin(curAngle);
                              this.integerizeRoomPlacement(rooms[i]);

                              collidedByAny = false;
                              for (let j = 0; j < i; j++) {
                                  if (rectanglesTouched(rooms[j], rooms[i])) {
                                      collidedByAny = true;
                                      break;
                                  }
                              }
                              if (!collidedByAny) {
                                  d = ii;
                                  posX = rooms[i].x;
                                  posY = rooms[i].y;
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

      chooseMainRooms() {
          const rooms = this.rooms;
          const dungeonRooms = this.dungeonRooms;
          const mainVerts = [];
          const threshold = this.roomSizeMean * this.mainRoomThreshold;

          for (let i = rooms.length - 1; i >= 0; i--) {
              if (rooms[i].w > threshold && rooms[i].h > threshold) {
                  mainVerts.push([rooms[i].x, rooms[i].y, dungeonRooms.length]);
                  dungeonRooms.push(rooms[i]);
                  rooms.splice(i, 1);
              }
          }

          return mainVerts;
      }

      attachIntersectedByTunnels(tunnels, isDebug) {
          let room;
          for (let i = this.rooms.length - 1; i >= 0; i--) {
              room = this.rooms[i];
              for (let j = 0; j < tunnels.length; j = j + 4) {
                  if (alignedSegmentRectangleCol(
                          tunnels[j], tunnels[j + 1], tunnels[j + 2], tunnels[j + 3],
                          room.x1, room.y1, room.x2, room.y2
                      )) {
                      if (isDebug) {
                          room.isAttached = true;
                      }
                      this.dungeonRooms.push(room);
                      this.rooms.splice(i, 1);
                  }
              }
          }
      }

}

export default Rooms;
