import { MessageEmbed, Message, MessageReaction, User } from "discord.js";
import { utils } from "../utils/utils";

module.exports = {
    name: "messageCreate",
    async execute(message: Message) {
        if (utils.isAnswer(message)) {
            const question_message = await message.fetchReference();
            let question_embed = question_message.embeds[0];
            
            if (!utils.isEmbedQuestion(question_embed)) {
                return;
            }

            const user = question_embed.fields[0].value;

            const reply_message = await utils.answerReply(message, user);

            const filter = (reaction: MessageReaction, author: User) => {
                return (
                    ["❔", "✅"].includes(reaction.emoji.name ?? "") &&
                    utils.userString(author.id) === user
                );
            }

            reply_message.awaitReactions({ filter, max: 1, time: 30000, errors: ["time"] })
                .then((collected) => {
                    const reaction: MessageReaction = collected.last() as MessageReaction;
                    if (reaction.emoji.name === "❔") {
                        reply_message.reply(`${utils.userString(message.author.id)} is still confused.`);
                        utils.deleteHandler(reply_message);
                    } else if (reaction.emoji.name === "✅") {
                        question_embed = question_embed.setColor("#00ff00");
                        question_message.edit({ embeds: [question_embed] });
                        
                        utils.addSolved(question_message.id, message.content);
                        utils.deleteHandler(reply_message);
                    } else {
                        reply_message.reply(`Invalid choice.`);
                    }
                }).catch(() => {
                    utils.noReactionHandler(question_message, reply_message);
                }); 

        }
    },
};
