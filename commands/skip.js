const client = require('../bot.js');

module.exports = async function(message) {
    await client.skipSong(message);
}