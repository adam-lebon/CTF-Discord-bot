import { CategoryChannel, Guild, Role } from "discord.js";
import { inject, injectable } from "inversify";
import { Logger } from "tslog";
import slugify from "slugify";

@injectable()
export abstract class ChannelService {
    constructor(@inject(Logger) private logger: Logger) {}

    /**
     * Create all required discord channels for a team
     * @param guild
     * @param teamRole
     * @param wave
     */
    public async createTeamChannels(
        guild: Guild,
        teamRole: Role,
        wave = false
    ) {
        const category = await this.findOrCreateCategory(
            guild,
            teamRole.name.toUpperCase(),
            teamRole
        );

        const textChanName = this.slugifyChannel(teamRole.name);
        const textChannel = guild.channels.cache.find((chan) => {
            return chan.type === "text" && chan.name === textChanName;
        });
        if (textChannel) {
            if (textChannel.parentID !== category.id) {
                await textChannel.setParent(category.id);
            }
            await textChannel.lockPermissions();
        } else {
            this.logger.warn("Creating text channel", textChanName);
            const textChannel = await guild.channels.create(teamRole.name, {
                type: "text",
                parent: category,
            });

            if (wave) {
                await textChannel.send("👋");
            }
        }

        const voiceChannel = guild.channels.cache.find(
            (chan) => chan.type === "voice" && chan.name === teamRole.name
        );
        if (voiceChannel) {
            if (voiceChannel.parentID !== category.id) {
                await voiceChannel.setParent(category.id);
            }
            await voiceChannel.lockPermissions();
        } else {
            this.logger.warn("Creating voice channel", teamRole.name);
            await guild.channels.create(teamRole.name, {
                type: "voice",
                parent: category,
            });
        }
    }

    /**
     * Find a category channel in a specific guild
     * If it doesn't exists, it will create a new one.
     * @param categoryName The category's name to search
     */
    public async findOrCreateCategory(
        guild: Guild,
        categoryName: string,
        role: Role
    ): Promise<CategoryChannel> {
        categoryName = categoryName.toUpperCase();

        // Check if a category already exists
        const existingCategory = guild.channels.cache.find(
            (chan) => chan.name === categoryName && chan.type === "category"
        );

        let category: CategoryChannel;
        if (existingCategory) {
            category = existingCategory as CategoryChannel;
        } else {
            this.logger.warn("Creating category", categoryName);
            category = await guild.channels.create(categoryName, {
                type: "category",
            });
        }

        await category.overwritePermissions([
            {
                id: guild.roles.everyone,
                deny: ["VIEW_CHANNEL"],
            },
            {
                id: role,
                allow: [
                    "SEND_MESSAGES",
                    "ADD_REACTIONS",
                    "VIEW_CHANNEL",
                    "USE_EXTERNAL_EMOJIS",
                    "EMBED_LINKS",
                    "READ_MESSAGE_HISTORY",
                    "ATTACH_FILES",

                    "VIEW_CHANNEL",
                    "CONNECT",
                    "SPEAK",
                    "STREAM",
                ],
            },
        ]);

        return category;
    }

    private slugifyChannel(name: string): string {
        return slugify(name, {
            replacement: "-",
            remove: new RegExp("[@#:`]"),
        });
    }
}
