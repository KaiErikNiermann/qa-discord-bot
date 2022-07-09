const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Message } = require('discord.js');
const { db_client, db_command_coll } = require('../index.js');

module.exports = {
    name: 'question',
	data: new SlashCommandBuilder()
        .setName('question')
        .setDescription('publishes your question')
        .addStringOption(option =>
            option.setName('input')
                .setDescription('input your question')
                .setRequired(true)),

	async execute(interaction) {
        const myString = interaction.options.getString('input');

        // create question embed and reply to user
        const questionEmbed = new MessageEmbed()
            .setColor('#ff0000')
            .setTitle(`${myString}`)
            .setDescription(`to edit/delete do \`-e <your updated question>\``)
            .addField(`question from`, `<@${interaction.user.id}>`, true)

		await interaction.reply({ embeds: [questionEmbed] });

        // create db entry
        const create_entry = db_command_coll.get('create');
        await create_entry.execute(db_client, {
            question: `${myString}`,
            status: 0
        });

	},
};