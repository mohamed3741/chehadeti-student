
export const SCREEN_PERMISSION_MAP: { [screen: string]: string } = {
    HomeScreen: "dashboard",
    TeachersListScreen: "teacher",
    StudentsScreen: "enrollment",
    EmployeesListScreen: "employee",
    ClassesListScreen: "class-course",
    BlocksListScreen: "salle",
    ExamsListScreen: "evaluation",
    ResultsListScreen: "bulletin",
    AttendancesListScreen: "attendance",
    EventsListScreen: "weekly-schedule",
    AccountsScreen: "account",
    ExtraExpensesScreen: "extra-expense",
    SettingsScreen: "settings",
    // If you have a dedicated FinancesScreen resource on backend, set it here:
    // FinanceScreen: "finance",
    // Otherwise you can map it to "account" or remove it:
    FinanceScreen: "account",
};

// ---- core checks (same as web) ----

export const hasPermission = (
    permissions: string[] | undefined,
    resource: string,
    action: string = "view"
): boolean => {
    if (!permissions || permissions.length === 0) return false;
    const specific = `${resource}.${action}`;
    return permissions.includes(specific);
};

export const hasAnyPermissionForResource = (
    permissions: string[] | undefined,
    resource: string
): boolean => {
    if (!permissions || permissions.length === 0) return false;
    return permissions.some((p) => p.startsWith(`${resource}.`));
};

// ---- mobile helpers (screen-centric) ----

export const canAccessScreen = (
    permissions: string[] | undefined,
    screen: string
): boolean => {
    if (screen === "HomeScreen") {
        return hasPermission(permissions, "dashboard", "view");
    }
    const resource = SCREEN_PERMISSION_MAP[screen];
    if (!resource) return false; // deny unknown routes by default
    return hasPermission(permissions, resource, "view");
};

export const filterIconsByPermissions = (
    iconItems: Array<{ key: string; screen: string; [k: string]: any }>,
    permissions: string[] | undefined
): Array<{ key: string; screen: string; [k: string]: any }> => {
    if (!permissions || permissions.length === 0) {
        // show only logout if present
        return iconItems.filter((i) => i.screen === "Logout");
    }
    return iconItems.filter((i) => {
        if (i.screen === "Logout") return true; // always allow logout
        return canAccessScreen(permissions, i.screen);
    });
};
