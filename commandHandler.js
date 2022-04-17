const play = require('./commands/play.js')
const pause = require('./commands/pause.js')
const skip = require('./commands/skip.js');

module.exports.decide = async function(message){
  let args = message.content.split(' ');
  let userCommand =  args.shift();
  if(userCommand.charAt(0) === process.env.PREFIX){
    userCommand = userCommand.substring(1);
    switch(userCommand.toLowerCase()){
      case 'play':
      if(!args.length){ return message.reply('Choose a song to play') }
        play(message,args[0]);
        break;
      case 'pause':
        pause(message);
        break;
      case 'skip':
        skip(message);
        break;
      default:
        message.reply('Command does not exist');
        break;
    }
  }
}
