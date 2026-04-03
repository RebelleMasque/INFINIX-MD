const axios = require('axios');
const { channelInfo } = require('../lib/messageConfig');

const OPENROUTER_API_KEY =
  process.env.OPENROUTER_API_KEY || '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';

async function aiCommand(sock, chatId, message) {
  try {
    const rawText =
      message.message?.conversation?.trim() ||
      message.message?.extendedTextMessage?.text?.trim() ||
      message.message?.imageMessage?.caption?.trim() ||
      message.message?.videoMessage?.caption?.trim() ||
      '';

    const used = (rawText || '').split(/\s+/)[0] || '.gpt';
    const args = rawText.slice(used.length).trim();

    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const quotedText =
      quoted?.conversation ||
      quoted?.extendedTextMessage?.text ||
      quoted?.imageMessage?.caption ||
      quoted?.videoMessage?.caption ||
      '';

    const input = args || quotedText;

    if (!input) {
      await sock.sendMessage(
        chatId,
        {
          text:
            "❌ Donne un texte à demander.\n\n✅ Exemples :\n• *.gpt salut*\n• *.gemini écris une bio WhatsApp stylée*",
          ...channelInfo,
        },
        { quoted: message }
      );
      return;
    }

    if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'METS_TA_CLE_OPENROUTER_ICI') {
      throw new Error('Clé OpenRouter manquante');
    }

    try {
      await sock.sendMessage(chatId, {
        react: { text: '⏳', key: message.key },
      });
    } catch {}

    await sock.sendMessage(
      chatId,
      {
        text: '🧠 Réflexion en cours...',
        ...channelInfo,
      },
      { quoted: message }
    );

    const { data, status } = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openrouter/free',
        messages: [
          {
            role: 'system',
            content:
              "Tu es un assistant intelligent. Réponds toujours en français avec un style propre, clair et utile.",
          },
          {
            role: 'user',
            content: input,
          },
        ],
        temperature: 0.7,
        max_tokens: 1200,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 45000,
        validateStatus: () => true,
      }
    );

    if (status < 200 || status >= 300) {
      throw new Error(
        data?.error?.message ||
          data?.message ||
          `HTTP ${status}`
      );
    }

    let answer = data?.choices?.[0]?.message?.content || '';

    if (Array.isArray(answer)) {
      answer = answer
        .map((item) => {
          if (typeof item === 'string') return item;
          if (item?.text) return item.text;
          return '';
        })
        .join('\n')
        .trim();
    }

    if (!answer || typeof answer !== 'string') {
      throw new Error('Réponse vide');
    }

    if (answer.length > 3500) {
      answer = answer.slice(0, 3500) + '…';
    }

    const header = used.toLowerCase() === '.gemini' ? '✨ GEMINI' : '🤖 SORA';
    const question = input.length > 350 ? input.slice(0, 350) + '…' : input;

    const styled =
      `╭━━━〔 ${header} 〕━━━╮\n` +
      `┃ 🗣️ Question :\n` +
      `┃ ${question}\n` +
      `╰━━━━━━━━━━━━━━━━━━━━╯\n\n` +
      `${answer}\n\n` +
      `✨ INFINIX•MD\n` +
      `> BY REBELLE MASQUE`;

    await sock.sendMessage(
      chatId,
      {
        text: styled,
        ...channelInfo,
      },
      { quoted: message }
    );

    try {
      await sock.sendMessage(chatId, {
        react: { text: '✅', key: message.key },
      });
    } catch {}
  } catch (error) {
    console.error('[OPENROUTER] error:', error?.response?.data || error?.message || error);

    try {
      await sock.sendMessage(chatId, {
        react: { text: '❌', key: message.key },
      });
    } catch {}

    await sock.sendMessage(
      chatId,
      {
        text:
          `❌ Erreur OpenRouter.\n` +
          `📝 Détail: ${error?.message || 'Erreur inconnue'}\n\n` +
          `➡️ Réessaie plus tard.`,
        ...channelInfo,
      },
      { quoted: message }
    );
  }
}

module.exports = aiCommand;