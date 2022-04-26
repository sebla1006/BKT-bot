require('dotenv').config();

const { Client, Intents, MessageEmbed, MessageActionRow, MessageButton, Permissions } = require("discord.js");
const client = new Client({ intents: [ Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGES ]});
const { guildId, messageId, channelId, categoryChannelId } = require('./config.json');
const { creator } = require("./embedCreate");
const token = process.env.TOKEN;

client.login(token);
client.ticket = [];

client.on('ready', async (client) => {
    console.log(`Le bot est connecté en tant que ${client.user.tag}.`);
    /*
    const guild = await client.guilds.fetch(guildId);
    const channel = await guild.channels.fetch(channelId);
    creator(channel);*/
});

client.on('interactionCreate', async (interaction) => {
    if(!interaction.isButton()) return;

    if(interaction.message.id === messageId){

        if(!client.ticket.includes(interaction.member.id)){

            await interaction.reply( {ephemeral: true, content: "Le ticket est en cours de création."});
            client.emit("ticketCreate", (interaction.member))

        }else {

            await interaction.reply( {ephemeral: true, content: ":x: Vous ne pouvez pas créer plusieurs ticket."});

        }
    }


    if(interaction.channel.parentId === categoryChannelId && interaction.customId === "close"){

        if(client.ticket.includes(interaction.member.id) && !interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return await interaction.reply({ephemeral: true, content: ":x: Vous n'avez pas la permission de fermer le ticket."});
        await interaction.reply(`Le salon est en cours de suppression.`);
        client.ticket.splice(client.ticket.indexOf(interaction.message.mentions.members.first().id), 1);
        setTimeout( function(){
            interaction.channel.delete();
        }, 2000);
        
    }
});

client.on('ticketCreate', async (member) => {

    client.ticket.push(member.id);
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
            },
            { 
                id: "942492012870004747",
                allow: [ Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES ]
            },
            {
                id: "942475760092987442",
                allow: [ Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES ]
            },
            {
                id: "968488785228726354",
                allow: [ Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES ]
            },
            {
                id: "961348598904258631",
                allow: [ Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES ]
            }
        ]
    })
    .then( (channel) => {
        const embed = new MessageEmbed() 
            .setDescription("Le staff sera à vous dans quelques instants. Envoyez votre candidature ici.\nPour fermer le ticket cliquer sur 🔒.")
            .setFooter({text: "BKT esport" , iconURL: "https://i.imgur.com/Xu89RO6.jpg"})
            .setColor("#8F51C5");
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setStyle("SECONDARY")
                    .setLabel("Fermer le ticket")
                    .setCustomId("close")
                    .setEmoji("🔒")
            );
        
            channel.send({ embeds: [embed], components: [row], content: `Bienvenue ${member}`});
    })
});


client.on("messageCreate", async (message) => {

    if(message.channel.parentId === categoryChannelId) {
        
        if(message.content.includes("Pourquoi vous ?") && message.content.includes("Pourquoi choisir B-K-T E-Sports ?")){
            let trackerError = false;
            if(!message.content.includes("https://rocketleague.tracker.network/")) trackerError = true;
            message.reply(`Bonjour !\nVotre candidature a bien été reçu. L'équipe du staff se chargera de répondre le plus rapidement possible.\nUne fois la réponse donnée vous partiperez à une phase de test. Retrouvez toutes les informations ici : <#944601072276766770>${trackerError ? "\n(Ps: Votre message ne contient pas de tracker, pour voir votre tracker rendez vous sur le site, entrez votre nom d'utilisateur et prenez le lien puis coller le ici ! (site : https://rocketleague.tracker.network/ )": ""}\n\nMerci de votre patiente,\nPassez une bonne journée`);
        }

    }else if(message.content.startsWith("!new")){

        if(message.member.permissions.has("ADMINISTRATOR")){

            const member = message.mentions.members.first();
            if(!member) return message.channel.send(`:x: Vous n'avez pas mentioner de membre.`);

            message.channel.send("Veuillez envoyez le rang du membre.");
            await message.channel.awaitMessages({time: 180_000, errors: ['time'], filter: m=>m.author===message.author, max:1})
             .then( async (mess) => {
                let rang = mess.first().content;

                const channel = await message.guild.channels.fetch("942903458724470824");
                channel.send(`Bienvenue dans la team ${member}, vous rejoignez la team en tant que **${rang}**.`);
                message.channel.send(`:white_check_mark: Le message a bien été envoyé.`)
             })
             .catch(error => {
                 console.log(error);
                 message.channel.send(`:x: Vous avez mis top de temps à répondre.`);
             })

        }

    }
});