import { GuildMember } from "discord.js";
import { UserFriendlyError } from "./UserFriendlyError.class";

export class TeamAlreadyAssignedError extends UserFriendlyError {
    constructor(member: GuildMember) {
        super(`@${member.displayName} is already assigned to another team`);
    }
}
