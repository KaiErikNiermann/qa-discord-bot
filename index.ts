
import fs = require('node:fs');
import path = require('node:path');
import { Interaction } from 'discord.js';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Client, Collection, Intents } = require('discord.js');
import dotenv = require('dotenv');
dotenv.config();

const client = new Client({ intents: [Intents.FLAGS.GUILDS, "GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES", Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });

client.commands = new Collection();

// registering commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file : string) => file.endsWith('.ts'));

for (const file of commandFiles) {

	const filePath : string = path.join(commandsPath, file);
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const command = require(filePath);
	try {
		client.commands.set(command.data.name, command);
	} catch (error) { 
		console.log(`${error}`);
	}
}

// registering and listenting to events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter((file: string) => file.endsWith('.ts'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args: Array<unknown>) => event.execute(...args));
	} else {
		client.on(event.name, (...args: Array<unknown>) => event.execute(...args));
	}
}

client.on('interactionCreate', async (interaction : Interaction) => {

	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);
	
	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});



client.login(process.env.TOKEN);//