import { Command, CommandMessage, Guard } from "@typeit/discord";
import { Logger } from "tslog";
import { injectable } from "inversify";
import { CONFIG } from "../config";
import DIContainer from "../dependencies";
import { HasRole } from "../guards/HasRole.guard";
import { ChannelService } from "../services/Channel.service";
import { TeamService } from "../services/Team.service";
import { UserFriendlyError } from "../errors/UserFriendlyError.class";

@injectable()
export abstract class AssignCommand {
    private logger: Logger;
    private channelService: ChannelService;
    private teamService: TeamService;

    constructor() {
        this.logger = DIContainer.get(Logger);
        this.channelService = DIContainer.get(ChannelService);
        this.teamService = DIContainer.get(TeamService);
    }

    @Command("assign :teamname")
    @Guard(HasRole("admin"))
    public async assign(command: CommandMessage) {
        try {
            const teamName: string = command.args.teamname;

            const members = command.mentions.members?.array();

            if (command.guild && members) {
                this.logger.info(
                    "Users assign to team",
                    `"${teamName}"`,
                    members.map((member) => `@${member.displayName}`).join(" ")
                );

                const guild = command.guild;

                const role = await this.teamService.findOrCreateTeamRole(
                    guild,
                    teamName
                );
                await this.teamService.assignPlayerRole(
                    guild,
                    role,
                    ...members
                );

                // Channels creation
                if (CONFIG.createChannels) {
                    await this.channelService.createTeamChannels(
                        guild,
                        role,
                        true
                    );
                }
            }
        } catch (exception) {
            if (exception instanceof UserFriendlyError) {
                command.reply(`⚠️ ${exception.message}`);
                this.logger.warn(exception.message);
            } else {
                this.logger.error(exception);
            }
        }
    }
}
