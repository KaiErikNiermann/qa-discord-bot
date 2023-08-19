import { Message } from "discord.js";
import { utils } from "../utils/utils";

module.exports = {
    name: "messageCreate",
    async execute(message: Message) {
        if (message.content.startsWith("-q")) {
            const content = message.content.slice(3);
            const attachments = message.attachments.toJSON();

            await message.delete()

            const question_message = await message.channel.send({
                files: attachments.map((attachment) => attachment.proxyURL),
                content: `Question from <@${message.author.id}> \n${content}`,
                components: [utils.deleteButton()]
            });

            utils.insertQuestion(
                question_message.content,
                `${question_message.guildId}`,
                `${question_message.channelId}`,
                `${question_message.id}`
            )
        }
    }

}