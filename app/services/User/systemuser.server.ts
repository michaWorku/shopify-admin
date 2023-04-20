import { Response } from "../..//utils/utils-server"
import { json } from "@remix-run/node"
// import canUser from '../utils/casl/ability'
import canUser from "../../utils/casl/ability"
import { db } from "../db.server"
import getParams from "../..//utils/params/getParams.server"
import { searchCombinedColumn } from "../..//utils/params/search.server"
import { filterFunction } from "../..//utils/params/filter.server"
import customErr, { errorHandler } from "../..//utils/handler.server"
import { canEditUser } from "../..//utils/casl/canEditUser"
import { canDeleteUser } from "../..//utils/casl/canDeleteUser"
import { roleChange } from "../Role/role.server"
import { getUserEntities } from "../Entities/entity.server"
import { hashPassword } from "~/utils/auth"
// import { getUserEntities } from "../entity.server";

export const getSystemUsers = async (
  request: Request,
  userId: string,
  clientId?: string
) => {
  try {
    if (!clientId) {
      const iCanView = await canUser(userId, "read", "SystemUser", {})
      if (iCanView?.status === 200) {
        const users = (await getAllSystemUsers(request, userId)) as any
        if (users?.data) {
          await Promise.all(
            users?.data?.map(async (user: any) => {
              let data
              data = canEditUser(userId, user?.id).then(
                (res) => (user.canEdit = res)
              )

              data = canDeleteUser(userId, user?.id).then(
                (res) => (user.canDelete = res)
              )
              return data
            })
          )
          return users
        } else {
          return users
        }
      } else return iCanView
    } else {
      const iCanView = await canUser(userId, "read", "SystemUser", {
        clientId,
      })
      if (iCanView?.status === 200) {
        const systemUsers = (await getAllClientSystemUsers(
          request,
          clientId,
          userId
        )) as any
        await Promise.all(
          systemUsers?.data?.map(async (user: any) => {
            let data
            data = canEditUser(userId, user?.id, clientId).then((res) => {
              user.canEdit = res
            })
            data = canDeleteUser(userId, user?.id, clientId).then(
              (res) => (user.canDelete = res)
            )
            return data
          })
        )
        return systemUsers
      } else return iCanView
    }
  } catch (error) {
    return errorHandler(error)
  }
}

const getAllSystemUsers = async (request: any, userId: string) => {
  try {
    const {
      sortType,
      sortField,
      skip,
      take,
      pageNo,
      search,
      filter,
      exportType,
    } = getParams(request)
    const searchParams = searchCombinedColumn(
      search,
      ["firstName", "middleName", "lastName"],
      "search"
    )
    const filterParams = filterFunction(filter, "User")

    let _where: any = {
      roles: {
        some: {
          role: {
            permissions: {
              some: {
                permission: {
                  conditions: {
                    equals: {},
                  },
                },
              },
            },
          },
        },
      },
      id: {
        not: userId,
      },
      ...searchParams,
      ...filterParams,
    }
    let users
    const userCount = await db.user.count({
      where: _where,
    })

    if (userCount) {
      users = await db.user.findMany({
        take,
        skip,
        orderBy: [
          {
            ...(sortField !== "name"
              ? { [sortField]: sortType }
              : {
                  updatedAt: sortType,
                }),
          },
        ],
        where: _where,
      })
      let exportData
      if (exportType === "page") {
        exportData = users
      } else if (exportType === "filtered") {
        exportData = await db.user.findMany({
          orderBy: [
            {
              ...(sortField !== "name"
                ? { [sortField]: sortType }
                : {
                    updatedAt: sortType,
                  }),
            },
          ],
          where: _where,
        })
      } else {
        exportData = await db.user.findMany({})
      }
      return {
        data: users,
        metaData: {
          page: pageNo,
          pageSize: take,
          sort: [sortField, sortType],
          searchVal: search,
          filter,
          total: userCount,
          exportType,
          exportData,
        },
      }
    }

    throw new customErr("Custom_Error", "User not found", 404)
  } catch (err) {
    return errorHandler(err)
  }
}

