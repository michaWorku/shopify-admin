//@ts-nocheck
import { ForbiddenError } from '@casl/ability'
import {
    PrismaClientInitializationError,
    PrismaClientKnownRequestError,
    PrismaClientUnknownRequestError,
    PrismaClientValidationError,
} from '@prisma/client/runtime'
import { json, MaxPartSizeExceededError } from '@remix-run/node'
import { formatFileSize } from './format'

/**
 *
 * @description Custom Bad Request Error
 * @returns custom error response response 
 * @params data : TActionData
 * @params status : Status code
 */
export function badRequest<TActionData>(data: TActionData, status = 400) {
    return json<TActionData>(data, { status })
}

/**
 *
 * @description Custom Errors
 * @returns custom response from error handler
 * @params error : Name of error
 * @params message :Message relate to the error
 */

export type customErrorT = {
    error?: string
    message?: string
    status?: number
}
export default class customErr {
    constructor(error: string, message: string, status: number) {
        this.error = error
        this.message = message
        this.status = status
    }
    getAllErrors() {
        return {
            error: this.error,
            message: this.message,
            status: this.status,
        }
    }
}

export const errorHandler = async (err: any) => {
    if (err.status === 302) {
        return err
    }
    if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
            return json(
                Response({
                    error: {
                        error: {
                            message: `${err.meta.target.join(
                                ','
                            )} already exists.`,
                        },
                    },
                }),
                { status: 422 }
            )
        }
        if (err.code === 'P2011') {
            return json(
                Response({
                    error: {
                        error: {
                            message: `Empty value invalid input ${err.meta.target.join(
                                ','
                            )}`,
                        },
                    },
                }),
                { status: 422 }
            )
        }
        if (
            err.code === 'P2025'
        ) {
            console.log({ code: err.errorCode })
            return json(
                Response({
                    error: {
                        error: {
                            message: err?.meta?.cause
                        },
                    },
                }),
                { status: 400 }
            )
        }
    }
    if (err instanceof PrismaClientValidationError) {
        return json(
            Response({
                error: {
                    error: {
                        message: `Input validation failed ${err?.meta?.target?.join(
                            ','
                        )}`,
                    },
                },
            }),
            { status: 422 }
        )
    }
    if (err instanceof PrismaClientInitializationError) {
        if (
            err.errorCode === 'P1001' ||
            err.errorCode === 'P1002' ||
            err.errorCode === 'P1017'
        ) {
            return json(
                Response({
                    error: {
                        error: {
                            message: `Could not connect with db server, please check you connection ${err?.meta?.target?.join(
                                ','
                            )}`,
                        },
                    },
                }),
                { status: 422 }
            )
        }
    }
    if (err instanceof PrismaClientUnknownRequestError) {
        return json(
            Response({
                error: {
                    error: {
                        message: `'Better restart the app ${err?.meta?.target?.join(
                            ','
                        )}`,
                    },
                },
            }),
            { status: 500 }
        )
    }
    //File Upload Error
    if (err instanceof MaxPartSizeExceededError) {
        return json(
            Response({
                error: [
                    {
                        error: {
                            message: 'Validation Error',
                        },
                        fieldError: {
                            field: err?.field,
                            message: `file is larger than ${formatFileSize(
                                err?.maxBytes
                            )}`,
                        },
                    },
                ],
            }),
            { status: 422 }
        )
    }
    //Casl Error
    if (err instanceof ForbiddenError) {
        const newMessage = err.message
            .replace(' excute "', ' ')
            .replace('" on "', ' ')
            .replace('"', '')
            .replace('read', 'view')
        return json(
            Response({
                error: {
                    error: {
                        message: newMessage,
                    },
                },
            }),
            { status: 403 }
        )
    }

    if (err instanceof customErr) {
        const allErrors = new customErr(err)
        const { error, message, status } = allErrors.getAllErrors().error

        if (error == 'UNKNOWN_ROUTE') {
            return json(
                Response({
                    data: {},
                    error: {
                        error: {
                            message: message,
                        },
                    },
                }),
                { status: status || 404 }
            )
        }
        if (error == 'NOT_FOUND') {
            return json(
                Response({
                    data: {},
                    error: {
                        error: {
                            message: message,
                        },
                    },
                }),
                { status: status || 404 }
            )
        }
        if (error == 'Custom_Error') {
            return json(
                Response({
                    data: {},
                    error: {
                        error: {
                            message: message,
                        },
                    },
                }),
                { status: status || 404 }
            )
        }
    }

    //Unknown Error
    if (err.name === 'Error') {
        return json(
            Response({
                error: { error: { message: 'Something went wrong !!' } },
            }),
            { status: 500 }
        )
    }
    if (err.name === 'TypeError') {
        return json(
            Response({
                error: { error: { message: 'Something went wrong !!' } },
            }),
            { status: 500 }
        )
    }

    if (err.name === 'casl_Bad_Request') {
        if (err.code === 'P2002') {
            console.log({ err })
            return json(
                Response({
                    error: {
                        error: {
                            message: `${err.meta.target.join(
                                ','
                            )} already exists.`,
                        },
                    },
                }),
                { status: 422 }
            )
        }
        return json(
            Response({
                error: {
                    error: {
                        message: err.message,
                    },
                },
            }),
            {
                status: 400,
            }
        )
    }

    let jsonError = await err?.json()
    if (jsonError) {
        return json(
            Response({
                error: {
                    error: {
                        message: jsonError,
                    },
                },
            }),
            { status: err.status }
        )
    }
}

export type ResponseType = {
    data?: any
    metaData?: any
    error?: {
        fieldError?: [] | unknown
        error?: {
            message?: string
            description?: string
            stackTrace?: string
        }
    }
}

export const Response = (responseData: ResponseType) => {
    return responseData
}