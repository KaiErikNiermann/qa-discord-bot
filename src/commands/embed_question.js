const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Message } = require('discord.js');

module.exports = {
    name: 'echo',
	data: new SlashCommandBuilder()
        .setName('echo')
        .setDescription('Replies with your input!')
        .addStringOption(option =>
            option.setName('input')
                .setDescription('The input to echo back')
                .setRequired(true)),

	async execute(interaction) {
        const myString = interaction.options.getString('input');

        const questionEmbed = new MessageEmbed()
            .setColor('#ff0000')
            .setTitle(`question: ${myString}`)

		await interaction.reply({ embeds: [questionEmbed] }).then(() => {
                const filter = m => m.content.includes(`a`);
                const collector = interaction.channel.createMessageCollector({filter, time: 5000, max: 5});

                collector.on('collect', m => {
                    console.log(`collected ${m.content}`);
                });

                collector.on('end', collected => {
                    console.log(`collected ${collected.size} items`);
                });
            });

        return myString;
	},
};