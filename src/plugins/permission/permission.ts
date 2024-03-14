export enum Permission {
    SuperAdmin = 1 << 0,
    TicketCreate = 1 << 1,
    TicketUpdate = 1 << 2,
    TicketOperate = 1 << 3,
    CreateGame = 1 << 4,
    QueryGame = 1 << 5,
    UpdateGame = 1 << 6,
    DelGame = 1 << 7
}
function hasPermission(userRights: number, requiredPermission: number): boolean {
    return (userRights & requiredPermission) === requiredPermission;
}

function addPermission(userRights: number, permission: number): number {
    return userRights | permission;
}

function removePermission(userRights: number, permission: number): number {
    return userRights & ~permission;
}

export const isAdmin = (state: any): boolean => {
    return hasPermission(state.user.Info.permission, Permission.SuperAdmin);
};
