import crypto from 'crypto';

class PokerRooms {
  constructor() {
    this.rooms = {};
  }

  create(dealerData, userID) {
    const ID = crypto.randomBytes(10).toString('hex');
    const roomData = {
      ID,
      owner: { ...dealerData, ID: userID },
      users: {},
      settings: {},
      message: '',
    };
    this.rooms[ID] = roomData;
    return roomData;
  }

  close(roomID) {
    delete this.rooms[roomID];
  }

  getRoomData(roomID) {
    return this.rooms[roomID];
  }

  checkIfRoomExist(roomID) {
    if (this.rooms[roomID]) return true;
    return false;
  }

  addUser(userData, userID, roomID) {
    const user = {
      ID: userID,
      image: userData.image,
      name: userData.name,
      surname: userData.surname,
      position: userData.position,
      role: userData.role,
    };

    this.rooms[roomID].users[userID] = user;
  }

  deleteUser(roomID, userID) {
    delete this.rooms[roomID].users[userID];
  }

  changeMessage(roomID, text) {
    this.rooms[roomID].message = text;
  }
}

export default PokerRooms;
