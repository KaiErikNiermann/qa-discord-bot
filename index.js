"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db_command_coll = exports.db_client = void 0;
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Intents } = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();
const { MongoClient } = require('mongodb');
const uri = "***REMOVED***";
const db_client = new MongoClient(uri);
exports.db_client = db_client;
// connecting to db
async function main() {
    try {
        await db_client.connect();
    }
    catch (e) {
        console.error(e);
    }
}
const client = new Client({ intents: [Intents.FLAGS.GUILDS, "GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES", Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });
client.commands = new Collection();
const db_command_coll = new Collection();
exports.db_command_coll = db_command_coll;
let questions = [];
// registering commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    console.log(`registered ${command.data.name}`);
    client.commands.set(command.data.name, command);
}
// registering db_commands
const db_commandsPath = path.join(__dirname, 'db_commands');
const db_commandFiles = fs.readdirSync(db_commandsPath).filter((file) => file.endsWith('.js'));
for (const file of db_commandFiles) {
    const filePath = path.join(db_commandsPath, file);
    const command = require(filePath);
    db_command_coll.set(command.name, command);
}
// registering events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));
for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    }
    else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand())
        return;
    const command = client.commands.get(interaction.commandName);
    const create_entry = db_command_coll.get('create');
    if (!command)
        return;
    try {
        await command.execute(interaction);
    }
    catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});
main().catch(console.error);
client.login(process.env.TOKEN); //
