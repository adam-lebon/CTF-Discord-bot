import { Guild, GuildMember, Role } from "discord.js";
import { inject, injectable } from "inversify";
import { CONFIG } from "../config";
import { Logger } from "tslog";
import { TeamAlreadyAssignedError } from "../errors/TeamAlreadyAssigned.error";
import { PlayerIsAdminError } from "../errors/PlayerIsAdmin.error";

@injectable()
export class TeamService {
    constructor(@inject(Logger) private logger: Logger) {}

    public async findOrCreateTeamRole(
        guild: Guild,
        teamName: string
    ): Promise<Role> {
        await guild.roles.fetch();

        // Find role or create if it doesn't exist
        let teamRole =
            guild.roles.cache
                .filter((role) => role.name === teamName)
                .first() ??
            (await guild.roles.create({
                data: { name: teamName, mentionable: true, hoist: true },
            }));

        return teamRole;
    }

    public async assignPlayerRole(
        guild: Guild,
        role: Role,
        ...members: GuildMember[]
    ) {
        const flagerzRole = guild.roles.cache.find(
            (role) => role.name === CONFIG.playerRole
        )!;

        await Promise.all(
            members.map((member) => {
                // FIXME: improve this
                if (member.roles.cache.size >= 3) {
                    throw new TeamAlreadyAssignedError(member);
                }

                if (
                    member.roles.cache.find(
                        (role) => role.name === CONFIG.adminRole
                    )
                ) {
                    throw new PlayerIsAdminError(member.displayName);
                }

                this.logger.debug(
                    `Adding role "${role.name}" to user @${member.displayName}`
                );
                return member.roles.add([flagerzRole, role]);
            })
        );
    }
}
