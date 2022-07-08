import { Interaction } from "discord.js";

const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Intents } = require('discord.js');
const { token } = require('./config.json');
const {MongoClient} = require('mongodb');

const uri = "mongodb+srv://Applesauce:MgYfjblfhd0Qaz3T@cluster0.hul1v.mongodb.net/test";
const db_client = new MongoClient(uri);

// connecting to db
async function main() {
    try { await db_client.connect(); } catch (e) { console.error(e); } 
}

const client = new Client({ intents: [Intents.FLAGS.GUILDS, "GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES"] });

client.commands = new Collection();
const db_command_coll = new Collection();

let questions : Array<string> = [];

// registering commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file : any) => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	console.log(`setting ${command.data.name} for command ${command}`);
	client.commands.set(command.data.name, command);
}

// registering db_commands
const db_commandsPath = path.join(__dirname, 'db_commands');
const db_commandFiles = fs.readdirSync(db_commandsPath).filter((file : any) => file.endsWith('.js'));

for (const file of db_commandFiles) {
	const filePath = path.join(db_commandsPath, file);
	console.log(`new path ${filePath}`);
	const command = require(filePath);

	console.log(`setting ${command.name} for command ${command}`);
	db_command_coll.set(command.name, command);
}

// registering events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter((file: any) => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args: any) => event.execute(...args));
	} else {
		client.on(event.name, (...args: any) => event.execute(...args));
	}
}


client.on('interactionCreate', async (interaction : any) => {

	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);
	const db_command = db_command_coll.get('create');
	
	if (!command) return;

	try {
		let res = await command.execute(interaction);
		if (interaction.commandName == 'echo') {
			await db_command.execute(db_client, {
				question: `${res}`,
				status: 0
			});
		} 

	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

main().catch(console.error);

client.login(token);