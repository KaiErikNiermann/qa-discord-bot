import { MongoClient } from 'mongodb';
import fs = require('node:fs');
import path = require('node:path');
import { Collection } from 'discord.js';

const uri = "***REMOVED***";
const db_client = new MongoClient(uri);

// connecting to db
async function main(): Promise<void> {
    try { await db_client.connect(); } catch (e) { console.error(e); } 
}

const db_command_coll = new Collection();

export { db_client };

// registering db_commands
const db_commandsPath = path.join(__dirname, 'db_commands');
const db_commandFiles = fs.readdirSync(db_commandsPath).filter((file : string) => file.endsWith('.ts'));

for (const file of db_commandFiles) {
	const filePath = path.join(db_commandsPath, file);
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const command = require(filePath);
	db_command_coll.set(command.name, command);
}

export { db_command_coll };

main().catch(console.error);