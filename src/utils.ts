import type { Guild, GuildMember, Role } from "discord.js";
import { CONFIG } from "./config";
import { TeamAlreadyAssignedError } from "./errors/TeamAlreadyAssigned.error";

/**
 * Create role and assign this role to members
 * @param guild 
 * @param teamName 
 */
export const assignUsersToTeam = async (guild: Guild, teamName: string, members: GuildMember[]) => {    
    await guild.roles.fetch();

    let teamRole = guild.roles.cache.filter(role => role.name === teamName).first()
        ?? await guild.roles.create({ data: { name: teamName, mentionable: true, hoist: true }});


    const flagerzRole = guild.roles.cache.find(role => role.name === 'flagerz')!;
    await Promise.all(members.map(member => {
        if (member.roles.cache.size >= 3) {
            throw new TeamAlreadyAssignedError(member, teamName);
        }
        
        return member.roles.add([
            flagerzRole,
            teamRole
        ]);
    }));

    // Channels creation
    if (CONFIG.createChannels) {
        createChannels(guild, teamRole)
    }
};

export const createChannels = async (guild: Guild, teamRole: Role) => {
    const category = guild.channels.cache.find(chan => chan.name === 'TEAM' && chan.type === 'category')
        ?? await guild.channels.create('TEAM', {
            type: 'category',
            permissionOverwrites: [
                {
                    id: guild.roles.everyone,
                    deny: ['VIEW_CHANNEL']
                },
                {
                id: teamRole,
                allow: [
                    'SEND_MESSAGES',
                    'VIEW_CHANNEL',
                    'USE_EXTERNAL_EMOJIS',
                    'EMBED_LINKS',
                    'READ_MESSAGE_HISTORY',
                    'ATTACH_FILES',
                    'CONNECT',
                    'STREAM'
                ]
            }]
        });

    if (!guild.channels.cache.find(chan =>
        chan.type === 'text'
        && chan.name === teamRole.name.toLowerCase()
        && chan.parentID === category.id
    )) {
        await guild.channels.create(teamRole.name, { type: 'text', parent: category });
    }

    if (!guild.channels.cache.find(chan =>
        chan.type === 'voice'
        && chan.name === teamRole.name
        && chan.parentID === category.id
    )) {
        await guild.channels.create(teamRole.name, { type: 'voice', parent: category });
    }
};
