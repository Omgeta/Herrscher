import { AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler } from "discord-akairo";
import { Message } from "discord.js";
import { join } from "path";

const defaultPrefix = process.env.DEFAULT_PREFIX;
const owners: string[] = (process.env.OWNER_ID || "").split(",");

declare module "discord-akairo" {
    interface AkairoClient {
        commandHandler: CommandHandler;
        listenerHandler: ListenerHandler;
    }
}

interface BotOptions {
    token: string;
    owners?: string | string[];
}

export default class HerrscherClient extends AkairoClient {
    public config: BotOptions;

    public commandHandler: CommandHandler = new CommandHandler(this, {
        directory: join(__dirname, "..", "commands"),
        prefix: defaultPrefix,
        handleEdits: true,
        commandUtil: true,
        commandUtilLifetime: 3e5,
        defaultCooldown: 6e4,
        argumentDefaults: {
            prompt: {
                modifyStart: (_: Message, str: string) => `${str}\n\ntype \`cancel\` to cancel the command`,
                modifyRetry: (_: Message, str: string) => `${str}\n\ntype \`cancel\` to cancel the command`,
                timeout: "Command timed out.",
                ended: "You exceeded the maximum number of tries.",
                cancel: "This command has been cancelled.",
                retries: 3,
                time: 3e5
            },
            otherwise: ""
        },
        ignorePermissions: owners,
        ignoreCooldown: owners,
        blockBots: true
    });

    public inhibitorHandler: InhibitorHandler = new InhibitorHandler(this, {
        directory: join(__dirname, "..", "inhibitors")
    });

    public listenerHandler: ListenerHandler = new ListenerHandler(this, {
        directory: join(__dirname, "..", "listeners")
    });

    public constructor(config: BotOptions) {
        super({
            ownerID: config.owners,
            intents: ["GUILDS", "DIRECT_MESSAGES"],
            partials: ["MESSAGE", "CHANNEL", "REACTION"]
        });

        this.config = config;
    }

    private async _init(): Promise<void> {
        this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
        this.commandHandler.useListenerHandler(this.listenerHandler);
        this.listenerHandler.setEmitters({
            commandHandler: this.commandHandler,
            inhibitorHandler: this.inhibitorHandler,
            listenerHandler: this.listenerHandler
        });

        this.commandHandler.loadAll();
        this.listenerHandler.loadAll();
    }

    public async start(): Promise<string> {
        await this._init();
        return this.login(this.config.token);
    }
}