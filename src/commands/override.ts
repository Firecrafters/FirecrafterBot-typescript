import { PermissionFlagsBits } from "discord.js";
import type { CommandCallArgs, CommandHelpText } from "../commandManager.js";
import config, { getUser, getGuildUser, getGuild, type GuildOverridableGlobalOptions, type UserOverridableGlobalOptions, type UserOverridableGuildOptions } from "../config.js"
import { isNumericalString, userIdHelper } from "../utils.js";
import { z, ZodType } from "zod";

export type Overrideables = {
    user: Partial<{ [K in keyof UserOverridableGlobalOptions]: ZodType }>;
    member: Partial<{ [K in keyof UserOverridableGuildOptions]: ZodType }>;
    member_protected: Partial<{ [K in keyof UserOverridableGuildOptions]: ZodType }>;
    guild: Partial<{ [K in keyof GuildOverridableGlobalOptions]: ZodType }>;
};

// use this to set safe values for members to override, along with `zod` schemas for validation
// ignored by anyone in global owners array
export const overridables: Overrideables = {
    // global user overrides
    user: {
        
    },
    // guild member overrides
    member: {
        
    },
    // member overrides that require `Manage Server` permissions
    member_protected: {
        bwaaLimit: z.int().gt(0),
    },
    // guild overrides (requires `Manage Server`)
    guild: {
        prefix: z.string().max(5),
    },
};

export const h: CommandHelpText = {
    compact: "set various overrides",
    descriptive: "wip", // TODO: make better description
};

export async function _({ isOwner, hasManageServer, message, args }: CommandCallArgs, forceIfOwner?: boolean) {
    if (isOwner && forceIfOwner)
        console.log("forced override sent from " + message.author.id)
    if (args.length == 1 && args[0] == "list")
        return await message.reply((Object.keys(overridables.user).length ? `## User overrides:\n${Object.keys(overridables.user).join(", ")}\n` : '') + (Object.keys(overridables.member).length ? `## Member overrides:\n${Object.keys(overridables.member).join(", ")}\n` : '') + (Object.keys(overridables.member_protected).length ? `## Member overrides (only applyable with \`Manage Server\`):\n${Object.keys(overridables.member_protected).join(", ")}\n` : '') + (Object.keys(overridables.guild).length ? `## Guild overrides:\n${Object.keys(overridables.guild).join(", ")}\n` : ''))
    if (args.length < 1 || !(message.guild ? ["user", "member", "guild"] : ["user"]).includes(args[0]!))
        return await message.reply("args[0]: '`context`' must be either: `user`, `member`, or `guild` (`guild` and `member` may only be used in servers!) or `list` to list all valid keys");
    if (args[0] == "guild" && !hasManageServer)
        return await message.reply("you cannot edit guild overrides without `Manage Server` permissions");
    const t = args[0] == "guild" ? "here" : "me"
    if (args.length < 2 || (!isNumericalString(args[1]!) && args[1] != t))
        return await message.reply("args[1]: '`id`' must be either: a relevant id or `" + t + "`");
    if (args[0] != "member" && args[1] != t && !isOwner)
        return await message.reply("args[1]: can only be `"+t+"` unless you are an owner");
    if (args.length < 3)
        return await message.reply("args[2]: '`key`' must be any relevant override key, for a full list run `override list`");
    if (!((isOwner && forceIfOwner) || (args[0] == "user" && args[2]! in overridables.user) || (args[0] == "member" && (args[2]! in overridables.member || (hasManageServer && args[2]! in overridables.member_protected))) || (args[0] == "guild" && args[2]! in overridables.guild)))
        return await message.reply("invalid '`key`'");
    var user = userIdHelper(args[2] == "me" ? message.author : args[2]!);
    if (args.length > 3) {
        var data: unknown;
        if (args.length == 4 && args[3] == "reset") switch (args[0]) {
            case "user":
                delete (getUser(user).globalOverrides as any)[args[2]!];
                break;
            case "member":
                delete (getGuildUser(message.guild!, user).guildOverrides as any)[args[2]!];
                break;
            case "guild":
                delete (getGuild(message.guild!).globalOverrides as any)[args[2]!];
                break;
        } else {
            try { data = JSON.parse(args.slice(3).join(" ")) } catch { return await message.reply("malformed json"); }
            if (!(isOwner && forceIfOwner)) {
                let schema: ZodType | undefined;
            
                switch (args[0]) {
                    case "user":
                        schema = overridables.user[args[2]! as keyof typeof overridables.user];
                        break;
                    case "member":
                        schema = overridables.member[args[2]! as keyof typeof overridables.member];
                        if (hasManageServer && !schema) {
                            schema = overridables.member_protected[args[2]! as keyof typeof overridables.member_protected];
                        }
                        break;
                    case "guild":
                        schema = overridables.guild[args[2]! as keyof typeof overridables.guild];
                        break;
                }
            
                if (!schema) 
                    return await message.reply("no schema found for that key");
            
                const validation = schema.safeParse(data);
                if (!validation.success)
                    return await message.reply(`\`\`\`fix\n${z.prettifyError(validation.error)}\`\`\``);
                data = validation.data!;
            }
        }
        switch (args[0]) {
            case "user":
                (getUser(user).globalOverrides as any)[args[2]!] = data;
                break;
            case "member":
                (getGuildUser(message.guild!, user).guildOverrides as any)[args[2]!] = data;
                break;
            case "guild":
                (getGuild(message.guild!).globalOverrides as any)[args[2]!] = data;
                break;
        }
        return await message.reply("override set!");
    }
    return await message.reply(`\`${args[1]}.${args[2]}\` = \`${JSON.stringify(args[0] == "user" ? (getUser(user).globalOverrides as any)[args[2]!] : args[0] == "member" ? (getGuildUser(message.guild!, user).guildOverrides as any)[args[2]!] : (getGuild(message.guild!).globalOverrides as any)[args[2]!])}\``);
};