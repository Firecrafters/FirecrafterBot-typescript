import { type CommandCallArgs } from "../commandManager.js";
import * as c from "../config.js";
import * as utils from "../utils.js";

export default async function bwaa({ args, message }: CommandCallArgs): Promise<void> {
    const bwaa =  (): string => {
        const bwaaArray = [
            c.config.emotes.neuroBwaa,
            c.config.emotes.evilBwaa
        ]

        return utils.getRandomItem(bwaaArray);
    }

    if (args.length > 0 && typeof args[0] == "string")
    {
        const bwaaLimit = c.getGuildUserOverridableOption("bwaaLimit", message.guild, message.author);

        const val = parseFloat(args[0]);
        if (val > 0 && val <= bwaaLimit) {
            let bwaaString = "";
            const roundedVal = utils.probabilisticRound(val)
            for (let i = 0; i < roundedVal; i++) bwaaString += (bwaa() + " ");
            await message.reply(bwaaString);
        } else if (val > bwaaLimit) {
            await message.reply(`${c.config.emotes.no} Too many ${bwaa()}s`)
        } else {
            await message.reply(bwaa());
        }
    } else {
        await message.reply(bwaa());
    }
}
