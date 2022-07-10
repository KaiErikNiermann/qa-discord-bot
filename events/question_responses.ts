import { MessageEmbed, Message, MessageReaction, User } from 'discord.js';
/* eslint-disable @typescript-eslint/no-var-requires */
import { db_client, db_command_coll } from '../db'

// TODO - implement latex system from https://editor.codecogs.com/docs/

module.exports = {
    name: 'messageCreate',
	async execute(message: Message) {
        try {
            if (message.type == 'REPLY' && message.author.bot == false) {
                const question_message = await message.fetchReference();
                const question_embed = question_message.embeds[0];
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

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const update_entry: any = db_command_coll.get('update');
                    update_entry.execute(db_client, question_embed.title, {
                        question: `${clean_msg}`,
                    });
    
                    return;
                }
    
                // delete embed
                if (message.content.startsWith(`-d`) && `<@${message.author.id}>` === user) {
                    question_message.delete(); 
                    message.delete();

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const delete_entry: any = db_command_coll.get('delete');
                    delete_entry.execute(db_client, {
                        question: `${question_embed.title}`,
                    });

                    return;
                }
                
                // answering embed question
                const bot_reply = await message.reply(`Hey ${user}, ${message.author.username} tried answering your question. \nIf you are still confused react with ❔otherwise react with ✅ `);
                bot_reply.react(`❔`);
                bot_reply.react(`✅`);
    
                const filter = (reaction: MessageReaction, author: User) => {
                    const emoji_name : string = reaction.emoji.name ?? ''; // default value in case of null
                    return ['❔', '✅'].includes(emoji_name) && `<@${author.id}>` === user;
                };
    
                bot_reply.awaitReactions({ filter, max: 1, time: 600000, errors: [ 'time' ]})
                    .then(collected => {
                        const reaction : MessageReaction = collected.first() as MessageReaction;
    
                        if (reaction.emoji.name === '✅') {
                        
                            // setting embed color to green to indicate solved
                            const new_embed = new MessageEmbed()
                                .setColor(`#00ff00`)
                                .setTitle(`${question_embed.title}`)
                                .setDescription(`to edit/delete do -e`)
                                .addField(`question from`, question_embed.fields[0].value, true)
                            question_message.edit({ embeds: [ new_embed ] });

                            // updating db with an answer
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const update_entry: any = db_command_coll.get('update');
                            update_entry.execute(db_client, question_embed.title, {
                                answer: `${message.content}`, 
                                status: 1 // solved
                            });
            
                        } else {
                            bot_reply.reply(`<@${message.author.id}>, ${user} needs more help`);
                        }
    
                    })
                    .catch( () => {
                        bot_reply.reply('User did not react');
                    });

            } 
        } catch (error) {
            // replied message was not a question
            return;
        }
	},
};