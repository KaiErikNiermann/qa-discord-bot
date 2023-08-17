import { MessageEmbed, Message, MessageReaction, User } from "discord.js";
import { db_client } from "../utils/bot/db";

module.exports = {
    name: "messageCreate",
    async execute(message: Message) {
        try {
            if (
                message.type == "REPLY" &&           // message is a reply
                !message.content.startsWith(`-e`) && // message is not an edit
                !message.content.startsWith(`-d`)    // message is not a delete
            ) {
                const question_message = await message.fetchReference();
                const question_embed = question_message.embeds[0];
                const userString = (id: string) => `<@${id}>`;
                const user = question_embed.fields[0].value;
                const db = db_client.db("main_db").collection("QandA_collection");

                const reply_message = await message.reply(
                    `Hey ${user}, ${message.author.username} tried answering your question. 
                    \nIf you are still confused react with ❔otherwise react with ✅ `
                );

                reply_message.react("❔");
                reply_message.react("✅");

                const filter = (reaction: MessageReaction, author: User) => {
                    return (
                        ["❔", "✅"].includes(reaction.emoji.name ?? "") &&
                        userString(author.id) === user
                    );
                }

                reply_message.awaitReactions({ filter, max: 1, time: 30000, errors: ["time"] })
                    .then((collected) => {
                        const reaction: MessageReaction = collected.last() as MessageReaction;
                        if (reaction.emoji.name === "❔") {
                            reply_message.reply(`${userString(message.author.id)} is still confused.`);
                        } else if (reaction.emoji.name === "✅") {
                            const updated_embed = new MessageEmbed()
                                .setColor("#00ff00")
                                .setTitle(`${question_embed.title}`)
                                .setDescription(`${question_embed.description}`)
                                .addFields(question_embed.fields)

                            question_message.edit({ embeds: [updated_embed] });

                            db.updateOne(
                                { message_id: `${question_message.id}` },
                                { $set: { 
                                    answer: `${message.content}`,
                                    status: 1 
                                } }
                            )
                            
                        }
                    }).catch(() => {
                        db.findOne(
                            { message_id: `${question_message.id}` },
                        ).then((result) => {
                            if (result?.status === 1) {
                                reply_message.delete().catch(console.error);
                                return;
                            } 
                            reply_message.reply(
                                `No reaction after 10 seconds, closing question.`
                            ).then((message) => {
                                setTimeout(() => {
                                    message.delete().catch(console.error);
                                }, 60000 * 10);
                            })
                            
                        });
                    }); 

            }
        } catch (error) {
            // replied message was not a question
            return;
        }
    },
};
