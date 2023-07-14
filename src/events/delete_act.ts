import { Message, Interaction } from "discord.js";
import { db_client } from "../utils/bot/db";

module.exports = {
    name: "interactionCreate",
    async execute(interaction: Interaction) {
        if (interaction.isButton()) {
            const message = interaction.message as Message;
            const question_embed = message.embeds[0];
            const user = question_embed.fields[0].value;

            if (`<@${interaction.user.id}>` !== user) return;

            message.delete();

            db_client
                .db("main_db")
                .collection("QandA_collection")
                .deleteOne({ question: `${question_embed.title}` });
        }
    },
};
