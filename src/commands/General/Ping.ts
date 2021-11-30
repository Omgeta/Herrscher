import { Message } from "discord.js";
import { Command } from "discord-akairo";

export default class PingCommand extends Command {
    public constructor() {
        super("ping", {
            aliases: ["ping", "latency"],
            category: "Utility",
            description: {
                content: "Check the latency to the Discord API",
                usage: "ping",
                examples: [
                    "ping"
                ]
            },
            ratelimit: 3
        });
    }

    public exec(message: Message): Promise<Message> {
        return message.util.send(`API Latency is \`${this.client.ws.ping}\`ms.`);
    }
}