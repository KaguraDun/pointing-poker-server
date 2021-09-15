import crypto from 'crypto';

class PokerRooms {
  constructor() {
    this.rooms = [];
  }

  create(dealerData) {
    const roomData = {
      ID: crypto.randomBytes(10).toString('hex'),
      owner: dealerData,
      users: [],
      settings: {},
    };

    this.rooms.push(roomData);
    return roomData;
  }

  close(roomID) {
    this.rooms = this.rooms.filter((room) => room.ID !== roomID);
  }

  getRoomData(roomID) {
    return this.rooms.filter((room) => room.ID === roomID);
  }

  addUser(userData) {
    const user = {
      ID: userData.ID,
      image: userData.image,
      name: userData.name,
      surname: userData.surname,
      position: userData.position,
      role: userData.role,
    };

    this.rooms.users.push(user);
  }

  deleteUser(roomID, userID) {
    const currentRoom = this.rooms.find((ID) => ID === roomID);
    currentRoom.users = currentRoom.users.filter((ID) => userID !== ID);
  }
}

export default PokerRooms;
