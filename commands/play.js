const yts = require('yt-search');
const axios = require('axios');

async function playCommand(sock, chatId, message) {
    try {
        const text =
            message.message?.conversation ||
            message.message?.extendedTextMessage?.text ||
            '';

        const searchQuery = text.split(' ').slice(1).join(' ').trim();

        if (!searchQuery) {
            return await sock.sendMessage(
                chatId,
                {
                    text:
`╭──❏ 🎵 *PLAY*
│
│ ❌ Donne le nom de la musique.
│
│ Exemple :
│ .play dadju jaloux
╰──❏`
                },
                { quoted: message }
            );
        }

        /* ✅ Réaction : téléchargement en cours */
        try {
            await sock.sendMessage(chatId, {
                react: { text: '⏳', key: message.key }
            });
        } catch {}

        // Recherche YouTube
        const { videos } = await yts(searchQuery);

        if (!videos || videos.length === 0) {
            await sock.sendMessage(chatId, {
                react: { text: '❌', key: message.key }
            });

            return await sock.sendMessage(
                chatId,
                {
                    text:
`╭──❏ 🎵 *PLAY*
│
│ ❌ Aucun résultat trouvé.
╰──❏`
                },
                { quoted: message }
            );
        }

        // Message info
        await sock.sendMessage(chatId, {
            text:
`╭──❏ ⏳ *Téléchargement*
│
│ Recherche en cours...
│ Veuillez patienter...
╰──❏`
        });

        const video = videos[0];
        const urlYt = video.url;

        // Appel API
        const response = await axios.get(
            `https://apis-keith.vercel.app/download/dlmp3?url=${urlYt}`
        );

        const data = response.data;

        if (!data || !data.status || !data.result || !data.result.downloadUrl) {
            await sock.sendMessage(chatId, {
                react: { text: '❌', key: message.key }
            });

            return await sock.sendMessage(
                chatId,
                {
                    text:
`╭──❏ ❌ *Erreur*
│
│ Impossible de récupérer l’audio.
╰──❏`
                },
                { quoted: message }
            );
        }

        const audioUrl = data.result.downloadUrl;
        const title = data.result.title || "musique";

        // Envoi audio
        await sock.sendMessage(
            chatId,
            {
                audio: { url: audioUrl },
                mimetype: "audio/mpeg",
                fileName: `${title}.mp3`
            },
            { quoted: message }
        );

        /* ✅ Réaction : terminé */
        try {
            await sock.sendMessage(chatId, {
                react: { text: '✅', key: message.key }
            });
        } catch {}

    } catch (error) {
        console.error('Error in play command:', error);

        /* ❌ Réaction : erreur */
        try {
            await sock.sendMessage(chatId, {
                react: { text: '❌', key: message.key }
            });
        } catch {}

        await sock.sendMessage(
            chatId,
            {
                text:
`╭──❏ ❌ *Téléchargement échoué*
│
│ Une erreur est survenue.
╰──❏`
            },
            { quoted: message }
        );
    }
}

module.exports = playCommand;