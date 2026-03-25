import { EmbedBuilder, User, Guild, type Snowflake } from "discord.js";
import { saveAll } from "./config.js"

export function getRandomItem<T>(array: T[]): T {
    const index = Math.floor(Math.random() * array.length);
    return array[index] as T;
}

export interface EmbedOptions {
    title: string,
    description: string,
    color: number
}

export function makeEmbed(options: EmbedOptions): EmbedBuilder {
    const embed = new EmbedBuilder();
    embed.setTitle(options.title);
    embed.setDescription(options.description);
    embed.setColor(options.color);

    return embed;
}

export function probabilisticRound(num: number): number {
    const lower = Math.floor(num);
    const fraction = num - lower;
    if (fraction === 0) return lower;
    return Math.random() < fraction ? lower + 1 : lower;
}

export async function saveExit(code: number) {
    await saveAll();
    process.exit(code);
}

export type UserId = string | Snowflake;
export type GuildId = string | Snowflake;
export type UserResolvable = User | UserId;
export type GuildResolvable = Guild | GuildId;
export function userIdHelper(user: UserResolvable): UserId { return (typeof user == "string") ? user : user.id }
export function guildIdHelper(guild: GuildResolvable): GuildId { return (typeof guild == "string") ? guild : guild.id }

export function isNumericalString(str: string): boolean {
    return /^[0-9]+$/.test(str);
}