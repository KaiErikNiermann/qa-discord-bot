import { SlashCommandBuilder } from "@discordjs/builders";
import {
    MessageEmbed,
    CommandInteraction,
    MessageActionRow,
    MessageButton,
} from "discord.js";
import { db_client } from "../utils/bot/db";

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

        const questionEntry: db_listing = {
            question: `${user_question}`,
            answer: "",
            status: 0,
            guild_id: `${interaction.guildId}`,
            channel_id: `${interaction.channelId}`,
            message_id: "",
        };

        const deleteButton = new MessageActionRow().setComponents(
            new MessageButton() // Create the button inside of an action Row
                .setCustomId("delete_button")
                .setLabel("delete")
                .setStyle("PRIMARY")
        );

        await interaction.reply({
            embeds: [questionEmbed],
            components: [deleteButton],
        });

        const message = await interaction.fetchReply();
        questionEntry.message_id = message.id;

        // add question to db
        const inserted_id = await db_client
            .db("main_db")
            .collection<db_listing>("QandA_collection")
            .insertOne(questionEntry);

        console.log("inserted id: ", inserted_id.insertedId);
    },
};
