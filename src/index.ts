import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { Client, Collection, Intents } from "discord.js";
dotenv.config();

export const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.DIRECT_MESSAGES,
    ],
});

const command_collection: Collection<string, command> = new Collection<
    string,
    command
>();

const loadCommands = (commandsPath: string) => {
    const commandFiles = fs
        .readdirSync(commandsPath)
        .filter((file) => file.endsWith(".ts"));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const new_command: command = require(filePath);
        try {
            command_collection.set(new_command.name, new_command);
        } catch (error) {
            console.error(error);
        }
    }
};

const loadEvents = (eventsPath: string) => {
    const eventFiles = fs
        .readdirSync(eventsPath)
        .filter((file) => file.endsWith(".ts"));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);

        if (event.once) {
            client.once(event.name, (...args: unknown[]) =>
                event.execute(...args)
            );
        } else {
            client.on(event.name, (...args: unknown[]) =>
                event.execute(...args)
            );
        }
    }
};

// listen for interactions
const registerInteractions = () => {
    client.on("interactionCreate", async (interaction) => {
        if (!interaction.isCommand()) return;

        const curr_command = command_collection.get(interaction.commandName);
        try {
            curr_command?.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: "There was an error while executing this command!",
                ephemeral: true,
            });
        }
    });
};

// setup bot
const startBot = () => {
    const commandsPath = path.join(__dirname, "commands");
    const eventsPath = path.join(__dirname, "events");

    loadEvents(eventsPath);
    loadCommands(commandsPath);
    registerInteractions();
};

startBot();

client.login(process.env.TOKEN).catch(console.error);
