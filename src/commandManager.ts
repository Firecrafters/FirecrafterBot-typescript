import { Client, Message, PermissionsBitField } from "discord.js";

export type CommandCallArgs = {
    commandInfo: CommandInfo
    commandManager: CommandManager;
    client: Client;
    args: string[];
    isOwner: boolean;
    message: Message;
    permissions: PermissionsBitField;
    hasManageServer: boolean;
    commandName: string;
};
export type CommandHandler = (args: CommandCallArgs) => Promise<any>;
export type CommandHelpText = {
    // should be a tiny description of the command, sent when calling `help` without any args
    compact?: string;
    // should be a complete description of the command
    descriptive?: string;
}
export type CommandInfo = {
    handler: CommandHandler;
    help: CommandHelpText;
};

export class CommandManager {
    private _commands: { [key: string]: CommandInfo };

    get commands() {
        return this._commands;
    }
    
    getCommand(name?: string) {
        return this._commands[name||""] || null;
    } 

    constructor() {
        this._commands = {};
    }

    registerCommand(name: string, handler: CommandHandler, help?: CommandHelpText) {
        this._commands[name] = { handler, help: help||{} };
    }
    registerCommandInfo(name: string, info: CommandInfo) {
        this._commands[name] = info;
    }

    async handle(name: string, args: CommandCallArgs): Promise<boolean> {
        if (this._commands[name]) {
            await this._commands[name].handler(args);
            return true;
        } else return false;
    }
};
