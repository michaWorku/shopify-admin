import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const permissions = [
    {
        action: 'create',
        subject: 'Client',
        conditions: {},
        fields: [],
        name: 'Create Client',
        description:
            'With this permission the user can create a client',
        category: 'User',
    },
    {
        action: 'create',
        subject: 'Form',
        conditions: { clientId: '$clientId' },
        fields: [],
        name: 'Create form',
        description:
            'With this permission the client can create form',
        category: 'Client',
    },
    {
        action: 'create',
        subject: 'Reward',
        conditions: { clientId: '$clientId' },
        fields: [],
        name: 'Create reward',
        description:
            'With this permission the client can create reward',
        category: 'Client',
    },
    {
        action: 'read',
        subject: 'Submission',
        conditions: { clientId: '$clientId' },
        fields: [],
        name: 'View User form submisions',
        description:
            'With this permission the client can view user form submissions',
        category: 'Client',
    },
    {
        action: 'Read',
        subject: 'User',
        conditions: {clientId: '$clientId' },
        fields: [],
        name: 'Read User',
        description:
            'With this permission the client can read a user',
        category: 'Client',
    },
    {
        action: 'create',
        subject: 'Role',
        conditions: {},
        fields: [],
        name: 'Create a Role',
        description:
            'With this permission the user can create role for system users',
        category: 'Role',
    },
    {
        action: 'create',
        subject: 'User',
        conditions: {},
        fields: [],
        name: 'Create User',
        description:
            'With this permission the user can create system users',
        category: 'User',
    },
    {
        action: 'create',
        subject: 'BulkTask',
        conditions: {},
        fields: [],
        name: 'Create Bulk Task',
        description:
            'With this permission the user can create bulk tasks',
        category: 'User',
    },
]

async function main() {
    await prisma.$connect()

    await prisma.permission.createMany({
        data: permissions
    })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
