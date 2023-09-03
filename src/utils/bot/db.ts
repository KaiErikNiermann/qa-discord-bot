/* eslint-disable @typescript-eslint/no-var-requires */
import { MongoClient } from "mongodb";
import fs from "node:fs";
import path from "node:path";
import { Collection, TextChannel } from "discord.js";
import { client } from "../../index";

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

const db = db_client.db("main_db").collection("QandA_collection");

export { db_client, db };

const change_stream = db_client
    .db("main_db")
    .collection("QandA_collection")
    .watch([], { fullDocument: "updateLookup" });

change_stream.on("change", (change) => {
    if (change.operationType === "update") {
        if (change.fullDocument?.status === 1) return;        

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

export { db_command };

main().catch(console.error);
