import crypto from 'crypto';
import DECK_FIBONACCI from './models/deck-fibonacci';
import DECK_POPULAR from './models/deck-popular';
import DECK_POWER_OF_TWO from './models/deck-power-of-two';

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
      settings: {
        dealerAsPlayer: false,
        decks: [
          { name: 'Popular', values: DECK_POPULAR },
          { name: 'Fibonacci', values: DECK_FIBONACCI },
          { name: 'Power of two', values: DECK_POWER_OF_TWO },
        ],
        currentDeck: 'Fibonacci',
        newPlayersJoinWithAdmit: true,
        autoTurnOver: true,
        enableTimer: true,
        roundDurationSeconds: 60,
      },
      message: '',
      isStarted: false,
    };
    this.rooms[ID] = roomData;
    return roomData;
  }

  close(roomID) {
    if (!roomID) return;

    delete this.rooms[roomID];
  }

  getRoomData(roomID) {
    if (!roomID) return;

    return this.rooms[roomID];
  }

  checkIfRoomExist(roomID) {
    if (!roomID) return;

    if (this.rooms[roomID]) return true;
    return false;
  }

  addUser(userData, userID, roomID) {
    if (!roomID) return;

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
    if (!roomID) return;

    delete this.rooms[roomID].users[userID];
  }

  changeMessage(roomID, text) {
    if (!roomID) return;

    this.rooms[roomID].message = text;
  }

  startGame(roomID) {
    if (!roomID) return;

    this.rooms[roomID].isStarted = true;
  }

  updateSettings(roomID, newSettings) {
    if (!roomID) return;

    Object.assign(this.rooms[roomID]?.settings, newSettings);
  }
}
export default PokerRooms;
