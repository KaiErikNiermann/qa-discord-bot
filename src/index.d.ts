import { MongoClient } from "mongodb";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

declare global {
    type db_listing = {
        question: string;
        guild_id: string;
        status: number;
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