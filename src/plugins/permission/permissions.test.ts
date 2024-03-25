import { Permission, addPermission, hasPermission, isAdmin, listPermissions, removePermission } from "./permission";

describe("Permissions System", () => {
    test("SuperAdmin has all permissions", () => {
        const superAdminRights = Permission.SuperAdmin;
        expect(hasPermission(superAdminRights, Permission.TicketCreate)).toBe(true);
        expect(hasPermission(superAdminRights, Permission.DelGame)).toBe(true);
        expect(isAdmin({ user: { Info: { permission: superAdminRights } } })).toBe(true);
    });

    test("Add and check permission", () => {
        let userRights = 0; // Initially no permissions
        userRights = addPermission(userRights, Permission.TicketCreate);
        expect(hasPermission(userRights, Permission.TicketCreate)).toBe(true);
        expect(hasPermission(userRights, Permission.TicketUpdate)).toBe(false); // Not added yet
    });

    test("Remove permission", () => {
        let userRights = addPermission(0, Permission.QueryGame);
        userRights = removePermission(userRights, Permission.QueryGame);
        expect(hasPermission(userRights, Permission.QueryGame)).toBe(false);
    });

    test("Multiple permissions manipulation", () => {
        let userRights = addPermission(0, Permission.TicketCreate);
        userRights = addPermission(userRights, Permission.TicketUpdate);
        userRights = addPermission(userRights, Permission.CreateGame);
        expect(hasPermission(userRights, Permission.TicketCreate)).toBe(true);
        expect(hasPermission(userRights, Permission.TicketUpdate)).toBe(true);
        expect(hasPermission(userRights, Permission.CreateGame)).toBe(true);
        userRights = removePermission(userRights, Permission.TicketUpdate);
        expect(hasPermission(userRights, Permission.TicketUpdate)).toBe(false);
    });

    test("listPermissions returns correct permissions for a user", () => {
        let userRights = addPermission(0, Permission.TicketCreate);
        userRights = addPermission(userRights, Permission.TicketUpdate);
        userRights = addPermission(userRights, Permission.QueryGame);
        const expectedPermissions = [Permission.TicketCreate, Permission.TicketUpdate, Permission.QueryGame];
        expect(listPermissions(userRights)).toEqual(expect.arrayContaining(expectedPermissions));
    });

    test("listPermissions includes SuperAdmin and ignores other permissions", () => {
        const userRights = Permission.SuperAdmin;
        expect(listPermissions(userRights)).toEqual(expect.arrayContaining([Permission.SuperAdmin]));
    });

    test("listPermissions returns an empty array for no permissions", () => {
        const userRights = 0; // No permissions
        expect(listPermissions(userRights)).toEqual([]);
    });

    test("listPermissions works with multiple permissions including SuperAdmin", () => {
        let userRights = Permission.SuperAdmin;
        userRights = addPermission(userRights, Permission.TicketCreate); // This should not affect the outcome
        userRights = addPermission(userRights, Permission.DelGame); // This should not affect the outcome
        const expectedPermissions = [Permission.SuperAdmin];
        expect(listPermissions(userRights)).toEqual(expect.arrayContaining(expectedPermissions));
    });
});
