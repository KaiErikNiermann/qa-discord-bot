import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed, CommandInteraction } from "discord.js";
import { db } from "../utils/bot/db";
import { utils } from "../utils/utils";

module.exports = {
    name: "question",
    data: new SlashCommandBuilder()
        .setName("question")
        .setDescription("publishes your question")
        .addStringOption((option) =>
            option
                .setName("input")
                .setDescription("input your question")
                .setRequired(true)
        ),

    async execute(interaction: CommandInteraction) {
        const user_question = interaction.options.getString("input");

        // create question embed and reply to user
        const questionEmbed = new MessageEmbed()
            .setColor("#ff0000")
            .setTitle(`${user_question}`)
            .setDescription(`to edit reply with \`-e <your updated question>\``)
            .addFields({
                name: "question from",
                value: `<@${interaction.user.id}>`,
                inline: true,
            });


        await interaction.reply({
            embeds: [questionEmbed],
            components: [utils.deleteButton()],
        });

        const message = await interaction.fetchReply();

        const inserted_id = await utils.insertQuestion(
            `${user_question}`,
            `${interaction.guildId}`,
            `${interaction.channelId}`,
            `${message.id}`
        );

        console.log("inserted id: ", inserted_id.insertedId);
    },
};