export default function clientPermissions() {
    const clientPermissionsRepo = [
        {
            action: 'create',
            subject: 'User',
            conditions: { clientId: '$clientId' },
            fields: [],
            name: 'Create client user',
            description:
                'With this permission the user can create a user for this client',
            category: 'User',
        },
        {
            action: 'read',
            subject: 'User',
            conditions: { clientId: '$clientId' },
            fields: [],
            name: 'View client users',
            description:
                'With this permission the user can view the users of this client',
            category: 'User',
        },
        {
            action: 'update',
            subject: 'User',
            conditions: { edit_partial: false, clientId: '$clientId' },
            fields: [],
            name: 'Edit client users',
            description:
                "With this permission the user can edit the users of this client who doesn't have edit user permissions",
            category: 'User',
        },
        {
            action: 'delete',
            subject: 'User',
            conditions: { delete_partial: false, clientId: '$clientId' },
            fields: [],
            name: 'Delete client users',
            description:
                "With this permission the user can delete the users of this client who doesn't have delete user permissions",
            category: 'User',
        },
        {
            action: 'create',
            subject: 'Role',
            conditions: { clientId: '$clientId' },
            fields: [],
            name: 'Create client role',
            description:
                'With this permission the user can create Role using the permissions given by this client',
            category: 'Role',
        },
        {
            action: 'update',
            subject: 'Role',
            conditions: { clientId: '$clientId' },
            fields: [],
            name: 'Edit client role ',
            description:
                'With this permission the user can edit Role with permissions given by this client',
            category: 'Role',
        },
        {
            action: 'read',
            subject: 'Payment',
            conditions: { clientId: '$clientId' },
            fields: [],
            name: 'View client payments',
            description:
                'With this permission the user can view payments made by this client',
            category: 'Payment',
        },
        {
            action: 'read',
            subject: 'Client',
            conditions: { clientId: '$clientId' },
            fields: [],
            name: 'View this client',
            description:
                'With this permission the user can view the clients basic informations',
            category: 'Client',
        },
        {
            action: 'create',
            subject: 'UsageReport',
            conditions: { clientId: '$clientId' },
            fields: [],
            name: "Create client's usage report",
            description:
                'With this permission the user can create usage report for this client',
            category: 'Usage Report',
        },
        {
            action: 'read',
            subject: 'UsageReport',
            conditions: { clientId: '$clientId' },
            fields: [],
            name: "View client's Usage Report",
            description:
                'With this permission the user can view usage reports of this client',
            category: 'Usage Report',
        },
        {
            action: 'request',
            subject: 'Invoice',
            conditions: { clientId: '$clientId' },
            fields: [],
            name: 'Requset client invoice',
            description:
                'With this permission the user can send a generate invoice request for this client',
            category: 'Invoice',
        },
        {
            action: 'read',
            subject: 'Invoice',
            conditions: { clientId: '$clientId' },
            fields: [],
            name: "View client's invoice",
            description:
                'With this permission the user can view invoices generated for this client',
            category: 'Invoice',
        },
        {
            action: 'read',
            subject: 'Notification',
            conditions: { clientId: '$clientId' },
            fields: [],
            name: "View client's Notifications",
            description:
                'With this permission the user can see notifications sent for this client',
            category: 'Notification',
        },
    ]
    return clientPermissionsRepo
}
