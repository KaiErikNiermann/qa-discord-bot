import { MessageEmbed, Message, MessageReaction, User } from "discord.js";
import { db_client, db_command_coll } from "../db";

module.exports = {
    name: "messageCreate",
    async execute(message: Message) {
        try {
            if (
                message.type == "REPLY" && // message is a reply
                !message.content.startsWith(`-e`) && // message is not an edit
                !message.content.startsWith(`-d`) // message is not a delete
            ) {
                const question_message = await message.fetchReference();
                const question_embed = question_message.embeds[0];
                const user = question_embed.fields[0].value;

                // answering embed question
                const bot_reply = await message.reply(
                    `Hey ${user}, ${message.author.username} tried answering your question. 
                    \nIf you are still confused react with ❔otherwise react with ✅ `
                );

                bot_reply.react(`❔`);
                bot_reply.react(`✅`);

                const colletionFilter = (
                    reaction: MessageReaction,
                    author: User
                ) => {
                    const emoji_name: string = reaction.emoji.name ?? ""; // default value in case of null
                    return (
                        ["❔", "✅"].includes(emoji_name) &&
                        `<@${author.id}>` === user
                    );
                };

                // update db with answer by matching question
                db_client
                    .db("main_db")
                    .collection("QandA_collection")
                    .updateOne(
                        { question: question_embed.title },
                        {
                            $set: {
                                answer: `${message.content}`,
                            },
                        }
                    );

                bot_reply
                    .awaitReactions({
                        filter: colletionFilter,
                        max: 1,
                        time: 60000,
                        errors: ["time"],
                    })
                    .then((collected) => {
                        const reaction: MessageReaction =
                            collected.first() as MessageReaction;

                        if (reaction.emoji.name === "✅") {
                            console.log("user is satisfied");

                            // setting embed color to green to indicate solved
                            const new_embed = new MessageEmbed()
                                .setColor(`#00ff00`)
                                .setTitle(`${question_embed.title}`)
                                .setDescription(
                                    `to edit reply with \`-e <your updated question>\``
                                )
                                .addFields({
                                    name: `question from`,
                                    value: question_embed.fields[0].value,
                                    inline: true,
                                });

                            question_message.edit({ embeds: [new_embed] });

                            // update db with answer by matching question
                            db_client
                                .db("main_db")
                                .collection("QandA_collection")
                                .updateOne(
                                    { question: question_embed.title },
                                    {
                                        $set: {
                                            status: 1,
                                        },
                                    }
                                );
                        } else {
                            bot_reply.reply(
                                `<@${message.author.id}>, ${user} needs more help`
                            );
                        }
                    })
                    .catch(() => {
                        bot_reply.reply(
                            "User did not react, question is closed"
                        );
                    });
            }
        } catch (error) {
            // replied message was not a question
            return;
        }
    },
};
