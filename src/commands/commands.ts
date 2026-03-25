import { type CommandCallArgs, type CommandHandler, CommandManager } from "../commandManager.js";
import * as config from "../config.js"
import bwaa from "./bwaa.js";
import * as fish from "./fish.js"

async function notImplemented({ message }: CommandCallArgs) {
    message.reply(`Not implemented ${config.emotes.NO}`);
}

function registerAll(commands: CommandManager) {
    commands.registerCommand("restart", async function({ message, isOwner }) {
        if (!isOwner) return;

        await message.reply(`Restarting ${config.emotes.CERBER_LOADING}`);
        console.log("Restart triggered by " + message.author.tag);
        process.exit(1);
    });
    commands.registerCommand("stop", async function({ message, isOwner }) {
        if (!isOwner) return;

        await message.reply(`Stopping ${config.emotes.CERBER_LOADING}`);
        console.log("Stop triggered by " + message.author.tag);
        process.exit(0);
    });

    commands.registerCommand("bwaa", bwaa, "bwaa!");
    commands.registerCommand("fish", async function ({ message }) { await message.reply({ embeds: [fish.fish(message)]}) }, "this command is fishy");
    commands.registerCommand("points", async function ({ message }) { await message.reply({ embeds: [fish.getPoints(message)] }); }, "get your fishing points");
    commands.registerCommand("leaderboard", async function ({ message }) { await message.reply({ embeds: [fish.getLeaderboardEmbed(config.LEADERBOARD_LENGTH_LIMIT)] }); }, "get fishing leaderboard");

    commands.registerCommand("help", notImplemented, "helps you with commands"); // TODO: "help" command
}

export { registerAll }
