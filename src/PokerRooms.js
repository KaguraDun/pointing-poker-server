import crypto from 'crypto';
import DECK_FIBONACCI from './models/deck-fibonacci';
import DECK_POPULAR from './models/deck-popular';
import DECK_POWER_OF_TWO from './models/deck-power-of-two';
import nestedObjectAssign from 'nested-object-assign';
import fs from 'fs';
import path from 'path';

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
      issues: {
        1: {
          title: 'problemo',
          link: 'problemo',
          priority: 'medium',
        },
        2: {
          title: 'problemo',
          link: 'problemo',
          priority: 'medium',
        },
        3: {
          title: 'problemo',
          link: 'problemo',
          priority: 'medium',
        },
      },
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
      game: {
        isStarted: false,
        isEnded: false,
        currentIssueID: null,
        isTimerStart: false,
        roundTime: null,
      },
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
    if (userData.image) {
      const buffer = Buffer.from(userData.image, 'base64');
      fs.writeFileSync(path.resolve(`public/${userID}.png`), buffer, (err) => {
        if (err) throw err;
      });
    }

    const user = {
      ID: userID,
      image: userData.image ? `${userID}.png` : null,
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

    this.rooms[roomID].game.isStarted = true;
  }

  updateSettings(roomID, newSettings) {
    if (!roomID) return;

    Object.assign(this.rooms[roomID]?.settings, newSettings);
  }

  updateGameState(roomID, newGameState) {
    if (!roomID) return;

    nestedObjectAssign(this.rooms[roomID]?.game, newGameState);
  }

  addIssue(roomID, issueData) {
    if (!roomID) return;

    const issueID = crypto.randomBytes(5).toString('hex');

    const issue = {
      ...issueData,
      ID: issueID,
    };

    this.rooms[roomID].issues[issueID] = issue;
  }

  editIssue(roomID, issueID, issueData) {
    if (!roomID && !issueID) return;

    this.rooms[roomID].issues[issueID] = issueData;
  }

  deleteIssue(roomID, issueID) {
    if (!roomID) return;

    delete this.rooms[roomID].issues[issueID];
  }
}
export default PokerRooms;
