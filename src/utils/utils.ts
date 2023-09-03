import { InsertOneResult } from "mongodb";
import { db } from "./bot/db";
import { Message, MessageEmbed, MessageActionRow, MessageButton } from "discord.js";

class utils {
    public static getFormattedDate(date: Date): string {
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    }

    public static userString(id: string): string {
        return `<@${id}>`;
    }

    public static questionContent(message: string): string {
        return message.split("\n---")[1];
    }

    public static isAnswer(message: Message): boolean {
        return message.type === "REPLY" && !message.author.bot;
    }

    public static isEdit(message: Message): boolean {
        return message.type === "REPLY" && message.content.startsWith("-e") && !message.author.bot;
    }

    public static removePrefix(message: Message): string {
        return message.content.slice(3);
    }

    public static async answerReply(message: Message, user: string): Promise<Message<boolean>> {
        const reply_message = await message.reply(
            `Hey ${user}, ${message.author.username} tried answering your question. 
            \nIf you are still confused react with ❔ otherwise react with ✅.`
        );

        reply_message.react("❔");
        reply_message.react("✅");

        return reply_message;
    }

    public static noReactionHandler(
        question_message: Message<boolean>,
        reply_message: Message<boolean>
    ): void {
        db.findOne({ message_id: `${question_message.id}` }).then((result) => {
            if (result?.status === 1) {
                reply_message.delete().catch(console.error);
                return;
            }
            reply_message
                .reply(`No reaction after 10 seconds, closing question.`)
                .then((message) => {
                    setTimeout(() => {
                        reply_message.delete().catch(console.error);
                        message.delete().catch(console.error);
                    }, 5000);
                });
        });
    }

    public static async addSolved(id: string, answer: string): Promise<void> {
        console.log(`added answer to question with ID ${id}`); 
        let arr: string[] = (await db.findOne({ message_id: id }))?.answers ?? [];
        arr.push(answer);
        await db.updateOne(
            { message_id: id },
            {
                $set: {
                    answers: arr,
                    status: 1,
                },
            }
        );
    }

    public static questionButtons() {
        return new MessageActionRow().setComponents(
            new MessageButton().setCustomId("delete_button").setLabel("delete").setStyle("PRIMARY"),
            new MessageButton().setCustomId("copy_button").setLabel("copy").setStyle("PRIMARY")
        );
    }

    public static copyButton() {
        return new MessageActionRow().setComponents(
            new MessageButton().setCustomId("copy_button").setLabel("copy").setStyle("PRIMARY")
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
        return message.content.split("\n")[0].split(" ")[2];
    }

    public static async insertQuestion(
        question: string,
        guildId: string,
        channelId: string,
        messageId: string,
        managerMessageId: string
    ): Promise<InsertOneResult<Document>> {
        console.log(`inserted question with ID ${messageId}`);
        return await db.insertOne({
            question: question,
            answers: [],
            status: 0,
            guild_id: guildId,
            channel_id: channelId,
            message_id: messageId,
            manager_message_id: managerMessageId,
        });
    }

    public static async getManager(messageId: string) {
        const res = await db.findOne({
            message_id: messageId,
        })
        return res?.manager_message_id;
    }

    /**
     *
     * @param n number of questions to get
     * @param answered 1 for answered, 0 for unanswered, 2 for both
     * @param sort_by newest or oldest
     * @returns An object containing the question link, timestamp, status and text
     */
    public static async getNQuestions(
        n: number,
        answered: number,
        sort_by: string
    ): Promise<string[][]> {
        const results = (
            await db
                .find(
                    {
                        status: answered === 1 ? 1 : answered === 0 ? 0 : { $in: [1, 0] },
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
            const timestampA = Date.parse(utils.deconstruct(parseInt(a.message_id)).timestamp);
            const timestampB = Date.parse(utils.deconstruct(parseInt(b.message_id)).timestamp);

            if (sort_by === "newest") return timestampB - timestampA;
            else return timestampA - timestampB;
        });

        const urls = results.map((question) => {
            return [
                `https://discord.com/channels/${question.guild_id}/${question.channel_id}/${question.message_id}`,
                utils.deconstruct(parseInt(question.message_id)).timestamp,
                question.status,
                question.question,
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
