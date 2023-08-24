import { Message } from "discord.js";
import { utils } from "../utils/utils";

module.exports = {
    name: "messageCreate",
    async execute(message: Message) {
        if (utils.isEdit(message)) {
            const question_message = await message.fetchReference();
            const question_embed = question_message.embeds[0];
            const cleaned = message.content.replace("-e ", "");

            if (utils.isMdQuestion(question_message)) {
                const cleaned_md = question_message.content
                    .split("\n")[0]
                    .concat(`\n${cleaned}`);

                await question_message.edit(cleaned_md);
            } else if (utils.isEmbedQuestion(question_embed)) {
                await question_message.edit({ embeds: [question_embed.setTitle(cleaned)] });
            } else {
                return;
            }

            utils.deleteHandler(message);
        }
    },
};
