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
exports.createChannels = exports.assignUsersToTeam = void 0;
const config_1 = require("./config");
const TeamAlreadyAssigned_error_1 = require("./errors/TeamAlreadyAssigned.error");
/**
 * Create role and assign this role to members
 * @param guild
 * @param teamName
 */
const assignUsersToTeam = (guild, teamName, members) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    yield guild.roles.fetch();
    let teamRole = (_a = guild.roles.cache.filter(role => role.name === teamName).first()) !== null && _a !== void 0 ? _a : yield guild.roles.create({ data: { name: teamName, mentionable: true, hoist: true } });
    const flagerzRole = guild.roles.cache.find(role => role.name === 'flagerz');
    yield Promise.all(members.map(member => {
        if (member.roles.cache.size >= 3) {
            throw new TeamAlreadyAssigned_error_1.TeamAlreadyAssignedError(member, teamName);
        }
        return member.roles.add([
            flagerzRole,
            teamRole
        ]);
    }));
    // Channels creation
    if (config_1.CONFIG.createChannels) {
        exports.createChannels(guild, teamRole);
    }
});
exports.assignUsersToTeam = assignUsersToTeam;
const createChannels = (guild, teamRole) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const category = (_b = guild.channels.cache.find(chan => chan.name === 'TEAM' && chan.type === 'category')) !== null && _b !== void 0 ? _b : yield guild.channels.create('TEAM', {
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
            }
        ]
    });
    if (!guild.channels.cache.find(chan => chan.type === 'text'
        && chan.name === teamRole.name.toLowerCase()
        && chan.parentID === category.id)) {
        yield guild.channels.create(teamRole.name, { type: 'text', parent: category });
    }
    if (!guild.channels.cache.find(chan => chan.type === 'voice'
        && chan.name === teamRole.name
        && chan.parentID === category.id)) {
        yield guild.channels.create(teamRole.name, { type: 'voice', parent: category });
    }
});
exports.createChannels = createChannels;
//# sourceMappingURL=utils.js.map