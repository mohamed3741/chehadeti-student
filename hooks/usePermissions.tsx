import {useAuth} from "./useAuth";
import {hasAnyPermissionForResource, hasPermission} from "../utils/permissionUtils";


export const usePermissions = () => {

    const { connectedUser } = useAuth();

    const permissions: string[] | undefined = connectedUser?.permissions;

    const can = (resource: string, action: string): boolean => {
        return hasPermission(permissions, resource, action);
    };

    const canAny = (resource: string): boolean => {
        return hasAnyPermissionForResource(permissions, resource);
    };

    const getResourcePermissions = (resource: string) => {
        return {
            canView: can(resource, "view"),
            canCreate: can(resource, "create"),
            canUpdate: can(resource, "update"),
            canDelete: can(resource, "delete"),
            canArchive: can(resource, "archive"),
        };
    };

    return {
        can,
        canAny,
        getResourcePermissions,
        permissions,
    };
};
