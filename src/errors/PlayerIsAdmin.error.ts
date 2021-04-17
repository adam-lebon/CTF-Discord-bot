import { UserFriendlyError } from "./UserFriendlyError.class";

export class PlayerIsAdminError extends UserFriendlyError {
    constructor(playerName: string) {
        super(
            `${playerName} cannot be assigned to a team since this user is an admin`
        );
    }
}
