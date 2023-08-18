import { Message, MessageEmbed, MessageReaction, User } from "discord.js";

class utils {
    public static getFormattedDate(date: Date): string {
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    }

    public static userString(id: string): string {
        return `<@${id}>`;
    }

    public static answerReply(message: Message): Boolean {
        return (
            message.type === "REPLY" &&
            !message.content.startsWith("-e") 
        );
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
}
