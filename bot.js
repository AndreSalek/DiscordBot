const fs = require('fs');
const { Client, Intents } = require('discord.js');
require('./commandHandler');
require('dotenv').config();
const {
  joinVoiceChannel,
  getVoiceConnection,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const { YTSearcher } = require('ytsearcher');
const searcher = new YTSearcher({
  key: 'your youtube API key',
  revealkey: true,
});

const queue = new Map();
const audioPlayer = createAudioPlayer();
let serverQueue;

const client = new Client({
  shards:'auto',
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES
]});


//dynamically retrieving data
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	}
  else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

module.exports.pauseSong = (message) => {
  if(!serverQueue){
    message.reply('No song in queue')
  }
  else if(!serverQueue.isPaused){
    audioPlayer.pause();
    serverQueue.isPaused = true;
  }
  else{
    audioPlayer.unpause();
    serverQueue.isPaused = false;
  }
}

module.exports.skipSong = (message) => {
  if(!serverQueue) { return message.reply('No song in queue to skip.') }
  serverQueue.songs.shift();
  serverQueue.playing = false;
  if(!serverQueue.songs.length){
     audioPlayer.stop();
     queue.delete();
     }
  else{
    this.playSong();
  }
}

function addToServerQueue(song){
  queue.set(serverQueue.guildId, serverQueue.songs.push(song))
}

function createServerQueue(message){
  const queueConst = {
    guildId: message.guild.id,
    voiceChannel: message.guild.me.voice,
    songs: [],
    isPaused: false,
    connection: null,
    volume: 10,
    playing: false,
  };
  queue.set(message.guild.id, queueConst);
  return queue.get(message.guild.id);
}

module.exports.joinChannel = async (message,channelId) => {
  client.channels.fetch(channelId).then(channel=> {
    const connection = joinVoiceChannel({
      channelId: message.member.voice.channel.id,
      guildId: message.guild.id,
      selfDeaf: false,
      selfMute: false,
      adapterCreator: channel.guild.voiceAdapterCreator
    })
    connection.subscribe(audioPlayer);
  })
  .catch(error => {
    console.log(' Request failed'+ error);
    return message.channel.send('Cannot join to voice chat');
  })

}
module.exports.pushToQueue = async(message, args) => {
  try{
    if(!serverQueue) { serverQueue = createServerQueue(message) };
    serverQueue.connection = getVoiceConnection(message.guild.id);
    const songSearch = await searcher.search(args).then()
    const songUrl = songSearch.first.url;
    addToServerQueue(songUrl);
    return serverQueue;
  }
  catch(err){
    console.log(err)
    message.reply('Did not find this song.')
  }
}

module.exports.playSong = async(message) => {
  try{
    if(!serverQueue.songs.length) { return }
    const stream = ytdl(serverQueue.songs[0], { filter: 'audioonly', volume: 0.5, opusEncoded: true});
    const resource = createAudioResource(stream);
    const dispatcher = audioPlayer.play(resource);

    audioPlayer
    .once(AudioPlayerStatus.Playing, () => {
      serverQueue.playing = true;
    })
    .on(AudioPlayerStatus.Idle, () => {
      serverQueue.songs.shift();
      serverQueue.playing = false;
      if(!serverQueue.songs) {
        queue.delete();
        audioPlayer.stop();
        serverQueue.connection.destroy();
      }else{
        this.playSong();
      }
    })
  }
  catch(err){
    message.reply('Cannot play this song');
    console.log(err);
  }
}

// Login to Discord with client's token
client.login(process.env.TOKEN);
