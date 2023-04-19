import { redirect } from 'react-router'
import type { ClientUser, Prisma, User } from '@prisma/client';
import { Client } from '@prisma/client'
import type { z } from 'zod'
import moment from 'moment-timezone'
import customErr, { Response, badRequest, errorHandler } from '~/utils/handler.server'
import { hashPassword, verifyPassword } from '~/utils/auth'
import { db } from '../db.server'
import { searchCombinedColumn, searchFunction } from '~/utils/params/search.server'
import { filterFunction, multipleFilter } from '~/utils/params/filter.server'
import { format } from '~/utils/format'
import getParams from '~/utils/params/getParams.server';

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
            if (client.isRewarded) {
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


/**
 * Retrieve all users.
 * @async
 * @function getUsers
 * @param {Request} request - The HTTP request object.
 * @returns {Promise<obj>} The retrieved users.
 * @throws {Error} Throws an error if users are not found.
 */
 export const getUsers = async (request: Request): Promise<any> => {
    try {
        const { sortType, sortField, skip, take, pageNo, search, filter, exportType } = getParams(request);

        const searchParams = searchFunction(search, 'User', ['firstName', 'middleName', 'lastName']);
        const filterParams = filterFunction(filter, 'User');

        const usersWhere: Prisma.UserWhereInput = {
            deletedAt: null,
            ...searchParams,
            ...filterParams,
        };

        const usersCount = await db.user.count({ where: usersWhere });

        if (usersCount === 0) {
            throw new customErr('Custom_Error', 'No user found', 404);
        }

        const users = await db.user.findMany({
            take,
            skip,
            orderBy: [{ [sortField]: sortType }],
            where: usersWhere
        });

        let exportData;

        if (exportType === 'page') {
            exportData = users;
        } else if (exportType === 'filtered') {
            exportData = await db.user.findMany({
                orderBy: [{ [sortField]: sortType }],
                where: usersWhere,
            });
        } else {
            exportData = await db.user.findMany({});
        }

        return Response({
            data: users,
            metaData: {
                page: pageNo,
                pageSize: take,
                total: usersCount,
                sort: [sortField, sortType],
                searchVal: search,
                filter,
                exportType,
                exportData,
            },
        })
    } catch (error) {
        console.log('Error occurred loading users.');
        console.dir(error, { depth: null });
        return errorHandler(error);
    }
};


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
