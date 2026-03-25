import { type GuildId, type UserId, type GuildResolvable, type UserResolvable, guildIdHelper, userIdHelper } from "./utils.js"
import { Emote, type Emotes } from "./emote.js"
import * as fs from "node:fs/promises";
import type { Colors } from "./color.js";
import _ from "lodash";

// Per-guild options that are user-overridable per-guild
export type UserOverridableGuildOptions = {
    bwaaLimit: number;
};
// Global options that are guild-overridable
export type GuildOverridableGlobalOptions = {
    prefix: string;
};
// Options each user can override globally
export type UserOverridableGlobalOptions = {
};
// Config for a user per-guild
export type GuildUserConfig = {
    guildOverrides: Partial<UserOverridableGuildOptions>;
};
// Config for a guild
export type GuildConfig = {
    defaultUserConfig: GuildUserConfig;
    globalOverrides: Partial<GuildOverridableGlobalOptions>;
    userOverridableOptions: UserOverridableGuildOptions;
    users: { [key: UserId]: GuildUserConfig };
};
// Config for a user
export type UserConfig = {
    globalOverrides: UserOverridableGlobalOptions;
}
// Global configuration (config.json)
export type GlobalConfig = {
    globalOwners: UserId[];
    defaultGuildConfig: GuildConfig;
    defaultUserConfig: UserConfig;
    emotes: Emotes;
    colors: Colors;
    guildOverridableOptions: GuildOverridableGlobalOptions;
    userOverridableOptions: UserOverridableGlobalOptions;
    indentConfigs: number;
    autosaveSeconds: number;
    leaderboardLengthLimit: number;
};
// Add default values for your new stuff to here
export const defaultConfig: GlobalConfig = {
    globalOwners: [],
    defaultGuildConfig: {
        defaultUserConfig: {
            guildOverrides: {},
        },
        globalOverrides: {},
        userOverridableOptions: { bwaaLimit: 30 },
        users: {},
    },
    defaultUserConfig: {
        globalOverrides: {},
    },
    emotes: Object.fromEntries(Object.values(Emote).map(k => [k, ":unset:"])) as Emotes,
    colors: {
        embed: 0xff00ff,
    },
    guildOverridableOptions: {
        prefix: "_",
    },
    userOverridableOptions: {
    },
    indentConfigs: 4,
    autosaveSeconds: 300,
    leaderboardLengthLimit: 10,
};

export const configFile = Bun.file("./config.json");
export let config: GlobalConfig = defaultConfig;
export default config;
export const guildConfigs: { [key: GuildId]: GuildConfig } = {};
export const userConfigs: { [key: UserId]: UserConfig } = {};
function _stringify(data: any) {
    return JSON.stringify(data, null, config.indentConfigs || undefined)
}
export async function saveConfig() {
    await configFile.write(_stringify(config));
}
export async function loadAll() {
    let jsonConfig: unknown;
    try {
        jsonConfig = await configFile.exists() ? await configFile.json() : undefined;
        if (typeof jsonConfig !== "object" || !jsonConfig) throw "e";
    } catch { throw "Malformed config.json!"; }
    config = jsonConfig
        ? _.merge({}, defaultConfig, jsonConfig) // Combine the default config with the user-provided config
        : config; // Use default config if user-provided was not found

    await saveConfig(); // Apply any config updates

    if (!jsonConfig) throw "Default config placed at ./config.json, you may want to configure it, if you dont just run the app again!";

    await fs.mkdir("./storage/users", { recursive: true });
    await fs.mkdir("./storage/guilds", { recursive: true });

    const users = await fs.readdir("./storage/users");
    const guilds = await fs.readdir("./storage/guilds");

    for (const userId of users) if (/^[0-9]+$/.test(userId)) try {
        userConfigs[userId] = _.merge({}, config.defaultUserConfig, await Bun.file(`./storage/users/${userId}`).json());
    } catch {
        await fs.rename(`./storage/users/${userId}`, `./storage/users/${userId}.bak`)
        console.log(`failed to load user data for ${userId}, file renamed to '${userId}.bak'`)
    }
    for (const guildId of guilds) if (/^[0-9]+$/.test(guildId)) try {
        // update guild
        guildConfigs[guildId] = _.merge({}, config.defaultGuildConfig, await Bun.file(`./storage/guilds/${guildId}`).json());
        // update users
        for (const user in guildConfigs[guildId]!.users) guildConfigs[guildId]!.users[user] = _.merge({}, guildConfigs[guildId]!.defaultUserConfig, guildConfigs[guildId]!.users[user]);
    } catch {
        await fs.rename(`./storage/guilds/${guildId}`, `./storage/guilds/${guildId}.bak`)
        console.log(`failed to load guild data for ${guildId}, file renamed to '${guildId}.bak'`)
    }
}

