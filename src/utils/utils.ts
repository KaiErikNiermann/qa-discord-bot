import { Message, MessageEmbed, MessageReaction, User } from "discord.js";
import { db } from "./bot/db";

class utils {
    public static getFormattedDate(date: Date): string {
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    }

    public static userString(id: string): string {
        return `<@${id}>`;
    }

    public static isAnswer(message: Message): Boolean {
        return (
            message.type === "REPLY" &&
            !message.content.startsWith("-e") 
        );
    } 

    public static isMdQuestion(message: Message): Boolean {
        return message.content.startsWith("Question from");  
    }
        
    public static editReply(message: Message): Boolean {
        return (
            message.type === "REPLY" &&
            message.content.startsWith("-e") 
        );
    }

    public static removePrefix(message: Message): string {
        return message.content.slice(3);
    }

    public static async answerReply(message: Message, user: string): Promise<Message<boolean>> {
        const reply_message = await message.reply(
            `Hey ${user}, ${message.author.username} tried answering your question. 
            \nIf you are still confused react with ❔otherwise react with ✅ `
        );

        reply_message.react("❔");
        reply_message.react("✅");

        return reply_message;
    }

    public static isQuestionEmbed(question_embed: MessageEmbed): Boolean {
        try { 
            if ( question_embed.fields[0].name !== "question from" ) {
                return false;
            }
        } catch (error) { return false; }

        return true;
    }

    public static noReactionHandler(question_message: Message<boolean>, reply_message: Message<boolean>): void {
        db.findOne(
            { message_id: `${question_message.id}` },
        ).then((result) => {
            // Question was already answered
            if (result?.status === 1) {
                reply_message.delete().catch(console.error);
                return;
            } 
            // User did not respond in time
            reply_message.reply(
                `No reaction after 10 seconds, closing question.`
            ).then((message) => {
                setTimeout(() => {
                    message.delete().catch(console.error);
                }, 60000 * 10);
            })
        });
    }

    public static addSolved(id: string, answer: string): void {
        db.updateOne(
            { message_id: id },
            { $set: {
                answer: answer,
                status: 1
            } }
        ).catch((error) => {
            console.error(`There was an error updating the database: ${error}`);
        })
    }
}

export { utils };