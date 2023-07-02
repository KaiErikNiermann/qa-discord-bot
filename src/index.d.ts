import { MongoClient } from "mongodb";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

declare global {
    type db_listing = {
        question: string;
        answer: string;
        status: number;
        
        guild_id: string;
        channel_id: string;
        message_id: string;
    };

    type db_command = {
        name: string;
        execute: (client: MongoClient, newListing: db_listing) => void;
    };    

    type command = {
        name: string;
        data: SlashCommandBuilder;
        execute: (interaction: CommandInteraction) => void;
    };
}