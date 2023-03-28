import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import SecurePassword from 'secure-password'

const SP = new SecurePassword()
const prisma = new PrismaClient()
export const hashPassword = async (password: string) => {
    const hashedBuffer = await SP.hash(Buffer.from(password))
    return hashedBuffer.toString('base64')
}
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
            password: await hashPassword('password'),
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
