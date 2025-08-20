const fs = require('fs')
const chalk = require('chalk')

/*      bot name Space XMD developed by iconic         tech new latest version follow instructions Don't      change not belong for user only dev will fix the      debug for my bot please contact us at https://.      codewave-unit.zone.id/support/contact-us.         */



//contact details
global.onwername = "ɪᴄᴏɴɪᴄ ᴛᴇᴄʜ"
global.onwernumber = '263716304574' 
global.BotName = '𝐒𝐏𝐀𝐂𝐄 𝐗𝐌𝐃'
global.ytname = "YT: Tech-God"
global.socialm = "GitHub: iconic05"
global.location = "Zimbabwe, Bulawayo, city"
global.packname = 'ɢᴇɴᴀʀᴇᴛɪᴏɴ ʙʏ'
global.author = '𝐒𝐏𝐀𝐂𝐄 𝐗𝐌𝐃'
// Notice copy and follow official channel
global.space_xmd_link = 'https://whatsapp.com/channel/0029ValX2Js9RZAVtDgMYj0r'
//custom prefix
global.prefa = ['','!','.','#','&']
//false=disable and true=enable
global.autoRecording = false //auto recording
global.autoTyping = true //auto typing
global.chatbot = false
global.autorecordtype = true //auto typing + recording
global.autoread = false //auto read messages
global.autobio = true //auto update bio
global.anti92 = false //auto block +92 
global.autoswview = true //auto view status/story
global.iconictechMenu = 'v1'

global.codewave_contact = 'https://codewave-unit.zone.id/support/contact-us'
//reply messages
global.mess = {
    done: 'Done !',
    prem: 'This feature can be used by premium user only',
    admin: 'This feature can be used by admin only',
    botAdmin: 'This feature can only be used when the bot is a group admin ',
    owner: 'This feature can be used by owner only',
    group: 'This feature is only for groups',
    private: 'This feature is only for private chats',
    wait: 'In process... ',    
    error: 'Error!',
}
global.thumb = fs.readFileSync('./SpaceMedia/spacelogo.jpg')

let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright(`Update'${__filename}'`))
    delete require.cache[file]
    require(file)
})


/*        Contact us https://codewave-unit.zone.id/.         support/contact-us 
    Developed by iconic tech.                            */
  
