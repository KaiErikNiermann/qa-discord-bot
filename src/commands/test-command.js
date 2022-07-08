const { SlashCommandBuilder } = require('@discordjs/builders');
const { Message } = require('discord.js');

module.exports = {
	name: 'test-command',
	data: new SlashCommandBuilder()
		.setName('test-command')
		.setDescription('command to test features'),
        
	async execute(interaction) {
		await interaction.reply(`hello`);
	},
};