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
export abstract class CreateChansCommand {
    private logger: Logger;
    private channelService: ChannelService;
    private teamService: TeamService;

    constructor() {
        this.logger = DIContainer.get(Logger);
        this.channelService = DIContainer.get(ChannelService);
        this.teamService = DIContainer.get(TeamService);
    }

    @Command("createChans")
    @Guard(HasRole("admin"))
    public async assign(command: CommandMessage) {
        try {
            if (command.guild) {
                this.logger.info("Channels creation requested");

                const teams = new Set(
                    command.guild.members.cache
                        .filter(
                            (member) =>
                                member.roles.cache.size === 3 && // @everyone + flagerz + "nom de la team"
                                member.roles.cache
                                    .array()
                                    .find(
                                        (role) =>
                                            role.name === CONFIG.playerRole
                                    ) !== undefined
                        )
                        .map(
                            (member) =>
                                member.roles.cache.find(
                                    (role) =>
                                        ![
                                            "@everyone",
                                            CONFIG.playerRole,
                                        ].includes(role.name)
                                )!
                        )
                );

                for (const teamRole of teams) {
                    this.logger.info(
                        "Channels creation for team",
                        teamRole.name
                    );
                    await this.channelService.createTeamChannels(
                        command.guild,
                        teamRole,
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
