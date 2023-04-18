import { redirect } from 'react-router'
import type { ClientUser, Prisma, User } from '@prisma/client';
import { Client } from '@prisma/client'
import type { z } from 'zod'
import moment from 'moment-timezone'
import customErr, { badRequest } from '~/utils/handler.server'
import { hashPassword, verifyPassword } from '~/utils/auth'
import { db } from '../db.server'
import { searchCombinedColumn } from '~/utils/params/search.server'
import { multipleFilter } from '~/utils/params/filter.server'
import { format } from '~/utils/format'

export enum Role {
    'ADMIN',
    'USER',
    'AGENT',
}

export type SignupForm = {
    firstName: string
    middleName: string
    lastName: string
    email: string
    phone: string
    password?: string
}

const userSelect: Prisma.UserSelect = {
    id: true,
    firstName: true,
    middleName: true,
    lastName: true,
    phone: true,
    email: true,
    gender: true,
    birthDate: true,
    isVerified: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
}

export const userFormHandler = async (
    request: Request,
    schema: z.ZodObject<any>
) => {
    const form = await request.formData()
    const firstName = form.get('firstName')
    const middleName = form.get('middleName')
    const lastName = form.get('lastName')
    const email = form.get('email')
    let phone = form.get('phone') as string
    const role = form.get('role')
    const password = form.get('password')
    if (phone) {
        const parsedPhone = phone.startsWith('+') ? phone.slice(1) : phone
        phone = `251${
            parsedPhone.startsWith('0')
                ? parsedPhone.slice(1)
                : parsedPhone.startsWith('251')
                ? parsedPhone.slice(3)
                : parsedPhone
        }`
    }

    let fields: any = {
        firstName,
        middleName,
        lastName,
        email,
        phone,
        role,
    }
    if (request.method === 'POST') fields.password = password
    const result = schema.safeParse(fields)
    console.log({ result })
    if (!result?.success) {
        const error = result?.error?.flatten()
        return badRequest({ fields, error: { error } })
    }
    return result
}
export const createUser = async (user: SignupForm) => {
    try {
        const hashedPassword = await hashPassword(user?.password as string)
        return db.user.create({
            data: {
                firstName: user.firstName,
                middleName: user.middleName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                password: hashedPassword,
            },
            select: userSelect,
        })
    } catch (error) {
        throw error
    }
}

export const checkUserExists = async (fieldType: string, phone: string) => {
    try {
        const user =
            (await db.user.count({
                where: {
                    [fieldType]: phone,
                    deletedAt: null,
                },
            })) > 0
        if (user) return user
        return null
        // throw new Error('User not found')
    } catch (error) {
        throw error
    }
}

export const userLogin = async (email: string, password: string) => {
    const user = await db.user.findFirst({ where: { email } })
    if (!user) {
        throw new Error('User not found')
    }

    const { result, error, improvedHash } = await verifyPassword(
        user.password as string,
        password
    )

    if (result === 'INVALID') {
        throw error ? error : new Error('Invalid Password')
    }

    if (improvedHash) {
        await db.user.update({
            data: { password: improvedHash },
            where: { id: user.id },
        })
    }

    const { password: userPassword, ...sessionUser } = user

    return sessionUser
}

export const getUserById = async (userId: string) => {
    if (!userId) {
        throw new customErr('Custom_Error', 'User ID is required', 404)
    }
    try {
        const user = (await db.user.findUnique({
            where: { id: userId },
            include: {
                clients: true,
                roles: {
                    select: {
                        role: true,
                    },
                },
                submissions: true,
                rewards: true,
                blulkTasks: true,
            },
        })) as any
        let clientUser: string[] = []
        let clientSystemUser: string[] = []
        user.roles = user?.roles?.map((e: any) => e.role)
        user?.clients?.forEach((client: ClientUser) => {
            if (client.isSystemUser) {
                clientSystemUser.push(client.clientId)
                return
            }
            if (client.isRewareded) {
                clientUser.push(client.clientId)
            }
        })

        return Object.assign(user, {
            clientIds: clientSystemUser.length ? clientSystemUser : clientUser,
        })
    } catch (error) {
        throw error
    }
}

export const updateUser = async (data: Partial<User>) => {
    try {
        console.log({ updateUser: data })
        return await db.user.update({
            where: { phone: data.phone },
            data,
            select: userSelect,
        })
    } catch (error) {
        throw error
    }
}

export const deleteUser = async (phone: string) => {
    try {
        return await db.user.update({
            data: {
                deletedAt: new Date(),
            },
            where: { phone },
            select: userSelect,
        })
    } catch (error) {
        throw error
    }
}

export const getUsers = async (request: Request) => {
    try {
        const url = new URL(request.url)

        let filters = url.searchParams.get('filters')
        if (typeof filters === 'string' && !!filters)
            filters = JSON.parse(filters)
        let sort: any = url.searchParams.get('sort')
        if (typeof sort === 'string' && !!sort) sort = JSON.parse(sort)
        const page = url.searchParams.get('page')
        const perPage = url.searchParams.get('perPage')
        const search = url.searchParams.get('search') || ''
        console.log({ search, filters, page, perPage, sort })

        const fields = ['firstName', 'middleName', 'lastName', 'email', 'phone']
        const take = perPage ? parseInt(perPage) : 5
        const count = await db.user.count({
            where: {
                ...(search ? searchCombinedColumn(search, fields) : {}),
                ...(filters?.length ? multipleFilter(filters, 'User') : {}),
            },
        })

        const users = await db.user.findMany({
            where: {
                ...(search !== '' ? searchCombinedColumn(search, fields) : {}),
                ...(filters?.length ? multipleFilter(filters, 'User') : {}),
            },
            orderBy: sort?.length
                ? sort?.map((item: any) => {
                      if (item.field === 'name') {
                          return {
                              firstName: item.sort,
                          }
                      }
                      return { [item.field]: item.sort }
                  })
                : {},
            select: userSelect,
            take,
            skip: page ? take * parseInt(page) : 0,
        })
        return {
            data: {
                users: users?.map((user: any) => ({
                    ...user,
                    createdAt: moment(new Date(user?.createdAt), format)
                        .tz('Africa/Addis_Ababa')
                        .format(format),
                    updatedAt: moment(new Date(user?.updatedAt), format)
                        .tz('Africa/Addis_Ababa')
                        .format(format),
                    deletedAt: user?.deltedAt
                        ? moment(new Date(user?.deletedAt), format)
                              .tz('Africa/Addis_Ababa')
                              .format(format)
                        : '',
                })),
            },
            metaData: {
                total: count,
                page,
                perPage,
                search,
                filters,
                sort,
            },
        }
    } catch (error) {
        throw error
    }
}

export const updatePassword = async (phone: string, password: string) => {
    try {
        const hashedPassword = await hashPassword(password)
        console.log({ afterHash: new Date() })

        return await db.user.update({
            data: {
                password: hashedPassword,
            },
            where: { phone },
            select: userSelect,
        })
    } catch (error) {
        throw error
    }
}
