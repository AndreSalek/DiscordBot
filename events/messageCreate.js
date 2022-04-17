const command = require('./../commandHandler.js');

module.exports = {
  name: 'messageCreate',
  async execute(message){
    command.decide(message);
    }
  }
