const axios = require('axios');

module.exports = async function (sock, chatId) {
    try {
        const apiKey = 'dcd720a6f1914e2d9dba9790c188c08c';

        // Actus en français (France)
        const url = `https://newsapi.org/v2/top-headlines?country=fr&language=fr&apiKey=${apiKey}`;

        const response = await axios.get(url, { timeout: 15000 });
        const articles = response.data.articles.slice(0, 5);

        if (!articles || articles.length === 0) {
            return await sock.sendMessage(
                chatId,
                { text: "❌ Aucune actualité disponible pour le moment." }
            );
        }

        let newsMessage =
"╭━━━〔 📰 ACTUS PREMIUM 〕━━━╮\n\n";

        articles.forEach((article, index) => {
            const titre = article.title || "Sans titre";
            const source = article.source?.name || "Source inconnue";
            const date = article.publishedAt
                ? article.publishedAt.slice(0, 10)
                : "----/--/--";

            newsMessage +=
"🗞️ " + (index + 1) + ") `" + titre + "`\n" +
"🏷️ Source : `" + source + "`\n" +
"📅 Date : `" + date + "`\n\n";
        });

        newsMessage +=
"⚡ INFINIX•MD\n" +
"╰━━━━━━━━━━━━━━━━━━━━╯";

        await sock.sendMessage(chatId, { text: newsMessage });

    } catch (error) {
        console.error('Error fetching news:', error);

        await sock.sendMessage(
            chatId,
            { text: "❌ Désolé, impossible de récupérer les actualités maintenant." }
        );
    }
};