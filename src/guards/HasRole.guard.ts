import { ArgsOf, GuardFunction } from "@typeit/discord";

/**
 * Filter users using a specific role
 * @param args
 */
export const HasRole = (roleName: string): GuardFunction => async (
    [message]: ArgsOf<"commandMessage">,
    client,
    next
) => {
    if (message.member?.roles.cache.find((role) => role.name === roleName)) {
        await next();
    }
};
