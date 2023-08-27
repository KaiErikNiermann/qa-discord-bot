import { Message, Interaction } from "discord.js";
import { db } from "../utils/bot/db";
import { utils } from "../utils/utils";

module.exports = {
    name: "interactionCreate",
    async execute(interaction: Interaction) {
        if (
            interaction.isButton() &&
            interaction.customId === "delete_button"
        ) {
            const message = interaction.message as Message;
            const user = (await utils.getUser(message)) as string;
            if (`<@${interaction.user.id}>` !== user) return;

            message.delete();

            db.deleteOne({ message_id: `${message.id}` });
        } else if (
            interaction.isButton() &&
            interaction.customId === "copy_button"
        ) {
            const question_message = (
                interaction.message as Message
            ).content.split("\n---")[1];
            interaction.reply({ content: question_message, ephemeral: true });
        } else {
            return;
        }
    },
};
