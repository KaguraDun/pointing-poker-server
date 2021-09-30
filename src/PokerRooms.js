import crypto from 'crypto';
import DECK_FIBONACCI from './models/deck-fibonacci';
import DECK_POPULAR from './models/deck-popular';
import DECK_POWER_OF_TWO from './models/deck-power-of-two';

class PokerRooms {
  constructor() {
    this.rooms = {};
  }

  create(dealerData) {
    const roomID = crypto.randomBytes(10).toString('hex');
    const roomData = {
      ID: roomID,
      owner: '',
      users: {},
      issues: {},
      settings: {
        dealerAsPlayer: false,
        decks: {
          popular: { name: 'Popular', values: DECK_POPULAR },
          fibonacci: { name: 'Fibonacci', values: DECK_FIBONACCI },
          powerOfTwo: { name: 'Power of two', values: DECK_POWER_OF_TWO },
        },
        currentDeck: 'fibonacci',
        newPlayersJoinWithAdmit: true,
        autoTurnOver: true,
        enableTimer: true,
        roundDurationSeconds: 60,
      },
      message: '',
      isStarted: false,
    };
    this.rooms[roomID] = roomData;

    const dealerID = this.addUser(roomID, dealerData);

    this.rooms[roomID].owner = dealerID;

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

  addUser(roomID, userData) {
    if (!roomID) return;
    const userID = crypto.randomBytes(10).toString('hex');

    const user = {
      ID: userID,
      image: userData.image,
      name: userData.name,
      surname: userData.surname,
      position: userData.position,
      role: userData.role,
    };

    this.rooms[roomID].users[userID] = user;

    return userID;
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

  addIssue(roomID, issue) {
    if (!roomID) return;

    const issueID = crypto.randomBytes(5).toString('hex');

    const issueData = {
      ...issue,
      ID: issueID,
    };

    this.rooms[roomID].issues[issueID] = issueData;
  }

  deleteIssue(roomID, issueID) {
    if (!roomID) return;

    delete this.rooms[roomID].issues[issueID];
  }
}
export default PokerRooms;
