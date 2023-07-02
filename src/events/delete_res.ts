import { MessageEmbed, Message, MessageReaction, User } from "discord.js";
import { db_client, db_command_coll } from "../db";

module.exports = {
    name: "messageCreate",
    async execute(message: Message) {
        try {
            if (message.type == "REPLY" && !message.author.bot) {
                const question_message = await message.fetchReference();
                const question_embed = question_message.embeds[0];
                const user = question_embed.fields[0].value;

                // delete embed
                if (
                    message.content.startsWith(`-d`) &&
                    `<@${message.author.id}>` === user
                ) {
                    // delete embed
                    question_message.delete();
                    message.delete();

                    // delete entry from db
                    db_client
                        .db("main_db")
                        .collection("QandA_collection")
                        .deleteOne({ question: `${question_embed.title}` });

                    return;
                }
            }
        } catch (error) {
            // replied message was not a question
            return;
        }
    },
};
