require('dotenv').config();

const { Client, Intents, MessageEmbed, MessageActionRow, MessageButton, Permissions } = require("discord.js");
const client = new Client({ intents: [ Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES ]});
const { guildId, messageId, channelId, categoryChannelId } = require('./config.json');
const { creator } = require("./embedCreate");
const token = process.env.TOKEN;

client.login(token);
client.ticket = []

client.on('ready', async (client) => {
    console.log(`Le bot est connecté en tant que ${client.user.tag}.`);
    const guild = await client.guilds.fetch(guildId);
    const channel = await guild.channels.fetch(channelId);
    //creator(channel);
});

client.on('interactionCreate', async (interaction) => {
    if(!interaction.isButton()) return;
    if(interaction.message.id === messageId){
        if(!client.ticket.includes(interaction.member.id)){
            await interaction.reply( {ephemeral: true, content: "Le ticket est en cours de création."})
            client.emit("ticketCreate", (interaction.member))
        }else {
            await interaction.reply( {ephemeral: true, content: ":x: Vous ne pouvez pas créer plusieurs ticket."})
        }
    }
    if(interaction.channel.parentId === categoryChannelId && interaction.customId === "close"){
        if(client.ticket.includes(interaction.member.id)) return await interaction.reply({ephemeral: true, content: ":x: Vous n'avez pas la permission de fermer le ticket."})
        await interaction.reply(`Le salon est en cours de suppression.`)
        if(interaction.message.mentions.members.first()) client.ticket.splice(client.ticket.indexOf(interaction.message.mentions.members.first().id), 1)
        setTimeout( function(){
            interaction.channel.delete()
        }, 2000)
        
    }
});

client.on('ticketCreate', async (member) => {
    client.ticket.push(member.id)
    const parent = await member.guild.channels.fetch(categoryChannelId);
    member.guild.channels.create(member.nickname || member.user.username, { 
        parent: parent,
        permissionOverwrites: [
            {
                id: member.id,
                allow: [ Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES ]
            },
            {
                id: "942462504246857748",
                deny: [ Permissions.FLAGS.VIEW_CHANNEL ]
            }
        ]
    })
    .then( (channel) => {
        const embed = new MessageEmbed() 
            .setDescription("Le staff sera à vous dans quelques instants. Envoyez votre candidature ici.\nPour fermer le ticket cliquer sur 🔒.")
            .setFooter({text: "BKT esport" , iconURL: "https://i.imgur.com/Xu89RO6.jpg"})
            .setColor("#8F51C5")
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setStyle("SECONDARY")
                    .setLabel("Fermer le ticket")
                    .setCustomId("close")
                    .setEmoji("🔒")
            )
        
            channel.send({ embeds: [embed], components: [row], content: `Bienvenue ${member}`})
    })
});
