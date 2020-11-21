"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamAlreadyAssignedError = void 0;
class TeamAlreadyAssignedError extends Error {
    constructor(member, teamName) {
        super(`@${member.displayName} is already assign to team "${teamName}"`);
    }
}
exports.TeamAlreadyAssignedError = TeamAlreadyAssignedError;
//# sourceMappingURL=TeamAlreadyAssigned.error.js.map