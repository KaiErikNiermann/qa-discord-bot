import { Message } from "discord.js";
import { utils } from "../utils/utils";

module.exports = {
    name: "messageCreate",
    async execute(message: Message) {
        if (message.content.startsWith("-q")) {
            const content = message.content.slice(3);
            const attachments: string[] = message.attachments
                .toJSON()
                .map((attachment) => attachment.url);

            const manager_message = await message.reply(
                `Question from ${utils.userString(message.author.id)}\n`
            );

            await utils.insertQuestion(
                `${message.author.id}\n${content}\n${attachments.join("\n")}`,
                `${message.guildId}`,
                `${message.channelId}`,
                `${message.id}`,
                `${manager_message.id}`
            );
        }
    },
};
