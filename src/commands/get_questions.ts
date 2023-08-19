import { SlashCommandBuilder } from "@discordjs/builders";
import { BaseCommandInteraction, CommandInteraction } from "discord.js";
import { utils } from "../utils/utils";
import { connect } from "http2";

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
                    { name: "10", value: 10 },
                    { name: "25", value: 25 },
                    { name: "50", value: 50 }
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
                .setName("answered")
                .setDescription("answered")
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
            `getting ${n} ${
                answered ? "answered" : "unanswered"
            } questions sorted by ${sort_by}`
        );

        let questions = await utils.getNQuestions(n, answered, sort_by);
        await interaction.followUp(
            questions.map((question) => {
                return `${question[0]} | ${question[1]}`
            }).join("\n")
        );
    },
};
