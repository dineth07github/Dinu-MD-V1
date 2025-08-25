const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {
SESSION_ID: process.env.SESSION_ID || "",
ALIVE_IMG: process.env.ALIVE_IMG || "https://github.com/dineth07github/Dinu-MD-V1/blob/main/images/logo.png?raw=true",
ALIVE_MSG: process.env.ALIVE_MSG || "*Hello👋 Dinu-MD Is Alive Now😍*",
BOT_OWNER: '94785602293',  // Replace with the owner's phone number



};
