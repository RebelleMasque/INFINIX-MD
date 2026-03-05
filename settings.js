const settings = {
  packname: '𝐈𝐍𝐅𝐈𝐍𝐈𝐗•𝐌𝐃',
  author: 'rebelle masque',
  botName: "𝐈𝐍𝐅𝐈𝐍𝐈𝐗•𝐌𝐃",
  botOwner: 'rebelle masque', // ton nom
  ownerNumber: '2250140768791', //Saisissez votre numéro ici, sans le symbole +. Indiquez simplement l'indicatif du pays et le numéro, sans espace.
  giphyApiKey: 'qnl7ssQChTdPjsKta2Ax2LMaGXz303tq',
  commandMode: "public",
  maxStoreMessages: 20, 
  storeWriteInterval: 10000,
  description: "Bot WhatsApp Multi-Device pour la gestion de groupes et l’automatisation.",
  version: "3.0.2",
  updateZipUrl: "https://github.com/RebelleMasque/INFINIX-MD/archive/refs/heads/main.zip",
};

module.exports = settings;


// ajouté vautre prefix setting
module.exports.prefix = process.env.PREFIX || '.';

// Anti-mention de masse (suppression auto)
module.exports.antiMention = { enabled: false, threshold: 5, adminBypass: true };
//rebelle masque 💥