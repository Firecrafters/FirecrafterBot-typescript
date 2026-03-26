import type { CommandCallArgs } from "../commandManager";


export async function help({ commandManager, args, message }: CommandCallArgs) {
    if (args.length == 0) await message.reply("## Command List\n" + Object.keys(commandManager.commands)
        .filter(k => commandManager.commands[k]!.help.compact)
        .map(k => `\`${k}\`: ${commandManager.commands[k]!.help!.compact}`).join("\n"))
    else {
        var cmd = commandManager.getCommand(args.join(" "))
        if (!cmd) return await message.reply(`\`${args.join(" ")}\` does not exist`)
        await message.reply(cmd.help.descriptive ||cmd.help.compact || `\`${args.join(" ")}\` does not have help text`);
    }
};
export default help;