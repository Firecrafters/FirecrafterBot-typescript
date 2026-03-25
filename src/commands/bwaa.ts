import { type CommandCallArgs } from "../commandManager.js";
import { Message } from "discord.js";
import * as config from "../config.js";
import * as utils from "../utils.js";

export default async function bwaa({ args, message }: CommandCallArgs): Promise<void> {
    const bwaa =  (): string => {
        const bwaaArray = [
            config.emotes.NEURO_BWAA,
            config.emotes.EVIL_BWAA
        ]

        return utils.getRandomItem(bwaaArray);
    }

    if (args.length > 0 && typeof args[0] == "string")
    {
        let bwaaLimit = config.BWAA_LIMIT;

        if (config.CustomBwaaLimits[message.author.id])
            bwaaLimit = config.CustomBwaaLimits[message.author.id] as number;

        const val = parseFloat(args[0]);
        if (val > 0 && val <= bwaaLimit) {
            let bwaaString = "";
            const roundedVal = utils.probabilisticRound(val)
            for (let i = 0; i < roundedVal; i++) bwaaString += (bwaa() + " ");
            await message.reply(bwaaString);
        } else if (val > config.BWAA_LIMIT) {
            await message.reply(`${config.emotes.NO} Too many ${bwaa()}s`)
        } else {
            await message.reply(bwaa());
        }
    } else {
        await message.reply(bwaa());
    }
}
