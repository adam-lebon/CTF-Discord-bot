import { Client, TextChannel } from "discord.js";
import { Logger } from "tslog";

import { CONFIG } from "./config";
import { TeamAlreadyAssignedError } from "./errors/TeamAlreadyAssigned.error";
import { assignUsersToTeam, createChannels } from "./utils";

/** Configuration */
const logger = new Logger();
const client = new Client();

/** Event listeners */
client.on('ready', async () => {
    logger.info(`Connected as ${client.user!.tag}`);

    client.on('message', async (message) => {
        try {
            if (message.member?.roles.cache.find(role => role.name === CONFIG.adminRole)) {
                logger.debug(message.content);
                const matchResult = (message.content.match(/^\/assign "?([^<"]+)"? ((<@\d+>)+\s?)+/))?.slice(1);
                if (matchResult) {
                    const [ teamName ] = matchResult;
                    const members = message.mentions.members?.array();
                    if (message.guild && members) {
                        await assignUsersToTeam(message.guild, teamName, members);
                        logger.info('Users assign to team', `"${teamName}"`, members.map(member => `@${member.displayName}`).join(' '));
                    }

                } else if (message.content.match(/^\/createChans$/)) {
                    if (message.guild) {
                        logger.info('Channels creation requested');

                        const teams = new Set(message.guild.members.cache
                            .filter(member =>
                                member.roles.cache.size === 3 // @everyone + flagerz + "nom de la team"
                                && member.roles.cache.array().find(role => role.name === CONFIG.playerRole) !== undefined
                            )
                            .map(member => member.roles.cache.find(role => !['@everyone', CONFIG.playerRole].includes(role.name))!)
                        );

                        for (const teamRole of teams) {
                            logger.info('Channels creation for team', teamRole.name);
                            await createChannels(message.guild, teamRole);
                        }
                    }

                } else {
                    return;
                }

                await message.delete()
                // await message.react('👌');
            }
            
        } catch (error) {
            if (error instanceof TeamAlreadyAssignedError) {
                // logger.info(error.message);
                await message.channel.send(`😠 ${error.message}`);
            } else {
                logger.fatal(error);
            }
        }
    });
});

client.login(CONFIG.token);

process.on('SIGINT', () => process.exit());