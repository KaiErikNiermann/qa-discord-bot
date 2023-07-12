import { MongoClient } from "mongodb";
import fs from "node:fs";
import path from "node:path";
import { AnyChannel, Collection, TextChannel } from "discord.js";
import { client } from "./index";

const uri = `${process.env.DB_CONNECT}`;
console.log(uri);
const db_client: MongoClient = new MongoClient(uri);

// connecting to db
async function main(): Promise<void> {
    try {
        await db_client.connect();
    } catch (e) {
        console.error(e);
    }
}

const db_command_coll = new Collection<string, db_command>();

export { db_client };

// registering db_commands
const db_commandsPath: string = path.join(__dirname, "utils");
const db_commandFiles: string[] = fs
    .readdirSync(db_commandsPath)
    .filter((file: string) => file.endsWith(".ts"));

for (const file of db_commandFiles) {
    const filePath = path.join(db_commandsPath, file);
    const command: db_command = require(filePath);
    db_command_coll.set(command.name, command);
}

const change_stream = db_client
    .db("main_db")
    .collection("QandA_collection")
    .watch([], { fullDocument: "updateLookup" });

change_stream.on("change", (change) => {
    if (change.operationType === "update") {
        console.log("Changed entry:", change.fullDocument);
        
        const channel: TextChannel = client.channels.cache.get(
            change.fullDocument?.channel_id
        ) as TextChannel;

        const message_id = change.fullDocument?.message_id;
        console.log(message_id);

        channel.messages.fetch(message_id).then((message) => {
            message.reply(`${change.fullDocument?.answer}`);    
            // emit messageCreate event
            // client.emit("messageCreate", message);
        }).catch((error) => {
            console.error(error);
        });

    }
});

export { db_command_coll, db_command };

main().catch(console.error);