await loadAll();

export async function saveUser(user: UserResolvable) {
    const id = userIdHelper(user);
    await Bun.file("./storage/users/"+id).write(_stringify(userConfigs[id]));
}
export async function saveUsers() { for (const userId in userConfigs) await saveUser(userId); }
export async function saveGuild(guild: GuildResolvable) {
    const id = guildIdHelper(guild);
    await Bun.file("./storage/guilds/"+id).write(_stringify(guildConfigs[id]));
}
export async function saveGuilds() { for (const guildId in guildConfigs) await saveGuild(guildId); }
export async function saveAll() {
    await saveConfig();
    await saveUsers();
    await saveGuilds();
}
export let pauseAutosaves = false;
export function setAutosavesPaused(to: boolean) { pauseAutosaves = to; }
let saving = false;
setInterval(async () => {
  if (saving || pauseAutosaves) return;
  saving = true;
  try {
    await saveAll();
  } finally {
    saving = false;
  }
}, config.autosaveSeconds * 1000);
process.on("SIGINT", async () => {
    console.log("Saving...");
    await saveAll();
    process.exit(0);
});
process.on("SIGTERM", async () => {
    console.log("Saving...")
    await saveAll();
    process.exit(0);
});

// utilities:
// use before writing to the guildConfigs map to make sure it exists
export function getGuild(guild: GuildResolvable) {
    const id = guildIdHelper(guild);
    if (guildConfigs[id] == undefined) guildConfigs[id] = structuredClone(config.defaultGuildConfig);
    return guildConfigs[id];
}
// use before writing to the userConfigs map to make sure it exists
export function getUser(user: UserResolvable) {
    const id = userIdHelper(user);
    if (userConfigs[id] == undefined) userConfigs[id] = structuredClone(config.defaultUserConfig);
    return userConfigs[id];
}
// use before writing to any GuildConfig.users map to make sure it exists
export function getGuildUser(guild: GuildResolvable, user: UserResolvable) {
    const g = getGuild(guild);
    const id = userIdHelper(user);
    if (g.users[id] == undefined) g.users[id] = structuredClone(g.defaultUserConfig);
    return g.users[id];
}

export function getGlobalUserOverridableOption(option: keyof UserOverridableGlobalOptions, user: UserResolvable | null) {
    return user ? getUser(user).globalOverrides[option]
        ?? config.userOverridableOptions[option] : config.userOverridableOptions[option];
}
export function getGlobalGuildOverridableOption(option: keyof GuildOverridableGlobalOptions, guild: GuildResolvable | null) {
    return guild ? getGuild(guild).globalOverrides[option]
        ?? config.guildOverridableOptions[option] : config.guildOverridableOptions[option];
}
export function getGuildUserOverridableOption(option: keyof UserOverridableGuildOptions, guild: GuildResolvable | null, user: UserResolvable | null) {
    if (!guild || !user) return config.defaultGuildConfig.userOverridableOptions[option];
    const g = getGuild(guild);
    const u = getGuildUser(guild, user);
    return u.guildOverrides[option]
        ?? g.userOverridableOptions[option]
        ?? config.defaultGuildConfig.userOverridableOptions[option];
}
