/* eslint-disable @typescript-eslint/no-var-requires */
import fs from "node:fs";
import path from "node:path";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";

import dotenv from "dotenv";
dotenv.config();

const commands: any[] = [];
const commandsPath = path.join(__dirname, "../../commands");
const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".ts"));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const new_command: command = require(filePath);
    commands.push(new_command.data.toJSON());
}

const myToken: string = process.env.TOKEN ?? "0";
const guild_id: string = process.env.GUILD_ID ?? "0";
const client_id: string = process.env.CLIENT_ID ?? "0";

const rest = new REST({ version: "9" }).setToken(myToken);

rest.put(Routes.applicationGuildCommands(client_id, guild_id), {
    body: commands,
})
    .then(() => {
        console.log("Successfully registered application commands.");
        process.exit(0);
    })
    .catch(console.error);
