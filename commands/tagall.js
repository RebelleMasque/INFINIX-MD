const isAdmin = require('../lib/isAdmin');

function getTime() {
    const now = new Date();
    return now.toUTCString().split(' ')[4]; // HH:MM:SS
}

async function tagAllCommand(sock, chatId, senderId, message, args = []) {
    try {
        const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);

        if (!isBotAdmin) {
            await sock.sendMessage(
                chatId,
                { text: '❌ Mets le bot admin d’abord.' },
                { quoted: message }
            );
            return;
        }

        if (!isSenderAdmin) {
            await sock.sendMessage(
                chatId,
                { text: '❌ Seuls les admins peuvent utiliser .tagall.' },
                { quoted: message }
            );
            return;
        }

        // Infos du groupe
        const groupMetadata = await sock.groupMetadata(chatId);
        const participants = groupMetadata.participants || [];
        const groupName = groupMetadata.subject || "Groupe";

        const totalMembers = participants.length;

        // Compter les admins
        const totalAdmins = participants.filter(
            p => p.admin === 'admin' || p.admin === 'superadmin'
        ).length;

        if (totalMembers === 0) {
            await sock.sendMessage(
                chatId,
                { text: '❌ Aucun membre trouvé.' },
                { quoted: message }
            );
            return;
        }

        // Heure
        const time = getTime();

        // Image du groupe
        let groupImageUrl = null;
        try {
            groupImageUrl = await sock.profilePictureUrl(chatId, 'image');
        } catch (e) {
            groupImageUrl = null;
        }

        // Message utilisateur
        const userText = Array.isArray(args) ? args.join(' ').trim() : '';

        let messageText =
            "✨ INFINIX•MD\n" +
            `📛 Groupe : ${groupName}\n` +
            `👥 Membres : ${totalMembers}\n` +
            `👮 Admins : ${totalAdmins}\n` +
            `🕒 Heure : ${time} UTC\n\n`;

        if (userText) {
            messageText += `🔊 Message : ${userText}\n\n`;
        } else {
            messageText += "🔊 H𝐎𝐧 𝐬𝐞 𝐫𝐞𝐯𝐞𝐢𝐥𝐥𝐞 :\n\n";
        }

        // Mentions
        participants.forEach(p => {
            messageText += `🙋 @${p.id.split('@')[0]}\n`;
        });

        const mentions = participants.map(p => p.id);

        // Envoi
        if (groupImageUrl) {
            await sock.sendMessage(
                chatId,
                {
                    image: { url: groupImageUrl },
                    caption: messageText,
                    mentions
                },
                { quoted: message }
            );
        } else {
            await sock.sendMessage(
                chatId,
                {
                    text: messageText,
                    mentions
                },
                { quoted: message }
            );
        }

    } catch (error) {
        console.error('Error in tagall command:', error);

        await sock.sendMessage(
            chatId,
            { text: '❌ Erreur lors du tag.' },
            { quoted: message }
        );
    }
}

module.exports = tagAllCommand;