const getAllClientSystemUsers = async (
  request: any,
  clientId: string,
  userId: string
) => {
  try {
    const {
      sortType,
      sortField,
      skip,
      take,
      pageNo,
      search,
      filter,
      exportType,
    } = getParams(request)
    const searchParams = searchCombinedColumn(
      search,
      ["firstName", "middleName", "lastName"],
      "search"
    )
    const filterParams = filterFunction(filter, "User")
    let users
    let _where = {
      clients: {
        some: {
          isSystemUser: true,
          clientId: clientId,
        },
      },
      id: {
        not: userId,
      },
      ...searchParams,
      ...filterParams,
    }
    const userCount = await db.user.count({
      where: _where,
    })

    if (userCount) {
      users = await db.user.findMany({
        take,
        skip,
        orderBy: [
          {
            ...(sortField !== "name"
              ? { [sortField]: sortType }
              : {
                  updatedAt: sortType,
                }),
          },
        ],
        where: _where,
      })

      let exportData
      if (exportType === "page") {
        exportData = users
      } else if (exportType === "filtered") {
        exportData = await db.user.findMany({
          orderBy: [
            {
              ...(sortField !== "name"
                ? { [sortField]: sortType }
                : {
                    updatedAt: sortType,
                  }),
            },
          ],
          where: _where,
        })
      } else {
        exportData = await db.user.findMany({})
      }

      return {
        data: users,
        metaData: {
          page: pageNo,
          pageSize: take,
          sort: [sortField, sortType],
          searchVal: search,
          filter,
          exportData,
          exportType,
          total: userCount,
        },
      }
    }

    throw new customErr("Custom_Error", "No User was found", 404)
  } catch (err) {
    return errorHandler(err)
  }
}
export const createSystemUser = async (
  userId: string,
  data: any,
  clientId?: string
) => {
  try {
    if (clientId) {
      const isClientUser = await canUser(userId, "create", "SystemUser", {
        clientId,
      })
      if (isClientUser?.status === 200) {
        // create user
        const response = await createSystemUserDb(data, clientId)
        return json(response, { status: 200 })
      } else {
        return isClientUser
      }
    } else {
      const isSysteUser = await canUser(userId, "create", "SystemUser", {})
      if (isSysteUser?.status === 200) {
        //create user
        const response = await createSystemUserDb(data)
        return json(response, { status: 200 })
      } else {
        return isSysteUser
      }
    }
  } catch (err) {
    console.log("INSIDE CATCH", { err })
    return errorHandler(err)
  }
}

export const createSystemUserDb = async (data: any, clientId?: string) => {
  try {
    const hashedPassword = await hashPassword(data?.password as string)
    const result = await db.$transaction(
      async (tx) => {
        let userObject: any = {}
        Object.entries(data).map(async ([key, value]) => {
          if (key === "roleId") {
          } else if (key === "password") {
            Object.assign(userObject, { [key]: hashedPassword })
          } else {
            Object.assign(userObject, { [key]: value })
          }
        })

        console.log({ userObject })
        const newUser = await tx.user.create({
          data: {
            ...userObject,
            roles: {
              createMany: {
                data: data?.roleId?.map((e: string) => {
                  return {
                    roleId: e,
                  }
                }),
              },
            },
          },
        })

        if (clientId) {
          await tx.user.update({
            where: {
              id: newUser?.id,
            },
            data: {
              clients: {
                create: {
                  isSystemUser: true,
                  clientId: clientId,
                },
              },
            },
          })
        }

        return { newUser }
      },
      {
        maxWait: 5000,
        timeout: 30000,
      }
    )

    return Response({
      data: {
        data: result.newUser,
        message: "User successfully created",
      },
    })
  } catch (err) {
    throw err
  }
}

