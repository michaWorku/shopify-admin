import { createAbility } from './defineAbility'
import interpolate from './interpolate'
import { ForbiddenError, subject } from '@casl/ability'
import type { MongoAbility } from '@casl/ability'
import { json } from '@remix-run/node'
import { permittedFieldsOf } from '@casl/ability/extra'
import { Prisma } from '@prisma/client'
import { pick } from 'lodash'
import { getUserPermissions } from '~/services/Role/Permissions/permission.server'
import { getUserById } from '~/services/User/Users.server'
import { Response, errorHandler } from '../handler.server'

export enum AbilityType {
    FULL, // eslint-disable-line
    PARTIAL, // eslint-disable-line
    BOTH, // eslint-disable-line
}
export default async function canUser(
    userId: string,
    action: any,
    subj: any,
    daTa: any,
    permissionType: AbilityType = AbilityType.FULL
) {
    let partial
    try {
        const user = await getUserById(userId)
        const permissions = (await getUserPermissions(userId)) as any

        if (permissionType === AbilityType.BOTH) {
            partial = permissions.some(
                (per: any) =>
                    (per.action === action || per.action === 'manage') &&
                    (per.subject === subj || per.subject === 'all')
            )
            const parsedPermissions = interpolate(JSON.stringify(permissions), {
                user,
            })
            const ability: MongoAbility = createAbility(parsedPermissions)
            ForbiddenError.from(ability).throwUnlessCan(
                action,
                subject(subj, daTa)
            )
            return json(
                Response({
                    data: {
                        ability: true,
                        partial: partial,
                    },
                }),
                {
                    status: 200,
                }
            )
        }
        if (permissionType === AbilityType.PARTIAL) {
            const partial = permissions.some(
                (per: any) =>
                    (per.action === action || per.action === 'manage') &&
                    (per.subject === subj || per.subject === 'all')
            )
            if (partial) {
                return json(
                    Response({
                        data: {
                            partial: partial,
                        },
                    }),
                    {
                        status: 200,
                    }
                )
            } else {
                // throw ForbiddenError
                return json(
                    Response({
                        error: { error: { message: 'Unauthorized' } },
                    }),
                    { status: 403 }
                )
            }
        } else {
            const parsedPermissions = interpolate(JSON.stringify(permissions), {
                user,
            })
            const ability: MongoAbility = createAbility(parsedPermissions)
            ForbiddenError.from(ability).throwUnlessCan(
                action,
                subject(subj, daTa)
            )

            return json(
                Response({
                    data: {
                        ability: true,
                    },
                }),
                {
                    status: 200,
                }
            )
        }
    } catch (err) {
        if (
            err instanceof ForbiddenError &&
            partial &&
            permissionType === AbilityType.BOTH
        ) {
            return json(
                Response({
                    data: {
                        ability: false,
                        partial: partial,
                    },
                }),
                {
                    status: 200,
                }
            )
        }
        return errorHandler(err)
    }
}
