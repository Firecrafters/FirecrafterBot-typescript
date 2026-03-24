import { Client, Message } from "discord.js";

type CommandCallArgs = {
    commandManager: CommandManager;
    client: Client;
    args: string[];
    isOwner: boolean;
    message: Message;
};
type CommandHandler = (args: CommandCallArgs) => Promise<void>;

class CommandManager {
    private _commands: { [key: string]: CommandHandler };
    private _helpTexts: { [key: string]: string };

    get helpTexts(): { [key: string]: string } {
        return this._helpTexts;
    }

    get commands(): { [key: string]: CommandHandler } {
        return this._commands;
    }

    constructor() {
        this._commands = {};
        this._helpTexts = {};
    }

    registerCommand(name: string, handler: CommandHandler, helpText?: string) {
        this._commands[name] = handler;
        if (helpText) this._helpTexts[name] = helpText;
    }

    async handle(name: string, args: CommandCallArgs): Promise<boolean> {
        if (this._commands[name]) {
            await this._commands[name](args);
            return true;
        } else return false;
    }

    getHelpTextFor(name: string): string | undefined {
        return this._helpTexts[name];
    }
}

export { type CommandCallArgs, type CommandHandler, CommandManager };
