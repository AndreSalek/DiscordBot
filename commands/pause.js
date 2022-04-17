const client = require('../bot.js');

module.exports = async function(message) {
    client.pauseSong(message);
}
