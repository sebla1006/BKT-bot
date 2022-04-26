const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");

/**
 * Fontion qui envoie l'embed ticket dans le channel
 * @param { guildTextChannel } channel Le salon du où l'embed sera envoyé
 */

const creator = ( channel ) => {
    const embed = new MessageEmbed()
        .setTitle("Recrutement")
        .setDescription("Pour créer un ticket réagissez avec ✉️.")
        .setFooter({text: "BKT esport" , iconURL: "https://i.imgur.com/Xu89RO6.jpg"})
        .setColor("#8F51C5");

    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setStyle("SECONDARY")
                .setLabel("Créer un ticket")
                .setCustomId("ticket")
                .setEmoji("✉️")
        );
            
    channel.send( {embeds: [embed], components: [row]} );
}

module.exports = {
    creator
}