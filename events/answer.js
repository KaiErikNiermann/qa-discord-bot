const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Message } = require('discord.js');
const { db_client, db_command_coll } = require('../index.js')

// TODO - implement latex system from https://editor.codecogs.com/docs/

module.exports = {
    name: 'messageCreate',
	async execute(message) {
        try {
            if (message.type = 'REPLY' && message.author.bot == false) {
                const question_message = await message.fetchReference();
                let question_embed = question_message.embeds[0];
                const user = question_embed.fields[0].value;
                
                // edit embed
                if (message.content.startsWith(`-e`) && `<@${message.author.id}>` === user) {
                    const raw_msg = message.content;
                    const clean_msg = raw_msg.replace(`-e `, ``);
                    const new_embed = new MessageEmbed()
                        .setColor(`#ff0000`)
                        .setTitle(`${clean_msg}`)
                        .setDescription(`to edit/delete do -e`)
                        .addField(`question from`, question_embed.fields[0].value, true)
    
                    question_message.edit({ embeds: [ new_embed ] });
                    const update_entry = db_command_coll.get('update');
                    update_entry.execute(db_client, question_embed.title, {
                        question: `${clean_msg}`,
                    });
    
                    return;
                }
    
                // delete embed
                if (message.content.startsWith(`-d`) && `<@${message.author.id}>` === user) {
                    question_message.delete(); 
                    message.delete();
                    return;
                }
                
                // answering embed question
                const bot_reply = await message.reply(`Hey ${user}, ${message.author.username} tried answering your question. \nIf you are still confused react with ❔otherwise react with ✅ `);
                bot_reply.react(`❔`);
                bot_reply.react(`✅`);
    
                const filter = (reaction, author) => {
                    return ['❔', '✅'].includes(reaction.emoji.name) && `<@${author.id}>` === user;
                };
    
                bot_reply.awaitReactions({ filter, max: 1, time: 60000, errors: ['time'] })
                    .then(collected => {
                        const reaction = collected.first();
    
                        if (reaction.emoji.name === '✅') {
    
                            // updating db with an answer
                            const update_entry = db_command_coll.get('update');
                            update_entry.execute(db_client, question_embed.title, {
                                answer: `${message.content}`, 
                                status: 1 // solved
                            });
    
                        } else {
                            bot_reply.reply(`<@${message.author.id}>, ${user} needs more help`);
                        }
    
                    })
                    .catch(collected => {
                        bot_reply.reply('User did not react');
                    });
            } 
        } catch (error) {
            // replied message was not a question
            return;
        }
	},
};