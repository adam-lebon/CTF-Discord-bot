"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONFIG = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.CONFIG = {
    token: process.env.DISCORD_TOKEN,
    adminRole: process.env.ADMIN_ROLE,
    playerRole: process.env.PLAYER_ROLE,
    createChannels: process.env.CREATE_CHANNELS === "true"
};
//# sourceMappingURL=config.js.map