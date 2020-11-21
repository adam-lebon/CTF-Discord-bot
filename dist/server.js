"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const tslog_1 = require("tslog");
const config_1 = require("./config");
const TeamAlreadyAssigned_error_1 = require("./errors/TeamAlreadyAssigned.error");
const utils_1 = require("./utils");
/** Configuration */
const logger = new tslog_1.Logger();
const client = new discord_js_1.Client();
/** Event listeners */
client.on('ready', () => __awaiter(void 0, void 0, void 0, function* () {
    logger.info(`Connected as ${client.user.tag}`);
    client.on('message', (message) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            if ((_a = message.member) === null || _a === void 0 ? void 0 : _a.roles.cache.find(role => role.name === config_1.CONFIG.adminRole)) {
                logger.debug(message.content);
                const matchResult = (_b = (message.content.match(/^\/assign "?([^<"]+)"? ((<@\d+>)+\s?)+/))) === null || _b === void 0 ? void 0 : _b.slice(1);
                if (matchResult) {
                    const [teamName] = matchResult;
                    const members = (_c = message.mentions.members) === null || _c === void 0 ? void 0 : _c.array();
                    if (message.guild && members) {
                        yield utils_1.assignUsersToTeam(message.guild, teamName, members);
                        logger.info('Users assign to team', `"${teamName}"`, members.map(member => `@${member.displayName}`).join(' '));
                    }
                }
                else if (message.content.match(/^\/createChans$/)) {
                    if (message.guild) {
                        logger.info('Channels creation requested');
                        const teams = new Set(message.guild.members.cache
                            .filter(member => member.roles.cache.size === 3 // @everyone + flagerz + "nom de la team"
                            && member.roles.cache.array().find(role => role.name === config_1.CONFIG.playerRole) !== undefined)
                            .map(member => member.roles.cache.find(role => !['@everyone', config_1.CONFIG.playerRole].includes(role.name))));
                        for (const teamRole of teams) {
                            logger.info('Channels creation for team', teamRole.name);
                            yield utils_1.createChannels(message.guild, teamRole);
                        }
                    }
                }
                else {
                    return;
                }
                yield message.delete();
                // await message.react('👌');
            }
        }
        catch (error) {
            if (error instanceof TeamAlreadyAssigned_error_1.TeamAlreadyAssignedError) {
                // logger.info(error.message);
                yield message.channel.send(`😠 ${error.message}`);
            }
            else {
                logger.fatal(error);
            }
        }
    }));
}));
client.login(config_1.CONFIG.token);
//# sourceMappingURL=server.js.map