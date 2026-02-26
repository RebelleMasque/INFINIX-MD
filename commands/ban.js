const fs = require('fs');
const { channelInfo } = require('../lib/messageConfig');
const isAdmin = require('../lib/isAdmin');
const { isSudo } = require('../lib/index');

async function banCommand(sock, chatId, message) {
    // Restrict in groups to admins; in private to owner/sudo
    const isGroup = chatId.endsWith('@g.us');
    if (isGroup) {
        const senderId = message.key.participant || message.key.remoteJid;
        const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);
        if (!isBotAdmin) {
            await sock.sendMessage(chatId, { 
                text: '❌ Je dois être *admin* pour utiliser la commande `.ban`.', 
                ...channelInfo 
            }, { quoted: message });
            return;
        }
        if (!isSenderAdmin && !message.key.fromMe) {
            await sock.sendMessage(chatId, { 
                text: '❌ Seuls les *admins du groupe* peuvent utiliser `.ban`.', 
                ...channelInfo 
            }, { quoted: message });
            return;
        }
    } else {
        const senderId = message.key.participant || message.key.remoteJid;
        const senderIsSudo = await isSudo(senderId);
        if (!message.key.fromMe && !senderIsSudo) {
            await sock.sendMessage(chatId, { 
                text: '❌ En privé, seuls le *propriétaire/sudo* peuvent utiliser `.ban`.', 
                ...channelInfo 
            }, { quoted: message });
            return;
        }
    }

    let userToBan;

    // Check for mentioned users
    if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
        userToBan = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
    }
    // Check for replied message
    else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
        userToBan = message.message.extendedTextMessage.contextInfo.participant;
    }

    if (!userToBan) {
        await sock.sendMessage(chatId, {
            text:
`╭─────❏ 𝐈𝐍𝐅𝐈𝐍𝐈𝐗•𝐌𝐃
│ 🚫 \`Erreur\` : utilisateur non détecté
│ ✅ Utilise :
│ • \`.ban @user\`
│ • Ou réponds au message de la personne puis tape \`.ban\`
╰─────❏
›  • \`REBELLE MASQUE\``,
            ...channelInfo
        }, { quoted: message });
        return;
    }

    // Prevent banning the bot itself
    try {
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        if (userToBan === botId || userToBan === botId.replace('@s.whatsapp.net', '@lid')) {
            await sock.sendMessage(chatId, { 
                text: '🤖❌ Tu ne peux pas bannir le compte du bot.', 
                ...channelInfo 
            }, { quoted: message });
            return;
        }
    } catch {}

    try {
        // Add user to banned list
        const bannedUsers = JSON.parse(fs.readFileSync('./data/banned.json'));
        if (!bannedUsers.includes(userToBan)) {
            bannedUsers.push(userToBan);
            fs.writeFileSync('./data/banned.json', JSON.stringify(bannedUsers, null, 2));

            await sock.sendMessage(chatId, {
                text:
`╭───❏ 𝐈𝐍𝐅𝐈𝐍𝐈𝐗•𝐌𝐃
│ ✅ \`Bannissement réussi\`
│ 👤 Utilisateur : @${userToBan.split('@')[0]}
╰───❏
›  • \`REBELLE MASQUE\``,
                mentions: [userToBan],
                ...channelInfo
            }, { quoted: message });

        } else {
            await sock.sendMessage(chatId, {
                text:
`╭───❏ 𝐈𝐍𝐅𝐈𝐍𝐈𝐗•𝐌𝐃
│ ⚠️ \`Déjà banni\`
│ 👤 Utilisateur : @${userToBan.split('@')[0]}
╰───❏
›  • \`REBELLE MASQUE\``,
                mentions: [userToBan],
                ...channelInfo
            }, { quoted: message });
        }
    } catch (error) {
        console.error('Error in ban command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Échec : impossible de bannir cet utilisateur.', 
            ...channelInfo 
        }, { quoted: message });
    }
}

module.exports = banCommand;