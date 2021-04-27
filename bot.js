const tmi = require('tmi.js');
const axios = require('axios')

// Define configuration options
const opts = {
    identity: {
        username: 'cena_dolara_kanada',
        password: process.env.TOKEN
    },
    channels: [
        'adamcy_'
    ]
};


// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();
const api = 'http://api.nbp.pl/api/exchangerates/tables/a/'
let currentValue = null
const getCurrentDolarValue = async () => {
    try {
        return await axios.get(api)
    } catch (error) {
        console.error(error)
    }
}

const printCurrentDolarValue = async (target, splitedCommandName, author) => {
    if (currentValue.data[0].rates[4].mid) {
        console.log(currentValue.data[0].rates[4].mid);
        client.say(target, `@${author} ${splitedCommandName[1] || 1} ${splitedCommandName[1] ? "dolarów kanadyjskich" : "dolar kanadyjski"}  to aktualnie ${Math.floor((currentValue.data[0].rates[4].mid * parseFloat(splitedCommandName[1]) || currentValue.data[0].rates[4].mid) * 100) / 100} PLN! NaM`);
    }
}

// Called every time a message comes in
function onMessageHandler(target, user, msg, self) {
    if (self) { return; } // Ignore messages from the bot
    const commandName = msg.trim();
    let author = user['display-name']
    let splitedCommandName = commandName.split(' ')
    if (splitedCommandName[0] == '!cena' && (parseInt(splitedCommandName[1]) * 100 || !splitedCommandName[1])) {
        if(parseInt(splitedCommandName[1]) > 100000000 )
          return;
      else
        printCurrentDolarValue(target, splitedCommandName, author);
        
    }
}
 

// Called every time the bot connects to Twitch chat
async function onConnectedHandler(addr, port) {
    currentValue = await getCurrentDolarValue()
    setInterval(async () => {
        currentValue = await getCurrentDolarValue()
        console.log(currentValue.data);

    }, 3600000);
    console.log(currentValue.data);


    console.log(`* Connected to ${addr}:${port}`);
}
