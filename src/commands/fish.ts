import * as utils from "../utils.js";
import * as config from "../config.js";
import { Database } from "bun:sqlite";
import { EmbedBuilder, Message } from "discord.js";

interface Rarity {
    name: string,
    multiplier: number,
    probability: number
}

interface Catch {
    name: string,
    value: number
}

const RARITIES: Rarity[] = [
    { name: "common",   multiplier: 0.80, probability: 0.500 },
    { name: "uncommon", multiplier: 1.00, probability: 0.300 },
    { name: "rare",     multiplier: 2.50, probability: 0.150 },
    { name: "mythical", multiplier: 10.0, probability: 0.045 },
    { name: "godly",    multiplier: 50.0, probability: 0.005 }
];

const CATCHES: Catch[] = [
    { "name": "Cardboard Box",            "value": 5   },
    { "name": "Eliv Plush",               "value": 100 },
    { "name": "Nwero Plush",              "value": 100 },
    { "name": config.emotes.JOEL,         "value": 50  },
    { "name": "Tutel",                    "value": 80  },
    { "name": "Cookie",                   "value": 70  },
    { "name": "RAM",                      "value": 500 },
    { "name": "Gymbag",                   "value": 150 },
    { "name": "Harpoon",                  "value": 200 },
    { "name": "Programmer's Socks",       "value": 70  },
    { "name": "Metal Pipes",              "value": 150 },
    { "name": config.emotes.NEURO_BWAA,   "value": 300 },
    { "name": config.emotes.EVIL_BWAA,    "value": 300 },
    { "name": "The Duck on Neuro's Head", "value": 250 },
    { "name": "[Filtered]",               "value": 150 }
];

export type UserPoints = { userID: string, points: number };

function getRandomRarity(): Rarity {
    const randomValue = Math.random();
    let cumulativeProbability = 0;

    for (const rarity of RARITIES) {
        cumulativeProbability += rarity.probability;
        if (randomValue < cumulativeProbability) {
            return rarity;
        }
    }

    // Fallback, this should never be reached
    return RARITIES[0] as Rarity;
}

function getDb(): Database {
    const db = new Database("db.sqlite");

    db.run(`
        CREATE TABLE IF NOT EXISTS fishing_data (
            userID TEXT PRIMARY KEY,
            username TEXT,
            points REAL DEFAULT 0
        )
    `);

    return db;
}

export function fish(message: Message): EmbedBuilder {
    const rarity: Rarity = getRandomRarity();
    const item: Catch = utils.getRandomItem(CATCHES);
    const worth = item.value * rarity.multiplier;

    const id = message.author.id;
    const username = message.author.tag;

    const db: Database = getDb();
    try {
        db.prepare(`
            INSERT INTO fishing_data (userID, username, points)
            VALUES (?, ?, ?)
            ON CONFLICT (userID)
            DO UPDATE SET points = fishing_data.points + excluded.points
        `).run(id, username, worth);
    } catch (e) {
        console.error(`Error: ${e}`);
    } finally {
        db.close();
    }

    const suffix = rarity.name === "uncommon" ? "n" : "";

    console.log(`${username} caught a ${item.name} of rarity ${rarity.name}`);
    console.log(`${username} gained ${worth} points (${item.value} * ${rarity.multiplier})\n`);

    const description = [
        `You caught a${suffix} **_${rarity.name}_ ${item.name}**`,
        `+**${worth}** points`
    ].join("\n");

    return utils.makeEmbed({
        title: "Fishing",
        description: description,
        color: config.EMBED_COLOR
    });
}

export function getPoints(message: Message): EmbedBuilder {
    const id = message.author.id;

    const db: Database = getDb();
    let points = 0;

    try {
        const row = db.prepare(
            "SELECT points FROM fishing_data WHERE userID = ?"
        ).get(id) as { points: number } | undefined;

        if (row)
            points = row.points;
    } catch (e) {
        console.error(`Error: ${e}`);
    } finally {
        db.close();
    }

    return utils.makeEmbed({
        title: "Points",
        description: `${points}`,
        color: config.EMBED_COLOR
    });
}

export function getLeaderboard(limit: number): UserPoints[] {
    const db: Database = getDb();

    const rows = db.prepare(
        "SELECT userID, points FROM fishing_data ORDER BY points DESC LIMIT ?"
    ).all(limit) as UserPoints[];

    db.close();
    return rows;
}

export function buildLeaderboardEmbed(rows: Array<{ userID: string, points: number }>): EmbedBuilder {
    const lines = rows.map(({ userID, points }: UserPoints, index): string => {
        return `${index + 1}. **<@${userID}>** — ${points.toLocaleString()} points`
    });

    return utils.makeEmbed({
        title: "Leaderboard",
        description: lines.length > 0 ? lines.join("\n") : "N/A",
        color: config.EMBED_COLOR
    });
}
