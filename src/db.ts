import { MongoClient } from "mongodb";
import fs from "node:fs";
import path from "node:path";
import { AnyChannel, Collection, TextChannel } from "discord.js";
import { client } from "./index";

const uri = `${process.env.DB_CONNECT}`;
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
const db_commandsPath: string = path.join(__dirname, "db_utils");
const db_commandFiles: string[] = fs
    .readdirSync(db_commandsPath)
    .filter((file: string) => file.endsWith(".ts"));

db_commandFiles.forEach((file: string) => {
    const filePath = path.join(db_commandsPath, file);
    const command: db_command = require(filePath);
    db_command_coll.set(command.name, command);
});

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
        if (message_id === undefined || message_id === null || message_id === "") {
            console.error("message_id not found");
            return;
        }

        channel.messages
            .fetch(message_id)
            .then((message) => {
                message.reply(`${change.fullDocument?.answer}`)
            })
            .catch((error) => {
                console.error(error);
            });
    }
});

export { db_command_coll, db_command };

main().catch(console.error);
