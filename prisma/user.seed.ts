import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
const prisma = new PrismaClient()

async function main() {
    await prisma.$connect()

    await prisma.user.create({
        data: {
            firstName: 'Super',
            middleName: 'Sewasew',
            lastName: 'Admin',
            email: 'admin@sewasewmultimedia.com',
            gender: 'MALE',
            phone: '0911111111',
            password: bcrypt.hashSync('password', 10),
            isVerified: true,
            status: 'ACTIVE',
            roles: {
                create: {
                    role: {
                        create: {
                            name: 'super-admin',
                            createdBy: 'system',
                            permissions: {
                                create: {
                                    permission: {
                                        create: {
                                            action: 'manage',
                                            subject: 'all',
                                            name: 'Manage All',
                                            description: 'User is able with all the actions',
                                        },
                                    },
                                },
                            },
                        }
                    }
                }
            },
            birthDate: new Date(),
        },
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
