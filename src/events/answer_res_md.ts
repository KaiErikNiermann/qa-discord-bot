import { MessageEmbed, Message, MessageReaction, User } from "discord.js";
import { db_client } from "../utils/bot/db";

module.exports = {
    name: "messageCreate",
    async execute(message: Message) {
        if (
            message.type === "REPLY" &&
            !message.content.startsWith("-e") &&
            !message.content.startsWith("-d")
        ) {
            

        }
    },
};
