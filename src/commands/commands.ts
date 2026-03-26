import { type CommandCallArgs, CommandManager } from "../commandManager.js";
import config, { loadAll, pauseAutosaves, saveAll, setAutosavesPaused } from "../config.js"
import { saveExit } from "../utils.js";
import bwaa from "./bwaa.js";
import * as fish from "./fish.js"
import help from "./help.js";
import * as ovrd from "./override.js";

async function notImplemented({ message }: CommandCallArgs) {
    await message.reply(`Not implemented ${config.emotes.no}`);
}

function registerAll(commands: CommandManager) {
    commands.registerCommand("save", async function ({ message, isOwner }) {
        if (!isOwner) return;

        await message.reply(`Saving data ${config.emotes.cerberLoading}`);
        console.log("Manual save triggered by " + message.author.tag);
        await saveAll();
    });
    commands.registerCommand("reload", async function ({ message, isOwner }) {
        if (!isOwner) return;

        await message.reply(`Reloading data ${config.emotes.cerberLoading}`);
        console.log("Manual data reload triggered by " + message.author.tag);
        await loadAll();
    });
    commands.registerCommand("toggleAutosave", async function ({ message, isOwner }) {
        if (!isOwner) return;

        setAutosavesPaused(!pauseAutosaves);
        await message.reply(`Autosaving is now ${pauseAutosaves ? "**off** (for this session!)" : "**on**"}`);
        console.log(`Autosaving ${pauseAutosaves ? "disabled (for this session)" : "enabled"} by ` + message.author.tag);
        await loadAll();
    });

    commands.registerCommand("restart", async function({ message, isOwner }) {
        if (!isOwner) return;

        await message.reply(`Restarting ${config.emotes.cerberLoading}`);
        console.log("Restart triggered by " + message.author.tag);
        await saveExit(1);
    });
    commands.registerCommand("stop", async function({ message, isOwner }) {
        if (!isOwner) return;

        await message.reply(`Stopping ${config.emotes.cerberLoading}`);
        console.log("Stop triggered by " + message.author.tag);
        await saveExit(0);
    });
    
    commands.registerCommand("override", async function (a) { await ovrd._(a, false); }, ovrd.h);
    commands.registerCommand("override!", async function (a) { await ovrd._(a, true); });

    commands.registerCommand("bwaa", bwaa, { compact: "bwaa!" });
    commands.registerCommand("fish", async function ({ message }) { await message.reply({ embeds: [fish.fish(message)] }); }, { compact: "this command is fishy" });
    commands.registerCommand("points", async function ({ message }) { await message.reply({ embeds: [fish.getPoints(message)] }); }, { compact: "get your fishing points" });
    commands.registerCommand("leaderboard", async function ({ message }) { await message.reply({ embeds: [fish.getLeaderboardEmbed(config.leaderboardLengthLimit)] }); }, { compact: "get fishing leaderboard" });

    commands.registerCommand("help", help, { compact: "helps you with commands" }); // TODO: "help" command
}

export { registerAll }
