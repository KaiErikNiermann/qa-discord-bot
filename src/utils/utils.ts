import { InsertOneResult } from "mongodb";
import { db } from "./bot/db";
import {
    Message,
    MessageEmbed,
    MessageActionRow,
    MessageButton,
} from "discord.js";

class utils {
    public static getFormattedDate(date: Date): string {
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    }

    public static userString(id: string): string {
        return `<@${id}>`;
    }

    public static isAnswer(message: Message): Boolean {
        return message.type === "REPLY" && !message.content.startsWith("-e");
    }

    public static isMdQuestion(message: Message): Boolean {
        return message.content.startsWith("Question from");
    }

    public static isEdit(message: Message): Boolean {
        return (
            message.type === "REPLY" &&
            message.content.startsWith("-e") &&
            !message.author.bot
        );
    }

    public static removePrefix(message: Message): string {
        return message.content.slice(3);
    }

    public static async answerReply(
        message: Message,
        user: string
    ): Promise<Message<boolean>> {
        const reply_message = await message.reply(
            `Hey ${user}, ${message.author.username} tried answering your question. 
            \nIf you are still confused react with ❔ otherwise react with ✅.`
        );

        reply_message.react("❔");
        reply_message.react("✅");

        return reply_message;
    }

    public static isEmbedQuestion(question_embed: MessageEmbed): Boolean {
        try {
            if (question_embed.fields[0].name !== "question from") {
                return false;
            }
        } catch (error) {
            return false;
        }

        return true;
    }

    public static noReactionHandler(
        question_message: Message<boolean>,
        reply_message: Message<boolean>
    ): void {
        db.findOne({ message_id: `${question_message.id}` }).then((result) => {
            // Question was already answered
            if (result?.status === 1) {
                reply_message.delete().catch(console.error);
                return;
            }
            // User did not respond in time
            reply_message
                .reply(`No reaction after 10 seconds, closing question.`)
                .then((message) => {
                    setTimeout(() => {
                        message.delete().catch(console.error);
                    }, 60000 * 10);
                });
        });
    }

    public static async addSolved(id: string, answer: string): Promise<void> {
        let arr = (await db.findOne({ message_id: id }))?.answer ?? [];

        await db.updateOne(
            { message_id: id },
            {
                $set: {
                    answers: [...arr, answer],
                    status: 1,
                },
            }
        );
    }

    public static deleteButton() {
        return new MessageActionRow().setComponents(
            new MessageButton()
                .setCustomId("delete_button")
                .setLabel("delete")
                .setStyle("PRIMARY")
        );
    }

    public static async deleteHandler(message: Message) {
        try {
            await message.delete();
        } catch (error) {
            console.error(`There was an error deleting the message: ${error}`);
        }
    }

    public static async getUser(message: Message): Promise<string | undefined> {
        const question_embed = message.embeds[0];

        if (utils.isMdQuestion(message)) {
            return message.content.split("\n")[0].split(" ")[2];
        } else if (utils.isEmbedQuestion(question_embed)) {
            return question_embed.fields[0].value;
        }
    }

    public static async insertQuestion(
        question: string,
        guildId: string,
        channelId: string,
        messageId: string
    ): Promise<InsertOneResult<Document>> {
        console.log(`inserted question with ID ${messageId}`);
        return await db.insertOne({
            question: question,
            answers: [],
            status: 0,
            guild_id: guildId,
            channel_id: channelId,
            message_id: messageId,
        });
    }

    public static async getNQuestions(
        n: number,
        answered: number,
        sort_by: string
    ): Promise<string[][]> {
        const results = (
            await db
                .find(
                    {
                        status:
                            answered === 1
                                ? 0
                                : answered === 0
                                ? 1
                                : { $in: [1, 0] },
                    },
                    {
                        limit: n,
                        projection: {
                            _id: 0,
                        },
                    }
                )
                .toArray()
        ).sort((a, b) => {
            const timestampA = Date.parse(
                utils.deconstruct(parseInt(a.message_id)).timestamp
            );
            const timestampB = Date.parse(
                utils.deconstruct(parseInt(b.message_id)).timestamp
            );

            if (sort_by === "newest") {
                return timestampB - timestampA;
            } else {
                return timestampA - timestampB;
            }
        });

        const urls = results.map((question) => {
            return [
                `https://discord.com/channels/${question.guild_id}/${question.channel_id}/${question.message_id}`,
                utils.deconstruct(parseInt(question.message_id)).timestamp,
            ];
        });

        return urls;
    }

    public static deconstruct(snowflake: number) {
        const BINARY = snowflake.toString(2).padStart(64, "0");
        const res = {
            timestamp: new Date(
                parseInt(BINARY.substring(0, 42), 2) + 1420070400000
            ).toLocaleString(),
            workerID: parseInt(BINARY.substring(42, 47), 2),
            processID: parseInt(BINARY.substring(47, 52), 2),
            increment: parseInt(BINARY.substring(52, 64), 2),
        };
        return res;
    }
}

export { utils };
