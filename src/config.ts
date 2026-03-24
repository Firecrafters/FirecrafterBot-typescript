
const users = {
    FIRECRAFTER: "1173363433975062590"
}

interface Emotes {
    CERBER_LOADING: string,
    NO: string,
    JOEL: string,
    ONLINE: string,
    NEURO_BWAA: string,
    EVIL_BWAA: string
}

const emotes: Emotes = {
    CERBER_LOADING: "<a:CerberLoading:1482116273067393166>",
    NO: "<a:NO:1482117359719284847>",
    JOEL: "<a:Joel:1482122301674623149>",
    ONLINE: "<:Online:1482458113033633913>",
    NEURO_BWAA: "<:NeuroBwaa:1482775783092261056>",
    EVIL_BWAA: "<:EvilBwaa:1482775917532287056>"
}

const PREFIX = "_";
const OWNER = users.FIRECRAFTER;

const BWAA_LIMIT = 30;
const EMBED_COLOR = 0xFF00FF;
const LEADERBOARD_LENGTH_LIMIT = 10;

export { PREFIX, OWNER, emotes, BWAA_LIMIT, EMBED_COLOR, LEADERBOARD_LENGTH_LIMIT };
