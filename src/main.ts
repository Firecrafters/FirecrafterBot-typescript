import { Client, GatewayIntentBits, Message } from "discord.js";
import * as dotenv from "dotenv";
import * as config from "./config.js";
import bwaa from "./commands/bwaa";

dotenv.config({
    quiet: true
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once("clientReady", (): void => {
    console.log(`Logged in as ${client.user?.tag}`);
});

client.on("messageCreate", async (message: Message): Promise<void> => {
    // Ignore bots & and messages without prefix
    if (message.author.bot || !message.content.startsWith(config.PREFIX)) {
        return
    }

    const args = message.content.slice(config.PREFIX.length).trim().split(/ +/);
    const command = args.shift()?.toLowerCase();

    if (command === "restart") {
        if (message.author.id !== config.OWNER)
            return;

        await message.reply(`Restarting ${config.emotes.CERBER_LOADING}`);
        process.exit(1);
    } else if (command === "stop") {
        if (message.author.id !== config.OWNER)
            return;

        await message.reply(`Stopping ${config.emotes.CERBER_LOADING}`);
        process.exit(0);
    } else if (command === "bwaa") {
        await bwaa(message, args);
    } else {
        await message.reply(`Unknown command \`${config.PREFIX}${command}\``);
    }
});

await client.login(process.env.TOKEN);
