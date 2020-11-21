import { GuildMember } from "discord.js";

export class TeamAlreadyAssignedError extends Error {
    constructor(member: GuildMember, teamName: string) {
        super(`@${member.displayName} is already assign to team "${teamName}"`);
    }
}