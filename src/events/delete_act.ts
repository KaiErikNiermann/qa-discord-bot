import { Message, Interaction } from "discord.js";
import { db } from "../utils/bot/db";
import { utils } from "../utils/utils";

module.exports = {
    name: "interactionCreate",
    async execute(interaction: Interaction) {
        if (interaction.isButton()) {
            const message = interaction.message as Message;
            const user = (await utils.getUser(message)) as string;
            if (`<@${interaction.user.id}>` !== user) return;

            message.delete();

            db.deleteOne({ message_id: `${message.id}` });
        }
    },
};
