import dotenv from "dotenv";

dotenv.config();

export const CONFIG = {
    token: process.env.DISCORD_TOKEN!,
    adminRole: process.env.ADMIN_ROLE || "admin",
    playerRole: process.env.PLAYER_ROLE,
    createChannels: process.env.CREATE_CHANNELS === "true",
    maxTeamSize: parseInt(process.env.MAX_TEAM_SIZE || "4"),
};
