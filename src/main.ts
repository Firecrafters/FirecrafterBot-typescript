import {Client, GatewayIntentBits, Message, type Channel, TextChannel, type EmbedBuilder} from "discord.js";
import * as dotenv from "dotenv";
import * as config from "./config.js";
import bwaa from "./commands/bwaa.js";
import * as fish from "./commands/fish.js"
import { buildLeaderboardEmbed } from "./commands/fish.js";
import { type CommandCallArgs, type CommandHandler, CommandManager } from "./commandManager.js";
import { registerAll } from "./commands/commands.js";

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

const commands = new CommandManager();
registerAll(commands);

client.once("clientReady", async (): Promise<void> => {
    console.log(`Logged in as ${client.user?.tag}`);

    const channel = <Channel>client.channels.cache.get(process.env.ONLINE_ALERT_CHANNEL as string);
    if (channel instanceof TextChannel) {
        await channel.send(`${config.emotes.ONLINE} Online`);
    }
});

client.on("messageCreate", async (message: Message): Promise<void> => {
    // Ignore bots & and messages without prefix
    if (message.author.bot || !message.content.startsWith(config.PREFIX)) {
        return
    }

    const isOwner = message.author.id === config.OWNER;

    const args = message.content.slice(config.PREFIX.length).trim().split(/ +/);
    const command = args.shift()?.toLowerCase();

    let embed: EmbedBuilder;

    if (!await commands.handle(command || "", { commandManager: commands, client, args, message, isOwner })) {
        await message.reply(`Unknown command \`${config.PREFIX}${command}\``);
        console.log("An invalid command was sent: " + message.content);
    }
});

await client.login(process.env.TOKEN);
