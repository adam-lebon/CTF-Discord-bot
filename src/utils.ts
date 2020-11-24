import type { Guild, GuildMember, Role } from "discord.js";
import { CONFIG } from "./config";
import { TeamAlreadyAssignedError } from "./errors/TeamAlreadyAssigned.error";
import { logger } from "./logger";

const sanitizeTextChan = (name: string) => name.toLowerCase()
    .replace(/@/g, 'a')
    .replace(/[&<>\.\/\s'::\[\]]/g, '-')
    .replace(/-+/g, '-')
    .match(/^-*(.+)(?<!-)-*$/)![1];

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
    const existingCategory = guild.channels.cache.find(chan => chan.name === teamRole.name.toUpperCase() && chan.type === 'category');

    let category;
    if (!existingCategory) {
        logger.warn('Creating category', teamRole.name.toUpperCase());
        category = await guild.channels.create(teamRole.name.toUpperCase(), {
            type: 'category',
        });
    } else {
        category = existingCategory;
    }

    await category.overwritePermissions([
        {
            id: guild.roles.everyone,
            deny: ['VIEW_CHANNEL']
        },
        {
        id: teamRole,
        allow: [
            'SEND_MESSAGES',
            'ADD_REACTIONS',
            'VIEW_CHANNEL',
            'USE_EXTERNAL_EMOJIS',
            'EMBED_LINKS',
            'READ_MESSAGE_HISTORY',
            'ATTACH_FILES',

            'VIEW_CHANNEL',
            'CONNECT',
            'SPEAK',
            'STREAM'
        ]
    }]);

    const textChanName = sanitizeTextChan(teamRole.name);
    const textChannel = guild.channels.cache.find(chan =>{
        debugger;
        return chan.type === 'text'
        && chan.name === textChanName
    });
    if (textChannel) {
        if (textChannel.parentID !== category.id) {
            await textChannel.setParent(category.id);
        }
        await textChannel.lockPermissions();

    } else {
        logger.warn('Creating text channel', textChanName)
        const textChannel = await guild.channels.create(teamRole.name, { type: 'text', parent: category });

        if (wave) {
            await textChannel.send('👋');
        }
    }

    const voiceChannel = guild.channels.cache.find(chan =>
        chan.type === 'voice'
        && chan.name === teamRole.name
    );
    if (voiceChannel) {
        if (voiceChannel.parentID !== category.id) {
            await voiceChannel.setParent(category.id);
        }
        await voiceChannel.lockPermissions();
    } else {
        logger.warn('Creating voice channel', teamRole.name)
        await guild.channels.create(teamRole.name, { type: 'voice', parent: category });
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