const colyseus = require('colyseus');
const social = require('@colyseus/social');
const {Dispatcher} = require('@colyseus/command');
const PreparationState = require('./states/preparation-state');
const {
  OnGameStartCommand,
  OnJoinCommand,
  OnLeaveCommand,
  OnToggleReadyCommand
} = require('./commands/preparation-commands');

class PreparationRoom extends colyseus.Room {
  constructor() {
    super();
    this.dispatcher = new Dispatcher(this);
  }

  onCreate(options) {
    this.setState(new PreparationState());
    this.maxClients = 8;
    this.onMessage('game-start', (client, message) => {
      this.dispatcher.dispatch(new OnGameStartCommand(), {client, message});
    });
    this.onMessage('toggle-ready', (client, message) => {
      this.dispatcher.dispatch(new OnToggleReadyCommand(), client);
    });
  }

  async onAuth(client, options, request) {
    const token = social.verifyToken(options.token);
    const user = await social.User.findById(token._id);
    return user;
  }

  onJoin(client, options, auth) {
    this.dispatcher.dispatch(new OnJoinCommand(), {client, options, auth});
  }

  onLeave(client, consented) {
    this.dispatcher.dispatch(new OnLeaveCommand(), {client, consented});
  }

  onDispose() {
    this.dispatcher.stop();
  }
}

module.exports = PreparationRoom;
