import { SlashCommandBuilder } from '@discordjs/builders';
import { BaseCommandInteraction } from 'discord.js';

module.exports = {
	name: 'test-command',
	data: new SlashCommandBuilder()
		.setName('test-command')
		.setDescription('command to test features'),
        
	async execute(interaction: BaseCommandInteraction) {
		await interaction.reply(`hello`);
	},
};