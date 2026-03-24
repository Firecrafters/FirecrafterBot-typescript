import { EmbedBuilder } from "discord.js";

function getRandomItem<T>(array: T[]): T {
    const index = Math.floor(Math.random() * array.length);
    return array[index] as T;
}

interface EmbedOptions {
    title: string,
    description: string,
    color: number
}

function makeEmbed(options: EmbedOptions): EmbedBuilder {
    const embed = new EmbedBuilder();
    embed.setTitle(options.title);
    embed.setDescription(options.description);
    embed.setColor(options.color);

    return embed;
}

function probabilisticRound(num: number): number {
    const lower = Math.floor(num);
    const fraction = num - lower;
    if (fraction === 0) return lower;
    return Math.random() < fraction ? lower + 1 : lower;
}

export { getRandomItem, makeEmbed, probabilisticRound };
