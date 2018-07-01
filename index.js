const Vayrynen = require('./Vayrynen.js');

// Get server url from cli argument if set.
let baseUrl = process.argv.length > 2 ? 'http://' + process.argv[2] + '/' : '';

// Create robot.
let bot = new Vayrynen(baseUrl)
bot.joinGame();