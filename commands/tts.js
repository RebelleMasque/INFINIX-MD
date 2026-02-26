const gTTS = require('gtts');
const fs = require('fs');
const path = require('path');

async function ttsCommand(sock, chatId, text, message, language = 'fr') {

    // Si aucun texte n’est fourni
    if (!text) {
        const msg = `
╭────❏ 𝐈𝐍𝐅𝐈𝐍𝐈𝐗•𝐌𝐃
│ 🌟 *²⁰²⁶ .tts!* 🎤
│ \`Erreur\` : Texte manquant ❌
│ Veuillez fournir un texte à convertir.
│ ➥ Exemple :
│ .tts Salut les gars
╰────❏
›  • \`PRO MAX\`
`.trim();

        await sock.sendMessage(
            chatId,
            { text: msg },
            { quoted: message }
        );
        return;
    }

    const fileName = `tts-${Date.now()}.mp3`;
    const filePath = path.join(__dirname, '..', 'assets', fileName);

    const gtts = new gTTS(text, language);

    gtts.save(filePath, async function (err) {

        if (err) {
            await sock.sendMessage(
                chatId,
                { text: '❌ Erreur lors de la génération du message vocal.' },
                { quoted: message }
            );
            return;
        }

        // Envoi de l'audio
        await sock.sendMessage(chatId, {
            audio: { url: filePath },
            mimetype: 'audio/mpeg'
        }, { quoted: message });

        // Suppression du fichier après envoi
        fs.unlinkSync(filePath);
    });
}

module.exports = ttsCommand;