const client = require('../bot.js');

module.exports = async function(message, args) {
  const userVoiceChannel = message.member.voice;
  const botVoiceChannel = message.guild.me.voice;

  // Checking if the member is in a voice channel.
  if (!userVoiceChannel.channel) return message.reply('You need to be in a voice channel.');
  await client.joinChannel(message,message.member.voice.channel.id);

  if (botVoiceChannel.channelID == userVoiceChannel.channelID) {
    let queuePromise = await client.pushToQueue(message, args)
    .then((serverQueue) => {
      let lastArrayIndex = serverQueue.songs.length - 1;
      (serverQueue.songs.length > 1)? message.reply('Added to queue! ' + serverQueue.songs[lastArrayIndex]) : message.reply('Playing ' + serverQueue.songs[0]);
      if(!serverQueue.playing){ client.playSong(message); }
    })
    .catch(err => console.log('Error ' + err))
  }
}