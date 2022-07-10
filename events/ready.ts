import { Client } from "discord.js";

module.exports = {
	name: 'ready',
	once: true,
	execute(client: Client) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		console.log(`Ready! Logged in as ${(client.user)!.tag}`);
	},
};