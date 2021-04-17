import "reflect-metadata";
import { Client } from "@typeit/discord";
import { CONFIG } from "./config";
import { DiscordBot } from "./DiscordBot";
import DIContainer from "./dependencies";
import { Logger } from "tslog";

const start = async () => {
    const logger = DIContainer.get(Logger);

    const client = new Client({
        classes: [DiscordBot],
        silent: false,
        variablesChar: ":",
    });

    try {
        await client.login(CONFIG.token);
        logger.info("Connected");
    } catch (error) {
        logger.error(error);
    }
};

start();
