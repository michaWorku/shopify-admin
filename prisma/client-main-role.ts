import { PrismaClient } from "@prisma/client"
import SecurePassword from "secure-password"

const SP = new SecurePassword()
const prisma = new PrismaClient()
export const hashPassword = async (password: string) => {
  const hashedBuffer = await SP.hash(Buffer.from(password))
  return hashedBuffer.toString("base64")
}
async function main() {
  await prisma.$connect()
  const clientPermissions = await prisma.permission.findMany({
    where: {
      conditions: {
        not: {},
      },
    },
  })

  await prisma.role.create({
    data: {
      createdBy: "system",
      name: "client manage all role",
      description: "This is main role for companies.",
      permissions: {
        create: clientPermissions?.map((item: any) => {
          return {
            permission: {
              connect: {
                id: item?.id,
              },
            },
          }
        }),
      },
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
