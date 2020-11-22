import type { Guild, GuildMember, Role } from "discord.js";
import { CONFIG } from "./config";
import { TeamAlreadyAssignedError } from "./errors/TeamAlreadyAssigned.error";
import { logger } from "./logger";

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
        
        logger.debug(`Adding role "${teamRole.name}" to user @${member.displayName}`)
        return member.roles.add([
            flagerzRole,
            teamRole
        ]);
    }));

    // Channels creation
    if (CONFIG.createChannels) {
        await createChannels(guild, teamRole, true);
    }
};

export const createChannels = async (guild: Guild, teamRole: Role, wave = false) => {
    const category = guild.channels.cache.find(chan => chan.name === 'TEAM' && chan.type === 'category')
        ?? await guild.channels.create('TEAM', {
            type: 'category'
        });

    if (!guild.channels.cache.find(chan =>
        chan.type === 'text'
        && chan.name === teamRole.name.toLowerCase()
        && chan.parentID === category.id
    )) {
        const textChannel = await guild.channels.create(teamRole.name, { type: 'text', parent: category, permissionOverwrites: [
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
                ]
            }]
        });

        if (wave) {
            await textChannel.send('👋');
        }
    }

    if (!guild.channels.cache.find(chan =>
        chan.type === 'voice'
        && chan.name === teamRole.name
        && chan.parentID === category.id
    )) {
        await guild.channels.create(teamRole.name, { type: 'voice', parent: category, permissionOverwrites: [
                {
                    id: guild.roles.everyone,
                    deny: ['VIEW_CHANNEL']
                },
                {
                id: teamRole,
                allow: [
                    'VIEW_CHANNEL',
                    'CONNECT',
                    'STREAM'
                ]
            }]
        });
    }
};

export const deleteChans = async (guild: Guild) => {
    const category = guild.channels.cache.find(chan => chan.name === 'TEAM' && chan.type === 'category');

    if (category) {
        logger.debug('Parent channel is', category.name);
        const toDelete = guild.channels.cache.filter(channel => channel.parentID === category.id).array();

        logger.info('The following channels will be deleted', toDelete.map(chan => chan.name));
        await new Promise(resolve => setTimeout(resolve, 20e3));

        for (const channel of toDelete) {
            logger.debug('Deleting channel', channel.name);
            await channel.delete()
        }

        // await Promise.all(toDelete.map(channel => channel.delete()));

    } else {
        logger.error('Unable to find parent category');
    }
};