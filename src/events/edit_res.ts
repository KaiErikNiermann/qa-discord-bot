import { MessageEmbed, Message } from "discord.js";
import { db_client } from "../utils/bot/db";

module.exports = {
    name: "messageCreate",
    async execute(message: Message) {
        try {
            if (message.type == "REPLY" && !message.author.bot) {
                const question_message = await message.fetchReference();
                const question_embed = question_message.embeds[0];
                const user = question_embed.fields[0].value;

                if (
                    message.content.startsWith(`-e`) &&
                    `<@${message.author.id}>` === user
                ) {
                    // create updated embed
                    const clean_msg = message.content.replace(`-e `, ``);
                    const new_embed = new MessageEmbed()
                        .setColor(`#ff0000`)
                        .setTitle(`${clean_msg}`)
                        .setDescription(
                            `to edit reply with \`-e <your updated question>\``
                        )
                        .addFields({
                            name: `question from`,
                            value: question_embed.fields[0].value,
                            inline: true,
                        });

                    question_message.edit({ embeds: [new_embed] });

                    message.delete();

                    // update db
                    await db_client
                        .db("main_db")
                        .collection("QandA_collection")
                        .updateOne(
                            { question: question_embed.title },
                            { $set: clean_msg }
                        );

                    return;
                }
            }
        } catch (error) {
            // replied message was not a question
            return;
        }
    },
};
