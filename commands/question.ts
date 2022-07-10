import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed , CommandInteraction } from 'discord.js';
// eslint-disable-next-line @typescript-eslint/no-var-requires
import { db_client, db_command_coll } from '../db'

module.exports = {
    name: 'question',
	data: new SlashCommandBuilder()
        .setName('question')
        .setDescription('publishes your question')
        .addStringOption(option =>
            option.setName('input')
                .setDescription('input your question')
                .setRequired(true)),

	async execute(interaction: CommandInteraction) {
        const myString = interaction.options.getString('input');

        // create question embed and reply to user
        const questionEmbed = new MessageEmbed()
            .setColor('#ff0000')
            .setTitle(`${myString}`)
            .setDescription(`to edit/delete do \`-e <your updated question>\``)
            .addField(`question from`, `<@${interaction.user.id}>`, true)

		await interaction.reply({ embeds: [questionEmbed] });

        // create db entry
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const create_entry: any = db_command_coll.get('create');
        await create_entry.execute(db_client, {
            question: `${myString}`,
            status: 0
        });

	},
};