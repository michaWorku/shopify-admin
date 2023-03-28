export default function systemPermissions() {
    const systemPermissionsRepo = [
        {
            action: 'create',
            subject: 'User',
            conditions: {},
            fields: [],
            name: 'Create User',
            description:
                'With this permission the user can create users for the system',
            category: 'User',
        },
        {
            action: 'read',
            subject: 'User',
            conditions: {},
            fields: [],
            name: 'View Users',
            description:
                'With this permission the user can view all users on the system',
            category: 'User',
        },
        {
            action: 'update',
            subject: 'User',
            conditions: { edit_full: false },
            fields: [],
            name: 'edit Users',
            description:
                "With this permission the user can edit all users who doesm't have the same edit user permission",
            category: 'User',
        },
        {
            action: 'delete',
            subject: 'User',
            conditions: { delete_full: false },
            fields: [],
            name: 'delete Users',
            description:
                "With this permission the user can delete all users who doesm't have the same delete user permission",
            category: 'User',
        },
        {
            action: 'create',
            subject: 'Role',
            conditions: {},
            fields: [],
            name: 'Create Role',
            description:
                'With this permission the user can create a role with all permissions',
            category: 'Role',
        },
        {
            action: 'read',
            subject: 'Role',
            conditions: {},
            fields: [],
            name: 'View Roles',
            description: 'With this permission the user can view all roles',
            category: 'Role',
        },
        {
            action: 'update',
            subject: 'Role',
            conditions: {},
            fields: [],
            name: 'Edit Roles',
            description: 'With this permission the user can update all roles',
            category: 'Role',
        },
        {
            action: 'create',
            subject: 'Client',
            conditions: {},
            fields: [],
            name: 'Create Client',
            description: 'With this permission the user can create clients',
            category: 'Client',
        },
        {
            action: 'read',
            subject: 'Client',
            conditions: {},
            fields: [],
            name: 'View Clients',
            description: 'With this permission the user can view all clients',
            category: 'Client',
        },
        {
            action: 'update',
            subject: 'Client',
            conditions: {},
            fields: [],
            name: 'Edit Client',
            description:
                "With this permission the user can edit client's informations",
            category: 'Client',
        },
        {
            action: 'delete',
            subject: 'Client',
            conditions: {},
            fields: [],
            name: 'Delete Client',
            description: 'With this permission the user can create clients',
            category: 'Client',
        },
        {
            action: 'create',
            subject: 'BulkTask',
            conditions: {},
            fields: [],
            name: 'Create Bulk Task',
            description:
                'With this permission the user can create Bulk Taks',
            category: 'BulkTask',
        },
        {
            action: 'read',
            subject: 'BulkTask',
            conditions: {},
            fields: [],
            name: 'View Bulk Tasks',
            description:
                'With this permission the user can view all Bulk Tasks',
            category: 'BulkTask',
        },
        {
            action: 'update',
            subject: 'BulkTask',
            conditions: {},
            fields: [],
            name: 'Edit Bulk Task',
            description:
                "With this permission the user can edit Bulk Task",
            category: 'BulkTask',
        },
        {
            action: 'delete',
            subject: 'BulkTask',
            conditions: {},
            fields: [],
            name: 'Delete Bulk Task',
            description:
                'With this permission the user can create Bulk Task',
            category: 'BulkTask',
        },
        {
            action: 'create',
            subject: 'Configuration',
            conditions: {},
            fields: [],
            name: 'Create Configuration',
            description:
                'With this permission the user can create Configuration',
            category: 'Configuration',
        },
        {
            action: 'read',
            subject: 'Configuration',
            conditions: {},
            fields: [],
            name: 'View Configurations',
            description:
                'With this permission the user can view all Configurations',
            category: 'Configuration',
        },
        {
            action: 'update',
            subject: 'Configuration',
            conditions: {},
            fields: [],
            name: 'Edit Configuration',
            description: 'With this permission the user can edit Configuration',
            category: 'Configuration',
        },
        {
            action: 'delete',
            subject: 'Configuration',
            conditions: {},
            fields: [],
            name: 'Delete Configuration',
            description:
                'With this permission the user can delete Configuration',
            category: 'Configuration',
        },
        {
            action: 'read',
            subject: 'UsageReport',
            conditions: {},
            fields: [],
            name: 'View Usage Reports',
            description:
                'With this permission the user can view all Usage reports',
            category: 'Usage Report',
        },
        {
            action: 'create',
            subject: 'UsageReport',
            conditions: {},
            fields: [],
            name: 'Create Usage Report',
            description:
                'With this permission the user can create Usage report',
            category: 'Usage Report',
        },
        {
            action: 'read',
            subject: 'Activitylog',
            conditions: {},
            fields: [],
            name: 'view activity log',
            description:
                "With this permission the user can view user's activity log",
            category: 'Activitylog',
        },
        {
            action: 'read',
            subject: 'Permissions',
            conditions: {},
            fields: [],
            name: 'view all permissions',
            description:
                'With this permission the user can view all permissions',
            category: 'Permission',
        },
        {
            action: 'create',
            subject: 'Notification',
            conditions: {},
            fields: [],
            name: 'create Notification',
            description:
                'With this permission the user can create Notification',
            category: 'Notification',
        },
        {
            action: 'read',
            subject: 'Notification',
            conditions: {},
            fields: [],
            name: 'View sent notifications',
            description:
                'With this permission the user can view sent Notifications',
            category: 'Notification',
        },
    ]
    return systemPermissionsRepo
}