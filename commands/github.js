const settings = require('../settings');
const moment = require('moment-timezone');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');


async function githubCommand(sock, chatId, message) {
  try {
    if (!process.env.GITHUB_REPO) {
      const msg = `⚠️ *Repo GitHub non configuré.*

`+
                  `Ajoute la variable d’environnement *GITHUB_REPO* (ex: user/repo).
`+
                  `Telegram : https://t.me/+cJv8pOd1Em40ZGFk
`+
                  `Chaîne WhatsApp : https://whatsapp.com/channel/0029VbCBdVzE50UZNpbYsn0d`;
      await sock.sendMessage(chatId, { text: msg }, { quoted: message });
      return;
    }

    const res = await fetch(`https://api.github.com/repos/${process.env.GITHUB_REPO}`);
    if (!res.ok) throw new Error('Error fetching repository data');
    const json = await res.json();

    let txt = `*乂  𝐈𝐍𝐅𝐈𝐍𝐈𝐗•𝐌𝐃  乂*\n\n`;
    txt += `✩  *Nom* : ${json.name}\n`;
    txt += `✩  *Watchers* : ${json.watchers_count}\n`;
    txt += `✩  *Size* : ${(json.size / 1024).toFixed(2)} MB\n`;
    txt += `✩  *Dernière mise à jour* : ${moment(json.updated_at).format('DD/MM/YY - HH:mm:ss')}\n`;
    txt += `✩  *Lien* : ${json.html_url}\n`;
    txt += `✩  *Forks* : ${json.forks_count}\n`;
    txt += `✩  *Stars* : ${json.stargazers_count}\n\n`;
    txt += `💥 *𝐈𝐍𝐅𝐈𝐍𝐈𝐗•𝐌𝐃*`;

    // Use the local asset image
    const imgPath = path.join(__dirname, '../assets/bot_image.jpg');
    const imgBuffer = fs.readFileSync(imgPath);

    await sock.sendMessage(chatId, { image: imgBuffer, caption: txt }, { quoted: message });
  } catch (error) {
    await sock.sendMessage(chatId, { text: '❌ Error fetching repository information.' }, { quoted: message });
  }
}

module.exports = githubCommand; 