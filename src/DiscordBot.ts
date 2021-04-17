import { Client, Command, CommandMessage, Discord } from "@typeit/discord";
import { AssignCommand } from "./commands/Assign.command";
import { BocCommand } from "./commands/Boc.command";
import { CreateChansCommand } from "./commands/CreateChans.command";

@Discord("/", {
    import: [AssignCommand, BocCommand, CreateChansCommand],
})
export abstract class DiscordBot {}
