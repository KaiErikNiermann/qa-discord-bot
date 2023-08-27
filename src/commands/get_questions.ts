import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { utils } from "../utils/utils";

module.exports = {
    name: "get-questions",
    data: new SlashCommandBuilder()
        .setName("get-questions")
        .setDescription("get question links")
        .addNumberOption((option) =>
            option
                .setName("question-number")
                .setDescription("number of questions to get")
                .setRequired(true)
                .addChoices(
                    { name: "1", value: 1 },
                    { name: "5", value: 5 },
                    { name: "10", value: 10 },
                )
        )
        .addStringOption((option) =>
            option
                .setName("sort-by")
                .setDescription("sort by")
                .addChoices(
                    { name: "newest", value: "newest" },
                    { name: "oldest", value: "oldest" }
                )
        )
        .addNumberOption((option) =>
            option
                .setName("status")
                .setDescription("status of question")
                .addChoices(
                    { name: "answered", value: 1 },
                    { name: "unanswered", value: 0 },
                    { name: "both", value: 2 }
                )
        ),

    async execute(interaction: CommandInteraction) {
        const n = interaction.options.getNumber("question-number") ?? 10;
        const answered = interaction.options.getNumber("answered") ?? 0;
        const sort_by = interaction.options.getString("sort-by") ?? "newest";

        await interaction.reply(
            `getting ${n} ${answered ? "answered" : "unanswered"
            } questions sorted by ${sort_by}`
        )
        
        // TODO - maybe use embeds for this 
        const questions = await utils.getNQuestions(n, answered, sort_by);
        await interaction.followUp(
            questions
                .map((question) => {
                    const status = parseInt(question[2]) === 1 ? "✅ answered" : "❔ unanswered";
                    return [
                        `### ${status}`,
                        `Q: ${question[3].split('\n')[1].slice(0, 20)}...[see more](${question[0]})\n`,
                        `${question[0]} | ${question[1]}`
                    ].join("\n");
                })
                .join("\n")
        );
    },
};
