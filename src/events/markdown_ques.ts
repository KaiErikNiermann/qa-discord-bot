import { Message } from "discord.js";

module.exports = {
    name: "messageCreate",
    async execute(message: Message) {
        if (message.content.startsWith("-q")) {
            const content = message.content.slice(3);
            const attachments = message.attachments.toJSON();

            console.log(attachments);

            await message.delete()

            await message.channel.send({
                files: attachments.map((attachment) => attachment.proxyURL),
                content: `**<@${message.author.id}>** asked: \n${content}`
            });
        }
    }

}