const axios = require('axios');

const TELE_SOCIAL_BASE = "https://tele-social.vercel.app/down?url=";

async function facebookCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || 
                     message.message?.extendedTextMessage?.text;

        const url = text.split(' ').slice(1).join(' ').trim();

        if (!url) {
            return await sock.sendMessage(chatId, { 
                text: "Please provide a Facebook video URL.\nExample: .fb https://www.facebook.com/..."
            }, { quoted: message });
        }

        if (!url.includes('facebook.com')) {
            return await sock.sendMessage(chatId, { 
                text: "That is not a Facebook link."
            }, { quoted: message });
        }

        // Loading reaction
        await sock.sendMessage(chatId, {
            react: { text: '🔄', key: message.key }
        });

        const apiUrl = TELE_SOCIAL_BASE + encodeURIComponent(url);

        const { data } = await axios.get(apiUrl, { timeout: 20000 });

        if (!data || data.status === false) {
            return await sock.sendMessage(chatId, { 
                text: "❌ Failed to download video.\nVideo may be private or link invalid."
            }, { quoted: message });
        }

        const videoUrl = data.download || data.url;
        const title = data.title || "Facebook Video";

        if (!videoUrl) {
            return await sock.sendMessage(chatId, { 
                text: "❌ No downloadable video found."
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, {
            video: { url: videoUrl },
            mimetype: "video/mp4",
            caption: `𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗗 𝗕𝗬 YOUR BOT NAME\n\n📝 Title: ${title}`
        }, { quoted: message });

    } catch (error) {
        console.error('Facebook command error:', error);
        await sock.sendMessage(chatId, { 
            text: "⚠️ API error. Please try again later."
        }, { quoted: message });
    }
}

module.exports = facebookCommand;