import { Message } from "discord.js";
import { utils } from "../utils/utils";
import { db } from "../utils/bot/db";

module.exports = {
    name: "messageUpdate",
    async execute(old_message: Message, new_message: Message) {
        if (!(old_message.content.startsWith("-q") || new_message.content.startsWith("-q"))) return;

        db.updateOne(
            { message_id: old_message.id },
            { $set: {
                question: new_message.content
            }}
        )
    },
};
