import { Command, CommandMessage } from "@typeit/discord";

export abstract class BocCommand {

    @Command("boc")
    public async boc(command: CommandMessage) {
        const answer = ["bite", "couille"][Math.floor(Math.random() * 2)];

        const reply = await command.channel.send(answer);

        setTimeout(() => {
            reply.delete();
        }, 5e3);
    }

}