export const updateSystemUser = async (
  editorId: string,
  userId: string,
  data: any,
  clientId?: string
) => {
  try {
    if (clientId) {
      const isClientUser = await canUser(editorId, "update", "SystemUser", {
        clientId: clientId,
      })
      if (isClientUser?.status === 200) {
        //Check if the edited user is from the same client
        const editedUserClient = (await getUserEntities(editorId)) as any
        if (editedUserClient?.data?.id === clientId) {
          // create user
          const response = await updateSystemUserDb(userId, data, editorId)
          return json(response, { status: 200 })
        } else {
          return json(
            Response({
              error: {
                error: {
                  message: "You can not edit this user.",
                },
              },
            })
          )
        }
      } else {
        return isClientUser
      }
    } else {
      const isSysteUser = await canUser(editorId, "update", "SystemUser", {})
      if (isSysteUser?.status === 200) {
        //create user
        const response = await updateSystemUserDb(userId, data, editorId)
        return json(response, { status: 200 })
      } else {
        return isSysteUser
      }
    }
  } catch (err) {
    console.log("INIDE CATCH", { err })
    return errorHandler(err)
  }
}

export const updateSystemUserDb = async (
  userId: string,
  data: any,
  editorId: string
) => {
  try {
    let roles
    if (data?.roleId) {
      const userRoles = await db.role.findMany({
        where: {
          createdBy: editorId,
          users: {
            some: {
              userId: userId,
            },
          },
        },
      })
      const { connect, disconnect } = await roleChange(
        userRoles?.map((e) => e.id),
        data?.roleId
      )
      roles = {
        create: connect
          .filter((e) => e !== undefined && e !== null)
          .map((elt) => {
            return {
              role: {
                connect: {
                  id: elt,
                },
              },
            }
          }),
        deleteMany: disconnect
          .filter((e) => e !== undefined && e !== null)
          .map((elt) => {
            return {
              roleId: elt,
            }
          }),
      }
    }
    let userObject: any = {}
    Object.entries(data).map(([key, value]) => {
      if (key === "roleId") {
      } else {
        Object.assign(userObject, { [key]: value })
      }
    })
    const updatedUser = await db.user.update({
      where: {
        id: userId,
      },
      data: {
        ...userObject,
        roles,
      },
    })

    return Response({
      data: {
        data: updatedUser,
        message: "User successfully updated",
      },
    })
  } catch (err) {
    throw err
  }
}

export const deleteSystemUser = async (
  userId: string,
  deletedUserId: string,
  clientId?: string
) => {
  try {
    if (clientId) {
      const isClientUser = await canUser(userId, "delete", "SystemUser", {
        clientId,
      })
      if (isClientUser?.status === 200) {
        //Check if the edited user is from the same client
        const deletedUserClient = (await getUserEntities(userId)) as any
        if (deletedUserClient?.data?.id === clientId) {
          // create user
          const response = await deleteSystemUserDb(deletedUserId)
          return json(response, { status: 200 })
        } else {
          return json(
            Response({
              error: {
                error: {
                  message: "You can not delete this user.",
                },
              },
            })
          )
        }
      } else {
        return isClientUser
      }
    } else {
      const isSysteUser = await canUser(userId, "delete", "SystemUser", {})
      if (isSysteUser?.status === 200) {
        //create user
        const response = await deleteSystemUserDb(userId)
        return json(response, { status: 200 })
      } else {
        return isSysteUser
      }
    }
  } catch (err) {
    return errorHandler(err)
  }
}

export const deleteSystemUserDb = async (deletedUserId: string) => {
  const user = await db.user.update({
    where: {
      id: deletedUserId,
    },
    data: {
      deletedAt: new Date(),
    },
  })

  return Response({
    data: {
      user,
      message: "User successfuly deleted.",
    },
  })
}
